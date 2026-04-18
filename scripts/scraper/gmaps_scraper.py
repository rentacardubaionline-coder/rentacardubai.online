"""
Google Maps Business Scraper — City Mode, Writes to Supabase
Runs inside GitHub Actions, triggered by admin dashboard.

Env vars required:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  JOB_ID          — uuid of scrape_jobs row
  CITY_SLUG       — e.g. "lahore"
  CATEGORY        — e.g. "Car rental" (default)
"""

import asyncio
import os
import random
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from typing import Optional

import httpx
from playwright.async_api import async_playwright, TimeoutError as PWTimeout
from supabase import create_client, Client


# ══════════════════════════════════════════════════════════════════════════
#  CONFIG
# ══════════════════════════════════════════════════════════════════════════

MAX_REVIEWS_PER_BUSINESS = 15
MAX_IMAGES_PER_BUSINESS  = 5
MAX_SECONDS_PER_CELL     = 90
MAX_SCROLLS_PER_CELL     = 40
STALE_LIMIT              = 5
SCROLL_PAUSE             = 0.5
JITTER                   = (0.5, 1.2)
CITY_GRID_STEP           = 0.06          # ~6-7 km per cell (finer than country)
CONCURRENT_DETAIL_PAGES  = 3             # speed: scrape 3 detail pages in parallel

NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search"
USER_AGENT_UA  = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/122.0.0.0 Safari/537.36"
)


# ══════════════════════════════════════════════════════════════════════════
#  PHONE NORMALISATION (ports lib/utils.ts:normalizePhone)
# ══════════════════════════════════════════════════════════════════════════

def normalise_phone(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    digits = re.sub(r"[\s\-().]", "", raw)
    if re.fullmatch(r"\+92[3]\d{9}", digits):
        return digits
    if re.fullmatch(r"92[3]\d{9}", digits):
        return f"+{digits}"
    if re.fullmatch(r"0[3]\d{9}", digits):
        return f"+92{digits[1:]}"
    if re.fullmatch(r"[3]\d{9}", digits):
        return f"+92{digits}"
    # fallback: return cleaned digits if they look phone-ish
    return digits or None


# ══════════════════════════════════════════════════════════════════════════
#  SUPABASE CLIENT
# ══════════════════════════════════════════════════════════════════════════

def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.")
        sys.exit(1)
    return create_client(url, key)


def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


# ══════════════════════════════════════════════════════════════════════════
#  CITY BBOX LOOKUP (via Nominatim, cached per run)
# ══════════════════════════════════════════════════════════════════════════

async def fetch_city_bbox(city_name: str, country: str = "Pakistan") -> Optional[tuple[float, float, float, float]]:
    """Fetch bbox (south, west, north, east) for a city via OSM Nominatim."""
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(
                NOMINATIM_BASE,
                params={"q": f"{city_name}, {country}", "format": "json", "limit": 1},
                headers={"User-Agent": "rentnowpk-scraper/1.0"},
            )
            data = resp.json()
            if not data:
                return None
            bb = data[0].get("boundingbox")  # [south, north, west, east]
            if not bb or len(bb) != 4:
                return None
            south, north, west, east = float(bb[0]), float(bb[1]), float(bb[2]), float(bb[3])
            return (south, west, north, east)
        except Exception as e:
            log(f"⚠ Nominatim error for {city_name}: {e}")
            return None


def build_grid(south: float, west: float, north: float, east: float,
               step: float = CITY_GRID_STEP) -> list[tuple[float, float]]:
    """Divide a bounding box into (lat, lng) search centre points."""
    points = []
    lat = south + step / 2
    while lat <= north + step / 2:
        lng = west + step / 2
        while lng <= east + step / 2:
            points.append((round(lat, 5), round(lng, 5)))
            lng += step
        lat += step
    return points


# ══════════════════════════════════════════════════════════════════════════
#  URL PARSING HELPERS
# ══════════════════════════════════════════════════════════════════════════

def extract_place_id(url: str) -> str:
    m = re.search(r"!1s(ChIJ[^!&?%]+)", url)
    if m:
        return urllib.parse.unquote(m.group(1))
    m = re.search(r"[?&]placeid=(ChIJ[^&]+)", url)
    if m:
        return urllib.parse.unquote(m.group(1))
    m = re.search(r"!(0x[0-9a-f]+:0x[0-9a-f]+)", url)
    if m:
        return m.group(1)
    return ""


def extract_latlng(url: str) -> tuple[Optional[float], Optional[float]]:
    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url)
    if m:
        return (float(m.group(1)), float(m.group(2)))
    return (None, None)


