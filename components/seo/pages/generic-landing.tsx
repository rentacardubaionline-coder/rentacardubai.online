import Link from "next/link";
import {
  ArrowRight, Car, MessageCircle, Shield, Zap,
  CheckCircle2, Clock, MapPin, Navigation,
} from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import { FilteredListings } from "./filtered-listings";
import type { ResolvedPage } from "@/lib/seo/seo-resolver";
import type { FaqItem } from "@/lib/seo/routes-config";

interface GenericLandingProps {
  h1: string;
  resolved: ResolvedPage;
  allCities: { id: string; name: string; slug: string }[];
  listings: any[];
  faqs: FaqItem[];
  allBusinesses?: any[];
}

/** Handles: city+town, city+model, routes, filters, keyword+model */
export function GenericLanding({ h1, resolved, allCities, listings, faqs, allBusinesses }: GenericLandingProps) {
  const searchHref = resolved.city
    ? `/search?city=${resolved.city.name}`
    : "/search";

  // Default city for filter pre-selection:
  // - city pages: the city itself
  // - route pages: the origin city (e.g. Lahore for "lahore-to-islamabad")
  const defaultCity = resolved.city?.name ?? resolved.route?.originCity.name;

  // Contextual description
  let desc = "Compare verified rental vendors and book with a small advance.";
  if (resolved.city && resolved.model) {
    desc = `Find ${resolved.model.brand.name} ${resolved.model.name} available for rent in ${resolved.city.name}. Compare prices from verified vendors and book instantly.`;
  } else if (resolved.city && resolved.town) {
    desc = `Looking for a rental car near ${resolved.town.name}, ${resolved.city.name}? Browse local vendors, compare prices, and book with a small advance.`;
  } else if (resolved.route) {
    desc = `Book a reliable vehicle for the ${resolved.route.originCity.name} to ${resolved.route.destinationCity.name} route. Professional drivers, transparent pricing, instant confirmation.`;
  } else if (resolved.model) {
    desc = `Rent a ${resolved.model.brand.name} ${resolved.model.name} from verified vendors. Compare prices across Pakistan and book with a small advance.`;
  } else if (resolved.filter) {
    const filterLabel = resolved.filter.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    desc = `Browse ${filterLabel.toLowerCase()} car rental options. Verified vendors, transparent pricing, instant booking.`;
  }

  return (
    <div className="space-y-12">

      {/* ── Compact Header ──────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">{h1}</h1>
        <p className="mt-1 text-sm text-ink-500 max-w-2xl">{desc}</p>
      </header>

      {/* ── Route Info Card ────────────────────────────────────────────────── */}
      {resolved.route && (
        <section className="rounded-2xl border border-surface-muted bg-white p-5 shadow-card">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">From</span>
                <p className="font-semibold text-ink-900">{resolved.route.originCity.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Navigation className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">To</span>
                <p className="font-semibold text-ink-900">{resolved.route.destinationCity.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Car className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400">Service</span>
                <p className="font-semibold text-ink-900">With driver</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Listings with Filters ───────────────────────────────────────────── */}
      <FilteredListings
        listings={listings}
        cities={allCities}
        defaultCity={defaultCity}
        allBusinesses={allBusinesses}
      />

      {/* ── Trust Strip ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 py-4 border-y border-surface-muted text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Verified Vendors Only
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
          <h2 className="text-2xl font-bold text-ink-900">How Booking Works</h2>
          <p className="mt-1 text-sm text-ink-500">No sign-up needed. No app download. Just WhatsApp and go.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {[
            { icon: Car, step: "01", title: "Pick Your Car", desc: "Browse real listings with verified prices. Filter by location, model, or budget.", color: "bg-brand-600 text-white" },
            { icon: MessageCircle, step: "02", title: "WhatsApp the Vendor", desc: "Tap WhatsApp to message the vendor directly. Confirm dates, pricing, and pickup.", color: "bg-emerald-600 text-white" },
            { icon: Zap, step: "03", title: "Pay Advance & Go", desc: "Lock your booking with a small advance. Pay the rest at pickup. No hidden charges.", color: "bg-amber-500 text-white" },
          ].map((item) => (
            <div key={item.step} className="relative rounded-2xl bg-white p-6 shadow-card">
              <span className="absolute top-4 right-5 text-5xl font-black text-surface-muted/80 select-none leading-none">
                {item.step}
              </span>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4 shadow-sm`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-5">Frequently Asked Questions</h2>
          <FaqAccordion faqs={faqs} />
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-8 md:p-10 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Book?</h2>
        <p className="mt-2 text-brand-100 max-w-md mx-auto">
          Compare prices from verified vendors and reserve your car in minutes via WhatsApp.
        </p>
        <Link
          href={searchHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg hover:bg-brand-50 transition-colors"
        >
          View Available Cars <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── SEO Footer ─────────────────────────────────────────────────────── */}
      <section className="border-t border-surface-muted pt-8 space-y-3 text-xs text-ink-400 leading-relaxed">
        <h2 className="text-sm font-semibold text-ink-600">{h1} — Compare & Book</h2>
        <p>{desc} RentNowPK connects you with verified local rental vendors. Browse real vehicle photos, compare transparent prices, and book directly via WhatsApp with a small advance — no hidden charges, no middlemen.</p>
      </section>
    </div>
  );
}
