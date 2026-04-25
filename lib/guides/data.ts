// File-based guide article registry. Editing here requires a deploy; the
// payoff is zero new dependencies (no MDX toolchain) and full type safety on
// the content shape. If we later move authoring to a CMS, swap the registry
// for a DB query — the rest of the rendering chain stays unchanged.

const UNSPLASH = "https://images.unsplash.com";

export type GuideCategory = "for-renters" | "for-vendors";

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "callout";
      tone: "tip" | "warning" | "note";
      title: string;
      body: string;
    }
  | { type: "checklist"; items: { title: string; detail?: string }[] }
  | { type: "quote"; text: string; cite?: string };

export interface Guide {
  slug: string;
  title: string;
  /** SEO meta description and the share-preview subtitle. */
  description: string;
  /** 1–2 sentence preview shown on the index card. */
  excerpt: string;
  category: GuideCategory;
  /** Approximate read time in minutes. */
  readMins: number;
  author: { name: string; role: string };
  publishedAt: string; // YYYY-MM-DD
  updatedAt?: string;
  heroImage: string;
  imageAlt: string;
  blocks: GuideBlock[];
}

export const GUIDE_CATEGORIES: {
  key: GuideCategory | "all";
  label: string;
  helper: string;
}[] = [
  { key: "all", label: "All guides", helper: "Everything we've published" },
  {
    key: "for-renters",
    label: "For renters",
    helper: "How to choose, book, and drive away with confidence",
  },
  {
    key: "for-vendors",
    label: "For vendors",
    helper: "Get more bookings and grow your rental business",
  },
];

