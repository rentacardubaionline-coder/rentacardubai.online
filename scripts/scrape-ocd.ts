/**
 * OneClickDrive scraper — Dubai listings
 *
 * Usage:
 *   npm run scrape:ocd -- [job_id]
 *
 * Env required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Flow:
 *   1. Fetch paginated Dubai listing cards → collect listing IDs + URLs
 *   2. Fetch each listing detail page → parse full data
 *   3. Upsert dealers (dedup by company name)
 *   4. Upsert listings (dedup by ocd_listing_id)
 *   5. Update job progress throughout
 */

import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const BASE_URL   = "https://www.oneclickdrive.com";
const DUBAI_BASE = `${BASE_URL}/rent-a-car-dubai`;
const DELAY_MS   = 2000;
const BATCH_SIZE = 5;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  Referer: "https://www.oneclickdrive.com/",
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface ListingCard {
  ocdId: string;
  url: string;
}

interface ParsedDealer {
  ocd_company_name: string;
  ocd_company_slug: string;
  phone: string | null;
  whatsapp: string | null;
  area: string | null;
  city: string;
  logo_url: string | null;
  description: string | null;
  dealer_note: string | null;
  working_hours: Record<string, string> | null;
  is_verified: boolean;
  is_premium: boolean;
}

interface ParsedListing {
  ocd_listing_id: string;
  ocd_url: string;
  // location
  location: string | null;
  // car specs
  make: string | null;
  model: string | null;
  year: number | null;
  body_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  doors: number | null;
  luggage_bags: number | null;
  color_exterior: string | null;
  color_interior: string | null;
  spec_type: string | null;
  engine_capacity: string | null;
  // pricing
  currency: string;
  daily_rate_aed: number | null;        // discounted/current rate (column name kept)
  weekly_rate_aed: number | null;
  monthly_rate_aed: number | null;
  daily_rate_original: number | null;
  weekly_rate_original: number | null;
  monthly_rate_original: number | null;
  daily_km_included: number | null;
  weekly_km_included: number | null;
  monthly_km_included: number | null;
  extra_km_rate_aed: number | null;     // kept for back-compat
  extra_km_rate: number | null;
  extra_km_currency: string | null;
  // per-period extra km rates
  daily_extra_km_rate: number | null;
  daily_extra_km_currency: string | null;
  weekly_extra_km_rate: number | null;
  weekly_extra_km_currency: string | null;
  monthly_extra_km_rate: number | null;
  monthly_extra_km_currency: string | null;
  deposit_aed: number | null;
  salik_charges_aed: number | null;
  vat_percentage: number;
  // policies
  insurance_included: boolean;
  free_delivery: boolean;
  min_rental_days: number;
  fuel_policy: string | null;
  payment_methods: string[];
  payment_modes: string | null;
  mileage_policy: string | null;
  deposit_policy: string | null;
  rental_policy: string | null;
  additional_charges: string | null;
  // features + media
  features: string[];
  features_by_category: Record<string, string[]> | null;
  image_urls: string[];
  video_urls: string[];
  primary_image_url: string | null;
  // special offer
  special_offer: string | null;
  special_offer_heading: string | null;
  special_offer_body: string | null;
  special_offer_disclaimer: string | null;
  // requirements
  requirements_to_rent: string | null;
  min_driver_age: number | null;
  security_deposit_amount: number | null;
  security_deposit_currency: string | null;
  deposit_refund_period: string | null;
  // meta
  dealer_note: string | null;
  is_premium: boolean;
  is_featured: boolean;
  ocd_last_updated: string | null;
  // dealer
  dealer: ParsedDealer;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 429) { await sleep(5000 * (attempt + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error(`Max retries for ${url}`);
}

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}


function parseInteger(text: string | null | undefined, max = 99_999, maxDigits = 6): number | null {
  if (!text) return null;
  const digits = text.replace(/[^0-9]/g, "").slice(0, maxDigits);
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return isNaN(n) || n > max ? null : n;
}

function cleanText(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

function deslugify(slug: string): string {
  return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Detect total pages ───────────────────────────────────────────────────────

function detectTotalPages(html: string): { total: number; urlTemplate: string } {
  const $ = cheerio.load(html);
  const showingText = $("body").text().match(/Showing\s+\d+\s*-\s*\d+\s+of\s+([\d,]+)\s+cars?/i);
  const total = showingText ? parseInt(showingText[1].replace(/,/g, ""), 10) : 0;
  const totalPages = total > 0 ? Math.ceil(total / 20) : 64;

  const paginationLinks: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.includes("rent-a-car-dubai") && (href.includes("page") || href.includes("?p="))) {
      paginationLinks.push(href);
    }
  });

  let urlTemplate = `${DUBAI_BASE}?page={page}`;
  if (paginationLinks.length > 0) {
    const sample = paginationLinks[0];
    if (sample.includes("/page/")) urlTemplate = `${DUBAI_BASE}/page/{page}`;
    else if (sample.includes("?p=")) urlTemplate = `${DUBAI_BASE}?p={page}`;
    else if (sample.includes("?pg=")) urlTemplate = `${DUBAI_BASE}?pg={page}`;
  }

  return { total: totalPages, urlTemplate };
}

// ─── Parse listing cards from search results ─────────────────────────────────

function parseListingCards(html: string): ListingCard[] {
  const $ = cheerio.load(html);
  const cards: ListingCard[] = [];

  $("a[href*='/details/index/search-car-rentals-dubai/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const idMatch = href.match(/[?&]id=(\d+)/);
    if (!idMatch) return;
    const ocdId = idMatch[1];
    const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
    if (!cards.find((c) => c.ocdId === ocdId)) {
      cards.push({ ocdId, url: fullUrl });
    }
  });

  return cards;
}

