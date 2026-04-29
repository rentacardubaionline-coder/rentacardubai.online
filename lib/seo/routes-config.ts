// SEO keyword routes and template configuration
// 54 keywords × cities × towns × models × routes = 14K+ indexed pages

export interface SeoTemplate {
  h1: string;
  title: string;
  description: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface KeywordConfig {
  slug: string;
  label: string;
  templates?: {
    city?: SeoTemplate;
    model?: SeoTemplate;
    route?: SeoTemplate;
  };
}

// ── Default SEO Templates (selling-tone, conversion-focused) ─────────────────

export const DEFAULT_TEMPLATES: Record<string, SeoTemplate> = {
  keyword_only: {
    h1: "{keyword} — Verified Vendors, Instant Booking",
    title: "{keyword} in Dubai | Compare Prices & Book Instantly",
    description:
      "Find the best {keyword_lower} deals across Dubai. Compare verified vendors, check real prices, and book with a small advance. Trusted by thousands of travellers.",

  },
  keyword_city: {
    h1: "{keyword} in {city} — Compare & Book Today",
    title: "{keyword} in {city} | Verified Vendors from AED 90/day",
    description:
      "Book {keyword_lower} in {city} from trusted local vendors. Compare prices, check availability, and reserve with a small advance. With-driver & self-drive options available.",
  },
  keyword_model: {
    h1: "{brand} {model} for Rent — Book Now",
    title: "{brand} {model} for Rent | {keyword} from AED 150/day",
    description:
      "Rent a {brand} {model} through {keyword_lower}. Compare verified rental options, see real photos, and book instantly with a small advance.",
  },
  keyword_city_model: {
    h1: "{brand} {model} for Rent in {city}",
    title: "{brand} {model} in {city} | {keyword} — Best Deals",
    description:
      "Looking for {brand} {model} in {city}? Compare prices from verified vendors, view real photos, and book {keyword_lower} with a small advance. Available with driver or self-drive.",
  },
  keyword_route: {
    h1: "{keyword} — {from_city} to {to_city}",
    title: "{keyword} {from_city} to {to_city} | Reliable Intercity Rentals",
    description:
      "Book a reliable vehicle from {from_city} to {to_city}. Professional drivers, transparent pricing, and instant confirmation. Compare vendors and reserve your ride today.",
  },
  keyword_city_town: {
    h1: "{keyword} in {town}, {city}",
    title: "{keyword} in {town}, {city} | Local Vendors Near You",
    description:
      "Need {keyword_lower} in {town}, {city}? Browse verified local vendors, compare prices, and book with a small advance. Doorstep pickup available.",
  },
  keyword_filter_city: {
    h1: "{keyword} {filter} in {city}",
    title: "{keyword} {filter} in {city} | Compare & Book",
    description:
      "Browse {keyword_lower} {filter} options in {city}. Verified vendors, transparent pricing, and instant booking with a small advance.",
  },
  keyword_filter_route: {
    h1: "{keyword} {filter} — {from_city} to {to_city}",
    title: "{keyword} {filter} {from_city} to {to_city} | Book Now",
    description:
      "Find {keyword_lower} {filter} for the {from_city} to {to_city} route. Compare vendors, check availability, and book your ride today.",
  },
  vehicle_model: {
    h1: "Rent {brand} {model} in Dubai",
    title: "Rent {brand} {model} | Compare Prices Across Dubai",
    description:
      "Rent a {brand} {model} from verified vendors across Dubai. Compare daily, weekly, and monthly rates. Book with a small advance — no hidden charges.",
  },
  vehicle_model_city: {
    h1: "{brand} {model} for Rent in {city}",
    title: "{brand} {model} for Rent in {city} | Best Prices Guaranteed",
    description:
      "Book a {brand} {model} in {city} from verified local vendors. Compare prices, see real photos, and reserve instantly. Self-drive & with-driver options.",
  },
  vehicle_model_city_town: {
    h1: "{brand} {model} for Rent in {town}, {city}",
    title: "{brand} {model} in {town}, {city} | Rent Now",
    description:
      "Looking for a {brand} {model} near {town}, {city}? Compare local rental options, check availability, and book with a small advance today.",
  },
  vehicle_category: {
    h1: "Rent a {category} in Dubai",
    title: "{category} for Rent | Compare Prices & Book Instantly",
    description:
      "Browse {category} vehicles from verified rental vendors across Dubai. Compare prices, check availability, and book with confidence.",
  },
};

// ── Keywords now live in DB: see lib/seo/keywords-db.ts ──────────────────────
// Previously hardcoded here. Use getAllKeywords() / getKeywordBySlug() instead.

// ── Filter slugs ──────────────────────────────────────────────────────────

export const DRIVER_FILTERS = ["with-driver", "without-driver"] as const;

export const CAPACITY_FILTERS = [
  "2-seater", "4-seater", "5-seater", "7-seater", "9-seater",
  "12-seater", "15-seater", "22-seater", "30-seater", "30-plus-seater",
] as const;

export const ALL_FILTERS = [...DRIVER_FILTERS, ...CAPACITY_FILTERS];

// Reserved first-segment slugs that are NOT keywords
export const RESERVED_SEGMENTS = [
  "vehicles", "routes", "search", "cities", "listings", "cars",
  "vendors", "admin", "vendor", "api", "auth", "login", "signup",
  "privacy", "terms", "contact", "list-a-car",
];

// ── FAQ Templates ────────────────────────────────────────────────────────────

export const FAQS: Record<string, FaqItem[]> = {
  general: [
    {
      q: "How does car rental work on RentNow?",
      a: "Browse available vehicles, pick the one you like, and tap WhatsApp to message the vendor directly. Confirm your dates, pay a small advance, and you're booked. No forms, no app needed.",
    },
    {
      q: "Are the vendors on RentNow verified?",
      a: "Yes — every vendor submits Emirates ID and business documentation before going live. We verify identities so you can book with confidence.",
    },
    {
      q: "What documents do I need to rent a car?",
      a: "For residents, you need a valid UAE Driving License and Emirates ID. For tourists, you typically need a Passport, Visit Visa, and an International Driving Permit (IDP) along with your home country license.",
    },
    {
      q: "How much does it cost to rent a car in Dubai?",
      a: "Economy cars start from around AED 90/day, sedans from AED 150/day, and SUVs from AED 300/day. Prices vary by city, vehicle type, and rental duration.",
    },
    {
      q: "Can I rent a car with a driver?",
      a: "Yes — most vehicles on RentNow are available with professional local drivers who know the routes and parking. Self-drive options are also available on select vehicles.",
    },
    {
      q: "What areas does RentNow cover?",
      a: "RentNow has verified vendors across Dubai including Deira, Bur Dubai, Marina, Downtown, JLT, and will soon expand to other Emirates.",
    },
  ],
  city: [
    {
      q: "How do I book {keyword_lower} in {city}?",
      a: "Browse available vehicles in {city}, pick the one you like, share your travel dates via WhatsApp, and pay a small advance to confirm. Your booking is confirmed instantly.",
    },
    {
      q: "Can I hire a car with driver in {city}?",
      a: "Yes — most vehicles in {city} come with professional local drivers who know the routes, parking, and tolls. Self-drive is also available on select vehicles.",
    },
    {
      q: "What documents do I need for {keyword_lower} in {city}?",
      a: "For residents, a valid UAE license and Emirates ID are required. Tourists need a Passport, Visa, and IDP.",
    },
    {
      q: "What is the starting price for car rental in {city}?",
      a: "Prices in {city} start from approximately AED 90/day for economy cars and AED 250/day for SUVs. Rates vary by vehicle type, duration, and season.",
    },
    {
      q: "Can I book a car for outstation trips from {city}?",
      a: "Absolutely. Many vendors in {city} offer comprehensive packages with driver. Popular routes include travel to Hatta or other Dubai destinations. Salik (tolls) and fuel are typically handled according to the vendor's policy.",

    },
  ],
  route: [
    {
      q: "What is included in the fare from {from_city} to {to_city}?",
      a: "Most {from_city} to {to_city} fares include fuel and driver charges. Salik (tolls) may be extra. Confirm exact inclusions when you book.",
    },
    {
      q: "How long does the {from_city} to {to_city} journey take?",
      a: "Travel time depends on the traffic and road conditions. Your driver will share an estimated arrival time before departure.",
    },
    {
      q: "Can I make stops on the way from {from_city} to {to_city}?",
      a: "Short refreshment stops are included. For longer detours, discuss the route with your vendor in advance.",
    },
    {
      q: "Is round-trip available for {from_city} to {to_city}?",
      a: "Yes — most vendors offer both one-way and round-trip options. Round trips are often more economical.",
    },
  ],
  airport: [
    {
      q: "How do airport transfers work in {city}?",
      a: "Share your flight details and passenger count. The driver tracks your arrival at the airport and waits at the pickup area with a name board.",
    },
    {
      q: "Is waiting time included in airport transfers?",
      a: "Most vendors include a free 60-minute waiting window for flight delays. Extra waiting may be charged — confirm when booking.",
    },
    {
      q: "Can I book a late-night airport pickup in {city}?",
      a: "Yes — airport transfers are available 24/7. Many vendors specialize in late-night and early-morning pickups.",
    },
  ],
};
