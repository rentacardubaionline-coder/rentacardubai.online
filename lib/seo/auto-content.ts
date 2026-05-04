// Auto-generated SEO copy per page-type, tuned for the UAE / Dubai market.
//
// Single source of truth for H1 / meta title / meta description / intro
// paragraph / FAQ for every programmatic landing-page combination. Reads
// keyword.template_overrides when set; otherwise falls back to the
// UAE-tuned defaults below.
//
// Every output is fully populated even when only one input is provided
// (e.g. just `keyword`). Supports template variables in overrides via the
// {keyword}, {city}, {town}, {category}, {model}, {brand}, {from_city},
// {to_city} placeholders.

import type { SeoTemplate } from "./routes-config";

// ── Inputs ──────────────────────────────────────────────────────────────────

export type PageContentType =
  | "city"
  | "town"
  | "category"
  | "route"
  | "model"
  | "keyword_only";

export interface PageContentInput {
  type: PageContentType;
  keyword?: { slug: string; label: string; templateOverrides?: { city?: SeoTemplate; town?: SeoTemplate; category?: SeoTemplate; route?: SeoTemplate; model?: SeoTemplate } | null };
  city?: { name: string; slug: string };
  town?: { name: string; slug: string };
  category?: { name: string; slug: string };
  route?: { originCityName: string; destinationCityName: string };
  model?: { name: string; brandName: string };
  listingsCount?: number;
}

export interface PageContent {
  h1: string;
  title: string;
  description: string;
  intro: string;
  faq: { q: string; a: string }[];
}

// ── Variable substitution ──────────────────────────────────────────────────

function applyVars(s: string, vars: Record<string, string>): string {
  let out = s;
  for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, v);
  return out;
}

function buildVars(input: PageContentInput): Record<string, string> {
  const v: Record<string, string> = {};
  if (input.keyword) {
    v.keyword = input.keyword.label;
    v.keyword_lower = input.keyword.label.toLowerCase();
  } else {
    v.keyword = "Rent a Car";
    v.keyword_lower = "rent a car";
  }
  if (input.city) v.city = input.city.name;
  if (input.town) v.town = input.town.name;
  if (input.category) v.category = input.category.name;
  if (input.model) {
    v.model = input.model.name;
    v.brand = input.model.brandName;
  }
  if (input.route) {
    v.from_city = input.route.originCityName;
    v.to_city = input.route.destinationCityName;
  }
  return v;
}

// ── UAE FAQ blocks ─────────────────────────────────────────────────────────

