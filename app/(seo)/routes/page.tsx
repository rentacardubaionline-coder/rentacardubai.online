import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getCities, getRoutesByOriginCity } from "@/lib/seo/data";
import { getRoutesWithListings } from "@/lib/seo/coverage";
import { JsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Intercity & Popular Routes in the UAE | RentNow",
  description:
    "Browse popular Dubai and UAE car rental routes — Dubai Airport to Downtown, Dubai Marina to Palm Jumeirah, and inter-emirate trips. Compare verified dealers and book directly on WhatsApp.",
  alternates: { canonical: "https://www.rentacardubai.online/routes" },
};

export default async function RoutesIndexPage() {
  const [cities, withListings] = await Promise.all([
    getCities(),
    getRoutesWithListings(),
  ]);

  // Group routes by origin city. Only emit cities that are active AND that
  // currently have ≥ 1 route with listings (existence-gated).
  const routeGroups: {
    city: string;
    routes: { slug: string; destination: string }[];
  }[] = [];

  for (const city of cities) {
    const routes = await getRoutesByOriginCity(city.slug);
    const live = routes.filter((r) => withListings.has(r.slug));
    if (live.length === 0) continue;
    routeGroups.push({
      city: city.name,
      routes: live.map((r) => ({
        slug: r.slug,
        destination: r.destination_city.name,
      })),
    });
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
            Popular Car Rental Routes in the UAE
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            Reliable cars with optional drivers for popular Dubai trips and
            inter-emirate travel — Dubai Airport to Downtown, Dubai Marina to
            Palm Jumeirah, Dubai to Hatta, and more. Verified dealers, AED
            pricing, and instant WhatsApp confirmation.
          </p>
        </section>

        {routeGroups.length === 0 && (
          <section className="rounded-2xl border border-surface-muted bg-white p-8 text-center">
            <p className="text-ink-600">
              No live routes yet — check back soon as we add inventory across
              the UAE.
            </p>
          </section>
        )}

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