def dedup_key(url: str) -> str:
    m = re.search(r"/maps/place/([^?@]+)", url)
    return m.group(1) if m else url[-80:]


# ══════════════════════════════════════════════════════════════════════════
#  SCRAPER
# ══════════════════════════════════════════════════════════════════════════

class GmapsCityScraper:
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.seen_place_ids: set[str] = set()
        self._pw = None
        self.browser = None
        self.ctx = None
        self.supabase: Client = get_supabase()

    async def start(self):
        self._pw = await async_playwright().start()
        self.browser = await self._pw.chromium.launch(
            headless=self.headless,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        )
        self.ctx = await self.browser.new_context(
            user_agent=USER_AGENT_UA,
            viewport={"width": 1366, "height": 900},
            locale="en-US",
        )

    async def stop(self):
        try:
            await self.browser.close()
        except Exception:
            pass
        try:
            await self._pw.stop()
        except Exception:
            pass

    async def new_page(self):
        p = await self.ctx.new_page()
        # Block ads for speed
        await p.route(
            re.compile(r"(doubleclick\.net|googletagmanager|google-analytics|googlesyndication)"),
            lambda route, _: route.abort(),
        )
        return p

    async def goto(self, page, url: str, retries: int = 2) -> bool:
        for i in range(retries):
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=30_000)
                return True
            except Exception:
                if i < retries - 1:
                    await asyncio.sleep(2 + i)
        return False

    # ── Seen set (dedup against already-scraped) ──────────────────────────

    async def load_seen_place_ids(self):
        """Load all google_place_ids we've scraped before to skip them."""
        try:
            res = self.supabase.table("scraped_businesses").select("google_place_id").execute()
            self.seen_place_ids = {r["google_place_id"] for r in (res.data or []) if r.get("google_place_id")}
            log(f"📋 Loaded {len(self.seen_place_ids)} existing place_ids (will skip)")
        except Exception as e:
            log(f"⚠ Could not load seen place_ids: {e}")

    # ── STEP 1: Search a grid cell → get listing URLs ─────────────────────

    async def search_cell(self, page, category: str, city_name: str,
                          lat: float, lng: float) -> list[str]:
        query = f"{category} in {city_name}"
        url = (
            f"https://www.google.com/maps/search/{urllib.parse.quote_plus(query)}"
            f"/@{lat},{lng},14z?hl=en"
        )
        if not await self.goto(page, url):
            return []

        await asyncio.sleep(random.uniform(*JITTER))

        try:
            await page.wait_for_selector('[role="feed"]', timeout=10_000)
        except PWTimeout:
            return []

        hrefs: set[str] = set()
        stale = 0
        start = time.time()

        for _ in range(MAX_SCROLLS_PER_CELL):
            if time.time() - start > MAX_SECONDS_PER_CELL:
                break

            links = await page.query_selector_all('a[href*="/maps/place/"]')
            before = len(hrefs)
            for link in links:
                href = await link.get_attribute("href")
                if href:
                    hrefs.add(href.split("?")[0])

            if len(hrefs) == before:
                stale += 1
                if stale >= STALE_LIMIT:
                    break
            else:
                stale = 0

            feed = await page.query_selector('[role="feed"]')
            if not feed:
                break
            await feed.evaluate("f => f.scrollBy(0, 800)")
            await asyncio.sleep(SCROLL_PAUSE)

            try:
                body = await page.inner_text("body")
                if any(p in body for p in ["You've reached the end", "No more results"]):
                    break
            except Exception:
                pass

        return list(hrefs)

    # ── STEP 2: Scrape one detail page (business + reviews) ───────────────

    async def scrape_place(self, page, listing_url: str,
                           fallback_cat: str, city_name: str,
                           matched_city_id: Optional[str]) -> Optional[dict]:

        full_url = listing_url if "hl=en" in listing_url else listing_url + "?hl=en"
        if not await self.goto(page, full_url):
            return None

        await asyncio.sleep(random.uniform(*JITTER))

        try:
            await page.wait_for_selector("h1", timeout=10_000)
        except PWTimeout:
            return None

        final_url = page.url

        # Place ID — check against seen set
        place_id = extract_place_id(final_url)
        if not place_id:
            # Fallback: scrape from page HTML
            try:
                content = await page.content()
                matches = re.findall(r'"(ChIJ[a-zA-Z0-9_\-]{10,})"', content)
                if matches:
                    place_id = max(set(matches), key=matches.count)
            except Exception:
                pass

        if place_id and place_id in self.seen_place_ids:
            return None  # already scraped in a previous run
        if place_id:
            self.seen_place_ids.add(place_id)

        async def txt(selector: str) -> str:
            try:
                el = await page.query_selector(selector)
                return (await el.inner_text()).strip() if el else ""
            except Exception:
                return ""

        name = await txt("h1")
        if not name:
            return None

        category = await txt('button[jsaction*="category"]') or fallback_cat

        # Address
        address = ""
        for sel in [
            'button[data-item-id="address"]',
            'button[aria-label*="Address"]',
        ]:
            address = await txt(sel)
            if address:
                address = address.replace("Address: ", "").strip()
                break

        # Phone
        phone_raw = ""
        for sel in [
            'button[data-item-id*="phone:tel"]',
            'button[aria-label*="Phone"]',
        ]:
            phone_raw = await txt(sel)
            if phone_raw:
                phone_raw = re.sub(r"^Phone:\s*", "", phone_raw).strip()
                break

        # Website
        website = ""
        try:
            el = await page.query_selector('a[data-item-id="authority"], a[aria-label*="website" i]')
            if el:
                website = (await el.get_attribute("href") or "").strip()
        except Exception:
            pass

        # Rating + total reviews
        rating_str = await txt('div.F7nice span[aria-hidden="true"]') or await txt("span.ceNzKf")
        rating = None
        if rating_str:
            try:
                rating = float(rating_str.replace(",", "."))
            except ValueError:
                rating = None

        total_ratings = await self._scrape_total_ratings(page)

        # Lat/lng from URL
        lat, lng = extract_latlng(final_url)

        # Business hours (best effort)
        working_hours = await self._scrape_hours(page)

        # Description
        description = await self._scrape_description(page)

        # Images
        image_urls = await self._scrape_images(page)

        # Reviews
        reviews = await self._scrape_reviews(page)

        return {
            "google_place_id":     place_id or None,
            "name":                name,
            "category":            category,
            "address":             address or None,
            "city_name":           city_name,
            "matched_city_id":     matched_city_id,
            "phone":               phone_raw or None,
            "normalised_phone":    normalise_phone(phone_raw),
            "website":             website or None,
            "rating":              rating,
            "total_ratings":       total_ratings,
            "google_maps_url":     final_url,
            "working_hours":       working_hours,
            "description":         description,
            "image_urls":          image_urls,
            "review_count":        len(reviews),
            "lat":                 lat,
            "lng":                 lng,
            "reviews":             reviews,
        }

    # ── Hours ─────────────────────────────────────────────────────────────

    async def _scrape_hours(self, page) -> Optional[dict]:
        """Extract 7-day schedule from the hours section."""
        try:
            # Hours are in a table inside a hours dropdown area
            table = await page.query_selector('table[aria-label*="hours" i]')
            if not table:
                return None
            rows = await table.query_selector_all("tr")
            hours = {}
            for row in rows:
                cells = await row.query_selector_all("td")
                if len(cells) >= 2:
                    day = (await cells[0].inner_text()).strip()
                    time_str = (await cells[1].inner_text()).strip()
                    if day and time_str:
                        hours[day] = time_str
            return hours if hours else None
        except Exception:
            return None

    # ── Total ratings count (X Google reviews) ────────────────────────────

    async def _scrape_total_ratings(self, page) -> Optional[int]:
        """
        Extract the total review count. Multiple strategies because Google
        changes the DOM often. Returns the count as an int, or None.
        """
        # Strategy 1: visible "(X)" next to rating in the header
        # Example: "4.6(9)" or "4.6 (9)"
        try:
            container = await page.query_selector('div.F7nice, div[class*="F7nice"]')
            if container:
                text = (await container.inner_text()).strip()
                # Matches "(9)", "(1,234)", etc.
                m = re.search(r"\(([\d,]+)\)", text)
                if m:
                    return int(m.group(1).replace(",", ""))
        except Exception:
            pass

        # Strategy 2: look at the Reviews tab aria-label — e.g. "Reviews for X business"
        try:
            # Find all review-related buttons and pick the one with a digit in aria-label
            for sel in [
                'button[role="tab"][aria-label*="Reviews" i]',
                'button[aria-label*="Reviews for" i]',
                'button[jsaction*="pane.rating.moreReviews"]',
            ]:
                buttons = await page.query_selector_all(sel)
                for btn in buttons:
                    label = await btn.get_attribute("aria-label") or ""
                    # Match "9 reviews" or "Reviews (9)"
                    m = re.search(r"([\d,]+)\s*reviews?", label, re.IGNORECASE) or \
                        re.search(r"\(([\d,]+)\)", label)
                    if m:
                        return int(m.group(1).replace(",", ""))
        except Exception:
            pass

        # Strategy 3: aria-label that says "X reviews" anywhere
        try:
            elements = await page.query_selector_all('[aria-label*="reviews" i]')
            for el in elements:
                label = await el.get_attribute("aria-label") or ""
                # Must look like "X reviews" not "Write a review" or "Sort reviews"
                m = re.match(r"^\s*([\d,]+)\s*reviews?\s*$", label, re.IGNORECASE)
                if m:
                    return int(m.group(1).replace(",", ""))
        except Exception:
            pass

        # Strategy 4: visible text "X Google reviews" link (e.g. on search result side panel)
        try:
            anchors = await page.query_selector_all('a, button')
            for a in anchors:
                try:
                    txt = (await a.inner_text()).strip()
                    m = re.match(r"^\s*([\d,]+)\s*Google\s*reviews?\s*$", txt, re.IGNORECASE) or \
                        re.match(r"^\s*([\d,]+)\s*reviews?\s*$", txt, re.IGNORECASE)
                    if m:
                        return int(m.group(1).replace(",", ""))
                except Exception:
                    continue
        except Exception:
            pass

        return None

    # ── Description ───────────────────────────────────────────────────────

    async def _scrape_description(self, page) -> Optional[str]:
        try:
            for sel in [
                '[data-attrid="description"]',
                'div[aria-label*="About" i] div.fontBodyMedium',
            ]:
                el = await page.query_selector(sel)
                if el:
                    txt = (await el.inner_text()).strip()
                    if txt and len(txt) > 10:
                        return txt[:2000]
        except Exception:
            pass
        return None

    # ── Images ────────────────────────────────────────────────────────────

    def _is_real_photo(self, url: str) -> bool:
        """Filter out icons, avatars, pins, and tiny UI images."""
        if not url or "googleusercontent" not in url:
            return False
        # Reject tiny sizes: =s32, =s40, =s60, =s72 etc (avatars & icons)
        m = re.search(r"=s(\d+)", url)
        if m and int(m.group(1)) < 150:
            return False
        # Reject tiny widths: =w40-h40, =w80-h80 etc
        m = re.search(r"=w(\d+)-h(\d+)", url)
        if m and (int(m.group(1)) < 150 or int(m.group(2)) < 100):
            return False
        # Reject user avatars served from specific paths
        if "/a/ACg" in url or "/a-/ACg" in url:
            return False
        # Reject street-view paths
        if "streetview" in url.lower():
            return False
        return True

    def _normalise_image_url(self, url: str) -> str:
        """Force a high-res size for the scraped URL."""
        url = re.sub(r"=w\d+-h\d+(-[a-z]+)?", "=w1200-h900-k-no", url)
        url = re.sub(r"=s\d+(-[a-z]+)?", "=s1200", url)
        return url

    async def _scrape_images(self, page) -> list[str]:
        images: list[str] = []
        seen: set[str] = set()

        def add(src: str) -> None:
            if not self._is_real_photo(src):
                return
            norm = self._normalise_image_url(src)
            # Strip size for dedup (different sizes of same photo = same photo)
            key = re.sub(r"=[sw]\d+.*$", "", norm)
            if key in seen:
                return
            seen.add(key)
            if len(images) < MAX_IMAGES_PER_BUSINESS:
                images.append(norm)

        # Step 1: Try opening the Photos gallery (most reliable source)
        photo_btn = None
        for sel in [
            'button[jsaction*="pane.heroHeaderImage"]',
            'button[aria-label^="Photo of"]',
            'button[aria-label*="photos of" i]',
            'a[aria-label*="photo" i][role="button"]',
            'button[aria-label*="See photos"]',
        ]:
            try:
                photo_btn = await page.query_selector(sel)
                if photo_btn:
                    break
            except Exception:
                continue

        if photo_btn:
            try:
                await photo_btn.click()
                await asyncio.sleep(1.5)

                # Scroll inside the photo panel to load lazily-loaded thumbs
                for _ in range(6):
                    try:
                        scrollable = await page.query_selector('div[role="main"]')
                        if scrollable:
                            await scrollable.evaluate("el => el.scrollBy(0, 800)")
                    except Exception:
                        pass
                    await asyncio.sleep(0.4)

                # Harvest images from the photos panel
                imgs = await page.query_selector_all('a[data-photo-index] img, div[role="img"], img[src*="googleusercontent.com"]')
                for img in imgs:
                    try:
                        # Some photo tiles use background-image instead of src
                        style = await img.get_attribute("style") or ""
                        bg_match = re.search(r'url\("?(https://[^")]+)"?\)', style)
                        src = bg_match.group(1) if bg_match else (await img.get_attribute("src") or "")
                        if src:
                            add(src)
                    except Exception:
                        continue

                # Close overlay via ESC
                try:
                    await page.keyboard.press("Escape")
                    await asyncio.sleep(0.5)
                except Exception:
                    pass
            except Exception as e:
                log(f"  ⚠ Photo gallery error: {e}")

        # Step 2: Fallback — scrape inline hero + thumbnails from detail page
        if len(images) < MAX_IMAGES_PER_BUSINESS:
            try:
                # Photo tiles on the detail panel (before clicking gallery)
                for sel in [
                    'button[jsaction*="pane.heroHeaderImage"] img',
                    '[jsaction*="photo"] img',
                    'button[aria-label*="photo" i] img',
                ]:
                    imgs = await page.query_selector_all(sel)
                    for img in imgs:
                        if len(images) >= MAX_IMAGES_PER_BUSINESS:
                            break
                        src = await img.get_attribute("src") or ""
                        add(src)

                # Last resort: background-image hero
                hero_els = await page.query_selector_all('[jsaction*="heroHeaderImage"]')
                for el in hero_els:
                    style = await el.get_attribute("style") or ""
                    m = re.search(r'url\("?(https://[^")]+)"?\)', style)
                    if m:
                        add(m.group(1))
            except Exception:
                pass

        return images[:MAX_IMAGES_PER_BUSINESS]

    # ── Reviews (up to 15) ────────────────────────────────────────────────

    async def _scrape_reviews(self, page) -> list[dict]:
        reviews: list[dict] = []

        # Step 1: Click the Reviews tab. Try multiple selector patterns
        # because Google frequently minifies class names.
        review_tab_clicked = False
        tab_selectors = [
            'button[role="tab"][aria-label*="Reviews for"]',
            'button[role="tab"][aria-label^="Reviews"]',
            'button[aria-label*="Reviews for"]',
            'button[jsaction*="pane.rating.moreReviews"]',
            'button[aria-label*="More reviews"]',
            # Generic "Reviews" tab
            'button[role="tab"] >> text=Reviews',
            'a[href*="/reviews"]',
        ]
        for sel in tab_selectors:
            try:
                btn = await page.query_selector(sel)
                if btn:
                    # Scroll into view first
                    try:
                        await btn.scroll_into_view_if_needed(timeout=2000)
                    except Exception:
                        pass
                    await btn.click()
                    review_tab_clicked = True
                    await asyncio.sleep(1.5)
                    break
            except Exception:
                continue

        # If no tab button found, reviews may already be inline on the page
        # Scroll the detail panel — some layouts show reviews below Overview
        if not review_tab_clicked:
            try:
                main = await page.query_selector('div[role="main"]')
                if main:
                    # Scroll down the detail panel to reveal inline reviews
                    for _ in range(5):
                        await main.evaluate("el => el.scrollBy(0, 600)")
                        await asyncio.sleep(0.3)
            except Exception:
                pass

            # Check if inline reviews exist after scroll
            inline = await page.query_selector('[data-review-id]')
            if not inline:
                return []

        # Step 2: Wait for at least one review to mount
        try:
            await page.wait_for_selector('[data-review-id]', timeout=8000)
        except PWTimeout:
            # Last resort: sometimes reviews have zero-reviews state — check rating
            try:
                zero_marker = await page.query_selector('text=/No reviews/i')
                if zero_marker:
                    return []
            except Exception:
                pass
            return []

        # Find the scrollable container — Google uses a specific scrollable panel
        # for reviews. Multiple candidates depending on layout.
        scrollable_selectors = [
            'div[class*="review"][class*="scroll" i]',
            'div.m6QErb[aria-label*="Reviews" i]',
            'div[role="main"] div[tabindex="0"]',
        ]

        scroll_handle = None
        for sel in scrollable_selectors:
            try:
                el = await page.query_selector(sel)
                if el:
                    scroll_handle = el
                    break
            except Exception:
                continue

        # Scroll to load more reviews (lazily loaded)
        for _ in range(6):
            try:
                if scroll_handle:
                    await scroll_handle.evaluate("el => el.scrollBy(0, 2000)")
                else:
                    # Fallback: scroll the closest ancestor of a review card
                    await page.evaluate("""
                        () => {
                            const first = document.querySelector('[data-review-id]');
                            if (!first) return;
                            let parent = first.parentElement;
                            while (parent && parent.scrollHeight <= parent.clientHeight) {
                                parent = parent.parentElement;
                            }
                            if (parent) parent.scrollBy(0, 2000);
                        }
                    """)
            except Exception:
                pass
            await asyncio.sleep(0.7)

        # Step 3: Expand "See more" buttons on long reviews
        try:
            more_buttons = await page.query_selector_all(
                'button[aria-label*="See more" i], button[jsaction*="review.expandReview"]'
            )
            for btn in more_buttons[:MAX_REVIEWS_PER_BUSINESS * 2]:
                try:
                    await btn.click()
                    await asyncio.sleep(0.04)
                except Exception:
                    pass
        except Exception:
            pass

        # Step 4: Harvest review cards — use multiple selector fallbacks
        review_els = await page.query_selector_all('[data-review-id]')
        for el in review_els[:MAX_REVIEWS_PER_BUSINESS]:
            try:
                parsed = await self._parse_review_card(el)
                if parsed:
                    reviews.append(parsed)
            except Exception:
                continue

        return reviews[:MAX_REVIEWS_PER_BUSINESS]

    async def _parse_review_card(self, el) -> Optional[dict]:
        """Parse a single [data-review-id] card into a review dict."""
        # Reviewer name — try multiple selectors
        name = ""
        for sel in ['div.d4r55', '[class*="d4r55"]', 'button[aria-label*="Review by"]', 'div[aria-label*="Review by"]']:
            try:
                name_el = await el.query_selector(sel)
                if name_el:
                    if sel.startswith('button[aria-label') or sel.startswith('div[aria-label'):
                        label = await name_el.get_attribute("aria-label") or ""
                        m = re.search(r"Review by (.+)", label)
                        if m:
                            name = m.group(1).strip()
                            break
                    else:
                        name = (await name_el.inner_text()).strip()
                        if name:
                            break
            except Exception:
                continue

        # Avatar image
        avatar = ""
        for sel in ['button img.NBa7we', 'button img[alt*="photo"]', 'img.NBa7we', 'img[referrerpolicy]']:
            try:
                avatar_el = await el.query_selector(sel)
                if avatar_el:
                    src = await avatar_el.get_attribute("src") or ""
                    if src and "googleusercontent" in src:
                        avatar = src
                        break
            except Exception:
                continue

        # Rating from aria-label (most reliable)
        rating_val = 0
        try:
            stars_el = await el.query_selector('[aria-label*="star" i], [role="img"][aria-label*="star" i]')
            if stars_el:
                label = await stars_el.get_attribute("aria-label") or ""
                m = re.search(r"(\d+(?:\.\d+)?)\s*stars?", label, re.IGNORECASE)
                if m:
                    rating_val = int(float(m.group(1)))
        except Exception:
            pass

        # Date
        review_date = ""
        for sel in ['span.rsqaWe', '[class*="rsqaWe"]', '.DU9Pgb > span']:
            try:
                date_el = await el.query_selector(sel)
                if date_el:
                    review_date = (await date_el.inner_text()).strip()
                    if review_date:
                        break
            except Exception:
                continue

        # Comment
        comment = ""
        for sel in ['span.wiI7pd', '[class*="wiI7pd"]', 'div.MyEned', 'span[class*="reviewText"]']:
            try:
                comment_el = await el.query_selector(sel)
                if comment_el:
                    comment = (await comment_el.inner_text()).strip()
                    if comment:
                        break
            except Exception:
                continue

        if not name or not rating_val:
            return None

        return {
            "reviewer_name":       name,
            "reviewer_avatar_url": avatar or None,
            "rating":              rating_val,
            "comment":             comment or None,
            "review_date":         review_date or None,
        }


