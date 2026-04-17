import Link from "next/link";
import { MapPin, ArrowRight, Car, MessageCircle, Shield, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqAccordion } from "./faq-accordion";
import { VehicleGrid } from "./vehicle-grid";
import type { FaqItem } from "@/lib/seo/routes-config";

interface CityLandingProps {
  h1: string;
  keyword: { slug: string; label: string };
  city: { id: string; name: string; slug: string };
  listings: any[];
  towns: { id: string; name: string; slug: string }[];
  routes: { id: string; slug: string; destination_city: { name: string; slug: string } }[];
  faqs: FaqItem[];
}

export function CityLanding({ h1, keyword, city, listings, towns, routes, faqs }: CityLandingProps) {
  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Hero */}
      <section className="max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-900 leading-tight">
          {h1}
        </h1>
        <p className="mt-4 text-lg text-ink-600 leading-relaxed">
          Browse verified car rental vendors in {city.name}. Compare real prices for self-drive
          and with-driver rentals. Book with a small advance — no hidden charges, no middlemen.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/search?city=${city.name}`}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
          >
            <Car className="h-4 w-4" />
            Browse Cars in {city.name}
          </Link>
        </div>
      </section>

      {/* Available vehicles */}
      {listings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-ink-900">
                Available Cars in {city.name}
              </h2>
              <p className="text-sm text-ink-500">
                Real listings from verified local vendors.
              </p>
            </div>
            <Link
              href={`/search?city=${city.name}`}
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
          How to Book in {city.name}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Car, step: "1", title: "Pick a Vehicle", desc: `Browse cars available in ${city.name}. Filter by type, price, or driver option.` },
            { icon: MessageCircle, step: "2", title: "WhatsApp the Vendor", desc: "Message the vendor directly to confirm dates, pricing, and pickup location." },
            { icon: Shield, step: "3", title: "Pay & Ride", desc: "Pay a small advance online. The rest on pickup. Fully transparent — no surprises." },
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

      {/* Towns + Routes side by side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Towns in this city */}
        {towns.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4 text-brand-600" />
                Areas in {city.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {towns.map((town) => (
                  <Link
                    key={town.id}
                    href={`/${keyword.slug}/${city.slug}/${town.slug}`}
                    className="rounded-lg border border-surface-muted bg-surface-muted/30 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
                  >
                    {town.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Routes from this city */}
        {routes.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ArrowRight className="h-4 w-4 text-brand-600" />
                Outstation from {city.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {routes.map((route) => (
                  <Link
                    key={route.id}
                    href={`/${keyword.slug}/${route.slug}`}
                    className="rounded-lg border border-surface-muted bg-surface-muted/30 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
                  >
                    {city.name} → {route.destination_city.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
        <h2 className="text-2xl font-bold">Ready to Book in {city.name}?</h2>
        <p className="mt-2 text-brand-100">
          Compare prices from verified vendors and reserve your car in minutes.
        </p>
        <Link
          href={`/search?city=${city.name}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
        >
          View Available Cars <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
