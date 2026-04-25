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
  /** Vehicle-type price ladder (per-day PKR). Overrides the global default for major cities. */
  prices?: {
    label: string;
    examples: string;
    pricePkr: number;
  }[];
  /** Optional override for the banner photo. */
  imageUrl?: string;
}

/** Per-city overrides — top Pakistani cities get bespoke flavour. Other cities
 *  fall through to the default template generated from the city name. */
export const CITY_CONTENT: Record<string, CityContent> = {
  lahore: {
    intro:
      "Lahore is Pakistan's cultural capital and one of the easiest cities to rent in — vendors are concentrated around Gulberg, DHA, and Allama Iqbal Town, with most offering same-day pickup and drop-off across the city. Whether you're touring the Walled City, heading to a wedding in Bahria, or driving north for the weekend, you'll find both with-driver and self-drive options at fair prices.",
    highlight:
      "Vendors in DHA and Gulberg often deliver to your doorstep at no extra charge. For airport pickups (Allama Iqbal International), book a driver-included car a day in advance to lock the rate.",
    prices: [
      { label: "Economy hatchback", examples: "Suzuki Alto, Cultus, WagonR", pricePkr: 4000 },
      { label: "Sedan", examples: "Toyota Corolla, Honda City, Civic", pricePkr: 6500 },
      { label: "SUV / 4x4", examples: "Toyota Fortuner, Hyundai Tucson, Sportage", pricePkr: 14000 },
      { label: "Van / Coaster", examples: "Toyota Hiace, Coaster, Bolan", pricePkr: 11000 },
    ],
  },
  karachi: {
    intro:
      "Karachi's rental market is the largest in Pakistan, with vendors clustered around Clifton, DHA, Gulshan, and the airport area. Traffic is heavy, so most travellers prefer with-driver bookings — drivers know the shortcuts and handle parking at busy spots like Sea View and Dolmen Mall.",
    highlight:
      "If you're flying in, lock a Hiace or sedan with airport pickup (Jinnah International) at booking — vendors hold cars on quoted rates only when confirmed in advance over WhatsApp.",
    prices: [
      { label: "Economy hatchback", examples: "Suzuki Alto, Cultus, WagonR", pricePkr: 4500 },
      { label: "Sedan", examples: "Toyota Corolla, Honda City, Civic", pricePkr: 7000 },
      { label: "SUV / 4x4", examples: "Toyota Fortuner, Hyundai Tucson, Land Cruiser", pricePkr: 16000 },
      { label: "Van / Coaster", examples: "Toyota Hiace, Coaster", pricePkr: 12000 },
    ],
  },
  islamabad: {
    intro:
      "Islamabad has Pakistan's tidiest rental market — vendors operate out of Blue Area, F-7, and the I-sectors, and roads are wide enough that self-drive is comfortable for newcomers. It's also the launchpad for the most popular hill-station trips: Murree, Nathiagali, Naran, and Skardu.",
    highlight:
      "Booking a 4x4 for the northern areas? Vendors in Islamabad will quote separate rates for the city and for outstation trips — confirm both upfront. Petrol is paid by you on outstation runs.",
    prices: [
      { label: "Economy hatchback", examples: "Suzuki Alto, Cultus, WagonR", pricePkr: 4500 },
      { label: "Sedan", examples: "Toyota Corolla, Honda City, Civic", pricePkr: 7000 },
      { label: "SUV / 4x4", examples: "Toyota Fortuner, Prado, Land Cruiser, Hilux", pricePkr: 18000 },
      { label: "Van / Coaster", examples: "Toyota Hiace, Coaster (for groups)", pricePkr: 13000 },
    ],
  },
  rawalpindi: {
    intro:
      "Rawalpindi vendors typically serve both Pindi and Islamabad — a single rental can cover both cities at no extra charge. Saddar and Bahria Town have the densest vendor presence, and pickup from Islamabad airport is standard.",
    highlight:
      "If your trip spans both cities, mention it on WhatsApp and ask the vendor to quote a combined rate. Most will round down for repeat customers.",
  },
  faisalabad: {
    intro:
      "Faisalabad's industrial profile means rental demand peaks around business travel — sedans are the most common pick. Vendors are concentrated near the Clock Tower and on Jaranwala Road.",
  },
  multan: {
    intro:
      "Multan is a popular base for trips into South Punjab and Sindh. Local vendors are familiar with the long drives to Bahawalpur and Sukkur and will quote per-day rates that include reasonable mileage.",
  },
  peshawar: {
    intro:
      "Peshawar's rental market is smaller but well-suited for trips into Khyber Pakhtunkhwa — vendors here often have experience with Swat, Kalam, and the Mohmand area. Most prefer with-driver bookings for outstation runs.",
  },
  quetta: {
    intro:
      "Quetta vendors usually rent SUVs and 4x4s — terrain across Balochistan demands ground clearance. If you're heading toward Ziarat, Hanna Lake, or further into the province, mention the route at booking so the vendor can match the right vehicle.",
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

/** Per-route overrides for the most popular intercity drives. */
export const ROUTE_CONTENT: Record<string, RouteContent> = {
  "lahore-to-islamabad": {
    distanceKm: 380,
    driveHours: 4,
    motorway: "M-2 Motorway",
    bestVehicle: "Sedan or SUV with driver",
    about:
      "The Lahore–Islamabad drive on the M-2 motorway is one of Pakistan's smoothest intercity routes. Vendors typically cover the trip in 4 hours with one fuel stop. Most include the driver and basic fuel allowance in the quoted price; you pay tolls.",
    highlights: [
      "Bhera service area is the standard fuel + meal stop, roughly halfway",
      "Toll: ~Rs 1,300 for cars one-way (paid by you)",
      "Avoid Friday afternoons for Lahore departures — heavy weekend outbound traffic",
    ],
  },
  "karachi-to-hyderabad": {
    distanceKm: 165,
    driveHours: 2.5,
    motorway: "M-9 Motorway",
    bestVehicle: "Sedan with driver",
    about:
      "Karachi to Hyderabad is a quick 2.5-hour run on the M-9. Most rentals include driver and you pay tolls (~Rs 280) and any added fuel for the return leg. A standard sedan is plenty for the drive.",
    highlights: [
      "M-9 toll: ~Rs 280 each way",
      "Best done in daylight — there are limited service stops at night",
    ],
  },
  "islamabad-to-murree": {
    distanceKm: 65,
    driveHours: 2,
    motorway: "Murree Expressway",
    bestVehicle: "SUV or 4x4 with driver",
    about:
      "The Islamabad–Murree drive climbs from the capital into the Galyat hills in about two hours. Roads are paved and the new expressway helps, but a higher vehicle (SUV) is more comfortable and safer in winter conditions when the road can ice up.",
    highlights: [
      "In December–February, ask the vendor to confirm snow chains are available",
      "Pickup from Islamabad airport is standard if you're flying in",
      "Mall Road parking in Murree is limited — drivers know designated lots",
    ],
  },
  "lahore-to-karachi": {
    distanceKm: 1200,
    driveHours: 14,
    motorway: "M-2 + M-5 Motorways",
    bestVehicle: "Sedan or SUV with driver (overnight)",
    about:
      "The full Lahore–Karachi drive on motorway is around 14 hours. Most vendors quote a 2-day package (with overnight stop near Multan or Sukkur) and you pay fuel + tolls separately. Flights are usually faster, but rentals work for road trips with stops.",
    highlights: [
      "Total tolls one-way: ~Rs 4,500 for a sedan",
      "Drivers will plan a Multan or Bahawalpur overnight stop",
      "Carry CNIC + driving license — there are checkposts on both motorways",
    ],
  },
  "rawalpindi-to-naran": {
    distanceKm: 280,
    driveHours: 6.5,
    motorway: "N-35 Karakoram Highway (last 60km)",
    bestVehicle: "4x4 (Fortuner, Prado, Hilux)",
    about:
      "Naran sits in Khyber Pakhtunkhwa's Kaghan Valley. The drive from Pindi/Islamabad takes around 6.5 hours, with the last hour on alpine roads that demand a 4x4 — especially if you plan to continue to Lake Saif-ul-Malook or Babusar Pass.",
    highlights: [
      "Open season is May to September; check road conditions before booking outside this window",
      "Babusar Pass requires a 4x4 — sedans cannot make the climb",
      "Vendors in Pindi/Islamabad typically quote a 3-day round-trip package",
    ],
  },
  "islamabad-to-skardu": {
    distanceKm: 600,
    driveHours: 14,
    motorway: "N-35 Karakoram Highway",
    bestVehicle: "4x4 with experienced driver",
    about:
      "The Islamabad–Skardu drive along the Karakoram Highway is one of the most scenic in the world, but it's a serious 14-hour journey. Almost everyone rents a 4x4 with an experienced driver who knows the high-altitude sections — self-drive is not recommended unless you've driven these roads before.",
    highlights: [
      "Open mainly May to October — winters bring snow closures",
      "Vendors typically quote 6–7 day round-trip packages including driver, fuel, tolls",
      "Carry a paper backup of your itinerary — mobile signal drops in the gorges",
    ],
  },
};

/** Documents every customer needs — same across all cities + routes. */
export const RENTER_DOCUMENTS = [
  {
    title: "Original CNIC",
    detail: "Vendors photocopy or photograph your CNIC for their records. Bring the physical card, not a printout.",
  },
  {
    title: "Valid driving license",
    detail: "For self-drive bookings only. International licenses work; learner permits don't.",
  },
  {
    title: "Refundable security deposit",
    detail: "Typically PKR 5,000 to PKR 25,000 depending on the car. Returned at drop-off if the car is in the same condition.",
  },
  {
    title: "Local contact number",
    detail: "Vendors call to confirm before pickup. A working WhatsApp number speeds everything up.",
  },
];