function uaeFaqs(scope: "city" | "town" | "category" | "route" | "default", v: Record<string, string>): { q: string; a: string }[] {
  if (scope === "route") {
    return [
      {
        q: applyVars("What's included in {keyword} from {from_city} to {to_city}?", v),
        a: applyVars("Driver, fuel and standard comprehensive insurance are included in the {from_city} → {to_city} price. Salik (toll gates) is billed on top at AED 4 per crossing. Abu Dhabi Darb tolls are passed through where they apply. Confirm exact inclusions on WhatsApp before booking.", v),
      },
      {
        q: applyVars("How long does {from_city} to {to_city} take by car?", v),
        a: applyVars("{from_city} to {to_city} usually takes between 30 minutes and 1.5 hours depending on traffic on Sheikh Zayed Road and the time of day. Your driver shares a live ETA before departure.", v),
      },
      {
        q: applyVars("Can I book a one-way ride from {from_city} to {to_city}?", v),
        a: applyVars("Yes — UAE dealers on RentNow offer both one-way and round-trip pricing. Round trips are typically 20–30% cheaper per kilometre because the driver isn't returning empty.", v),
      },
      {
        q: applyVars("Can I book {from_city} to {to_city} late at night or before sunrise?", v),
        a: applyVars("Yes — most Dubai-based dealers run drivers 24/7, including airport pickups at DXB or DWC at 03:00. Share your pickup time on WhatsApp and the driver will confirm.", v),
      },
      {
        q: applyVars("Do {from_city} to {to_city} cars charge for waiting time?", v),
        a: applyVars("Short refreshment or photo stops along the route are included. Detours and multi-hour waits are billed by the hour — agree the rate on WhatsApp before you set off.", v),
      },
    ];
  }
  if (scope === "city" || scope === "town") {
    const place = v.town ? `${v.town}, ${v.city}` : v.city;
    return [
      {
        q: `How do I book ${v.keyword_lower} in ${place}?`,
        a: `Browse the cars available in ${place} above, tap the green WhatsApp button on the listing you want, share your pickup and return dates with the dealer, and pay a small advance to confirm. The whole flow takes under five minutes — no app or sign-up.`,
      },
      {
        q: `What documents do I need to rent a car in ${place}?`,
        a: `UAE residents need a valid UAE driving licence and Emirates ID. Tourists need their passport, UAE entry stamp or visit visa, an International Driving Permit (IDP) issued before they travel, and their original home-country licence. GCC residents can use their home-country licence directly.`,
      },
      {
        q: `What's the starting price for ${v.keyword_lower} in ${place}?`,
        a: `Economy cars in ${place} start from around AED 80–110 per day. Sedans run AED 130–200, SUVs AED 200–400, and luxury / sports cars AED 600+. Weekly and monthly rentals are typically 25–40% cheaper per day than the daily rate.`,
      },
      {
        q: `Can the dealer deliver the car to my hotel or apartment in ${place}?`,
        a: `Most dealers offer free delivery anywhere in Dubai for rentals of 3+ days, and a flat AED 50–150 fee for shorter rentals. Just share your ${place} address with the dealer on WhatsApp when you message them.`,
      },
      {
        q: `Is Salik included when renting in ${place}?`,
        a: `Salik gates are billed on top at AED 4 per crossing and settled at the end of the rental. Some monthly packages include unlimited Salik — confirm on WhatsApp before booking.`,
      },
      {
        q: `Can I drive my ${place} rental to Abu Dhabi, Sharjah or Hatta?`,
        a: `Yes — every car on RentNow comes with cross-emirate insurance, so trips from ${place} to Abu Dhabi, Sharjah, RAK, Fujairah or Hatta are all covered. Salik tolls and Abu Dhabi Darb tolls are billed on top.`,
      },
      {
        q: `What insurance is included on a ${place} rental?`,
        a: `Standard comprehensive insurance is included on every car: third-party liability, collision damage and theft. A refundable security deposit (AED 1,000–5,000 depending on the car) is held on a credit card during the rental.`,
      },
    ];
  }
  if (scope === "category") {
    const cat = v.category?.toLowerCase() || "car";
    return [
      {
        q: `Why rent a ${cat} in Dubai?`,
        a: `${v.category || "Cars"} rentals are popular in Dubai because pricing is competitive across a large local market and most cars are GCC-spec with full service history. Insurance and Salik handling are standard, and most dealers deliver free across Dubai on rentals of 3+ days.`,
      },
      {
        q: `What's the cheapest ${cat} I can rent in Dubai?`,
        a: `${v.category || "Vehicle"} pricing depends on the exact model and rental duration. Compare the cards above for today's live AED rates. Weekly rentals are typically 25–35% cheaper per day than daily, and monthly rentals 35–45% cheaper.`,
      },
      {
        q: `Can I drive a ${cat} from Dubai to Abu Dhabi or Sharjah?`,
        a: `Yes — every car on RentNow comes with cross-emirate insurance. There's no extra charge for driving Dubai → Abu Dhabi, Sharjah, RAK or Fujairah, but Salik tolls (AED 4/gate) and Abu Dhabi Darb tolls are billed on top.`,
      },
      {
        q: `Are ${cat} rentals in Dubai GCC-spec?`,
        a: `Most ${cat} cars listed on RentNow are GCC-spec — built for the regional climate and serviced locally. The listing detail page tells you the exact spec (GCC / American / European / Japanese) before you book.`,
      },
    ];
  }
  return [
    {
      q: `How does ${v.keyword || "renting a car"} work on RentNow?`,
      a: `Browse the AED-priced cars on the page, tap WhatsApp on the listing you like, share your pickup and return dates with the dealer, and pay a small advance to confirm. Most bookings are confirmed in under five minutes — no apps and no long forms.`,
    },
    {
      q: `Are the dealers verified UAE businesses?`,
      a: `Yes — every dealer submits a valid UAE trade licence and the owner's Emirates ID before going live. We don't list anonymous individuals or unregistered cars.`,
    },
    {
      q: `Which emirates does RentNow cover?`,
      a: `Most current inventory is in Dubai — Marina, Downtown, Business Bay, Deira, Bur Dubai, JLT, JBR, Palm Jumeirah, Al Quoz and more. Abu Dhabi, Sharjah, Ajman, RAK and Fujairah activate as inventory becomes available; cars rented in Dubai can typically be driven across all emirates.`,
    },
  ];
}

// ── Default UAE templates per page-type ────────────────────────────────────

