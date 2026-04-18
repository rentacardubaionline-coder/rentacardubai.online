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
    title: "{keyword} in Pakistan | Compare Prices & Book Instantly",
    description:
      "Find the best {keyword_lower} deals across Pakistan. Compare verified vendors, check real prices, and book with a small advance. Trusted by thousands of travellers.",
  },
  keyword_city: {
    h1: "{keyword} in {city} — Compare & Book Today",
    title: "{keyword} in {city} | Verified Vendors from PKR 3,500/day",
    description:
      "Book {keyword_lower} in {city} from trusted local vendors. Compare prices, check availability, and reserve with a small advance. With-driver & self-drive options available.",
  },
  keyword_model: {
    h1: "{brand} {model} for Rent — Book Now",
    title: "{brand} {model} for Rent | {keyword} from PKR 4,000/day",
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
    h1: "Rent {brand} {model} in Pakistan",
    title: "Rent {brand} {model} | Compare Prices Across Pakistan",
    description:
      "Rent a {brand} {model} from verified vendors across Pakistan. Compare daily, weekly, and monthly rates. Book with a small advance — no hidden charges.",
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
    h1: "Rent a {category} in Pakistan",
    title: "{category} for Rent | Compare Prices & Book Instantly",
    description:
      "Browse {category} vehicles from verified rental vendors across Pakistan. Compare prices, check availability, and book with confidence.",
  },
};

// ── 54 SEO Keywords ──────────────────────────────────────────────────────────

export const KEYWORDS: Record<string, KeywordConfig> = {
  "rent-a-car": { slug: "rent-a-car", label: "Rent a Car" },
  "car-on-rent": { slug: "car-on-rent", label: "Car on Rent" },
  "car-hire": { slug: "car-hire", label: "Car Hire" },
  "rent-a-vehicle": { slug: "rent-a-vehicle", label: "Rent a Vehicle" },
  "online-car-booking": { slug: "online-car-booking", label: "Online Car Booking" },
  "rent-vehicle-online": { slug: "rent-vehicle-online", label: "Rent Vehicle Online" },
  "car-rental-platform": { slug: "car-rental-platform", label: "Car Rental Platform" },
  "vehicle-booking-platform": { slug: "vehicle-booking-platform", label: "Vehicle Booking Platform" },
  "affordable-car-rental": { slug: "affordable-car-rental", label: "Affordable Car Rental" },
  "cheap-car-rental": { slug: "cheap-car-rental", label: "Cheap Car Rental" },
  "best-car-rental": { slug: "best-car-rental", label: "Best Car Rental" },
  "low-cost-car-rental": { slug: "low-cost-car-rental", label: "Low Cost Car Rental" },
  "car-rental-deals": { slug: "car-rental-deals", label: "Car Rental Deals" },
  "car-rental-prices": { slug: "car-rental-prices", label: "Car Rental Prices" },
  "daily-car-rental": { slug: "daily-car-rental", label: "Daily Car Rental" },
  "short-term-car-rental": { slug: "short-term-car-rental", label: "Short Term Car Rental" },
  "long-term-car-rental": { slug: "long-term-car-rental", label: "Long Term Car Rental" },
  "hourly-car-rental": { slug: "hourly-car-rental", label: "Hourly Car Rental" },
  "reliable-car-rental": { slug: "reliable-car-rental", label: "Reliable Car Rental" },
  "trusted-car-rental": { slug: "trusted-car-rental", label: "Trusted Car Rental" },
  "verified-car-rental": { slug: "verified-car-rental", label: "Verified Car Rental" },
  "best-car-rental-service": { slug: "best-car-rental-service", label: "Best Car Rental Service" },
  "top-car-rental-company": { slug: "top-car-rental-company", label: "Top Car Rental Company" },
  "instant-car-booking": { slug: "instant-car-booking", label: "Instant Car Booking" },
  "quick-car-booking": { slug: "quick-car-booking", label: "Quick Car Booking" },
  "car-rental-near-me": { slug: "car-rental-near-me", label: "Car Rental Near Me" },
  "rent-car-now": { slug: "rent-car-now", label: "Rent Car Now" },
  "travel-car-rental": { slug: "travel-car-rental", label: "Travel Car Rental" },
  "tour-car-rental": { slug: "tour-car-rental", label: "Tour Car Rental" },
  "family-car-rental": { slug: "family-car-rental", label: "Family Car Rental" },
  "business-car-rental": { slug: "business-car-rental", label: "Business Car Rental" },
  "car-rental-with-driver": { slug: "car-rental-with-driver", label: "Car Rental with Driver" },
  "car-rental-without-driver": { slug: "car-rental-without-driver", label: "Car Rental without Driver" },
  "car-rental-marketplace": { slug: "car-rental-marketplace", label: "Car Rental Marketplace" },
  "vehicle-rental-marketplace": { slug: "vehicle-rental-marketplace", label: "Vehicle Rental Marketplace" },
  "personal-car-rental": { slug: "personal-car-rental", label: "Personal Car Rental" },
  "commercial-car-rental": { slug: "commercial-car-rental", label: "Commercial Car Rental" },
  "airport-transfer": {
    slug: "airport-transfer",
    label: "Airport Transfer",
    templates: {
      city: {
        h1: "Airport Transfer in {city} — Reliable Pick & Drop",
        title: "Airport Transfer in {city} | Professional Drivers, 24/7 Service",
        description:
          "Book airport transfers in {city} with professional drivers. Ideal for late-night arrivals and family travel. Flight tracking included. Pay only a small advance.",
      },
    },
  },
  "self-drive-car-rental": { slug: "self-drive-car-rental", label: "Self Drive Car Rental" },
  "wedding-car-rental": { slug: "wedding-car-rental", label: "Wedding Car Rental" },
  "airport-transfer-services": { slug: "airport-transfer-services", label: "Airport Transfer Services" },
  "monthly-daily-car-rental": { slug: "monthly-daily-car-rental", label: "Monthly & Daily Car Rental" },
  "luxury-economy-budget-cars": { slug: "luxury-economy-budget-cars", label: "Luxury, Economy & Budget Cars" },
  "bus-coaster-rental": { slug: "bus-coaster-rental", label: "Bus & Coaster Rental" },
  "tour-travel-vehicles": { slug: "tour-travel-vehicles", label: "Tour & Travel Vehicles" },
};

