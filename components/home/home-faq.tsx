import { JsonLd } from "@/components/seo/json-ld";
import { generateFaqSchema } from "@/lib/seo/structured-data";
import { FaqAccordion } from "@/components/seo/pages/faq-accordion";

/**
 * Home-page Frequently Asked Questions — uses the same FaqAccordion as the
 * SEO landing pages so the look is consistent. Includes a FAQPage JSON-LD
 * schema for rich-result eligibility.
 */
const HOME_FAQS: { q: string; a: string }[] = [
  {
    q: "How does car rental on DubaiRentACar work in Dubai?",
    a: "Browse the AED-priced cars on the homepage or search by Dubai area (Marina, Downtown, Business Bay…), tap the green WhatsApp button on the listing you like, share your pickup and return dates with the dealer, and pay a small advance to confirm. Most bookings are confirmed in under five minutes — no app and no sign-up.",
  },
  {
    q: "Are the dealers on DubaiRentACar verified UAE businesses?",
    a: "Yes — every dealer submits a valid UAE trade licence and the owner's Emirates ID before going live. We don't list anonymous individuals or unregistered cars. The verified-dealer badge on each listing card is the platform's confirmation.",
  },
  {
    q: "What documents do I need to rent a car in Dubai?",
    a: "UAE residents need a valid UAE driving licence and Emirates ID. Tourists need their passport, UAE entry stamp or visit visa, an International Driving Permit (IDP) issued before they travel, and their original home-country licence. GCC residents can use their home-country licence directly.",
  },
  {
    q: "How much does it cost to rent a car in Dubai?",
    a: "Economy hatchbacks (Toyota Yaris, Nissan Sunny, Kia Rio) start from around AED 80–110/day. Sedans (Corolla, Camry, Accord) AED 130–200/day. SUVs (Patrol, Land Cruiser, Pajero) AED 200–400/day. Luxury and supercars (Mercedes G-Wagon, Lamborghini, Ferrari) start at AED 600/day. Weekly rentals are typically 25–35% cheaper per day, monthly rentals 35–45% cheaper.",
  },
  {
    q: "Is Salik (toll) included in the rental price?",
    a: "No — Salik is billed on top at AED 4 per gate crossing, settled at the end of the rental. Dubai has 8+ active Salik gates including Sheikh Zayed Road, Al Maktoum Bridge and Al Garhoud Bridge. A few monthly packages bundle unlimited Salik — confirm with the dealer on WhatsApp before booking.",
  },
  {
    q: "Can the dealer deliver the car to my hotel or apartment?",
    a: "Yes — most Dubai dealers offer free delivery anywhere in Dubai (Marina, Downtown, Palm Jumeirah, JBR, Deira, Al Barsha…) for rentals of 3+ days. Shorter rentals usually have a flat AED 50–150 delivery fee. Airport pickup at DXB or DWC can also be arranged on WhatsApp.",
  },
  {
    q: "What insurance is included on every rental?",
    a: "Standard comprehensive insurance is included on every car: third-party liability, collision damage and theft cover, valid across all seven emirates. A refundable security deposit (AED 1,000–5,000 depending on the car) is held on a credit card during the rental and released when the car is returned undamaged.",
  },
  {
    q: "Can I drive my Dubai rental to Abu Dhabi, Sharjah or Hatta?",
    a: "Yes — every car on DubaiRentACar comes with cross-emirate insurance, so trips to Abu Dhabi, Sharjah, Ajman, RAK, Fujairah or Hatta are all covered. Salik tolls (AED 4/gate) and Abu Dhabi Darb tolls (where applicable) are billed on top. Some dealers restrict travel to certain off-road or border areas — check the listing's policy.",
  },
  {
    q: "Can I rent a car with a driver in Dubai?",
    a: "Yes — many dealers offer professional UAE drivers who know Dubai's roads, parking zones (RTA paid parking, mall valet) and Salik gates. With-driver is popular for tourists, weddings, and hourly chauffeur use. Self-drive is the default option on most listings; toggle the listing filter to see with-driver only.",
  },
  {
    q: "What's the minimum rental period?",
    a: "Most cars on DubaiRentACar accept 1-day rentals. Some luxury and supercar listings require a 2- or 3-day minimum. The minimum is shown on each listing detail page; weekly and monthly rentals unlock the best per-day prices.",
  },
];

export function HomeFaq() {
  return (
    <section className="mx-auto max-w-3xl px-4 md:px-6 py-12 md:py-16">
      <JsonLd data={generateFaqSchema(HOME_FAQS)} />
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Everything renters ask before booking a car in Dubai.
        </p>
      </div>
      <FaqAccordion faqs={HOME_FAQS} />
    </section>
  );
}
