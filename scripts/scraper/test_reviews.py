"""
Stress test: scrape 10-15 businesses in a medium city and report results.
Logs total_ratings (from Google) vs scraped reviews for each business.
"""

import asyncio
import io
import os
import re
import sys

try:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
except Exception:
    pass

from playwright.async_api import async_playwright

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gmaps_scraper import GmapsCityScraper


CITY = "Bahawalnagar"
MAX_BUSINESSES = 15


def log(msg: str):
    print(msg, flush=True)


class _FakeScraper:
    """Wraps GmapsCityScraper methods without needing Supabase."""
    def __init__(self):
        self._real = object.__new__(GmapsCityScraper)

    def __getattr__(self, name):
        import types
        attr = getattr(GmapsCityScraper, name, None)
        if callable(attr):
            return types.MethodType(attr, self._real)
        return attr


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
        )
        ctx = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 900},
            locale="en-US",
        )
        page = await ctx.new_page()
        scraper = _FakeScraper()

        # Search
        search_url = f"https://www.google.com/maps/search/car+rental+in+{CITY}?hl=en"
        log(f"🌐 Searching: {search_url}")
        await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
        await asyncio.sleep(2.5)

        # Wait for feed
        try:
            await page.wait_for_selector('[role="feed"]', timeout=10000)
        except Exception as e:
            log(f"❌ No feed: {e}")
            await browser.close()
            return

        # Scroll feed to load more businesses
        for _ in range(3):
            feed = await page.query_selector('[role="feed"]')
            if feed:
                await feed.evaluate("f => f.scrollBy(0, 2000)")
            await asyncio.sleep(1.0)

        # Collect place URLs
        links = await page.query_selector_all('a[href*="/maps/place/"]')
        hrefs = []
        seen_urls = set()
        for link in links:
            href = await link.get_attribute("href")
            if href:
                stripped = href.split("?")[0]
                if stripped not in seen_urls:
                    seen_urls.add(stripped)
                    hrefs.append(stripped)
            if len(hrefs) >= MAX_BUSINESSES:
                break

        log(f"\n📋 Testing {len(hrefs)} businesses in {CITY}\n")

        # Results table
        results = []

        for i, href in enumerate(hrefs, 1):
            full_url = href if "hl=en" in href else href + "?hl=en"
            try:
                await page.goto(full_url, wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(1.5)

                # Wait for h1 with content
                try:
                    await page.wait_for_function(
                        """() => {
                            const h1 = document.querySelector('h1');
                            return h1 && h1.textContent.trim().length > 0;
                        }""",
                        timeout=10000,
                    )
                except Exception:
                    pass

                name_el = await page.query_selector("h1")
                name = (await name_el.inner_text()).strip() if name_el else "?"

                # Get total ratings from Google (like the real scraper does)
                total = await scraper._scrape_total_ratings(page)

                # Scrape reviews
                reviews = await scraper._scrape_reviews(page, business_name=name)

                status = "✅"
                if total is None:
                    status = "⚠️ "
                elif total == 0:
                    status = "○ "  # 0 reviews is fine
                elif len(reviews) == 0:
                    status = "❌"
                elif len(reviews) < min(5, total):
                    status = "⚠️ "

                results.append({
                    "name": name,
                    "total": total,
                    "scraped": len(reviews),
                    "status": status,
                })
                log(f"{status} [{i:2d}/{len(hrefs)}] {name[:60]:<60} → Google: {total if total is not None else '?':>4} | Scraped: {len(reviews):>2}")

            except Exception as e:
                log(f"❌ [{i:2d}/{len(hrefs)}] ERROR: {str(e)[:100]}")
                results.append({"name": href[-50:], "total": None, "scraped": 0, "status": "❌"})

        await browser.close()

        # Summary
        log(f"\n{'═' * 80}")
        log(f"SUMMARY — {CITY}")
        log(f"{'═' * 80}")
        total_businesses = len(results)
        genuine_zero = sum(1 for r in results if r["total"] == 0)
        successfully_scraped = sum(1 for r in results if r["scraped"] > 0)
        google_has_reviews = sum(1 for r in results if r["total"] and r["total"] > 0)
        failed_despite_reviews = sum(
            1 for r in results if r["total"] and r["total"] > 0 and r["scraped"] == 0
        )

        log(f"Total businesses tested:                   {total_businesses}")
        log(f"Businesses with 0 Google reviews:          {genuine_zero}")
        log(f"Businesses WITH Google reviews:            {google_has_reviews}")
        log(f"Successfully scraped (≥1 review):          {successfully_scraped}")
        log(f"❌ FAILED (Google has reviews, we got 0): {failed_despite_reviews}")
        log(f"")
        if google_has_reviews > 0:
            success_rate = (google_has_reviews - failed_despite_reviews) / google_has_reviews * 100
            log(f"Success rate (of businesses with reviews): {success_rate:.1f}%")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
