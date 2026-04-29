import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getCities, getRoutesByOriginCity } from "@/lib/seo/data";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Intercity Car Rental Routes in Pakistan | RentNowPK",
  description:
    "Browse all intercity car rental routes across Pakistan. Book reliable vehicles with professional drivers for Lahore to Islamabad, Karachi to Quetta, and 50+ more routes.",
  alternates: { canonical: "https://www.rentacardubai.online/routes" },
};

export default async function RoutesIndexPage() {
  const cities = await getCities();

  // Fetch routes for major origin cities (cities that have outbound routes)
  const majorCitySlugs = [
    "lahore",
    "karachi",
    "islamabad",
    "rawalpindi",
    "multan",
    "peshawar",
    "quetta",
    "faisalabad",
    "skardu",
    "gilgit",
    "gujranwala",
    "sialkot",
    "bahawalpur",
  ];

  const routeGroups: {
    city: string;
    routes: { slug: string; destination: string }[];
  }[] = [];

  for (const slug of majorCitySlugs) {
    const city = cities.find((c) => c.slug === slug);
    if (!city) continue;
    const routes = await getRoutesByOriginCity(slug);
    if (routes.length > 0) {
      routeGroups.push({
        city: city.name,
        routes: routes.map((r) => ({
          slug: r.slug,
          destination: r.destination_city.name,
        })),
      });
    }
  }

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Routes", href: "/routes" },
  ];

  return (
    <div className="min-h-screen">
      <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        <section className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink-900">
            Intercity Car Rental Routes
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            Book a car with driver for intercity travel across Pakistan.
            Professional drivers, transparent pricing, and instant confirmation
            via WhatsApp.
          </p>
        </section>

        {routeGroups.map((group) => (
          <section key={group.city}>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900 mb-4">
              <MapPin className="h-4 w-4 text-brand-600" />
              From {group.city}
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.routes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/routes/${route.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-surface-muted bg-white px-4 py-2.5 text-sm font-medium text-ink-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-700"
                >
                  {group.city}
                  <ArrowRight className="h-3 w-3 text-ink-400" />
                  {route.destination}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
