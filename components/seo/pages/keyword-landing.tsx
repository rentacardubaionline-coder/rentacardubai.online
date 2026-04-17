import Link from "next/link";
import { MapPin, Shield, Clock, MessageCircle, ChevronRight, Star, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FaqAccordion } from "./faq-accordion";
import { VehicleGrid } from "./vehicle-grid";
import type { FaqItem } from "@/lib/seo/routes-config";

interface KeywordLandingProps {
  h1: string;
  keyword: { slug: string; label: string };
  cities: { id: string; name: string; slug: string }[];
  listings: any[];
  faqs: FaqItem[];
}

export function KeywordLanding({ h1, keyword, cities, listings, faqs }: KeywordLandingProps) {
  // Show top 12 cities that are most popular
  const topCities = cities.slice(0, 24);

  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Hero section */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
          {h1}
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">
          Compare verified rental vendors across Pakistan. Browse vehicles, check real prices,
          and book with a small advance. Trusted by thousands of travellers for city drives,
          outstation trips, and airport transfers.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Car className="h-4 w-4" />
            Browse All Cars
          </Link>
        </div>
      </section>

      {/* City grid */}
      {topCities.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-1">
            {keyword.label} by City
          </h2>
          <p className="text-sm text-ink-500 mb-6">
            Choose your city to see available vehicles and local vendors.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {topCities.map((city) => (
              <Link
                key={city.id}
                href={`/${keyword.slug}/${city.slug}`}
                className="group flex items-center gap-2 rounded-xl border border-surface-muted bg-white px-4 py-3 text-sm font-medium text-ink-700 transition-all hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
              >
                <MapPin className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                <span className="truncate">{city.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Available vehicles */}
      {listings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-1">
            Featured Vehicles
          </h2>
          <p className="text-sm text-ink-500 mb-6">
            Real listings from verified vendors — book any of these today.
          </p>
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
            { icon: Car, step: "1", title: "Choose Your Car", desc: "Browse vehicles by city, model, or budget. Every listing shows real photos and verified prices." },
            { icon: MessageCircle, step: "2", title: "Connect via WhatsApp", desc: "Tap WhatsApp to message the vendor directly. Share your dates and confirm availability in minutes." },
            { icon: Shield, step: "3", title: "Book & Go", desc: "Pay a small advance to lock your booking. The rest is paid at pickup. No hidden charges." },
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

      {/* Trust section */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: "Verified Vendors", desc: "Every vendor is identity-verified. Your safety and trust come first." },
          { icon: Star, title: "Real Reviews", desc: "Read honest reviews from real customers before you book." },
          { icon: Clock, title: "Instant Confirmation", desc: "Connect directly with vendors via WhatsApp. No waiting, no middlemen." },
        ].map((item) => (
          <Card key={item.title} className="shadow-card">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-ink-900">{item.title}</h3>
              <p className="text-sm text-ink-600">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
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
    </div>
  );
}
