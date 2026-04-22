import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getRouteBySlug, getAllApprovedListings, getRoutesByOriginCity, getCities, getAllLivePublishedBusinesses } from "@/lib/seo/data";
import { generateBreadcrumbSchema, generateFaqSchema } from "@/lib/seo/structured-data";
import { FAQS } from "@/lib/seo/routes-config";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FaqAccordion } from "@/components/seo/pages/faq-accordion";
import { FilteredListings } from "@/components/seo/pages/filtered-listings";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return {};

  const title = `${route.origin_city.name} to ${route.destination_city.name} Car Rental | Book Now`;
  const description = `Book a reliable vehicle from ${route.origin_city.name} to ${route.destination_city.name}. Professional drivers, transparent pricing, and instant confirmation via WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.rentnowpk.com/routes/${slug}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function RoutePage({ params }: Props) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const origin = route.origin_city.name;
  const dest = route.destination_city.name;

  const [listings, relatedRoutes, cities, allBusinesses] = await Promise.all([
    getAllApprovedListings(100),
    getRoutesByOriginCity(route.origin_city.slug),
    getCities(),
    // Full country-wide set; client filters by the active city filter
    getAllLivePublishedBusinesses(500),
  ]);

  const vars = { from_city: origin, to_city: dest, keyword: "Rent a Car", keyword_lower: "rent a car" };
  const faqs = (FAQS.route ?? []).map((f) => ({
    q: f.q.replaceAll("{from_city}", origin).replaceAll("{to_city}", dest),
    a: f.a.replaceAll("{from_city}", origin).replaceAll("{to_city}", dest),
  }));

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Routes", href: "/routes" },
    { name: `${origin} to ${dest}`, href: `/routes/${slug}` },
  ];

  return (
    <div className="min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={generateFaqSchema(faqs)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10 space-y-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <header>
          <h1 className="text-xl md:text-2xl font-bold text-ink-900">
            {origin} to {dest} Car Rental
          </h1>
          <p className="mt-1 text-sm text-ink-500 max-w-2xl">
            Book a reliable vehicle with a professional driver for the {origin} to {dest} route.
            Compare vendors, check availability, and reserve via WhatsApp.
          </p>
        </header>

        {/* Route details card
        <section className="rounded-2xl border border-surface-muted bg-white p-6 shadow-card">
          <h2 className="font-bold text-ink-900 mb-4">Route Details</h2>
          <div className="grid sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              <div>
                <span className="text-ink-500 block text-xs">From</span>
                <span className="font-semibold text-ink-900">{origin}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="text-ink-500 block text-xs">To</span>
                <span className="font-semibold text-ink-900">{dest}</span>
              </div>
            </div>
            {route.distance_km && (
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-ink-400" />
                <div>
                  <span className="text-ink-500 block text-xs">Distance</span>
                  <span className="font-semibold text-ink-900">{route.distance_km} km</span>
                </div>
              </div>
            )}
            {route.estimated_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-ink-400" />
                <div>
                  <span className="text-ink-500 block text-xs">Est. Time</span>
                  <span className="font-semibold text-ink-900">{route.estimated_time}</span>
                </div>
              </div>
            )}
          </div>
        </section> */}

        {/* Vehicles with Filters */}
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-5">Available Vehicles</h2>
          <FilteredListings
            listings={listings}
            cities={cities}
            defaultCity={origin}
            allBusinesses={allBusinesses}
          />
        </section>

        {/* Related routes */}
        {relatedRoutes.length > 1 && (
          <section>
            <h2 className="text-xl font-bold text-ink-900 mb-4">
              Other Routes from {origin}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedRoutes
                .filter((r) => r.slug !== slug)
                .map((r) => (
                  <Link
                    key={r.id}
                    href={`/routes/${r.slug}`}
                    className="rounded-lg border border-surface-muted bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
                  >
                    {origin} → {r.destination_city.name}
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-ink-900 mb-6">Frequently Asked Questions</h2>
            <FaqAccordion faqs={faqs} />
          </section>
        )}
      </div>
    </div>
  );
}
