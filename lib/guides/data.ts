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
  | { type: "quote"; text: string; cite?: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      /** Defaults to "16/9". */
      ratio?: "16/9" | "4/3" | "1/1";
    };

/** Topic key drives the branded gradient hero illustration on the guide
 *  card and detail page (see components/guides/guide-hero.tsx). */
export type GuideTopic =
  | "business-setup"
  | "kyc"
  | "add-car"
  | "photo"
  | "pricing-guide"
  | "policies"
  | "leads"
  | "notifications"
  | "install"
  | "grow-business"
  | "self-drive";

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
  /** Topic icon for the branded hero. Falls back to a generic gradient. */
  topic: GuideTopic;
  /** Optional photographic hero — only used by guides that need one. Most
   *  guides use the topic-driven gradient hero instead, which is rendered
   *  from CSS + Lucide and never has loading issues. */
  heroImage?: string;
  imageAlt?: string;
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
    topic: "self-drive",
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
    topic: "grow-business",
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
    topic: "pricing-guide",
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

  // ── 4. Vendor: business setup ─────────────────────────────────────────
  {
    slug: "set-up-your-business-on-rentnowpk",
    title: "How to set up your business on RentNowPK (step-by-step)",
    description:
      "A simple guide for new vendors — register, set up your business, and get ready to receive your first lead.",
    excerpt:
      "Brand new to RentNowPK? Follow these steps in order. The whole setup takes about 15 minutes.",
    category: "for-vendors",
    readMins: 5,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "business-setup",
    blocks: [
      {
        type: "p",
        text: "Welcome. This guide walks you through every step of setting up as a vendor. The whole process takes about 15 minutes if you have your CNIC and a few car photos ready. After this, customers can find you and message you directly on WhatsApp.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Before you start — keep these handy",
        body: "Your CNIC, a phone you can take a clear selfie with, your business name and address, and at least 3 photos of one of your cars. That's all you need.",
      },

      {
        type: "h2",
        id: "signup",
        text: "Step 1: Sign up for an account",
      },
      {
        type: "ol",
        items: [
          "Open www.rentnowpk.com on your phone or computer",
          "Tap 'List your car' at the top right",
          "Enter your name, email, WhatsApp number, and a password",
          "Tap 'Create account' — done",
        ],
      },
      {
        type: "p",
        text: "We'll send a welcome email to confirm your address. Open it and tap the link to finish.",
      },

      {
        type: "h2",
        id: "business-profile",
        text: "Step 2: Set up your business profile",
      },
      {
        type: "p",
        text: "After you sign in, you'll land on the onboarding screen. The first card asks for your business details:",
      },
      {
        type: "checklist",
        items: [
          { title: "Business name", detail: "What customers will see — e.g. 'Lahore City Rentals' or 'Sarwar Motors'." },
          { title: "City and address", detail: "The city you operate in. Address can be a landmark like 'opposite Pace, Gulberg'." },
          { title: "Phone and WhatsApp", detail: "We pre-fill these from your signup. Make sure both are correct — customers will message you here." },
          { title: "Short description", detail: "Two or three sentences. What kind of cars you have, your standout point. Skip if not sure." },
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Use the WhatsApp number you actually check",
        body: "If you put a number you don't check daily, you'll lose every lead in the first hour. Customers don't wait — they message the next vendor.",
      },

      {
        type: "h2",
        id: "kyc-step",
        text: "Step 3: Submit KYC (identity verification)",
      },
      {
        type: "p",
        text: "Next card is KYC. We need three photos: front of your CNIC, back of your CNIC, and a selfie holding your CNIC. This takes about 2 minutes. Approval usually comes within 1 business day. We have a separate guide for this — see 'How to submit your KYC documents'.",
      },

      {
        type: "h2",
        id: "agree",
        text: "Step 4: Read and agree to the vendor terms",
      },
      {
        type: "p",
        text: "The third card shows the vendor agreement. The most important parts are at the top: per-lead pricing by car category, monthly billing, and your basic obligations (respond fast, list real cars, real prices). Read carefully, scroll to the bottom, then tick 'I agree' and continue.",
      },

      {
        type: "h2",
        id: "first-listing",
        text: "Step 5: Add your first car",
      },
      {
        type: "p",
        text: "After agreement you'll land on your dashboard. Tap the orange 'New listing' button at the top of the sidebar. The car-adding wizard takes 5 minutes per car. Full walkthrough in the 'Add your first car' guide.",
      },

      {
        type: "h2",
        id: "go-live",
        text: "Step 6: Wait for review, then go live",
      },
      {
        type: "p",
        text: "After you submit your first car, our team reviews it within 1–2 business days. You'll get a notification when it's approved (or a clear reason if anything needs changes). Once both your KYC and first listing are approved, your car shows up in customer search results. From that point, every customer who messages you on WhatsApp through RentNowPK is recorded as a lead.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Check your dashboard daily for the first week",
        body: "Open /vendor on your phone or laptop. The dashboard shows your leads, your listings, and any messages from our team. Doing this daily for the first week catches any small issues before they slow you down.",
      },
    ],
  },

  // ── 5. Vendor: KYC step-by-step ───────────────────────────────────────
  {
    slug: "submit-your-kyc-documents",
    title: "How to submit your KYC documents the right way",
    description:
      "What we need, how to take the photos, and how to fix things if your KYC is rejected.",
    excerpt:
      "We need 3 simple photos to verify you're a real person. This guide shows exactly how to take them so you pass on the first try.",
    category: "for-vendors",
    readMins: 5,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "kyc",
    blocks: [
      {
        type: "p",
        text: "KYC stands for 'Know Your Customer'. It just means we need to confirm you're a real person with a real Pakistani CNIC. We never share these documents with anyone — they're only used to verify your account once.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Why we ask for KYC",
        body: "Customers trust verified vendors more. They book faster, pay deposits faster, and leave fewer 'is this real?' messages. The verified badge on your profile pays for itself.",
      },

      {
        type: "h2",
        id: "what-we-need",
        text: "What we need from you",
      },
      {
        type: "checklist",
        items: [
          { title: "Your CNIC number", detail: "Type it carefully — format is 12345-1234567-1." },
          { title: "Photo of CNIC front", detail: "The side with your photo and name." },
          { title: "Photo of CNIC back", detail: "The side with your address and signature." },
          { title: "Selfie holding your CNIC", detail: "Your face and the front of the card both visible in one photo." },
        ],
      },

      {
        type: "h2",
        id: "how-to-photograph",
        text: "How to take good CNIC photos",
      },
      {
        type: "ol",
        items: [
          "Use your phone camera — don't use the one inside the upload form (it's lower quality)",
          "Find a flat surface with even light — near a window in daytime works perfectly",
          "Place the CNIC flat on a plain background — a wooden table, a notebook, anything not patterned",
          "Hold the phone directly above the card, not at an angle. The card should fill most of the photo",
          "Make sure all four corners are visible. No fingers covering the edges",
          "Take the photo, then check it — name and CNIC number must be readable. If they're blurry, retake",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Common mistakes that cause rejection",
        body: "Glare from the lamination, fingers covering the number, photo taken at an angle so part of the card is cut off, photo taken at night with yellow light. Take 30 seconds to retake — saves 1–2 days of waiting.",
      },

      {
        type: "h2",
        id: "selfie",
        text: "How to take the selfie",
      },
      {
        type: "ol",
        items: [
          "Hold your CNIC next to your face, around chest height — not in front of your face",
          "The front of the CNIC should be facing the camera, not facing you",
          "Use your phone's front camera in good daylight — no harsh shadows on your face",
          "Both your face AND the CNIC must be clearly visible in the same photo",
          "No hat, no sunglasses, no mask — your face should match the photo on the card",
        ],
      },

      {
        type: "h2",
        id: "submit",
        text: "Submitting your documents",
      },
      {
        type: "ol",
        items: [
          "Go to /vendor/onboarding (or tap 'Verify your identity' from the orange banner on your dashboard)",
          "Upload all three photos — front, back, selfie",
          "Type your CNIC number carefully",
          "Tick the agreement box and tap 'Submit for verification'",
          "You'll see a yellow 'Under review' card — that means it's with our team",
        ],
      },

      {
        type: "h2",
        id: "after-submit",
        text: "What happens next",
      },
      {
        type: "p",
        text: "Our team reviews KYC submissions within 1–2 business days. You'll get a notification (and an email) the moment a decision is made. If approved, your business profile gets a green 'Verified' badge automatically — and any car listings that were waiting on KYC go live immediately.",
      },

      {
        type: "h2",
        id: "rejection",
        text: "What to do if your KYC is rejected",
      },
      {
        type: "p",
        text: "If we can't verify, the notification will tell you exactly why — usually 'CNIC photo blurry' or 'face not visible in selfie'. Don't worry. Just take new photos following this guide and resubmit.",
      },
      {
        type: "ol",
        items: [
          "Open /vendor/settings",
          "Go to the 'Security' tab",
          "Find the 'Identity verification' card — it shows the rejection reason in red",
          "Tap 'Resubmit documents' to upload again",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Pro tip — clean lens first",
        body: "Phone camera lenses get smudgy. Wipe yours with a soft cloth (or a clean shirt) before taking CNIC photos. Sharp photos = first-try approval.",
      },
    ],
  },

  // ── 6. Vendor: how to add a car ───────────────────────────────────────
  {
    slug: "add-your-first-car-rentnowpk",
    title: "Add your first car: a 5-step walkthrough",
    description:
      "Everything you fill in when listing a car, in order — from make and model to photos and policies.",
    excerpt:
      "The new-listing wizard has 5 short steps. This guide walks you through each one so nothing gets skipped.",
    category: "for-vendors",
    readMins: 6,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "add-car",
    blocks: [
      {
        type: "p",
        text: "Listing a car takes about 5 minutes the first time. Once you've done one, the rest go faster. Open /vendor/listings and tap the orange 'New listing' button to start.",
      },

      {
        type: "h2",
        id: "step-1",
        text: "Step 1: Basics — what is the car?",
      },
      {
        type: "checklist",
        items: [
          { title: "Car category", detail: "Pick from Economy, Sedan, SUV, or Luxury. This sets your per-lead price (visible in the agreement). Pick the one that matches your car best." },
          { title: "Make and model", detail: "Type to search — Toyota, Honda, Suzuki, all common ones are there. If yours isn't listed, type the name and tap 'Add new'." },
          { title: "Year", detail: "Pick from the dropdown. Newer cars rent for more, but old reliable cars rent fast too." },
          { title: "City", detail: "Where the car is parked and where customers pick it up." },
          { title: "Color, transmission, fuel, seats", detail: "Fill in all of these — customers filter by them. If 'Toyota Corolla 2020 automatic petrol 5-seater' is in your listing, every search for those terms finds you." },
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Title is auto-filled — leave it as is",
        body: "When you pick make + model + year, the title fills in automatically (e.g. 'Toyota Corolla 2020'). That's the format customers search for. Don't change it to 'Beautiful Corolla' or 'Best Car' — those don't match real searches.",
      },

      {
        type: "h2",
        id: "step-2",
        text: "Step 2: Features — what does the car have?",
      },
      {
        type: "p",
        text: "Tick everything the car actually has — AC, cruise control, sunroof, USB charging, automatic transmission, etc. Each feature is a filter customers use to find cars. The more accurate ticks, the more searches you appear in.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "Don't lie about features",
        body: "If you tick 'sunroof' but the car doesn't have one, the customer will see when they pick it up. Bad review. Be honest — even basic cars get bookings.",
      },

      {
        type: "h2",
        id: "step-3",
        text: "Step 3: Pricing — how much per day?",
      },
      {
        type: "checklist",
        items: [
          { title: "Daily rate (with driver)", detail: "Required. This is your headline price — for one full 12-hour day with a driver. Include fuel and basic mileage in the price." },
          { title: "Weekly rate", detail: "Optional but recommended. Customers planning a 7-day trip filter by weekly cost. Standard formula: 6 times the daily rate." },
          { title: "Monthly rate", detail: "Optional. For corporate / long-stay customers. Standard formula: 22 to 25 times the daily rate." },
          { title: "Self-drive toggle", detail: "Turn on if you allow customers to drive themselves (no driver included). Then enter a separate self-drive daily rate — usually 25 to 35 percent lower than your with-driver rate." },
          { title: "Add-ons", detail: "Optional extras you can charge for — airport pickup, child seat, additional driver. These show up under your car as add-on options for the customer." },
        ],
      },

      {
        type: "h2",
        id: "step-4",
        text: "Step 4: Policies — your rules",
      },
      {
        type: "p",
        text: "We pre-fill three standard policies: Delivery, Toll Taxes, Fuel Policy. Read each one — most vendors keep them as is. Edit if your rules are different. You can also add new policies (e.g. cleaning charges, late-return fees) by tapping 'Add policy'.",
      },

      {
        type: "h2",
        id: "step-5",
        text: "Step 5: Photos — the most important step",
      },
      {
        type: "p",
        text: "Upload 3 to 8 photos of the car. The more, the better. Customers decide whether to message you in 2 seconds based on photos. We have a full guide on photographing cars — see 'How to photograph your car the right way'.",
      },
      {
        type: "ol",
        items: [
          "Tap the upload area or drag photos in",
          "Wait for each photo's progress bar to finish (small ones in seconds, big ones up to a minute)",
          "Mark one as the 'primary' photo — this is the one shown in search results",
          "Re-order by drag if needed",
          "When you have at least 3, the 'Submit for approval' button activates",
        ],
      },

      {
        type: "h2",
        id: "submit",
        text: "Submitting for approval",
      },
      {
        type: "p",
        text: "After photos, tap 'Submit for approval'. Our team reviews within 1–2 business days. You'll get a notification when it's approved or if anything needs changes. Once approved AND your KYC is also approved, the car goes live in customer search.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "You don't have to write a description",
        body: "We auto-generate the description from the details you entered (title, city, prices, business name). You'll see it on the public car page after submitting. If you want to write your own, edit the listing later.",
      },
    ],
  },

  // ── 7. Vendor: car photos walkthrough ─────────────────────────────────
  {
    slug: "photograph-your-car-for-more-bookings",
    title: "How to photograph your car for more bookings",
    description:
      "The angles, the lighting, and what to avoid — practical tips for vendors using just a phone camera.",
    excerpt:
      "Photos are the #1 reason customers tap your listing or scroll past. These tips work even with a basic phone.",
    category: "for-vendors",
    readMins: 5,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "photo",
    blocks: [
      {
        type: "p",
        text: "Customers decide in 2 seconds. Photos do all the work. You don't need a professional camera — your phone is enough. You just need to know which angles to shoot, which time of day, and what to avoid.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "The 4 photos every listing needs",
        body: "Front-3/4 angle (showroom shot), interior (driver and passenger seats), dashboard, and one detail shot (wheels, badge, or steering wheel). Three photos is the minimum, four is the sweet spot, more is fine up to 8.",
      },

      {
        type: "h2",
        id: "before",
        text: "Before you take any photo",
      },
      {
        type: "ol",
        items: [
          "Wash the car. A clean car looks 50% more expensive than a dusty one — same exact car",
          "Pick the time of day — early morning (around 8am) or late afternoon (around 5pm) gives the softest light. Avoid harsh midday sun",
          "Find a clean background — empty car park, in front of plain wall, or a quiet street. Avoid clutter, other cars, garbage, or busy roads",
          "Wipe the phone camera lens with a clean cloth — smudges blur photos",
        ],
      },

      {
        type: "h2",
        id: "front-shot",
        text: "Photo 1: The front 3/4 angle",
      },
      {
        type: "p",
        text: "This is your headline shot — the one that goes in search results. Stand at the front-right corner of the car, about 3 metres back. The car should fill the frame from front bumper to rear wheel. Hold the phone at headlight height.",
      },
      {
        type: "image",
        src: `${UNSPLASH}/photo-1552083974-5dbb6b1d3504?w=1200&q=80`,
        alt: "Sleek car shot at a 3/4 angle from the front",
        caption:
          "Example: front-3/4 angle. Whole car visible, low-angle, even light. This is the shot that decides whether customers tap your listing.",
      },

      {
        type: "h2",
        id: "interior-shot",
        text: "Photo 2: The interior",
      },
      {
        type: "p",
        text: "Open the front passenger door (not the driver side — you don't want to shoot the steering wheel from outside). Stand back and shoot the interior straight on. Both front seats and the dashboard should be visible.",
      },
      {
        type: "image",
        src: `${UNSPLASH}/photo-1562233237-10d744a7759d?w=1200&q=80`,
        alt: "Clean car interior view with both front seats and dashboard visible",
        caption:
          "Example: interior. Clean seats, dashboard in frame, no personal items lying around.",
      },

      {
        type: "h2",
        id: "dashboard-shot",
        text: "Photo 3: The dashboard",
      },
      {
        type: "p",
        text: "Sit in the driver's seat and shoot the dashboard from the passenger side, slightly above the seat. Show the steering wheel, the cluster, the infotainment screen, and the AC vents. This proves the car is in good shape.",
      },
      {
        type: "image",
        src: `${UNSPLASH}/photo-1541899481282-d53bffe3c35d?w=1200&q=80`,
        alt: "Detail shot of a car dashboard and steering wheel",
        caption:
          "Example: dashboard / detail shot. Clean steering, clear gauges, no cracks or wear visible.",
      },

      {
        type: "h2",
        id: "exterior-detail",
        text: "Photo 4: One detail shot",
      },
      {
        type: "p",
        text: "Pick one element you want to show off — the alloy wheels, the badge, the LED headlights, or the rear from the side. This adds personality and shows the car has been cared for.",
      },
      {
        type: "image",
        src: `${UNSPLASH}/photo-1519641471654-76ce0107ad1b?w=1200&q=80`,
        alt: "Stylish exterior detail of a car",
        caption:
          "Example: detail shot. Pick one feature that makes your car stand out and frame it tightly.",
      },

      {
        type: "h2",
        id: "avoid",
        text: "What to avoid",
      },
      {
        type: "checklist",
        items: [
          { title: "Stickers, watermarks, phone numbers on the photo", detail: "Looks amateur. We add the brand for you on share previews — no need to add yours." },
          { title: "Stock photos from Google or dealer brochure shots", detail: "Customers spot these instantly. They lose trust and move to the next listing." },
          { title: "Photos taken inside a closed garage or showroom", detail: "Yellow indoor light and reflections. Take the car outside even for 10 minutes." },
          { title: "Photos with people, kids, or other cars in the frame", detail: "Customers want to see the car only — not your nephew or your competitor." },
          { title: "Blurry, dark, or angled photos", detail: "If it's not sharp, retake. Bad photos cost you bookings — they're not worth uploading." },
        ],
      },

      {
        type: "callout",
        tone: "warning",
        title: "Don't use the same photo on multiple listings",
        body: "If you list 3 cars, each one needs its own photos. Same photos across listings is the #1 way customers spot a low-effort vendor.",
      },

      {
        type: "h2",
        id: "uploading",
        text: "Uploading on RentNowPK",
      },
      {
        type: "ol",
        items: [
          "On the photos step of the listing wizard, tap the upload box",
          "Select up to 8 photos at once from your phone gallery",
          "Wait for each progress bar — fast on Wi-Fi, takes 30–60 seconds on mobile data",
          "Tap a photo to mark it 'primary' — this is the one shown in search results. Pick your front-3/4 shot",
          "Drag to reorder if needed",
          "Tap 'Submit for approval' when done",
        ],
      },
    ],
  },

  // ── 8. Vendor: notifications setup ────────────────────────────────────
  {
    slug: "turn-on-instant-lead-alerts",
    title: "Turn on instant lead alerts (push notifications)",
    description:
      "Get pinged on your phone the moment a customer messages you — even when the app is closed.",
    excerpt:
      "Vendors with notifications on win 70% of leads. Vendors without lose them to whoever replies first. Setup takes 30 seconds.",
    category: "for-vendors",
    readMins: 3,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "notifications",
    blocks: [
      {
        type: "p",
        text: "Speed wins leads. Vendors who reply within 5 minutes book the customer 70% of the time. Vendors who take more than 30 minutes lose to whoever replied first. Push notifications are the easiest way to be the fast one — your phone pings the moment a customer fills the WhatsApp form.",
      },

      {
        type: "h2",
        id: "android",
        text: "On Android (Chrome)",
      },
      {
        type: "ol",
        items: [
          "Sign in at www.rentnowpk.com",
          "Tap your avatar → 'Settings'",
          "Tap the 'Notifications' tab",
          "Tap the orange 'Enable' button",
          "Your phone will ask 'Allow rentnowpk.com to send notifications?' — tap 'Allow'",
          "You'll see a green toast: 'Notifications enabled'",
          "Tap 'Send a test notification to this device' — within 1–2 seconds your phone should ping. That confirms it's working",
        ],
      },

      {
        type: "h2",
        id: "iphone",
        text: "On iPhone (Safari)",
      },
      {
        type: "callout",
        tone: "warning",
        title: "iPhone needs an extra step first",
        body: "Apple only delivers push notifications to apps installed to the home screen. On iPhone you must install RentNowPK first (Share → Add to Home Screen) before turning on notifications. See the 'Install RentNowPK on your phone' guide.",
      },
      {
        type: "ol",
        items: [
          "Open RentNowPK from your home-screen icon (not from Safari)",
          "Sign in if you haven't already",
          "Tap avatar → Settings → Notifications tab",
          "Tap 'Enable' — iOS will ask permission, tap 'Allow'",
          "Tap 'Send a test notification' to confirm it works",
        ],
      },

      {
        type: "h2",
        id: "desktop",
        text: "On a desktop / laptop",
      },
      {
        type: "p",
        text: "Same as Android — sign in, Settings → Notifications → Enable. Notifications appear in the corner of your screen. Works in Chrome, Edge, Firefox, and macOS Safari.",
      },

      {
        type: "h2",
        id: "what-you-get",
        text: "What the alerts look like",
      },
      {
        type: "p",
        text: "When a customer sends an enquiry, you'll see a notification like: 'New lead · Ahmed Khan' with the car name, city, and phone in the body. Tap it — you go straight to /vendor/leads where you can copy the customer's number into WhatsApp.",
      },

      {
        type: "h2",
        id: "troubleshoot",
        text: "If notifications stop coming",
      },
      {
        type: "checklist",
        items: [
          { title: "Phone in Do-Not-Disturb mode?", detail: "Switch DND off, or add your browser to the allowed apps." },
          { title: "Browser blocked notifications?", detail: "Open browser settings → Site settings → Notifications → make sure rentnowpk.com is set to 'Allow'." },
          { title: "Battery saver killing background processes?", detail: "On Android, check Settings → Apps → Chrome → Battery → set to 'Unrestricted'." },
          { title: "Logged out?", detail: "If you signed out, push subscription is removed for security. Sign back in and re-enable from Settings." },
        ],
      },

      {
        type: "callout",
        tone: "tip",
        title: "Two channels, both useful",
        body: "Even with push off, you'll see leads when you open RentNowPK — there's a bell icon at the top of the dashboard that lists all recent notifications. But push is what lets you reply in 5 minutes instead of 5 hours.",
      },
    ],
  },

  // ── 9. Vendor: install as app ─────────────────────────────────────────
  {
    slug: "install-rentnowpk-as-an-app",
    title: "Install RentNowPK as an app on your phone",
    description:
      "RentNowPK can be installed like a regular app — no Play Store or App Store needed. Faster to open, no browser bar.",
    excerpt:
      "Add RentNowPK to your home screen and it works exactly like a native app. Two-tap install on Android, three taps on iPhone.",
    category: "for-vendors",
    readMins: 3,
    author: { name: "RentNowPK Team", role: "Vendor Success" },
    publishedAt: "2026-04-25",
    topic: "install",
    blocks: [
      {
        type: "p",
        text: "RentNowPK works as a 'Progressive Web App' (PWA). That's a fancy way of saying you can install it on your phone like any other app — but without going to Play Store or App Store. Tap the home-screen icon and it opens straight away, full screen, no browser address bar. Faster than the browser, and you can enable lead notifications.",
      },

      {
        type: "h2",
        id: "android-install",
        text: "On Android (Chrome, Edge, Brave)",
      },
      {
        type: "ol",
        items: [
          "Open www.rentnowpk.com in Chrome",
          "Sign in as a vendor",
          "Within a few seconds, an orange 'Install RentNowPK' banner slides up from the bottom",
          "Tap 'Install' — Chrome shows the app icon and asks 'Add to home screen?'",
          "Tap 'Install' again — the icon appears on your home screen, named 'RentNowPK'",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        title: "Don't see the install banner?",
        body: "It's normal — Chrome decides when to show it based on how much you've used the site. You can install manually: tap the three-dot menu (top-right of Chrome) → 'Install app' or 'Add to Home screen'. Same result.",
      },

      {
        type: "h2",
        id: "iphone-install",
        text: "On iPhone / iPad (Safari)",
      },
      {
        type: "p",
        text: "Apple doesn't show an install banner like Android does. You have to do it yourself — but it's quick:",
      },
      {
        type: "ol",
        items: [
          "Open www.rentnowpk.com in Safari (not Chrome on iPhone — must be Safari)",
          "Tap the Share button at the bottom of Safari (square with an arrow pointing up)",
          "Scroll down the share menu and tap 'Add to Home Screen'",
          "Tap 'Add' in the top-right corner",
          "Done — the icon appears on your home screen",
        ],
      },

      {
        type: "h2",
        id: "desktop-install",
        text: "On a laptop or desktop",
      },
      {
        type: "ol",
        items: [
          "Open www.rentnowpk.com in Chrome, Edge, or Brave",
          "Look for the small install icon in the address bar — it looks like a computer screen with a down arrow",
          "Click it and confirm — RentNowPK appears in your dock or Start menu like any other app",
          "Mac Safari users: Develop menu → Add to Dock works similarly",
        ],
      },

      {
        type: "h2",
        id: "why-install",
        text: "Why bother installing?",
      },
      {
        type: "checklist",
        items: [
          { title: "Faster to open", detail: "One tap from the home screen — no Chrome, no address bar, straight into the app." },
          { title: "Lead alerts on iPhone", detail: "On iOS, push notifications only work for installed apps. If you want lead alerts on iPhone, install is required." },
          { title: "Looks like a real app", detail: "Full-screen mode, brand colour status bar, no browser chrome. Vendors who install treat it like any other phone app." },
          { title: "Works briefly when offline", detail: "If you lose signal, recent pages still load. You can browse leads from yesterday without internet." },
        ],
      },

      {
        type: "h2",
        id: "uninstall",
        text: "If you want to remove it later",
      },
      {
        type: "p",
        text: "It's just an icon — uninstall the same way you would any phone app. Long-press the icon and tap 'Remove' (Android) or 'Delete app' (iPhone). Your data stays safe; you can always reinstall by visiting the site again.",
      },
    ],
  },
];
