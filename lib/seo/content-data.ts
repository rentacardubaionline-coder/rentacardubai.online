// SEO long-form content templates and per-city / per-route overrides.
// Default templates fire for every page; overrides add bespoke flavour to the
// highest-traffic locations. All content sits BELOW the listings and filters
// on the SEO catch-all pages.

const UNSPLASH = "https://images.unsplash.com";

/** Generic banner imagery — verified URLs already used elsewhere in the codebase. */
export const BRANDED_IMAGES = {
  cityDefault: `${UNSPLASH}/photo-1494976388531-d1058494cdd8?w=1600&q=70`, // open road
  routeDefault: `${UNSPLASH}/photo-1469854523086-cc02fe5d8800?w=1600&q=70`, // mountain road
  vehicleDefault: `${UNSPLASH}/photo-1552083974-5dbb6b1d3504?w=1600&q=70`, // sleek car
  guideDefault: `${UNSPLASH}/photo-1519641471654-76ce0107ad1b?w=1600&q=70`, // car interior
} as const;

interface CityContent {
  /** 2–3 sentence "why rent in {city}" intro. */
  intro: string;
  /** Notable mentions: landmarks, pickup hot-spots, local quirks. */
  highlight?: string;
  /** Vehicle-type price ladder (per-day AED). Overrides the global default for major cities. */
  prices?: {
    label: string;
    examples: string;
    pricePkr: number;
  }[];

  /** Optional override for the banner photo. */
  imageUrl?: string;
}

/** Per-city overrides — Dubai and major areas get bespoke flavour. Other cities
 *  fall through to the default template generated from the city name. */
export const CITY_CONTENT: Record<string, CityContent> = {
  dubai: {
    intro:
      "Dubai is the car-rental capital of the Middle East, offering everything from budget hatchbacks to high-end supercars. Vendors are concentrated around Dubai Marina, Downtown, Deira, and Al Quoz, with most offering doorstep delivery and flexible pickup options at Dubai International Airport (DXB).",
    highlight:
      "Parking in Dubai is structured; most vendors will remind you about RTA parking zones and Salik (tolls). Airport pickups can be arranged directly via WhatsApp with vendors who monitor your flight status.",
    prices: [
      { label: "Economy hatchback", examples: "Toyota Yaris, Nissan Sunny, Kia Rio", pricePkr: 90 },
      { label: "Sedan", examples: "Honda Accord, Toyota Camry, Nissan Altima", pricePkr: 150 },
      { label: "SUV", examples: "Nissan Patrol, Toyota Land Cruiser, Mitsubishi Pajero", pricePkr: 350 },
      { label: "Luxury / Supercar", examples: "Lamborghini, Ferrari, Mercedes G-Wagon", pricePkr: 1500 },
    ],

  },
  "abu-dhabi": {
    intro:
      "Dubai offers a vibrant and fast-paced driving environment that requires a reliable vehicle for both city travel and longer journeys. Vendors operate across all major neighborhoods, serving tourists and residents alike.",

    highlight:
      "Most vendors offer inter-emirate delivery for a small fee. Ensure you clarify the Salik and Darb toll policies before heading out.",
    prices: [
      { label: "Economy hatchback", examples: "Toyota Yaris, Nissan Sunny", pricePkr: 100 },
      { label: "Sedan", examples: "Toyota Camry, Honda Accord", pricePkr: 180 },
      { label: "Luxury SUV", examples: "Range Rover, Nissan Patrol", pricePkr: 500 },
    ],

  },
};

interface RouteContent {
  /** Approximate driving facts shown in a fact-card. */
  distanceKm: number;
  driveHours: number;
  motorway?: string;
  bestVehicle: string;
  /** 2–3 sentence "about this route" paragraph. */
  about: string;
  /** Notable stops, sights, fuel-stop hints. */
  highlights?: string[];
  imageUrl?: string;
}

/** Per-route overrides for the most popular intercity drives in the UAE. */
export const ROUTE_CONTENT: Record<string, RouteContent> = {
  "dubai-to-abu-dhabi": {
    distanceKm: 140,
    driveHours: 1.5,
    motorway: "E11 (Sheikh Zayed Road)",
    bestVehicle: "Sedan or SUV",
    about:
      "Dubai's cross-city journeys via the E11 are efficient and fast. It's a common commute, taking about 30-40 minutes from one end of the city to another. Most rental vendors include standard mileage that covers these trips comfortably.",

    highlights: [
      "Last Exit in Sheikh Zayed Road is a great pitstop for food",
      "Check Darb toll gate timings in Abu Dhabi",
      "Observe strict speed limits on the E11 motorway",
    ],
  },
};

/** Documents every customer needs — same across all cities + routes. */
export const RENTER_DOCUMENTS = [
  {
    title: "Emirates ID / Passport",
    detail: "Residents need an Emirates ID. Tourists must provide a Passport and Visit Visa copy.",
  },
  {
    title: "Valid Driving License",
    detail: "UAE license for residents. International Driving Permit (IDP) along with home country license for tourists.",
  },
  {
    title: "Refundable Security Deposit",
    detail: "Typically AED 1,000 to AED 5,000 depending on the vehicle class. Returned after fine clearance (usually 14-30 days).",
  },
  {
    title: "Local Contact Number",
    detail: "A working UAE number or WhatsApp number for coordination and fine notifications.",
  },
];