// ─── Parse detail page ───────────────────────────────────────────────────────

function parseDetailPage(html: string, ocdId: string, url: string): ParsedListing {
  const $ = cheerio.load(html);
  const bodyText = cleanText($("body").text());

  // ── Detect primary currency (from OCD hidden input first) ──────────────
  const hiddenCurrency = ($("input#currency").val() as string || "").trim().toUpperCase();
  let primaryCurrency = hiddenCurrency || "AED";
  if (!hiddenCurrency) {
    const aedCount = (html.match(/\bAED\b/g) || []).length;
    const usdCount = (html.match(/\bUSD\b/g) || []).length;
    const eurCount = (html.match(/\bEUR\b/g) || []).length;
    if (usdCount > aedCount && usdCount >= eurCount) primaryCurrency = "USD";
    else if (eurCount > aedCount && eurCount > usdCount) primaryCurrency = "EUR";
  }

  const fullTextLower = html.toLowerCase();

  function extractPolicy(type: string): string | null {
    let result: string | null = null;
    $("h2, h3, h4, h5, span.side-hd").each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (!text.includes(type)) return;
      // Look inside faqbottom panel
      const panel = $(el).closest(".faqbottom, .accordion-item").find(".panel, .accordion-collapse, .panel-body").first();
      if (panel.length) {
        const panelText = cleanText(panel.text());
        if (panelText.length > 10) { result = panelText; return false; }
      }
      // Try sibling paragraph
      const next = $(el).nextAll("p, div").first().text().trim();
      if (next.length > 20) { result = next; return false; }
    });
    return result;
  }

  // ── Dealer name & Logo ───────────────────────────────────────────────────
  let companyName = "";
  let logoSrc: string | null = null;
  let dealerPhone: string | null = null;
  let dealerWhatsapp: string | null = null;

  // Pattern 0 (most reliable): hidden form input populated server-side
  const hiddenCompanyName = ($("input#m_companyname").val() as string || "").trim();
  if (hiddenCompanyName) companyName = hiddenCompanyName;

  // Pattern 0b: owner_verify h2 — always rendered as visible text
  if (!companyName) {
    const ownerH2 = $("article.owner_verify h2").first().text().trim();
    if (ownerH2.length > 2) companyName = ownerH2;
  }

  // Pattern 1: lsttitle-mob paragraph (mobile header above gallery)
  if (!companyName) {
    const lstTitle = $("p.lsttitle-mob").clone().children("img").remove().end().text().trim();
    if (lstTitle.length > 2 && lstTitle.length < 80) companyName = lstTitle;
  }

  // Pattern 2: WhatsApp link parameters (decode + signs as spaces)
  $("a[href*='api.whatsapp.com/send']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const decoded = decodeURIComponent(href.replace(/\+/g, " "));
    const m = decoded.match(/listed\s+by\s+([^.\n&]+)/i);
    if (m && !companyName) companyName = m[1].trim().replace(/[*]/g, "");
    const pMatch = href.match(/phone=([+\d]+)/);
    if (pMatch && !dealerWhatsapp) dealerWhatsapp = pMatch[1];
  });

  // Pattern 3: Logo image — title or onmouseover
  $("img[src*='/img/company/'], img[class*='owner'], img[class*='logo']").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && src.includes("/company/") && !logoSrc) {
      const cleanSrc = src.split("?")[0]; // strip CDN resize params
      logoSrc = cleanSrc.startsWith("http") ? cleanSrc : `${BASE_URL}${cleanSrc}`;
    }
    if (companyName) return; // already have name, only collect logo

    const title = $(el).attr("title") || "";
    if (title && !/^logo/i.test(title)) {
      companyName = title.replace(/^listed\s+by\s+/i, "").split(",")[0].trim();
      return;
    }
    const mouseover = $(el).attr("onmouseover") || "";
    const m = mouseover.match(/Listed\s+by\s+([^'<&]+)/i);
    if (m) companyName = m[1].trim();
  });

  // Pattern 4: Tracking script arguments
  if (!companyName) {
    $("[onclick*='track_number']").each((_, el) => {
      const onclick = $(el).attr("onclick") || "";
      const m = onclick.match(/track_number(?:_whatsapp)?(?:_premium)?\s*\(\s*['"]?\d+['"]?\s*,\s*['"]?\d+['"]?\s*,\s*['"]([^'"]+)['"]/i);
      if (m) { companyName = m[1].trim(); return false; }
    });
  }

  // Pattern 5: Slug scan (legacy fallback)
  let dealerSlug = "";
  if (!companyName) {
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const slugMatch = href.match(/\/rent-a-car-dubai\/([a-z0-9][a-z0-9-]{2,60})\//i);
      if (!slugMatch) return;
      const slug = slugMatch[1].toLowerCase();
      if (["dubai", "abu-dhabi", "sharjah", "ajman"].includes(slug)) return;
      dealerSlug = slug;
      const text = cleanText($(el).text());
      if (text.length > 3 && text.length < 60 && !/more|view|ads/i.test(text)) {
        companyName = text;
        return false;
      }
    });
  }

  // Fallbacks
  if (!companyName && dealerSlug) companyName = deslugify(dealerSlug);
  if (!companyName) {
    const pageTitle = $("title").text().trim();
    const fromMatch = pageTitle.match(/from\s+(.+?)\s+(?:in\s+Dubai|in\s+Abu\s+Dhabi|\|)/i);
    if (fromMatch) companyName = fromMatch[1].trim();
  }
  if (!companyName) {
    $("script[type='application/ld+json']").each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        const name = json?.seller?.name || json?.provider?.name || json?.author?.name;
        if (name && typeof name === "string" && name.length > 2) {
          companyName = name; return false;
        }
      } catch { /* noop */ }
    });
  }

  // Absolute last resort — use slug-derived name so listing is never skipped
  if (!companyName) companyName = `OCD Dealer ${ocdId}`;

  // ── Dealer logo ───────────────────────────────────────────────────────────
  // logoSrc already captured while scanning dealer links above; fall back to class search
  if (!logoSrc) {
    const rawLogo =
      $("[class*='company-logo'] img, [class*='vendor-logo'] img, [class*='dealer-logo'] img").first().attr("src") ||
      $("[class*='company'] img[src*='company'], [class*='dealer'] img[src*='dealer']").first().attr("src") ||
      null;
    if (rawLogo) logoSrc = rawLogo.startsWith("http") ? rawLogo : `${BASE_URL}${rawLogo}`;
  }
  const normalizedLogo = logoSrc;

  // ── Phone / WhatsApp ──────────────────────────────────────────────────────
  // OCD uses <i class="callnwbtn">+971...</i> inside a span onclick handler
  const phoneLinks: string[] = [];
  $("i.callnwbtn").each((_, el) => {
    const num = $(el).text().trim();
    if (num && num.length > 5 && num.length < 20) phoneLinks.push(num);
  });
  // Fallback: tel: links
  if (phoneLinks.length === 0) {
    $("a[href^='tel:']").each((_, el) => {
      const num = $(el).attr("href")?.replace("tel:", "").trim();
      if (num && num.length > 5 && num.length < 20) phoneLinks.push(num);
    });
  }
  const phone = dealerPhone ?? phoneLinks[0] ?? null;

  let whatsapp: string | null = dealerWhatsapp;
  if (!whatsapp) {
    $("a[href*='wa.me'], a[href*='whatsapp']").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      const m = href.match(/wa\.me\/(\d+)/);
      if (m) { whatsapp = `+${m[1]}`; return false; }
    });
  }
  if (!whatsapp) whatsapp = phoneLinks[1] ?? phone;

  // ── Dealer area (location) ────────────────────────────────────────────────
  // Look for structured location/area element — avoid h1 title text
  let dealerArea: string | null = null;
  const areaSelectors = [
    "[class*='dealer-location']",
    "[class*='vendor-location']",
    "[class*='company-area']",
    "[class*='company-location']",
    "[itemprop='addressLocality']",
    "[itemprop='addressRegion']",
  ];
  for (const sel of areaSelectors) {
    const text = $(sel).first().text().trim();
    if (text.length > 2 && text.length < 60) {
      dealerArea = text.replace(/,?\s*Dubai.*/i, "").trim() || null;
      break;
    }
  }

  // ── Listing location (shown under title on detail page) ───────────────────
  let listingLocation: string | null = null;
  const locSelectors = [
    "[class*='listing-location']",
    "[class*='car-location']",
    "[class*='rent-location']",
    "[class*='location-text']",
  ];
  for (const sel of locSelectors) {
    const text = $(sel).first().text().trim().replace(/\s+/g, " ");
    if (text.length > 2 && text.length < 80 && /,/.test(text)) {
      listingLocation = text;
      break;
    }
  }
  // Fallback: look for short text with comma after h1 (e.g., "Al Quoz, Dubai")
  if (!listingLocation) {
    $("[class*='location'], [class*='address'], [class*='area']").each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (text.length > 3 && text.length < 60 && /,/.test(text) && !/AED|USD|\$|rental|rent/i.test(text)) {
        listingLocation = text;
        return false;
      }
    });
  }

  // ── Dealer note ───────────────────────────────────────────────────────────
  const dealerNote =
    $("[class*='dealer-note'], [class*='vendor-note'], [class*='dealer-remark']").first().text().trim() ||
    null;

  // ── Working hours ─────────────────────────────────────────────────────────
  // OCD renders hours in <table class="time-detail"><tr><td>Sunday</td><td>Open 24 hours</td></tr>...
  const workingHours: Record<string, string> = {};
  $("table.time-detail tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length >= 2) {
      const day = cells.eq(0).text().trim();
      const hrs = cells.eq(1).text().trim();
      if (day && hrs) workingHours[day] = hrs;
    }
  });

  // ── Is verified / premium ─────────────────────────────────────────────────
  const isVerified = /verified\s+dealer|verified\s+company/i.test(bodyText);
  const isPremiumDealer = $("[class*='premium']").length > 0;

  const dealer: ParsedDealer = {
    ocd_company_name: companyName,
    ocd_company_slug: slugify(companyName),
    phone,
    whatsapp,
    area: dealerArea,
    city: "Dubai",
    logo_url: normalizedLogo,
    description: $("[class*='company-desc'], [class*='vendor-desc'], [class*='about-dealer']").first().text().trim() || null,
    dealer_note: dealerNote,
    working_hours: Object.keys(workingHours).length > 0 ? workingHours : null,
    is_verified: isVerified,
    is_premium: isPremiumDealer,
  };

  // ── Make / Model / Year ───────────────────────────────────────────────────
  let make: string | null = null;
  let model: string | null = null;
  let year: number | null = null;

  // From URL — most reliable: /search-car-rentals-dubai/Nissan/Patrol-Titanium/?id=
  const urlMatch = url.match(/search-car-rentals-[^/]+\/([^/]+)\/([^/?]+)/);
  if (urlMatch) {
    make  = urlMatch[1].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    model = urlMatch[2].replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  }

  // Year from page title or h1 (4-digit number 1980–2040)
  const h1Text = $("h1").first().text();
  const pageTitleText = $("title").text();
  const yearMatch = (h1Text || pageTitleText).match(/\b(20[0-3]\d|19[89]\d)\b/);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // ── Car overview table ────────────────────────────────────────────────────
  // ── Car Overview ──────────────────────────────────────────────────────────
  const overviewData: Record<string, string> = {};
  
  // Targeted extraction from div.description-highlights div.d-grid.priceingdt
  $("div.description-highlights div.d-grid.priceingdt").each((_, el) => {
    const label = $(el).find("span:first-child, a:first-child").first().text().trim().toLowerCase().replace(/[/:()]/g, "").trim();
    const value = $(el).find(".text-right").text().trim();
    if (label && value) overviewData[label] = value;
  });

  // Fallback to any table if targeted failed
  if (Object.keys(overviewData).length === 0) {
    $("table tr").each((_, row) => {
      const cells = $(row).find("td, th");
      for (let i = 0; i + 1 < cells.length; i += 2) {
        const label = cells.eq(i).text().trim().toLowerCase().replace(/[/:()]/g, "").trim();
        const val   = cells.eq(i + 1).text().trim();
        if (label && val) overviewData[label] = val;
      }
    });
  }

  const getOverview = (key: string): string => {
    const k = Object.keys(overviewData).find(k => k.includes(key.toLowerCase()));
    return k ? (overviewData[k] || "") : "";
  };

  const bodyTypeRaw      = getOverview("body type") || getOverview("body") || "";
  const transmissionRaw  = getOverview("gearbox")   || getOverview("transmission") || "";
  const fuelRaw          = getOverview("fuel type")  || getOverview("fuel")         || "";
  const seatsRaw         = getOverview("seating capacity") || getOverview("seats") || getOverview("passenger") || "";
  const doorsRaw         = getOverview("no. of doors") || getOverview("doors")     || "";
  const luggageRaw       = getOverview("fits no. of bags") || getOverview("bags") || getOverview("luggage") || "";
  const colorRaw         = getOverview("exterior / interior color") || getOverview("exterior color") || "";
  const colorIntRaw      = getOverview("interior color") || "";
  const specTypeRaw      = getOverview("spec type") || getOverview("spec") || getOverview("specs") || "";
  const engineCapacity   = getOverview("engine capacity") || null;
  const paymentModesRaw  = getOverview("payment modes") || getOverview("payment")  || "";

  // Parse exterior/interior from combined "Green / Brown" field
  let colorExterior = colorRaw || null;
  let colorInterior = colorIntRaw || null;
  if (colorRaw.includes("/")) {
    const parts = colorRaw.split("/").map(s => s.trim());
    colorExterior = parts[0] || null;
    colorInterior = colorInterior || parts[1] || null;
  }

  const safeSeats   = parseInteger(seatsRaw, 30);
  const safeDoors   = parseInteger(doorsRaw, 10);
  const safeLuggage = parseInteger(luggageRaw, 20);

  const bodyTypeMap: Record<string, string> = {
    suv: "SUV", sedan: "Sedan", hatchback: "Hatchback", coupe: "Coupe",
    convertible: "Convertible", van: "Van", pickup: "Pickup", truck: "Pickup",
    supercar: "Supercar", sports: "Sports", electric: "Electric",
    luxury: "Luxury", minivan: "Van", crossover: "SUV",
  };
  const bodyTypeLower = bodyTypeRaw.toLowerCase();
  const bodyType = Object.entries(bodyTypeMap).find(([k]) => bodyTypeLower.includes(k))?.[1] ?? (bodyTypeRaw || null);

  const transmLower = transmissionRaw.toLowerCase();
  const transmission =
    transmLower.includes("auto") ? "automatic" :
    transmLower.includes("manual") ? "manual" : null;

  const fuelLower = fuelRaw.toLowerCase();
  const fuelType =
    fuelLower.includes("diesel") ? "diesel" :
    fuelLower.includes("hybrid") ? "hybrid" :
    fuelLower.includes("electric") ? "electric" :
    fuelLower.includes("petrol") || fuelLower.includes("gasoline") ? "petrol" : null;

  const specType =
    /gcc/i.test(specTypeRaw) ? "GCC" :
    /american/i.test(specTypeRaw) ? "American" :
    /european/i.test(specTypeRaw) ? "European" :
    /japan/i.test(specTypeRaw) ? "Japanese" :
    (specTypeRaw || null);


  // ── Pricing Extraction (Tab-based) ─────────────────────────────────────────
  const periods = ["day", "week", "month"];
  const pricingByPeriod: Record<string, any> = {
    day: { discounted: null, original: null, km: null, extraKmRate: null, extraKmCurrency: primaryCurrency, currency: primaryCurrency },
    week: { discounted: null, original: null, km: null, extraKmRate: null, extraKmCurrency: primaryCurrency, currency: primaryCurrency },
    month: { discounted: null, original: null, km: null, extraKmRate: null, extraKmCurrency: primaryCurrency, currency: primaryCurrency },
  };

  periods.forEach(period => {
    const tabBtn = $(`.tablinks:contains("/ ${period}")`).first();
    const tabContentId = tabBtn.attr("onclick")?.match(/'([^']+)'/)?.[1];
    const tabContent = tabContentId ? $(`#${tabContentId}`) : null;

    if (tabBtn.length) {
      const discountedText = tabBtn.find("span.finalpr").text().trim();
      const originalText = tabBtn.find("s.f-13").text().replace(/[^\d.]/g, "").trim();
      const curText = tabBtn.find("span.currencypr").text().trim();
      
      if (curText) pricingByPeriod[period].currency = curText.toUpperCase();
      if (discountedText) pricingByPeriod[period].discounted = parseFloat(discountedText.replace(/,/g, ""));
      if (originalText) pricingByPeriod[period].original = parseFloat(originalText.replace(/,/g, ""));
    }

    if (tabContent && tabContent.length) {
      tabContent.find(".priceingdt").each((_, el) => {
        const text = $(el).text();
        if (/included\s+mileage/i.test(text)) {
          const val = $(el).find(".text-right").text().match(/([\d,]+)/);
          if (val) pricingByPeriod[period].km = parseInt(val[1].replace(/,/g, ""), 10);
        } else if (/additional\s+mileage/i.test(text)) {
          const val = $(el).find(".text-right").text().match(/([A-Z]+)?\s*([\d.]+)/i);
          if (val) {
            if (val[1]) pricingByPeriod[period].extraKmCurrency = val[1].toUpperCase();
            pricingByPeriod[period].extraKmRate = parseFloat(val[2]);
          }
        }
      });
    }
  });

  // Fallback for missing periods (e.g. from hidden inputs or WhatsApp link)
  if (!pricingByPeriod.day.discounted) {
    const dPrice = $("#m_daily_price").val() as string;
    if (dPrice) {
      const m = dPrice.match(/([A-Z]+)?\s*([\d,.]+)/i);
      if (m) pricingByPeriod.day.discounted = parseFloat(m[2].replace(/,/g, ""));
    }
  }
  if (!pricingByPeriod.week.discounted) {
    const wPrice = $("#m_weekly_price").val() as string;
    if (wPrice) {
      const m = wPrice.match(/([A-Z]+)?\s*([\d,.]+)/i);
      if (m) pricingByPeriod.week.discounted = parseFloat(m[2].replace(/,/g, ""));
    }
  }
  if (!pricingByPeriod.month.discounted) {
    const mPrice = $("#m_monthly_price").val() as string;
    if (mPrice) {
      const m = mPrice.match(/([A-Z]+)?\s*([\d,.]+)/i);
      if (m) pricingByPeriod.month.discounted = parseFloat(m[2].replace(/,/g, ""));
    }
  }

  const currency = pricingByPeriod.day.currency || pricingByPeriod.week.currency || pricingByPeriod.month.currency || primaryCurrency;
  const dailyKm   = pricingByPeriod.day.km;
  const weeklyKm  = pricingByPeriod.week.km;
  const monthlyKm = pricingByPeriod.month.km;
  const extraKmRate = pricingByPeriod.day.extraKmRate;
  const extraKmCurrency = pricingByPeriod.day.extraKmCurrency;


  // ── Deposit ───────────────────────────────────────────────────────────────
  let depositAed: number | null = null;
  const depositPatterns = [
    /(?:security\s+)?deposit[^:\n]*:?\s*(AED|USD|EUR)?\s*([\d,]+)/i,
  ];
  for (const pat of depositPatterns) {
    const m = bodyText.match(pat);
    if (m) {
      const amount = parseFloat(m[2].replace(/,/g, ""));
      // Convert USD → AED if needed (rough 3.67x)
      depositAed = m[1]?.toUpperCase() === "USD" ? Math.round(amount * 3.67) : amount;
      break;
    }
  }

  // ── Salik ─────────────────────────────────────────────────────────────────
  let salikAed: number | null = null;
  $(`span:contains("Salik"), span:contains("Toll Charges")`).each((_, el) => {
    const elText = $(el).text().trim();
    if (/salik|toll\s*charges/i.test(elText)) {
      const valText = $(el).next().text().trim();
      const m = valText.match(/(AED|USD|EUR|SAR|GBP)?\s*([\d.]+)/i);
      if (m) {
        salikAed = parseFloat(m[2]);
        return false;
      }
    }
  });

  // ── VAT ───────────────────────────────────────────────────────────────────
  const vatMatch = bodyText.match(/(\d+(?:\.\d+)?)%\s*VAT/i);
  const vatPercent = vatMatch ? parseFloat(vatMatch[1]) : 5;

  // ── Images ────────────────────────────────────────────────────────────────
  // De-duplicate by normalizing size-suffix variants.
  // Prefer data-src (lazy-loaded real image) over src (may be placeholder).
  const imageUrls: string[] = [];
  const seenNormUrls = new Set<string>();

  const addImage = (src: string) => {
    if (!src) return;
    if (src.startsWith("data:") || /placeholder|loading|blank|spinner/i.test(src)) return;
    const u = src.startsWith("http") ? src : `${BASE_URL}${src}`;
    // Normalize: strip _full/_medium/_large/_thumb to deduplicate against _small
    const norm = u.replace(/_(full|medium|large|thumb|big)\.(jpg|jpeg|png|webp)/i, "_small.$2")
                   .replace(/_(small)\.(jpg|jpeg|png|webp)/i, "_small.$2");
    if (seenNormUrls.has(norm)) return;
    seenNormUrls.add(norm);
    // Always store the _small version (confirmed working on OCD CDN)
    const storeUrl = /\.(jpg|jpeg|png|webp)$/i.test(u) && !u.includes("_small.")
      ? u  // no size suffix — keep as-is
      : norm;
    imageUrls.push(storeUrl);
  };

  $("img").each((_, el) => {
    const $el = $(el);
    // Prefer lazy-loaded attribute (real image) to avoid collecting placeholder + real = double
    const lazySrc = $el.attr("data-src") || $el.attr("data-lazy") ||
                    $el.attr("data-original") || $el.attr("data-img") || $el.attr("data-url");
    const src = lazySrc
      ? (lazySrc.includes("uploads/cars") ? lazySrc : "")
      : ($el.attr("src") || "");
    if (src.includes("uploads/cars")) addImage(src);
  });

  $("source").each((_, el) => {
    const srcset = $(el).attr("srcset") || $(el).attr("data-srcset") || "";
    srcset.split(",").forEach(entry => {
      const u = entry.trim().split(/\s+/)[0];
      if (u && u.includes("uploads/cars")) addImage(u);
    });
  });

  const primaryImage = imageUrls[0] ?? null;

  // ── Videos ────────────────────────────────────────────────────────────────
  const videoUrls: string[] = [];

  $("video").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src) videoUrls.push(src.startsWith("http") ? src : `${BASE_URL}${src}`);
    $(el).find("source").each((__, s) => {
      const ssrc = $(s).attr("src") || "";
      if (ssrc) videoUrls.push(ssrc.startsWith("http") ? ssrc : `${BASE_URL}${ssrc}`);
    });
  });

  $("iframe").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && (src.includes("youtube") || src.includes("vimeo") || src.includes(".mp4"))) {
      videoUrls.push(src);
    }
  });

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.match(/\.(mp4|webm|mov)(\?|$)/i)) {
      videoUrls.push(href.startsWith("http") ? href : `${BASE_URL}${href}`);
    }
  });

  // ── Special offer ─────────────────────────────────────────────────────────
  let specialOfferHeading: string | null = null;
  let specialOfferBody: string | null = null;
  let specialOfferDisclaimer: string | null = null;
  let specialOffer: string | null = null;

  const offerSection = $(
    "[class*='special-offer'], [class*='promo-box'], [class*='offer-banner'], [class*='special_offer'], [class*='offer-section']"
  ).first();

  if (offerSection.length) {
    specialOfferHeading = offerSection.find("h2, h3, h4, [class*='title'], [class*='heading'], strong, b").first().text().trim() || null;
    specialOfferBody = offerSection.find("p, [class*='desc'], [class*='body'], [class*='content']").first().text().trim() || null;
    specialOfferDisclaimer = offerSection.find("[class*='disclaimer'], [class*='terms'], small, [class*='note'], [class*='footer']").first().text().trim() || null;
    specialOffer = specialOfferHeading || cleanText(offerSection.text()).slice(0, 300) || null;
  } else {
    // Fallback: find "Special Offer" heading
    $("h2, h3, h4, [class*='section-title']").each((_, el) => {
      if (/special\s+offer/i.test($(el).text())) {
        specialOfferHeading = $(el).text().trim();
        const parent = $(el).parent();
        const lines = parent.find("p, li").map((__, li) => $(li).text().trim()).get();
        if (lines.length > 0) {
          specialOfferBody = lines[0] || null;
          specialOfferDisclaimer = lines.slice(1).join(" ") || null;
        }
        specialOffer = specialOfferHeading;
        return false;
      }
    });
  }

  // ── Min rental days & Insurance ───────────────────────────────────────────
  let minRentalDays = 1;
  let insuranceIncluded = /insurance\s+included/i.test(bodyText);
  let freeDelivery = /free\s+delivery/i.test(bodyText);

  // Most reliable: hidden form input set server-side
  const hiddenMinDays = ($("input#min_day_rental").val() as string || "").trim();
  if (hiddenMinDays) minRentalDays = parseInt(hiddenMinDays, 10) || 1;

  $("ul.card-del li").each((_, el) => {
    const text = $(el).text().trim();
    if (!hiddenMinDays && /(\d+)\s*day\s+rental/i.test(text)) {
      const m = text.match(/(\d+)/);
      if (m) minRentalDays = parseInt(m[1], 10);
    }
    if (/insurance\s+included/i.test(text)) insuranceIncluded = true;
    if (/free\s+delivery/i.test(text)) freeDelivery = true;
  });

  // ── Dealer Note (Inline from .supbox) ─────────────────────────────────────
  const dealerNoteEl = $(".supbox .sup-text").first();
  let dealerNoteText = dealerNoteEl.clone().children("b, i").remove().end().text().trim();
  if (!dealerNoteText) {
    dealerNoteText = $("[class*='dealer-note'], [class*='vendor-note'], [class*='dealer-remark']").first().text().trim();
  }

  // ── Requirements to rent (from JSON-LD + Body) ───────────────────────────
  let minAge: number | null = null;
  let depositAmount: number | null = null;
  let depositCurrency: string | null = null;
  let refundPeriod: string | null = null;

  $("script[type='application/ld+json']").each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (json["@type"] === "FAQPage" && Array.isArray(json.mainEntity)) {
        json.mainEntity.forEach((q: any) => {
          const answer = q.acceptedAnswer?.text || "";
          if (/minimum\s+age/i.test(q.name || "")) {
            const m = answer.match(/(\d+)\s+years/);
            if (m) minAge = parseInt(m[1], 10);
          }
          if (/security\s+deposit/i.test(q.name || "")) {
            const m = answer.match(/(AED|USD|EUR)?\s*([\d,]+)/i);
            if (m) {
              if (m[1]) depositCurrency = m[1].toUpperCase();
              depositAmount = parseFloat(m[2].replace(/,/g, ""));
            }
            if (/refunded|returned/i.test(answer)) {
              const r = answer.match(/(\d+)\s+days/);
              if (r) refundPeriod = `${r[1]} days`;
            }
          }
        });
      }
    } catch { /* noop */ }
  });

  const requirementsToRentRaw = $("[class*='requirements'], [id*='requirements']").first().text().trim() || null;

  // ── Features by category ─────────────────────────────────────────────────
  // Features live under .featurnspecs (not .featurewrap.featurnspecs which has Rental Terms)
  // We skip any faqbottom whose h3 says "Rental Terms"
  const featureGroups: Record<string, string[]> = {};
  const allFeatures: string[] = [];
  $(".featurnspecs .faqbottom").each((_, group) => {
    const category = $(group).find("h3.side-hd").text().trim();
    if (!category || /rental\s*terms/i.test(category)) return; // skip rental terms section
    const items: string[] = [];
    $(group).find(".panel li").each((__, li) => {
      // Remove icon images text artifacts — just take visible text
      const text = $(li).clone().find("img").remove().end().text().trim();
      if (text.length > 1 && text.length < 100) {
        items.push(text);
        if (!allFeatures.includes(text)) allFeatures.push(text);
      }
    });
    if (category && items.length) featureGroups[category] = items;
  });

  // Fallback if no categories found
  if (allFeatures.length === 0) {
    $("[class*='features-list'] li, [class*='features'] li").each((_, el) => {
      const text = $(el).clone().find("img").remove().end().text().trim();
      if (text.length > 2 && text.length < 80) allFeatures.push(text);
    });
  }

  // ── Policies (from Rental Terms modal) ───────────────────────────────────
  // OCD stores standard rental policies in #openModalrental hidden modal divs
  // .rtone = mileage, .rttwo = fuel, .rtthree = deposit, .rtfour = rental
  function extractFromModal(cls: string): string | null {
    const el = $(`#openModalrental .${cls} p`).first();
    const text = el.text().trim();
    return text.length > 10 ? text : null;
  }
  const mileagePolicy = extractFromModal("rtone") || extractPolicy("mileage");
  const depositPolicy = extractFromModal("rtthree") || extractPolicy("deposit");
  const rentalPolicy  = extractFromModal("rtfour") || extractPolicy("rental");
  const fuelPolicyRaw = getOverview("fuel policy");
  const fuelPolicy = fuelPolicyRaw ||
    extractFromModal("rttwo") ||
    (bodyText.match(/fuel policy[:\s]+([^.\n]+)/i)?.[1].trim() || null);

  // Payment methods — extract from the payment modes modal list
  const paymentMethods: string[] = [];
  $("ul.paymentstyle li span").each((_, el) => {
    const label = $(el).clone().find("small").remove().end().text().trim();
    if (label && label.length < 40) paymentMethods.push(label);
  });
  // Fallback text-search if modal not present
  if (paymentMethods.length === 0) {
    if (/cash/i.test(bodyText)) paymentMethods.push("Cash");
    if (/credit\s+card/i.test(bodyText)) paymentMethods.push("Credit Card");
    if (/debit\s+card/i.test(bodyText)) paymentMethods.push("Debit Card");
    if (/bitcoin|crypto/i.test(bodyText)) paymentMethods.push("Crypto");
    if (/bank\s+transfer|cheque/i.test(bodyText)) paymentMethods.push("Bank Transfer");
  }

  const additionalCharges = $("[class*='additional-charge'], [class*='extra-charge']").first().text().trim() || null;


  // ── Meta ──────────────────────────────────────────────────────────────────
  const isPremiumListing = $("[class*='premium']").length > 0;
  const isFeatured = fullTextLower.includes("featured");

  const lastUpdatedMatch = bodyText.match(/(?:last\s+updated|updated\s+on)[:\s]+(\d{1,2}\s+\w+\s+\d{4}|\d{2}\/\d{2}\/\d{4})/i);
  const ocdLastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : null;

  return {
    ocd_listing_id: ocdId,
    ocd_url: url,
    location: listingLocation,
    make,
    model,
    year,
    body_type: bodyType,
    transmission,
    fuel_type: fuelType,
    seats: safeSeats,
    doors: safeDoors,
    luggage_bags: safeLuggage,
    color_exterior: colorExterior,
    color_interior: colorInterior,
    spec_type: specType,
    engine_capacity: engineCapacity,
    currency,
    daily_rate_aed: pricingByPeriod.day.discounted,
    weekly_rate_aed: pricingByPeriod.week.discounted,
    monthly_rate_aed: pricingByPeriod.month.discounted,
    daily_rate_original: pricingByPeriod.day.original,
    weekly_rate_original: pricingByPeriod.week.original,
    monthly_rate_original: pricingByPeriod.month.original,
    daily_km_included: dailyKm,
    weekly_km_included: weeklyKm,
    monthly_km_included: monthlyKm,
    extra_km_rate_aed: extraKmCurrency === "AED" ? extraKmRate : (extraKmRate ? extraKmRate * 3.67 : null),
    extra_km_rate: extraKmRate,
    extra_km_currency: extraKmRate ? extraKmCurrency : null,
    // New per-period fields
    daily_extra_km_rate: pricingByPeriod.day.extraKmRate,
    daily_extra_km_currency: pricingByPeriod.day.extraKmCurrency,
    weekly_extra_km_rate: pricingByPeriod.week.extraKmRate,
    weekly_extra_km_currency: pricingByPeriod.week.extraKmCurrency,
    monthly_extra_km_rate: pricingByPeriod.month.extraKmRate,
    monthly_extra_km_currency: pricingByPeriod.month.extraKmCurrency,
    deposit_aed: depositAed,
    salik_charges_aed: salikAed,
    vat_percentage: vatPercent,
    insurance_included: insuranceIncluded,
    free_delivery: freeDelivery,
    min_rental_days: minRentalDays,
    fuel_policy: fuelPolicy,
    payment_methods: paymentMethods,
    payment_modes: paymentModesRaw || null,
    mileage_policy: mileagePolicy,
    deposit_policy: depositPolicy,
    rental_policy: rentalPolicy,
    additional_charges: additionalCharges,
    features: allFeatures,
    features_by_category: Object.keys(featureGroups).length > 0 ? featureGroups : null,
    image_urls: imageUrls,
    video_urls: videoUrls,
    primary_image_url: primaryImage,
    special_offer: specialOffer,
    special_offer_heading: specialOfferHeading,
    special_offer_body: specialOfferBody,
    special_offer_disclaimer: specialOfferDisclaimer,
    requirements_to_rent: requirementsToRentRaw,
    min_driver_age: minAge,
    security_deposit_amount: depositAmount,
    security_deposit_currency: depositCurrency,
    deposit_refund_period: refundPeriod,
    dealer_note: dealerNoteText,
    is_premium: isPremiumListing,
    is_featured: isFeatured,
    ocd_last_updated: ocdLastUpdated,
    dealer,
  };

}