# ══════════════════════════════════════════════════════════════════════════
#  ORCHESTRATOR
# ══════════════════════════════════════════════════════════════════════════

async def run(job_id: str, city_slug: str, category: str):
    supabase = get_supabase()
    log(f"🚀 Starting job {job_id} — city={city_slug}, category={category}")

    # Fetch city row
    try:
        city_res = supabase.table("cities").select("id, name, slug").eq("slug", city_slug).single().execute()
        city = city_res.data
    except Exception as e:
        log(f"❌ City '{city_slug}' not found: {e}")
        supabase.table("scrape_jobs").update({
            "status": "failed",
            "error_message": f"City slug '{city_slug}' not found",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", job_id).execute()
        return

    city_name = city["name"]
    city_id = city["id"]
    log(f"📍 City: {city_name} ({city_id})")

    # Fetch bbox from Nominatim
    bbox = await fetch_city_bbox(city_name)
    if not bbox:
        log(f"⚠ No bbox — using default ~20km box around the city centroid")
        # Rough fallback: assume 0.2 degrees around a Pakistani city centre
        bbox = (31.0, 74.0, 31.6, 74.6)

    south, west, north, east = bbox
    grid = build_grid(south, west, north, east, CITY_GRID_STEP)
    log(f"🗺  Grid: {len(grid)} cells (step={CITY_GRID_STEP}°)")

    # Update job to running
    supabase.table("scrape_jobs").update({
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "progress_total": len(grid),
    }).eq("id", job_id).execute()

    scraper = GmapsCityScraper(headless=True)
    await scraper.start()
    await scraper.load_seen_place_ids()

    saved = 0
    completed_cells = 0

    try:
        # Dedicated pages: 1 for search, N for details (concurrent)
        list_page = await scraper.new_page()
        detail_pages = [await scraper.new_page() for _ in range(CONCURRENT_DETAIL_PAGES)]

        for (lat, lng) in grid:
            urls = await scraper.search_cell(list_page, category, city_name, lat, lng)
            # Filter out already-seen slug keys
            new_urls = [u for u in urls if dedup_key(u) not in {dedup_key(u2) for u2 in urls[:0]}]  # simple dedup within cell
            seen_in_cell = set()
            cell_urls = []
            for u in urls:
                k = dedup_key(u)
                if k not in seen_in_cell:
                    seen_in_cell.add(k)
                    cell_urls.append(u)

            # Concurrent scrape — batches of CONCURRENT_DETAIL_PAGES
            for i in range(0, len(cell_urls), CONCURRENT_DETAIL_PAGES):
                batch = cell_urls[i:i + CONCURRENT_DETAIL_PAGES]
                tasks = [
                    scraper.scrape_place(detail_pages[j], url, category, city_name, city_id)
                    for j, url in enumerate(batch)
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for res in results:
                    if isinstance(res, Exception):
                        log(f"  ⚠ scrape error: {res}")
                        continue
                    if not res:
                        continue

                    # Quality filter: skip businesses with no valid images
                    image_urls = res.get("image_urls") or []
                    if not image_urls:
                        log(f"  🚫 Skipping '{res.get('name')}' — no usable images")
                        continue

                    # Insert into scraped_businesses
                    reviews = res.pop("reviews", [])
                    res["job_id"] = job_id
                    try:
                        biz_res = supabase.table("scraped_businesses").insert(res).execute()
                        biz_id = biz_res.data[0]["id"]
                        saved += 1

                        # Insert reviews
                        if reviews:
                            review_rows = [{**r, "scraped_business_id": biz_id} for r in reviews]
                            supabase.table("scraped_reviews").insert(review_rows).execute()

                    except Exception as e:
                        log(f"  ⚠ insert error ({res.get('name')}): {e}")

            completed_cells += 1

            # Update progress every 2 cells
            if completed_cells % 2 == 0 or completed_cells == len(grid):
                supabase.table("scrape_jobs").update({
                    "progress_current": completed_cells,
                    "scraped_count": saved,
                }).eq("id", job_id).execute()
                log(f"  📊 Progress: {completed_cells}/{len(grid)} cells, {saved} businesses")

    except Exception as e:
        log(f"❌ Job failed: {e}")
        supabase.table("scrape_jobs").update({
            "status": "failed",
            "error_message": str(e)[:500],
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "scraped_count": saved,
            "progress_current": completed_cells,
        }).eq("id", job_id).execute()
        await scraper.stop()
        return

    finally:
        await scraper.stop()

    # Mark complete
    supabase.table("scrape_jobs").update({
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "scraped_count": saved,
        "progress_current": completed_cells,
    }).eq("id", job_id).execute()

    log(f"✅ Completed! {saved} businesses saved.")


# ══════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════

def main():
    job_id    = os.environ.get("JOB_ID")
    city_slug = os.environ.get("CITY_SLUG")
    category  = os.environ.get("CATEGORY", "Car rental")

    if not job_id or not city_slug:
        print("❌ JOB_ID and CITY_SLUG env vars required")
        sys.exit(1)

    asyncio.run(run(job_id, city_slug, category))


if __name__ == "__main__":
    main()
