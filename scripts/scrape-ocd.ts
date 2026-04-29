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
import dotenv from "dotenv";
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

  // ── Detect primary currency ──────────────────────────────────────────────
  const aedCount = (html.match(/\bAED\b/g) || []).length;
  const usdCount = (html.match(/\bUSD\b/g) || []).length;
  const eurCount = (html.match(/\bEUR\b/g) || []).length;
  let primaryCurrency = "AED";
  if (usdCount > aedCount && usdCount >= eurCount) primaryCurrency = "USD";
  else if (eurCount > aedCount && eurCount > usdCount) primaryCurrency = "EUR";

  // ── Dealer name ───────────────────────────────────────────────────────────
  // Primary strategy: scan ALL <a href> pointing to /rent-a-car-dubai/[slug]/
  // Every OCD detail page has at least one dealer page link (logo, "More Ads", etc.)
  let companyName = "";
  let dealerSlug  = "";
  let logoSrc: string | null = null;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const slugMatch = href.match(/\/rent-a-car-dubai\/([a-z0-9][a-z0-9-]{2,60})\//i);
    if (!slugMatch) return;
    const slug = slugMatch[1].toLowerCase();
    if (slug === "dubai" || slug === "abu-dhabi" || slug === "sharjah") return;

    dealerSlug = slug;

    // Check for a logo image inside this link (most specific)
    const $img = $(el).find("img").first();
    if ($img.length) {
      const alt = $img.attr("alt") || "";
      if (alt.length > 3 && alt.length < 100 && !/logo/i.test(alt)) {
        companyName = alt;
      }
      const imgSrc = $img.attr("src") || $img.attr("data-src") || "";
      if (imgSrc && !logoSrc) logoSrc = imgSrc.startsWith("http") ? imgSrc : `${BASE_URL}${imgSrc}`;
    }

    // Prefer non-generic link text (e.g. actual company name rendered in link)
    if (!companyName) {
      const linkText = cleanText($(el).text());
      if (
        linkText.length > 3 && linkText.length < 100 &&
        !/more\s+ads|view\s+all|see\s+all|info|location|ads\s+by|dealer|rent|book|call|whatsapp/i.test(linkText) &&
        !/^(Dubai|Abu Dhabi|Sharjah|UAE)$/i.test(linkText)
      ) {
        companyName = linkText;
      }
    }
  });

  // Fallback: deslugify the URL slug
  if (!companyName && dealerSlug) {
    companyName = deslugify(dealerSlug);
  }

  // Last resort fallback: title-based extraction
  if (!companyName) {
    const pageTitle = $("title").text().trim();
    const fromMatch = pageTitle.match(/from\s+(.+?)\s+(?:in\s+Dubai|in\s+Abu\s+Dhabi|\|)/i);
    if (fromMatch) companyName = fromMatch[1].trim();
  }

  // JSON-LD
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
  const phoneLinks: string[] = [];
  $("a[href^='tel:']").each((_, el) => {
    const num = $(el).attr("href")?.replace("tel:", "").trim();
    if (num && num.length > 5 && num.length < 20) phoneLinks.push(num);
  });
  const phone = phoneLinks[0] ?? null;

  let whatsapp: string | null = null;
  $("a[href*='wa.me'], a[href*='whatsapp']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const m = href.match(/wa\.me\/(\d+)/);
    if (m) { whatsapp = `+${m[1]}`; return false; }
  });
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
  const workingHours: Record<string, string> = {};
  $("[class*='hours'], [class*='schedule'], [class*='timing'], [class*='working']").each((_, el) => {
    $(el).find("li, tr, [class*='row'], [class*='day']").each((__, row) => {
      const text = $(row).text().trim();
      const dayMatch = text.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/i);
      if (dayMatch) workingHours[dayMatch[1]] = text.replace(dayMatch[0], "").trim() || "Closed";
    });
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
  // Build a label→value map by finding the CAR OVERVIEW section
  const overviewData: Record<string, string> = {};

  // Find overview section by heading or class
  let overviewSection = $("[class*='car-overview'], [class*='overview-section'], [id*='overview']").first();
  if (!overviewSection.length) {
    $("h2, h3, h4, [class*='section-title'], [class*='section-heading']").each((_, el) => {
      if (/car\s+overview/i.test($(el).text())) {
        overviewSection = $(el).parent();
        return false;
      }
    });
  }

  const parseOverviewContainer = (container: ReturnType<typeof $>) => {
    // Table format: rows with alternating label/value pairs
    container.find("tr").each((_, row) => {
      const cells = $(row).find("td, th");
      for (let i = 0; i + 1 < cells.length; i += 2) {
        const label = cells.eq(i).text().trim().toLowerCase().replace(/[/:()]/g, "").trim();
        const val   = cells.eq(i + 1).text().trim();
        if (label && val && label.length < 50) overviewData[label] = val;
      }
    });
    // Label+value div format
    container.find("[class*='label'], [class*='key'], [class*='attr-name'], [class*='spec-label']").each((_, el) => {
      const label = $(el).text().trim().toLowerCase().replace(/[/:()]/g, "").trim();
      const val   = $(el).next().text().trim() ||
                    $(el).siblings("[class*='value'], [class*='val'], [class*='spec-value']").first().text().trim();
      if (label && val && label.length < 50) overviewData[label] = val;
    });
  };

  if (overviewSection.length) {
    parseOverviewContainer(overviewSection);
  }

  // Fallback: scan all td/th pairs in any table on the page
  if (Object.keys(overviewData).length === 0) {
    $("table").each((_, table) => {
      $(table).find("tr").each((__, row) => {
        const cells = $(row).find("td, th");
        for (let i = 0; i + 1 < cells.length; i += 2) {
          const label = cells.eq(i).text().trim().toLowerCase().replace(/[/:()]/g, "").trim();
          const val   = cells.eq(i + 1).text().trim();
          if (label && val && label.length < 50) overviewData[label] = val;
        }
      });
    });
  }

  const getOverview = (key: string): string => {
    const k = Object.keys(overviewData).find(k => k.includes(key.toLowerCase()));
    return k ? (overviewData[k] || "") : "";
  };

  // ── Spec extraction ───────────────────────────────────────────────────────
  // Prefer overview table, fall back to getSpecValue (broad scan)
  function getSpecValue(label: string): string {
    const ov = getOverview(label);
    if (ov) return ov;

    let exactVal = "";
    $(`span:contains("${label}"), b:contains("${label}"), div:contains("${label}"), a:contains("${label}")`).each((_, el) => {
      const elText = $(el).text().trim().toLowerCase();
      if (elText === label.toLowerCase() || elText === `${label.toLowerCase()} :` || elText === `${label.toLowerCase()}:`) {
        const next = $(el).next().text().trim();
        if (next && next.length < 100) { exactVal = next; return false; }
      }
    });
    if (exactVal) return exactVal;

    let val = "";
    $("td, th, [class*='spec'], [class*='detail'], [class*='overview']").each((_, el) => {
      const text = $(el).text().trim();
      if (new RegExp(`^${label}`, "i").test(text)) {
        const sibling = $(el).next().text().trim();
        if (sibling && sibling.length < 100) { val = sibling; return false; }
        const colon = text.match(new RegExp(`${label}[:\\s]+(.+)`, "i"));
        if (colon && colon[1].length < 100) { val = colon[1].trim(); return false; }
      }
    });
    return val;
  }

  const bodyTypeRaw      = getSpecValue("body type") || getSpecValue("Body Type") || getOverview("body") || "";
  const transmissionRaw  = getSpecValue("gearbox")   || getSpecValue("transmission") || "";
  const fuelRaw          = getSpecValue("fuel type")  || getSpecValue("fuel")         || "";
  const seatsRaw         = getSpecValue("seating capacity") || getSpecValue("seats") || getSpecValue("passenger") || "";
  const doorsRaw         = getSpecValue("no. of doors") || getSpecValue("doors")     || "";
  const luggageRaw       = getSpecValue("fits no. of bags") || getSpecValue("bags") || getSpecValue("luggage") || "";
  const colorRaw         = getSpecValue("exterior / interior color") || getSpecValue("exterior color") || "";
  const colorIntRaw      = getSpecValue("interior color") || "";
  const specTypeRaw      = getSpecValue("spec type") || getSpecValue("spec")          || "";
  const engineCapacity   = getSpecValue("engine capacity") || null;
  const paymentModesRaw  = getSpecValue("payment modes") || getSpecValue("payment")  || "";

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

  // ── Pricing ───────────────────────────────────────────────────────────────
  // Extract original + discounted price for each period, in whatever currency OCD shows
  interface PeriodPrice {
    discounted: number | null;
    original: number | null;
    km: number | null;
    currency: string;
  }

  function extractPeriodPrice(period: string): PeriodPrice {
    let discounted: number | null = null;
    let original: number | null = null;
    let km: number | null = null;
    let currency = primaryCurrency;

    const periodRe = new RegExp(`\\/${period}`, "i");

    // Scan narrow elements that contain this period (/day /week /month)
    $("td, [class*='price-'], [class*='rate-'], [class*='pricing-'], [class*='period']").each((_, el) => {
      const text = cleanText($(el).text());
      if (!periodRe.test(text)) return;
      if (text.length > 600) return; // skip the whole page body

      const currMatch = text.match(/\b(AED|USD|EUR|SAR|GBP)\b/i);
      if (currMatch) currency = currMatch[1].toUpperCase();

      // Extract all currency+amount pairs
      const pricePattern = /(?:AED|USD|EUR|SAR|GBP)\s*([\d,]+(?:\.\d{1,2})?)/gi;
      const amounts: number[] = [];
      let m: RegExpExecArray | null;
      while ((m = pricePattern.exec(text)) !== null) {
        const v = parseFloat(m[1].replace(/,/g, ""));
        if (!isNaN(v) && v > 1 && v < 500_000) amounts.push(v);
      }

      if (amounts.length === 1) {
        discounted = amounts[0];
      } else if (amounts.length >= 2) {
        // Two prices: larger = original (strikethrough), smaller = current
        const sorted = [...amounts].sort((a, b) => b - a);
        original = sorted[0];
        discounted = sorted[1];
        if (original === discounted) original = null;
      }

      // KM included in same element
      const kmMatch = text.match(/([\d,]+)\s*km/i);
      if (kmMatch) {
        const kv = parseInt(kmMatch[1].replace(/,/g, ""), 10);
        if (kv > 0 && kv <= 100_000) km = kv;
      }

      if (discounted !== null) return false;
    });

    // Broader fallback: scan body text context around /period mention
    if (discounted === null) {
      const lowerBody = bodyText.toLowerCase();
      const idx = lowerBody.indexOf(`/${period.toLowerCase()}`);
      if (idx !== -1) {
        const ctx = bodyText.slice(Math.max(0, idx - 300), idx + 50);
        const currMatch2 = ctx.match(/\b(AED|USD|EUR|SAR|GBP)\b/i);
        if (currMatch2) currency = currMatch2[1].toUpperCase();
        const pricePattern2 = /(?:AED|USD|EUR|SAR|GBP)\s*([\d,]+(?:\.\d{1,2})?)/gi;
        const amounts2: number[] = [];
        let m2: RegExpExecArray | null;
        while ((m2 = pricePattern2.exec(ctx)) !== null) {
          const v = parseFloat(m2[1].replace(/,/g, ""));
          if (!isNaN(v) && v > 1 && v < 500_000) amounts2.push(v);
        }
        if (amounts2.length === 1) discounted = amounts2[0];
        else if (amounts2.length >= 2) {
          const sorted2 = [...amounts2].sort((a, b) => b - a);
          original = sorted2[0];
          discounted = sorted2[1];
          if (original === discounted) original = null;
        }
      }
    }

    return { discounted, original, km, currency };
  }

  const dailyData   = extractPeriodPrice("day");
  const weeklyData  = extractPeriodPrice("week");
  const monthlyData = extractPeriodPrice("month");
  const currency    = dailyData.currency || weeklyData.currency || monthlyData.currency || primaryCurrency;

  // ── Included mileage (shown below pricing table) ──────────────────────────
  let kmIncluded: number | null = null;
  const kmPatterns = [
    /included\s+mileage\s+limit[^:\n]*:?\s*([\d,]+)\s*km/i,
    /mileage\s+limit[^:\n]*:?\s*([\d,]+)\s*km/i,
    /([\d,]+)\s*km[\s/]+(?:day|daily)\s+included/i,
  ];
  for (const pat of kmPatterns) {
    const m = bodyText.match(pat);
    if (m) { kmIncluded = parseInt(m[1].replace(/,/g, ""), 10); break; }
  }
  // If per-period km not found, apply global km to all periods
  const dailyKm   = dailyData.km   || kmIncluded;
  const weeklyKm  = weeklyData.km  || (kmIncluded ? kmIncluded * 7 : null);
  const monthlyKm = monthlyData.km || (kmIncluded ? kmIncluded * 30 : null);

  // ── Extra km rate ─────────────────────────────────────────────────────────
  let extraKmRate: number | null = null;
  let extraKmCurrency = currency;
  const extraPatterns = [
    /additional\s+mileage\s+charge[^:\n]*:?\s*(AED|USD|EUR|SAR|GBP)?\s*([\d.]+)\s*\/\s*km/i,
    /extra\s+(?:km|mileage)[^:\n]*:?\s*(AED|USD|EUR|SAR|GBP)?\s*([\d.]+)\s*\/?\s*km/i,
    /(AED|USD|EUR|SAR|GBP)\s*([\d.]+)\s*(?:per|\/)\s*(?:extra\s+)?km/i,
  ];
  for (const pat of extraPatterns) {
    const m = bodyText.match(pat);
    if (m) {
      if (m[1]) extraKmCurrency = m[1].toUpperCase();
      extraKmRate = parseFloat(m[2]);
      break;
    }
  }

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

  // ── Min rental days ───────────────────────────────────────────────────────
  let minRentalDays = 1;
  const minDayPatterns = [
    /(\d+)\s*(?:-\s*)?day\s+rental\s+available/i,
    /minimum\s+(?:rental\s+)?(?:duration|period|booking)[^:\n]*:?\s*(\d+)\s*day/i,
    /minimum\s+(\d+)\s*day/i,
    /min\.?\s*(\d+)\s*day/i,
  ];
  for (const pat of minDayPatterns) {
    const m = bodyText.match(pat);
    if (m) { minRentalDays = parseInt(m[1], 10); break; }
  }

  // ── Additional charges ────────────────────────────────────────────────────
  let additionalCharges: string | null = null;
  const addChargeEl = $("[class*='additional-charge'], [class*='extra-charge']").first();
  if (addChargeEl.length) {
    additionalCharges = cleanText(addChargeEl.text()) || null;
  } else {
    const m = bodyText.match(/additional\s+charge[s]?\s*[:–-]\s*([^.\n]{10,200})/i);
    if (m) additionalCharges = m[1].trim();
  }

  // ── Policies ─────────────────────────────────────────────────────────────
  const fullTextLower = bodyText.toLowerCase();
  const insuranceIncluded = /insurance\s+included/i.test(bodyText);
  const freeDelivery = /free\s+delivery/i.test(bodyText);

  // Fuel policy (from body text or overview)
  const fuelPolicyRaw = getSpecValue("fuel policy");
  const fuelPolicyMatch = !fuelPolicyRaw ? bodyText.match(/full policy[:\s]+([^.\n]+)/i) : null;
  const fuelPolicy = fuelPolicyRaw || (fuelPolicyMatch ? fuelPolicyMatch[1].trim() : null);

  // Payment methods (array for compatibility)
  const paymentMethods: string[] = [];
  if (fullTextLower.includes("cash")) paymentMethods.push("Cash");
  if (fullTextLower.includes("card") || fullTextLower.includes("credit")) paymentMethods.push("Card");
  if (fullTextLower.includes("bitcoin") || fullTextLower.includes("crypto")) paymentMethods.push("Crypto");
  if (fullTextLower.includes("bank transfer")) paymentMethods.push("Bank Transfer");

  // ── Rental term policies ──────────────────────────────────────────────────
  function extractPolicy(policyName: string): string | null {
    // Try dedicated class/id
    const el = $(
      `[class*='${policyName.toLowerCase()}-policy'], [class*='${policyName.toLowerCase()}_policy'], [id*='${policyName.toLowerCase()}']`
    ).first();
    if (el.length) {
      const text = cleanText(el.text());
      if (text.length > 5) return text;
    }
    // Find by heading/title text
    let result: string | null = null;
    $("[class*='policy'], [class*='rental-term'], [class*='term-item']").each((_, elmt) => {
      const elText = cleanText($(elmt).text());
      if (!new RegExp(policyName, "i").test(elText)) return;
      const heading = $(elmt).find("h2, h3, h4, strong, [class*='title']").first().text().trim();
      const content = heading ? elText.replace(heading, "").trim() : elText;
      if (content.length > 10) { result = content; return false; }
    });
    return result;
  }

  const mileagePolicy = extractPolicy("mileage");
  const depositPolicy = extractPolicy("deposit");
  const rentalPolicy  = extractPolicy("rental");

  // ── Features ─────────────────────────────────────────────────────────────
  const features: string[] = [];
  const featureSelectors = [
    "[class*='features-list'] li",
    "[class*='features'] li",
    "[class*='amenities'] li",
    "[class*='feature-item']",
    "[class*='spec-list'] li",
  ];
  for (const sel of featureSelectors) {
    $(sel).each((_, el) => {
      const text = cleanText($(el).text());
      if (text.length > 2 && text.length < 80 && !features.includes(text)) features.push(text);
    });
    if (features.length > 0) break;
  }

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

  // ── Requirements to rent ──────────────────────────────────────────────────
  let requirementsToRent: string | null = null;
  const reqEl = $("[class*='requirements'], [class*='rent-requirements'], [id*='requirements']").first();
  if (reqEl.length) {
    requirementsToRent = cleanText(reqEl.text()) || null;
  } else {
    $("h2, h3, h4, [class*='section-title'], [class*='accordion']").each((_, el) => {
      if (/requirements\s+to\s+rent/i.test($(el).text())) {
        const section = $(el).closest("[class*='section'], [class*='accordion-item'], [class*='collapse']");
        const text = cleanText((section.length ? section : $(el).parent()).text());
        if (text.length > 20) { requirementsToRent = text; return false; }
      }
    });
  }

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
    daily_rate_aed: dailyData.discounted,
    weekly_rate_aed: weeklyData.discounted,
    monthly_rate_aed: monthlyData.discounted,
    daily_rate_original: dailyData.original,
    weekly_rate_original: weeklyData.original,
    monthly_rate_original: monthlyData.original,
    daily_km_included: dailyKm,
    weekly_km_included: weeklyKm,
    monthly_km_included: monthlyKm,
    extra_km_rate_aed: extraKmCurrency === "AED" ? extraKmRate : (extraKmRate ? extraKmRate * 3.67 : null),
    extra_km_rate: extraKmRate,
    extra_km_currency: extraKmRate ? extraKmCurrency : null,
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
    features,
    image_urls: imageUrls,
    video_urls: videoUrls,
    primary_image_url: primaryImage,
    special_offer: specialOffer,
    special_offer_heading: specialOfferHeading,
    special_offer_body: specialOfferBody,
    special_offer_disclaimer: specialOfferDisclaimer,
    requirements_to_rent: requirementsToRent,
    dealer_note: dealerNote,
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
