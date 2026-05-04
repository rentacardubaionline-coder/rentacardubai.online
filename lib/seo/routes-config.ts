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
      q: "How does car rental on DubaiRentACar work in Dubai?",
      a: "Browse the AED-priced cars on the page, tap the green WhatsApp button on the listing you like, share your pickup and return dates with the dealer, and pay a small advance to confirm. Most bookings are confirmed in under five minutes — no app and no sign-up.",
    },
    {
      q: "Are the dealers on DubaiRentACar verified UAE businesses?",
      a: "Yes — every dealer submits a valid UAE trade licence and the owner's Emirates ID before going live. We don't list anonymous individuals or unregistered cars.",
    },
    {
      q: "What documents do I need to rent a car in the UAE?",
      a: "UAE residents need a valid UAE driving licence and Emirates ID. Tourists need their passport, UAE entry stamp or visit visa, an International Driving Permit (IDP) issued before they travel, and their original home-country licence. GCC residents may use their home licence directly.",
    },
    {
      q: "How much does it cost to rent a car in Dubai?",
      a: "Economy hatchbacks (Yaris, Sunny, Rio) start from around AED 80–110 per day. Sedans (Corolla, Camry, Accord) run AED 130–200. SUVs (Patrol, Land Cruiser, Pajero) AED 200–400. Luxury and supercars start at AED 600 and go up. Weekly and monthly rentals are typically 25–40% cheaper per day than the daily rate.",
    },
    {
      q: "Is comprehensive insurance included in the price?",
      a: "Yes. Every car on DubaiRentACar comes with standard third-party liability, collision damage and theft cover. A refundable security deposit (AED 1,000–5,000 depending on the car) is held on a credit card during the rental.",
    },
    {
      q: "How does Salik (toll) work?",
      a: "Salik is billed on top at AED 4 per gate crossing and settled at the end of the rental. A few premium dealers include unlimited Salik in monthly packages — confirm on WhatsApp before booking.",
    },
    {
      q: "Can I rent with a driver, or only self-drive?",
      a: "Both. Self-drive is the default. Many dealers also offer professional UAE drivers who know Dubai's roads, parking and Salik gates — useful for visitors, weddings, or hourly chauffeur use.",
    },
    {
      q: "Where in the UAE does DubaiRentACar operate?",
      a: "Most current inventory is in Dubai — Marina, Downtown, Business Bay, Deira, Bur Dubai, JLT, JBR, Palm Jumeirah, Al Quoz and more. Abu Dhabi, Sharjah, Ajman, RAK and Fujairah activate as inventory becomes available; cars rented in Dubai can typically be driven across all emirates.",
    },
  ],
  city: [
    {
      q: "How do I book {keyword_lower} in {city}?",
      a: "Browse the cars available in {city} above, tap the green WhatsApp button on the listing you want, share your dates with the dealer, and pay a small advance to confirm. The whole flow takes under five minutes.",
    },
    {
      q: "What documents do I need for {keyword_lower} in {city}?",
      a: "UAE residents need a valid UAE licence + Emirates ID. Tourists need passport, visit-visa stamp, International Driving Permit (IDP) and their original home-country licence. GCC residents can use their home licence.",
    },
    {
      q: "What's the starting price for {keyword_lower} in {city}?",
      a: "Pricing in {city} starts from around AED 80/day for an economy hatchback and AED 200–400/day for SUVs. Weekly and monthly rentals are 25–40% cheaper per day. Compare today's live AED rates on the cards above.",
    },
    {
      q: "Can the dealer deliver the car to my hotel or apartment in {city}?",
      a: "Most dealers offer free delivery anywhere inside Dubai for rentals of 3+ days. Shorter rentals usually have a flat AED 50–150 delivery fee. Just share your address with the dealer over WhatsApp when you message them.",
    },
    {
      q: "Is Salik included when renting in {city}?",
      a: "Salik gates are billed on top at AED 4 per crossing and settled at the end of the rental. A few monthly packages include unlimited Salik — confirm before booking.",
    },
    {
      q: "Can I drive a {city} rental to other emirates or to Hatta?",
      a: "Yes — every car on DubaiRentACar comes with cross-emirate insurance, so trips from {city} to Abu Dhabi, Sharjah, RAK, Fujairah or Hatta are all covered. Salik tolls and any Abu Dhabi Darb tolls are billed on top.",
    },
  ],
  route: [
    {
      q: "What's included in the {from_city} to {to_city} fare?",
      a: "Driver, fuel and standard insurance are included in the {from_city} → {to_city} price. Salik (toll gates) is billed on top at AED 4 per crossing. Abu Dhabi Darb tolls are also passed through where they apply. Confirm exact inclusions on WhatsApp.",
    },
    {
      q: "How long does the {from_city} to {to_city} drive take?",
      a: "{from_city} to {to_city} usually takes between 30 minutes and 1.5 hours depending on traffic on Sheikh Zayed Road and time of day. Your driver shares a live ETA before departure.",
    },
    {
      q: "Can I make stops on the way from {from_city} to {to_city}?",
      a: "Short refreshment or photo stops along the route are included. Longer detours (a side-trip to Yas Island, Marina, Hatta, etc.) are billed per hour — agree the rate with the dealer in advance.",
    },
    {
      q: "Is round-trip available for {from_city} to {to_city}?",
      a: "Yes — most UAE dealers offer both one-way and round-trip pricing. Round trips are typically 20–30% cheaper per kilometre because the driver isn't returning empty.",
    },
    {
      q: "Can I book {from_city} to {to_city} late at night or before sunrise?",
      a: "Yes. Most Dubai-based dealers run drivers 24/7, including airport runs at 03:00. Tell the dealer your flight or pickup time on WhatsApp and they'll confirm a driver.",
    },
  ],
  airport: [
    {
      q: "How does airport pickup at DXB or DWC work?",
      a: "Share your flight number, terminal (Dubai Airport's T1, T2 or T3 — or DWC if you're flying low-cost), and passenger count. The driver tracks your flight and waits at the meeting point with a name board.",
    },
    {
      q: "Is waiting time included for airport pickups?",
      a: "Yes — most dealers include a free 60-minute waiting window from the time your flight lands, which covers immigration, baggage and Customs. Beyond 60 minutes, waiting is charged hourly. Confirm when booking.",
    },
    {
      q: "Can I book a late-night or early-morning airport pickup in {city}?",
      a: "Yes — Dubai dealers run 24/7. Late-night arrivals at DXB and DWC are common; share your flight details on WhatsApp and the driver will be waiting at the meeting point regardless of the hour.",
    },
    {
      q: "Can I drop the car at the airport instead of returning it to the dealer?",
      a: "Yes, on rentals of 3+ days most dealers offer free airport drop-off in Dubai. Shorter rentals usually have a flat AED 50–100 drop-off fee. Confirm the meeting point on WhatsApp before your departure day.",
    },
  ],
};