// ─── DB helpers ──────────────────────────────────────────────────────────────

async function updateJob(jobId: string, fields: Record<string, unknown>) {
  await (db as any).from("ocd_scrape_jobs").update(fields).eq("id", jobId);
}

async function upsertDealer(jobId: string, dealer: ParsedDealer): Promise<string> {
  const { data, error } = await (db as any)
    .from("ocd_scraped_dealers")
    .upsert(
      { job_id: jobId, ...dealer },
      { onConflict: "ocd_company_name", ignoreDuplicates: false },
    )
    .select("id")
    .single();
  if (error) throw new Error(`Dealer upsert failed: ${error.message}`);
  return data.id as string;
}

async function upsertListing(jobId: string, dealerId: string, listing: ParsedListing) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dealer: _dealer, ...rest } = listing;
  const { error } = await (db as any)
    .from("ocd_scraped_listings")
    .upsert(
      { job_id: jobId, dealer_id: dealerId, ...rest },
      { onConflict: "ocd_listing_id", ignoreDuplicates: false },
    );
  if (error) throw new Error(`Listing upsert failed: ${error.message}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const jobIdArg = process.argv[2];
  let jobId: string;

  if (jobIdArg) {
    jobId = jobIdArg;
    await updateJob(jobId, { status: "running", started_at: new Date().toISOString() });
    console.log(`Resuming job: ${jobId}`);
  } else {
    const { data, error } = await (db as any)
      .from("ocd_scrape_jobs")
      .insert({
        source: "oneclickdrive",
        source_city: "dubai",
        source_url: DUBAI_BASE,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) { console.error("Failed to create job:", error.message); process.exit(1); }
    jobId = data.id as string;
    console.log(`Created job: ${jobId}`);
  }

  try {
    // ── Step 1: Detect total pages ────────────────────────────────────────
    console.log("Fetching page 1 to detect total pages…");
    const page1Html = await fetchHtml(DUBAI_BASE);
    const { total: totalPages, urlTemplate } = detectTotalPages(page1Html);
    console.log(`Total pages: ${totalPages}, URL template: ${urlTemplate}`);
    await updateJob(jobId, { total_pages: totalPages });

    // ── Step 2: Collect all listing cards ─────────────────────────────────
    const allCards: ListingCard[] = [...parseListingCards(page1Html)];
    console.log(`Page 1: found ${allCards.length} listings`);

    for (let page = 2; page <= totalPages; page++) {
      await sleep(DELAY_MS);
      const pageUrl = urlTemplate.replace("{page}", String(page));
      try {
        const html  = await fetchHtml(pageUrl);
        const cards = parseListingCards(html);
        allCards.push(...cards);
        console.log(`Page ${page}/${totalPages}: ${cards.length} listings (total: ${allCards.length})`);
        await updateJob(jobId, { pages_scraped: page, listings_found: allCards.length });
      } catch (err) {
        console.error(`Page ${page} failed:`, (err as Error).message);
      }
    }

    console.log(`\nTotal listing cards found: ${allCards.length}`);
    await updateJob(jobId, { listings_found: allCards.length });

    // ── Step 3: Fetch detail pages ─────────────────────────────────────────
    const dealerIdCache: Record<string, string> = {};
    let scraped = 0;
    let dealersFound = 0;
    let debugDumped = false; // dump first listing HTML once for inspection

    for (let i = 0; i < allCards.length; i += BATCH_SIZE) {
      const batch = allCards.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (card) => {
          await sleep(Math.random() * 500);
          const html = await fetchHtml(card.url);
          // Dump first listing HTML so we can inspect OCD's real structure
          if (!debugDumped) {
            debugDumped = true;
            const dumpPath = resolve(process.cwd(), "debug-ocd-listing.html");
            writeFileSync(dumpPath, html, "utf8");
            console.log(`\n[DEBUG] First listing HTML saved to: ${dumpPath}\n`);
          }
          return parseDetailPage(html, card.ocdId, card.url);
        }),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          console.error("Detail fetch failed:", result.reason);
          continue;
        }
        const parsed = result.value;

        const cacheKey = parsed.dealer.ocd_company_name;
        if (!dealerIdCache[cacheKey]) {
          dealerIdCache[cacheKey] = await upsertDealer(jobId, parsed.dealer);
          dealersFound++;
        }
        await upsertListing(jobId, dealerIdCache[cacheKey], parsed);
        scraped++;
      }

      // Update listing counts for dealers in this batch
      for (const [, id] of Object.entries(dealerIdCache)) {
        const { count } = await (db as any)
          .from("ocd_scraped_listings")
          .select("*", { count: "exact", head: true })
          .eq("dealer_id", id);
        await (db as any)
          .from("ocd_scraped_dealers")
          .update({ listing_count: count ?? 0 })
          .eq("id", id);
      }

      console.log(`Scraped ${scraped}/${allCards.length} | ${dealersFound} dealers`);
      await updateJob(jobId, { listings_scraped: scraped, dealers_found: dealersFound });
      await sleep(DELAY_MS);
    }

    // ── Done ──────────────────────────────────────────────────────────────
    await updateJob(jobId, {
      status: "completed",
      completed_at: new Date().toISOString(),
      listings_scraped: scraped,
      dealers_found: dealersFound,
    });
    console.log(`\n✓ Done! ${scraped} listings from ${dealersFound} dealers.  Job: ${jobId}`);
  } catch (err) {
    const msg = (err as Error).message;
    console.error("Fatal error:", msg);
    await updateJob(jobId, {
      status: "failed",
      error_message: msg,
      completed_at: new Date().toISOString(),
    });
    process.exit(1);
  }
}

main();
