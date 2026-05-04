import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  Car,
  MessageCircle,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Users,
  Star,
  BadgeCheck,
  Route,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import { FilteredListings } from "./filtered-listings";
import type { FaqItem } from "@/lib/seo/routes-config";
import {
  BRANDED_IMAGES,
  CITY_CONTENT,
  RENTER_DOCUMENTS,
} from "@/lib/seo/content-data";
import { BrandedBanner } from "@/components/seo/content/branded-banner";
import {
  ContentSectionHeading,
  ProseBlock,
  HighlightCallout,
  PriceTable,
  DocumentChecklist,
} from "@/components/seo/content/content-blocks";

interface CityLandingProps {
  h1: string;
  keyword: { slug: string; label: string };
  city: { id: string; name: string; slug: string };
  allCities: { id: string; name: string; slug: string }[];
  listings: any[];
  towns: { id: string; name: string; slug: string }[];
  routes: {
    id: string;
    slug: string;
    destination_city: { name: string; slug: string };
  }[];
  faqs: FaqItem[];
  allBusinesses?: any[];
}

export function CityLanding({
  h1,
  keyword,
  city,
  allCities,
  listings,
  towns,
  routes,
  faqs,
  allBusinesses,
}: CityLandingProps) {
  const totalListings = listings.length;

  // Per-city content overrides — major cities get bespoke copy + price tables;
  // every other city falls back to a templated default below.
  const cityKey = city.slug.toLowerCase();
  const cityOverride = CITY_CONTENT[cityKey];
  const cityIntro =
    cityOverride?.intro ??
    `${city.name} has a healthy car-rental market with verified local vendors. Whether you need a budget hatchback for a few days or a chauffeur-driven SUV for an event, you'll find it here at transparent prices — no haggling, no hidden charges.`;
  const cityHighlight = cityOverride?.highlight;
  const priceRows = cityOverride?.prices ?? [
    {
      label: "Economy hatchback",
      examples: "Nissan Sunny, Toyota Yaris, Kia Rio",
      priceAed: 90,
    },
    {
      label: "Sedan",
      examples: "Toyota Corolla, Honda Civic, Camry",
      priceAed: 120,
    },
    {
      label: "SUV / 4x4",
      examples: "Nissan Patrol, Land Cruiser, Tucson",
      priceAed: 250,
    },
    {
      label: "Luxury / Premium",
      examples: "Mercedes-Benz, BMW, Lexus",
      priceAed: 400,
    },
  ];

  const bannerImage = cityOverride?.imageUrl ?? BRANDED_IMAGES.cityDefault;

  return (
    <div className="space-y-12">
      {/* ── Compact Header (heading + subheading only — listings + filters follow) */}
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">{h1}</h1>
        <p className="mt-1 text-sm text-ink-500 max-w-2xl">
          {totalListings > 0
            ? `${totalListings}+ verified vehicles`
            : "Verified vehicles"}{" "}
          available in {city.name}. Compare real prices from local vendors —
          self-drive and with-driver. Book via WhatsApp with easy booking.
        </p>
      </header>

      {/* ── Listings with Filters ───────────────────────────────────────────── */}
      <FilteredListings
        listings={listings}
        cities={allCities}
        defaultCity={city.name}
        allBusinesses={allBusinesses}
      />

      {/* ── Branded city banner — opens the long-form content below the grid */}
      <BrandedBanner
        imageUrl={bannerImage}
        eyebrow="City Guide"
        title={`Renting a car in ${city.name}`}
        subtitle={`Everything you need to know — vendors, prices, documents, and the best ways to book.`}
      />

      {/* ── Why rent here — bespoke per-city intro */}
      <section className="space-y-4">
        <ContentSectionHeading
          eyebrow={`About ${city.name}`}
          title={`Why rent in ${city.name}`}
        />
        <ProseBlock>
          <p>{cityIntro}</p>
        </ProseBlock>
        {cityHighlight && (
          <HighlightCallout
            title={`Local tip for ${city.name}`}
            body={cityHighlight}
          />
        )}
      </section>

      {/* ── Typical prices table — pulled from per-city override or default */}
      <section className="space-y-4">
        <ContentSectionHeading
          eyebrow="What it costs"
          title={`Typical car rental prices in ${city.name}`}
          subtitle={`These are the rates we see most often from verified ${city.name} vendors. Promotions, long-trip discounts, and event peaks can shift the actual quote.`}
        />
        <PriceTable cityName={city.name} rows={priceRows} />
      </section>

      {/* ── Documents you'll need — universal but framed for this city */}
      <section className="space-y-4">
        <ContentSectionHeading
          eyebrow="Before pickup"
          title={`What you'll need to rent a car in ${city.name}`}
          subtitle={`${city.name} vendors verify a few standard things before handing over the keys. Have these ready and pickup takes minutes.`}
        />
        <DocumentChecklist items={RENTER_DOCUMENTS} />
      </section>

      {/* ── Trust Strip ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 py-4 border-y border-surface-muted text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Verified {city.name} Vendors
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-green-500" />
          Book via WhatsApp
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-brand-500" />
          No Hidden Charges
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-amber-500" />
          Instant Confirmation
        </span>
      </div>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-50/80 to-brand-100/40 border border-brand-100 p-6 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-ink-900">
            How to Book a Car in {city.name}
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            No sign-up needed. No app download. Just WhatsApp and go.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {[
            {
              icon: Car,
              step: "01",
              title: "Pick Your Car",
              desc: `Browse vehicles available in ${city.name}. Filter by type, price, or driver option. Every listing has real photos and verified prices.`,
              color: "bg-brand-600 text-white",
            },
            {
              icon: MessageCircle,
              step: "02",
              title: "WhatsApp the Vendor",
              desc: `Message ${city.name} vendors directly on WhatsApp. Confirm dates, pickup location, and pricing in minutes.`,
              color: "bg-emerald-600 text-white",
            },
            {
              icon: Zap,
              step: "03",
              title: "Pay Advance & Ride",
              desc: "Lock your booking with a small advance. Pay the rest at pickup. No hidden charges — ever.",
              color: "bg-amber-500 text-white",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl bg-white p-6 shadow-card"
            >
              <span className="absolute top-4 right-5 text-5xl font-black text-surface-muted/80 select-none leading-none">
                {item.step}
              </span>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4 shadow-sm`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Areas & Outstation Routes ──────────────────────────────────────── */}
      {towns.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                {keyword.label} by Area in {city.name}
              </h2>
              <p className="text-xs text-ink-400">
                {towns.length} areas with doorstep pickup
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {towns.map((town) => (
              <Link
                key={town.id}
                href={`/${keyword.slug}/${city.slug}/${town.slug}`}
                className="group flex items-center justify-between rounded-xl border border-surface-muted bg-white px-3.5 py-2.5 transition-all hover:border-brand-300 hover:bg-brand-50/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-3 w-3 text-brand-400 shrink-0" />
                  <span className="text-sm font-medium text-ink-700 truncate group-hover:text-brand-700">
                    {town.name}
                  </span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-ink-200 shrink-0 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink-900">
                Outstation Trips from {city.name}
              </h2>
              <p className="text-xs text-ink-400">
                {routes.length} popular intercity routes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {routes.map((route) => (
              <Link
                key={route.id}
                href={`/${keyword.slug}/${route.slug}`}
                className="group flex items-center gap-2.5 rounded-xl border border-surface-muted bg-white px-3.5 py-3 transition-all hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-800 truncate group-hover:text-emerald-700">
                    {route.destination_city.name}
                  </p>
                  <p className="text-[10px] text-ink-400">from {city.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Vehicle Types in this City ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-ink-900 mb-2">
          Vehicle Types in {city.name}
        </h2>
        <p className="text-sm text-ink-500 mb-5">
          From budget hatchbacks to luxury SUVs — find the right ride in{" "}
          {city.name}.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              icon: Car,
              label: "Economy Cars",
              sub: "Nissan Sunny, Toyota Yaris",
              price: "AED 90+/day",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: Car,
              label: "Sedans",
              sub: "Toyota Corolla, Honda Civic, Camry",
              price: "AED 120+/day",
              color: "bg-brand-50 text-brand-600",
            },
            {
              icon: Car,
              label: "SUVs & 4x4",
              sub: "Nissan Patrol, Land Cruiser, Tucson",
              price: "AED 250+/day",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Users,
              label: "Luxury & Vans",
              sub: "Mercedes, BMW, Hiace",
              price: "AED 350+/day",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={`/search?city=${city.name}`}
              className="group rounded-2xl border border-surface-muted bg-white p-4 transition-all hover:border-brand-200 hover:shadow-card"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color} mb-3`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                {item.label}
              </h3>
              <p className="text-[11px] text-ink-400 mt-0.5">{item.sub}</p>
              <p className="text-xs font-semibold text-brand-600 mt-2">
                {item.price}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why DubaiRentACar in {city} ────────────────────────────────────────── */}
      <section className="rounded-3xl overflow-hidden bg-ink-900 p-8 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Why {keyword.label} with DubaiRentACar in {city.name}
          </h2>
          <p className="mt-2 text-sm text-white/50 max-w-lg mx-auto">
            Compare multiple local vendors in {city.name} instead of settling
            for one quote.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BadgeCheck,
              title: `Verified ${city.name} Vendors`,
              desc: `Every vendor in ${city.name} submits Emirates ID and business docs. We verify before they go live.`,

              accent: "from-emerald-500/20 to-emerald-500/5",
              iconBg: "bg-emerald-500/20 text-emerald-400",
            },
            {
              icon: Star,
              title: "Real Customer Reviews",
              desc: `Read ratings from customers who rented in ${city.name}. Know what you're getting.`,
              accent: "from-amber-500/20 to-amber-500/5",
              iconBg: "bg-amber-500/20 text-amber-400",
            },
            {
              icon: Users,
              title: "Compare Local Vendors",
              desc: `See prices from multiple ${city.name} vendors side by side. Pick the best deal.`,
              accent: "from-brand-500/20 to-brand-500/5",
              iconBg: "bg-brand-500/20 text-brand-400",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp Booking",
              desc: `Message ${city.name} vendors on WhatsApp. No forms, no apps. Confirm in minutes.`,
              accent: "from-green-500/20 to-green-500/5",
              iconBg: "bg-green-500/20 text-green-400",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl bg-gradient-to-b ${item.accent} border border-white/5 p-5`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg} mb-4`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-5">
            {keyword.label} in {city.name} — FAQs
          </h2>
          <FaqAccordion faqs={faqs} />
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-8 md:p-10 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Book in {city.name}?</h2>
        <p className="mt-2 text-brand-100 max-w-md mx-auto">
          Compare prices from verified local vendors and reserve your car in
          minutes via WhatsApp.
        </p>
        <Link
          href={`/search?city=${city.name}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg hover:bg-brand-50 transition-colors"
        >
          View Cars in {city.name} <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── SEO Footer ─────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-muted pt-8 space-y-4 text-xs text-ink-400 leading-relaxed">
        <h2 className="text-sm font-semibold text-ink-600">
          {keyword.label} in {city.name} — Compare & Book
        </h2>
        <p>
          Looking for {keyword.label.toLowerCase()} in {city.name}? DubaiRentACar
          connects you with verified local rental vendors offering self-drive
          and with-driver options. Browse real vehicle photos, compare
          transparent prices, and book directly via WhatsApp — no hidden
          charges, no middlemen.
        </p>

        <p>
          Popular vehicles in {city.name} include economy cars (Nissan Sunny,
          Toyota Yaris), sedans (Toyota Corolla, Honda Civic, Camry), and SUVs
          (Nissan Patrol, Land Cruiser). For luxury travel, Mercedes-Benz and
          BMW are available with professional drivers.
          {routes.length > 0 &&
            ` Outstation trips from ${city.name} are also popular — book
          a car with driver for intercity travel to nearby cities.`}
        </p>
        {towns.length > 0 && (
          <p>
            We cover {towns.length}+ areas in {city.name} including{" "}
            {towns
              .slice(0, 8)
              .map((t) => t.name)
              .join(", ")}
            {towns.length > 8 ? `, and ${towns.length - 8} more` : ""}. Doorstep
            pickup is available from most vendors.
          </p>
        )}
      </section>
    </div>
  );
}
