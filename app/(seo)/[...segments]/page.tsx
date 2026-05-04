import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { resolveKeywordSegments, isKeyword, isReservedSegment } from "@/lib/seo/seo-resolver";
import { generateSeoMetadata, generateH1, generateFaqs, generateBreadcrumbs } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateFaqSchema, generateItemListSchema } from "@/lib/seo/structured-data";
import { getAllApprovedListings, getCities, getTownsByCity, getRoutesByOriginCity, getAllLivePublishedBusinesses } from "@/lib/seo/data";
import {
  getCitiesWithListings,
  getCityTownsWithListings,
  getRoutesWithListings,
  findListingForCombo,
} from "@/lib/seo/coverage";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { KeywordLanding } from "@/components/seo/pages/keyword-landing";
import { CityLanding } from "@/components/seo/pages/city-landing";
import { GenericLanding } from "@/components/seo/pages/generic-landing";

export const revalidate = 3600; // ISR: 1 hour

type Props = {
  params: Promise<{ segments: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;
  if (!segments.length || isReservedSegment(segments[0])) return {};

  const resolved = await resolveKeywordSegments(segments);
  if (resolved.type === "not_found") return {};

  return generateSeoMetadata(resolved);
}

export default async function SeoPage({ params }: Props) {
  const { segments } = await params;

  // Skip reserved segments — they're handled by other routes
  if (!segments.length || isReservedSegment(segments[0])) {
    notFound();
  }

  // Only handle keyword-based routes (DB-backed async check)
  if (!(await isKeyword(segments[0]))) {
    notFound();
  }

  // Depth-5: /{keyword}/{city}/{town}/{category}/{listing-slug}
  // → 301 redirect to the canonical /cars/{listingSlug} (Milestone 3).
  if (segments.length === 5) {
    const [, citySlug, townSlug, categorySlug, listingSlug] = segments;
    const found = await findListingForCombo({
      citySlug, townSlug, categorySlug, listingSlug,
    });
    if (!found) notFound();
    redirect(`/cars/${found.slug}`);
  }

  const resolved = await resolveKeywordSegments(segments);
  if (resolved.type === "not_found") {
    notFound();
  }

  // Existence gate — never render an SEO landing page that has zero approved
  // listings serving it. The sitemap also refuses to emit such URLs.
  const [citiesWithListings, cityTownsWithListings] = await Promise.all([
    getCitiesWithListings(),
    getCityTownsWithListings(),
  ]);
  if (resolved.type === "keyword_city" && resolved.city) {
    if (!citiesWithListings.has(resolved.city.slug)) notFound();
  }
  if (resolved.type === "keyword_city_town" && resolved.city && resolved.town) {
    const towns = cityTownsWithListings.get(resolved.city.slug);
    if (!towns?.has(resolved.town.slug)) notFound();
  }
  if (resolved.type === "keyword_route" && resolved.route) {
    const routes = await getRoutesWithListings();
    if (!routes.has(resolved.route.slug)) notFound();
  }

  const h1 = generateH1(resolved);
  const faqs = generateFaqs(resolved);
  const breadcrumbItems = generateBreadcrumbs(resolved);
  const faqSchema = generateFaqSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  // Fetch ALL approved listings so filters can work across cities
  let listings: any[] = await getAllApprovedListings(100);

  // ItemList schema for vehicle grids
  const itemListSchema = listings.length > 0
    ? generateItemListSchema(
        listings.map((l: any) => ({
          title: l.title,
          slug: l.slug,
          imageUrl: l.primary_image_url,
          businessName: l.business?.name,
        })),
        { name: h1, description: `Browse available cars for ${h1.toLowerCase()}` },
      )
    : null;

  // Always fetch all cities (needed for filter dropdown on every page type)
  const cities = await getCities();

  let towns: any[] = [];
  let routesFromCity: any[] = [];

  if (resolved.type === "keyword_city" && resolved.city) {
    [towns, routesFromCity] = await Promise.all([
      getTownsByCity(resolved.city.id),
      getRoutesByOriginCity(resolved.city.slug),
    ]);
  }

  // Fallback: when filters return 0 cars, offer direct-contact businesses
  // for the current city (or origin city for route pages)
  // Pass full country-wide business set; the client `FilteredListings`
  // filters by the currently-selected city on every filter change.
  const allBusinesses = await getAllLivePublishedBusinesses(500);

  return (
    <div className="min-h-screen">
      {/* Structured data */}
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Keyword-only pages: show city grid */}
        {resolved.type === "keyword_only" && (
          <KeywordLanding
            h1={h1}
            keyword={resolved.keyword!}
            cities={cities}
            listings={listings}
            faqs={faqs}
          />
        )}

        {/* City pages: show listings + towns + routes */}
        {resolved.type === "keyword_city" && (
          <CityLanding
            h1={h1}
            keyword={resolved.keyword!}
            city={resolved.city!}
            allCities={cities}
            listings={listings}
            towns={towns}
            routes={routesFromCity}
            faqs={faqs}
            allBusinesses={allBusinesses}
          />
        )}

        {/* All other page types: generic landing */}
        {!["keyword_only", "keyword_city"].includes(resolved.type) && (
          <GenericLanding
            h1={h1}
            resolved={resolved}
            allCities={cities}
            listings={listings}
            faqs={faqs}
            allBusinesses={allBusinesses}
          />
        )}
      </div>
    </div>
  );
}