export const GUIDES: Guide[] = [
  // ── 1. Customer pillar ────────────────────────────────────────────────
  {
    slug: "self-drive-vs-with-driver-pakistan",
    title: "Self-drive vs with-driver in Pakistan: which is right for you?",
    description:
      "A clear breakdown of when self-drive saves money, when a driver is worth it, and what each option actually costs in Pakistan in 2026.",
    excerpt:
      "The short answer: it depends on your route, your nerves, and your budget. The longer answer is below — with real numbers from Pakistani vendors.",
    category: "for-renters",
    readMins: 7,
    author: { name: "RentNowPK Team", role: "Editorial" },
    publishedAt: "2026-04-25",
    heroImage: `${UNSPLASH}/photo-1494976388531-d1058494cdd8?w=1600&q=70`,
    imageAlt: "Open road stretching into the distance",
    blocks: [
      {
        type: "p",
        text: "Every customer asks us the same question: should I rent the car self-drive, or pay a bit more and have someone else handle the wheel? There's a right answer for most situations — but it's not always the obvious one. This guide walks through the real tradeoffs in the Pakistani context: city traffic, intercity motorways, weddings, hill-station trips, and the documents you actually need for each option.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Quick answer",
        body: "If you're driving in Lahore, Karachi, or Islamabad and you've driven those cities before, self-drive saves you 20–30%. If you're going to Murree, Naran, or Skardu, or you're booking for a wedding, with-driver is almost always worth it — even before you factor in parking and fatigue.",
      },

      {
        type: "h2",
        id: "cost",
        text: "What each option actually costs",
      },
      {
        type: "p",
        text: "The headline number is the daily rate, but that's not the full picture. Here's what each option includes, and what you pay on top of the quoted rate.",
      },
      {
        type: "h3",
        text: "Self-drive",
      },
      {
        type: "ul",
        items: [
          "Daily rate covers the car only — you handle fuel and tolls",
          "Refundable security deposit of PKR 5,000–25,000 depending on the car",
          "Mileage cap (often 250 km/day); going over costs PKR 15–25 per extra km",
          "You return the car at the same fuel level you got it",
        ],
      },
      {
        type: "h3",
        text: "With driver",
      },
      {
        type: "ul",
        items: [
          "Daily rate covers car + driver for a 12-hour day",
          "Driver overtime after 12 hours: typically PKR 300–500 per extra hour",
          "Outstation trips: vendors quote per-trip with fuel + tolls usually paid by you",
          "Driver food and accommodation on multi-day trips: ~PKR 800–1,200/day",
        ],
      },

      {
        type: "h2",
        id: "when-self-drive",
        text: "When self-drive makes sense",
      },
      {
        type: "checklist",
        items: [
          {
            title: "You know the city you're driving in",
            detail:
              "Lahore, Karachi, and Islamabad are very different to drive. If you've driven the city before, self-drive is comfortable and cheaper.",
          },
          {
            title: "Your trip is mostly within one city",
            detail:
              "Self-drive shines for weekday work travel, day trips, errands. The mileage cap rarely bites.",
          },
          {
            title: "You have a clean license + extra cash for deposit",
            detail:
              "Vendors require both. The deposit comes back at drop-off when the car is returned in the same condition.",
          },
          {
            title: "You want flexibility on timing",
            detail:
              "No driver to coordinate with — leave when you want, take detours, stop where you like.",
          },
        ],
      },

      {
        type: "h2",
        id: "when-with-driver",
        text: "When with-driver is the smarter call",
      },
      {
        type: "checklist",
        items: [
          {
            title: "You're going to a hill station",
            detail:
              "Murree, Naran, Hunza, Skardu — these roads demand a driver who knows the terrain. Self-drive accidents in the north are common and the insurance position is messy.",
          },
          {
            title: "You're booking for a wedding or event",
            detail:
              "You want to focus on the event, not parking. Drivers also handle the late-night drop-offs that nobody enjoys after a long shaadi day.",
          },
          {
            title: "You're new to the city",
            detail:
              "First time in Karachi traffic? Local drivers know the shortcuts, the no-go neighbourhoods, and where to actually find parking.",
          },
          {
            title: "You're renting a Hiace or Coaster",
            detail:
              "Larger vehicles are almost always rented with a professional driver — most vendors won't hand them over self-drive.",
          },
        ],
      },

      {
        type: "h2",
        id: "license-insurance",
        text: "Documents and insurance — what's actually required",
      },
      {
        type: "p",
        text: "For self-drive bookings, every vendor will ask for the same three things: original CNIC, valid driving license (international licenses are accepted by most), and a refundable cash or bank-deposit security. International tourists should bring their passport plus an International Driving Permit alongside their home country license.",
      },
      {
        type: "p",
        text: "Insurance is the topic vendors don't talk about until something goes wrong. Most rental cars in Pakistan are not on a daily-rental insurance product the way they would be in Europe or the US — they're typically on the vendor's standard private policy, which has limits. For self-drive, ask the vendor in writing what happens in case of an accident: who pays for damage, what's your liability, what's the deductible. For with-driver, the driver is the vendor's employee or sub-contractor and any liability flows through them, which is a simpler position for the renter.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Get the insurance answer in writing",
        body: "Ask the vendor on WhatsApp before you confirm the booking. The answer should be a clear statement of who pays for what — vague replies are a sign to keep shopping.",
      },

      {
        type: "h2",
        id: "scenarios",
        text: "Common scenarios mapped to a recommendation",
      },
      {
        type: "ul",
        items: [
          "Wedding in Lahore for 3 days → with driver, sedan or SUV",
          "Two-week work trip in Karachi → self-drive sedan if you've driven Karachi before; otherwise driver",
          "Family weekend in Murree → with driver, SUV or 4x4",
          "Airport pickup + a quick city tour → with driver (no parking stress)",
          "Photo shoot in DHA Phase 6 → self-drive, you choose the car for the shoot",
          "Karachi → Hyderabad day trip → with driver, sedan; you'll thank yourself on the return",
        ],
      },

      {
        type: "h2",
        id: "how-to-decide",
        text: "How to make the call in 60 seconds",
      },
      {
        type: "ol",
        items: [
          "Where are you going? (City vs intercity vs hill station)",
          "Have you driven there before?",
          "Is there a fixed event you don't want to be late to?",
          "Are you carrying valuables, or have a young family along?",
          "Compare the with-driver quote — if it's only 20–30% more than self-drive, the comfort is usually worth it",
        ],
      },
      {
        type: "p",
        text: "Most people who switch from self-drive to with-driver after one frustrating trip don't go back. But if you know the route, the city, and you want maximum flexibility, self-drive is still the cheapest way to rent in Pakistan.",
      },
    ],
  },

  // ── 2. Vendor pillar ──────────────────────────────────────────────────
  {
    slug: "grow-your-car-rental-business-rentnowpk",
    title: "How to grow your car rental business on RentNowPK",
    description:
      "The handful of things that separate vendors who get a steady stream of leads from vendors who watch their listings sit unread.",
    excerpt:
      "Most vendors who underperform on RentNowPK do the same five things wrong. Fix these and your bookings climb without changing your prices.",
    category: "for-vendors",
    readMins: 9,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    heroImage: `${UNSPLASH}/photo-1552083974-5dbb6b1d3504?w=1600&q=70`,
    imageAlt: "A car at golden hour",
    blocks: [
      {
        type: "p",
        text: "We see the data behind every listing on RentNowPK — which ones get clicked, which get a WhatsApp lead, and which sit invisible. The vendors who consistently win bookings aren't the cheapest. They're the ones who treat their listings the way a retailer treats a shop window. This is the playbook they follow.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Read this with your dashboard open",
        body: "Each section maps to something you can change today inside /vendor/listings. Most fixes take 10 minutes per listing.",
      },

      {
        type: "h2",
        id: "photos",
        text: "1. Photos — the single biggest factor",
      },
      {
        type: "p",
        text: "Customers scrolling the search grid decide whether to tap your listing in less than two seconds. The decision is almost entirely visual. A good photo set lifts your click-through rate by 2–3× — we've measured it.",
      },
      {
        type: "checklist",
        items: [
          {
            title: "Use 3–8 photos per listing",
            detail:
              "Three is the floor. Eight is the ceiling — past that the gallery feels noisy without adding info.",
          },
          {
            title: "Shoot in natural light, ideally early morning or late afternoon",
            detail:
              "Avoid direct overhead sun (harsh shadows) and indoor showroom photos (dull and orange under fluorescents).",
          },
          {
            title: "Include a wide exterior shot, an angled three-quarter shot, the interior, and the dashboard",
            detail:
              "Customers want to see the car from the angles they'll experience it — outside walking up, inside sitting in.",
          },
          {
            title: "Avoid stickers, logos, and text overlays on photos",
            detail:
              "Ours look amateur next to clean photos. Let the platform's branding do the framing.",
          },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Avoid this mistake",
        body: "Stock photos and dealer brochure shots are spotted instantly. Customers know they're not your actual car and lose trust. Always shoot the specific car you're listing.",
      },

      {
        type: "h2",
        id: "title-spec",
        text: "2. Listing title and key specs",
      },
      {
        type: "p",
        text: "Title format that consistently wins: 'Year + Make + Model' followed by city. So 'Toyota Corolla 2022' beats 'Beautiful Corolla' every time. Customers search for specific models. Your title needs to match how they search.",
      },
      {
        type: "p",
        text: "Fill in every spec field — transmission, fuel, seats, color. Each one is a filter customers use. A blank field means your car doesn't appear when someone filters by automatic transmission, even if your car IS automatic.",
      },

      {
        type: "h2",
        id: "pricing",
        text: "3. Pricing — be competitive without becoming the cheapest",
      },
      {
        type: "p",
        text: "The cheapest listing on the page rarely wins. Customers assume something is wrong with it — old car, hidden charges, or a vendor who'll cancel last minute. The sweet spot is to be in the middle 60% of comparable listings in your city, and to be transparent about what's included.",
      },
      {
        type: "ul",
        items: [
          "Set both a daily and a weekly rate. Customers planning longer trips filter by weekly cost.",
          "If you offer self-drive, list a separate self-drive rate that's lower than your with-driver rate. The two-pricing model converts better than a single 'price varies' note.",
          "Add at least one paid add-on (delivery to airport, additional driver, baby seat). Add-ons signal that you're a serious operator.",
        ],
      },

      {
        type: "h2",
        id: "response-speed",
        text: "4. Response speed on WhatsApp",
      },
      {
        type: "p",
        text: "Once a customer sends you a WhatsApp message via RentNowPK, the clock starts. Vendors who reply within 5 minutes win the booking 70% of the time. Vendors who take more than 30 minutes lose to whoever replied first — usually a competitor on the same listing.",
      },
      {
        type: "checklist",
        items: [
          {
            title: "Turn on WhatsApp notifications + RentNowPK push notifications",
            detail:
              "Push alerts ping you the moment a lead arrives, even when the app is closed. Enable them in /vendor/settings → Notifications.",
          },
          {
            title: "Have 2–3 quick reply templates ready",
            detail:
              "Greet, confirm availability, ask about pickup location and dates, share the rate. Template responses get you to confirmation in 3 messages.",
          },
          {
            title: "If you can't respond, get someone on your team to monitor",
            detail:
              "A leads page that's checked twice a day is essentially turned off. Lead value drops by 50% every hour after arrival.",
          },
        ],
      },

      {
        type: "h2",
        id: "verification",
        text: "5. Get the verified badge — it more than pays for itself",
      },
      {
        type: "p",
        text: "Verified vendors (the green check on your profile) get noticeably more leads per listing than unverified ones. The badge appears in search results, on listing cards, and on your vendor profile. Customers choose verified over unverified at every comparison point — even when the prices are identical.",
      },
      {
        type: "p",
        text: "Verification takes 1–2 business days. Submit your CNIC, business documents, and a selfie via /vendor/onboarding. We never share these with customers — they're for our records only.",
      },

      {
        type: "h2",
        id: "reviews",
        text: "Bonus: how to get more reviews",
      },
      {
        type: "p",
        text: "Reviews are the second-strongest trust signal after verification. The customers most likely to leave one are the ones you went out of your way for: an early pickup, a clean car delivered on time, a flexible drop-off. Don't ask for reviews mid-trip — ask 24 hours after the trip ends, in a friendly WhatsApp message that includes a one-line pitch and a link to your RentNowPK profile.",
      },
      {
        type: "quote",
        text: "We went from 4 leads a week to 14 in two months. Nothing changed except photos and response time.",
        cite: "Sarwar Motors, Lahore — RentNowPK vendor since 2024",
      },

      {
        type: "h2",
        id: "what-not-to-do",
        text: "What to avoid",
      },
      {
        type: "ul",
        items: [
          "Don't list cars you don't have. Cancellations destroy your trust score and we hide repeat-offender listings from search.",
          "Don't use the same photo across multiple listings. Each listing needs its own shoot.",
          "Don't quote one price on the platform and a different one on WhatsApp. Customers screenshot.",
          "Don't ghost a lead. If the car isn't available, reply once and tell them — they'll come back to you next time.",
        ],
      },
      {
        type: "p",
        text: "If you do nothing else from this guide, do the photos. Then turn on push notifications. Those two changes alone move the needle for 80% of vendors.",
      },
    ],
  },

  // ── 3. Vendor pillar #2 ───────────────────────────────────────────────
  {
    slug: "pricing-your-fleet-pakistan",
    title: "Pricing your fleet for the Pakistani market: a vendor's guide",
    description:
      "What to charge per day, when to discount, when to mark up, and how to think about the price-tag economics that actually drive your monthly revenue.",
    excerpt:
      "There's a market price for every car in every city — and most vendors either undersell or overprice. Here's how to land in the band that fills your calendar.",
    category: "for-vendors",
    readMins: 8,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    heroImage: `${UNSPLASH}/photo-1469854523086-cc02fe5d8800?w=1600&q=70`,
    imageAlt: "A road winding through hills",
    blocks: [
      {
        type: "p",
        text: "Pricing is the lever vendors get most wrong. Too low and you fill the calendar but burn out for nothing. Too high and the calendar empties. This guide is the framework we share with every vendor who asks how to price their fleet for the Pakistani market.",
      },

      {
        type: "h2",
        id: "the-band",
        text: "Find the band — don't aim for the floor",
      },
      {
        type: "p",
        text: "Open the search page for your city, filter by your car's body type, and look at the prices of the 10 listings nearest yours. Your price should sit in the middle 60% of that range. Not the cheapest. Not the most expensive. The middle is where most bookings convert because customers screen out the outliers in both directions.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Why the cheapest doesn't always win",
        body: "Customers assume the cheapest listing on a search page has a catch — old car, bad service, last-minute cancellation. Mid-priced listings convert at a higher rate per click than the cheapest one.",
      },

      {
        type: "h2",
        id: "tier-pricing",
        text: "Use all three pricing tiers",
      },
      {
        type: "p",
        text: "RentNowPK supports daily, weekly, and monthly rates per listing. Most vendors only fill in the daily rate, which means they lose every customer who's filtering by weekly cost. Customers planning a 7-day trip compare per-week prices side by side; if you don't show one, you're invisible to that filter.",
      },
      {
        type: "ul",
        items: [
          "Daily rate: your headline. Sets the perception of your pricing.",
          "Weekly rate: 6× the daily rate is standard (so the 7th day is free). 5.5× wins more bookings if your fleet has spare capacity.",
          "Monthly rate: 22–25× the daily rate. This is for corporate / long-stay customers; volume is small but the rate is locked in.",
        ],
      },

      {
        type: "h2",
        id: "self-drive-premium",
        text: "Self-drive vs with-driver pricing",
      },
      {
        type: "p",
        text: "If your listing supports both modes, set them as separate prices. Self-drive should typically be 25–35% lower than with-driver, since you're not bundling driver labour. Don't set them the same — customers will assume you're just rounding and pick the competitor who has clean two-mode pricing.",
      },

      {
        type: "h2",
        id: "peak-season",
        text: "Peak season — when to mark up",
      },
      {
        type: "p",
        text: "Pakistani car-rental demand has predictable spikes. The vendors who win revenue in peak season are the ones who adjust pricing 3–4 weeks ahead of the spike, not after it.",
      },
      {
        type: "checklist",
        items: [
          {
            title: "Eid-ul-Fitr and Eid-ul-Azha (3 days each)",
            detail:
              "Mark up 30–50% on intercity bookings. Demand spikes 4× and supply is tight.",
          },
          {
            title: "Wedding season (October–February)",
            detail:
              "Sedans and SUVs in white and dark colors get a 15–25% premium for weekend evenings.",
          },
          {
            title: "Northern areas season (May–September)",
            detail:
              "4x4s, Fortuners, and Prados in Islamabad/Pindi see 30%+ premiums for outstation bookings.",
          },
          {
            title: "School breaks (June–August + late December)",
            detail:
              "Family-size vehicles (7-seaters, vans) command a 10–20% premium on family-trip routes.",
          },
        ],
      },

      {
        type: "h2",
        id: "addons",
        text: "Add-ons — small numbers, real revenue",
      },
      {
        type: "p",
        text: "Add-ons are where vendors leave money on the table. Each add-on costs you almost nothing to offer but adds PKR 500–3,000 per booking when accepted. Customers expect them and reject vendors who don't list any.",
      },
      {
        type: "ul",
        items: [
          "Doorstep delivery / pickup: PKR 1,000–2,000 within the city",
          "Airport pickup: PKR 1,500–3,000 depending on city",
          "Additional driver: PKR 800–1,500/day",
          "Baby car seat: PKR 500–1,000/day",
          "Extra cleaning fee for long trips: PKR 1,000",
        ],
      },

      {
        type: "h2",
        id: "discount-strategy",
        text: "When to discount",
      },
      {
        type: "p",
        text: "There are exactly two times when discounting works: filling the off-peak calendar (Tuesday–Thursday in city, mid-month in slow seasons) and rewarding repeat customers. Avoid discounting at the time of booking — it trains customers to negotiate every time. Instead, build the discount into a 'long trip' tier (5+ days = 10% off, 10+ days = 15% off) so it feels like a structured offer, not a haggle.",
      },

      {
        type: "h2",
        id: "review-quarterly",
        text: "Review your prices quarterly",
      },
      {
        type: "p",
        text: "The market moves. New vendors enter, fuel prices shift, the wedding season kicks in. Lock 30 minutes on your calendar every three months to walk through your listings, check the current market range, and adjust. Vendors who set prices once and forget are usually 15–20% out of date within a year — almost always too low.",
      },
      {
        type: "callout",
        tone: "note",
        title: "RentNowPK shows you what's competitive",
        body: "Use the public search page like a customer would. Filter by your city + body type + transmission. The first 10 listings are your real competition — those are the prices to benchmark against.",
      },

      {
        type: "p",
        text: "Pricing well isn't a one-time decision; it's a quarterly habit. Vendors who adjust prices in line with the market book more days, even when their per-day rate is higher than the average. The goal is calendar fullness, not headline rate.",
      },
    ],
  },
];
