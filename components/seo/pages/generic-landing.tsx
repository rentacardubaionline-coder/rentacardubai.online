import Link from "next/link";
import { ArrowRight, Car, MessageCircle, Shield } from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import { VehicleGrid } from "./vehicle-grid";
import type { ResolvedPage } from "@/lib/seo/seo-resolver";
import type { FaqItem } from "@/lib/seo/routes-config";

interface GenericLandingProps {
  h1: string;
  resolved: ResolvedPage;
  listings: any[];
  faqs: FaqItem[];
}

/** Handles: city+town, city+model, routes, filters, keyword+model */
export function GenericLanding({ h1, resolved, listings, faqs }: GenericLandingProps) {
  const searchHref = resolved.city
    ? `/search?city=${resolved.city.name}`
    : "/search";

  // Build a contextual description
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
    <div className="space-y-12 lg:space-y-16">
      {/* Hero */}
      <section className="max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
          {h1}
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">{desc}</p>
        <div className="mt-6">
          <Link
            href={searchHref}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Car className="h-4 w-4" />
            Browse Available Cars
          </Link>
        </div>
      </section>

      {/* Route info card */}
      {resolved.route && (
        <section className="rounded-2xl border border-surface-muted bg-white p-6 shadow-card">
          <h2 className="font-bold text-ink-900 mb-3">Route Details</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-ink-500">From</span>
              <p className="font-semibold text-ink-900">{resolved.route.originCity.name}</p>
            </div>
            <div>
              <span className="text-ink-500">To</span>
              <p className="font-semibold text-ink-900">{resolved.route.destinationCity.name}</p>
            </div>
            <div>
              <span className="text-ink-500">Service</span>
              <p className="font-semibold text-ink-900">With professional driver</p>
            </div>
          </div>
        </section>
      )}

      {/* Vehicle grid */}
      {listings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink-900">Available Vehicles</h2>
            <Link
              href={searchHref}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <VehicleGrid listings={listings} />
        </section>
      )}

      {/* How it works */}
      <section className="rounded-2xl bg-brand-50/50 border border-brand-100 p-6 lg:p-10">
        <h2 className="text-xl font-bold text-ink-900 mb-6 text-center">
          How Booking Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Car, step: "1", title: "Choose Your Car", desc: "Browse real listings with verified prices. Filter by location, model, or budget." },
            { icon: MessageCircle, step: "2", title: "Connect via WhatsApp", desc: "Tap WhatsApp to message the vendor directly. Confirm dates, pricing, and pickup." },
            { icon: Shield, step: "3", title: "Book & Go", desc: "Pay a small advance to confirm. The rest is paid at pickup. No hidden charges." },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-600 mb-1">Step {item.step}</p>
                <h3 className="font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-6">
            Frequently Asked Questions
          </h2>
          <FaqAccordion faqs={faqs} />
        </section>
      )}

      {/* CTA */}
      <section className="rounded-2xl bg-brand-600 p-8 text-center text-white">
        <h2 className="text-2xl font-bold">Ready to Book?</h2>
        <p className="mt-2 text-brand-100">
          Compare prices from verified vendors and reserve your car in minutes.
        </p>
        <Link
          href={searchHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
        >
          View Available Cars <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