const DEFAULTS: Record<PageContentType, SeoTemplate & { intro: string }> = {
  keyword_only: {
    h1: "{keyword} — Verified Dealers, Booked on WhatsApp",
    title: "{keyword} | Compare Verified Dubai Dealers",
    description: "{keyword} on a Dubai marketplace of verified rental agencies. Compare daily, weekly, and monthly AED prices, see real photos, and book directly on WhatsApp — no middlemen.",
    intro: "Looking for {keyword_lower} in Dubai? You're in the right place. Every car listed here belongs to a verified UAE rental agency that we've vetted in person — Emirates ID, trade licence, and active fleet checked. Compare today's prices across dealers, message any of them straight from the listing card, and confirm with a small advance. Free delivery, GCC-spec cars, and full insurance are standard across the platform.",
  },
  city: {
    h1: "{keyword} in {city}",
    title: "{keyword} in {city} | Dealers from AED 80/day",
    description: "Book {keyword_lower} in {city} from verified UAE rental agencies. Compare AED prices, see real photos, and confirm on WhatsApp. Salik handled, full insurance included.",
    intro: "Need {keyword_lower} in {city}? Browse the cars below — each one is owned by a verified {city}-based rental agency, with daily, weekly and monthly AED rates published live. Most dealers deliver free across Dubai for 3+ day rentals and respond within 5 minutes on WhatsApp during the day. Comprehensive insurance, GCC-spec vehicles, and clear Salik / mileage policies are standard.",
  },
  town: {
    h1: "{keyword} in {town}, {city}",
    title: "{keyword} in {town} | Local {city} Dealers",
    description: "Rental agencies serving {town} and the surrounding {city} area. Compare AED prices on the {keyword_lower} you want, message the dealer, and arrange free local delivery.",
    intro: "{town} is one of {city}'s busiest neighbourhoods, and several rental agencies on this platform either operate from {town} directly or deliver inside {town} for free. Below are the cars currently available with door-to-door drop-off to your apartment, hotel or office in {town}.",
  },
  category: {
    h1: "{category} for Rent in Dubai",
    title: "Rent a {category} in Dubai | AED Prices, Verified Dealers",
    description: "Rent a {category} in Dubai from verified agencies. Compare today's AED rates, see real photos, and book on WhatsApp with comprehensive insurance and free delivery on most rentals.",
    intro: "{category} rentals are one of Dubai's most popular categories — from short tourist drives along Sheikh Zayed Road to month-long resident leases. Every {category} below is GCC-spec, fully insured, and listed by a verified UAE dealer. Pick a car, message the agency, and they'll bring it to you free for any 3+ day rental.",
  },
  route: {
    h1: "{keyword} — {from_city} to {to_city}",
    title: "{keyword} {from_city} to {to_city} | Booked on WhatsApp",
    description: "Book a reliable {keyword_lower} for the {from_city} → {to_city} route. Professional driver, transparent AED pricing, Salik billed on top, instant WhatsApp confirmation.",
    intro: "Travelling {from_city} to {to_city}? The agencies below run this route every day and price the trip transparently in AED. Driver, fuel and insurance are included; Salik (toll) is billed on top at AED 4 per gate. Round-trip and one-way both available — confirm with the dealer on WhatsApp before you set off.",
  },
  model: {
    h1: "Rent {brand} {model} in Dubai",
    title: "{brand} {model} for Rent | Dubai AED Prices",
    description: "Rent a {brand} {model} from verified UAE dealers. Compare daily, weekly, monthly AED rates, see real photos, and book directly on WhatsApp.",
    intro: "Looking for a {brand} {model} in Dubai? Every car below is the actual {brand} {model} you'll receive — real photos, real plates, real mileage. Compare AED rates, scan the dealer's reviews, and message them straight from the listing card. Comprehensive insurance and GCC-spec cars are standard.",
  },
};

// ── Public API ─────────────────────────────────────────────────────────────

export function buildPageContent(input: PageContentInput): PageContent {
  const vars = buildVars(input);
  const base = DEFAULTS[input.type];
  const overrides = input.keyword?.templateOverrides ?? null;
  const ovKey = (
    input.type === "city" || input.type === "town" || input.type === "category" ||
    input.type === "route" || input.type === "model"
  ) ? input.type : null;
  const ov = ovKey && overrides ? overrides[ovKey] : null;

  const h1 = applyVars(ov?.h1 || base.h1, vars);
  const title = applyVars(ov?.title || base.title, vars);
  const description = applyVars(ov?.description || base.description, vars);
  const intro = applyVars(base.intro, vars);

  let faqScope: "city" | "town" | "category" | "route" | "default" = "default";
  if (input.type === "city" || input.type === "town") faqScope = input.type;
  else if (input.type === "category") faqScope = "category";
  else if (input.type === "route") faqScope = "route";

  const faq = uaeFaqs(faqScope, vars);

  return { h1, title, description, intro, faq };
}