export const KEYWORD_SLUGS = Object.keys(KEYWORDS);

// Keywords that generate town-level pages (limited to keep sitemap under 50K)
export const TOWN_KEYWORDS = [
  "rent-a-car",
  "car-on-rent",
  "car-hire",
  "airport-transfer",
];

// ── Filter slugs ──��──────────────────────────────────────────────────────────

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
      q: "How does car rental work on RentNowPK?",
      a: "Browse available vehicles, pick the one you like, and tap WhatsApp to message the vendor directly. Confirm your dates, pay a small advance, and you're booked. No forms, no app needed.",
    },
    {
      q: "Are the vendors on RentNowPK verified?",
      a: "Yes — every vendor submits CNIC and business documentation before going live. We verify identities so you can book with confidence.",
    },
    {
      q: "What documents do I need to rent a car?",
      a: "For with-driver rentals, you only need a valid CNIC and phone number. For self-drive, vendors may require a driving license and a refundable security deposit.",
    },
    {
      q: "How much does it cost to rent a car in Pakistan?",
      a: "Economy cars start from around PKR 3,500/day, sedans from PKR 5,000/day, and SUVs from PKR 10,000/day. Prices vary by city, vehicle type, and rental duration. Outstation trips with driver typically include fuel.",
    },
    {
      q: "Can I rent a car with a driver?",
      a: "Yes — most vehicles on RentNowPK are available with professional local drivers who know the routes and parking. Self-drive options are also available on select vehicles.",
    },
    {
      q: "What cities does RentNowPK cover?",
      a: "RentNowPK has verified vendors across 100+ cities in Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, and many more.",
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
      a: "For with-driver rentals, you only need a valid CNIC and phone number. For self-drive, vendors may require a driving license and refundable security deposit.",
    },
    {
      q: "What is the starting price for car rental in {city}?",
      a: "Prices in {city} start from approximately PKR 3,500/day for economy cars and PKR 8,000/day for SUVs. Rates vary by vehicle type, duration, and season.",
    },
    {
      q: "Can I book a car for outstation trips from {city}?",
      a: "Absolutely. Many vendors in {city} offer outstation packages with driver. Popular routes include intercity travel to nearby cities. Fuel and tolls are typically included.",
    },
  ],
  route: [
    {
      q: "What is included in the fare from {from_city} to {to_city}?",
      a: "Most {from_city} to {to_city} fares include fuel, driver charges, and tolls unless stated otherwise. Confirm exact inclusions when you book.",
    },
    {
      q: "How long does the {from_city} to {to_city} journey take?",
      a: "Travel time depends on the vehicle and road conditions. Your driver will share an estimated arrival time before departure.",
    },
    {
      q: "Can I make stops on the way from {from_city} to {to_city}?",
      a: "Short refreshment and prayer stops are included by default. For longer detours or multi-stop trips, discuss the route with your vendor in advance.",
    },
    {
      q: "Is round-trip available for {from_city} to {to_city}?",
      a: "Yes — most vendors offer both one-way and round-trip options. Round trips are often more economical. Ask your vendor for the best deal.",
    },
  ],
  airport: [
    {
      q: "How do airport transfers work in {city}?",
      a: "Share your flight details and passenger count. The driver tracks your arrival at {city} airport and waits at the pickup area with a name board.",
    },
    {
      q: "Is waiting time included in airport transfers?",
      a: "Most vendors include a free 30–60 minute waiting window for flight delays. Extra waiting may be charged per hour — confirm when booking.",
    },
    {
      q: "Can I book a late-night airport pickup in {city}?",
      a: "Yes — airport transfers are available 24/7 in {city}. Many vendors specialize in late-night and early-morning pickups.",
    },
  ],
};
