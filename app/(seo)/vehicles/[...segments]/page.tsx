import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveVehiclesSegments } from "@/lib/seo/seo-resolver";
import { generateSeoMetadata, generateH1, generateFaqs, generateBreadcrumbs } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateFaqSchema, generateItemListSchema } from "@/lib/seo/structured-data";
import { getAllApprovedListings, getCities, getAllLivePublishedBusinesses } from "@/lib/seo/data";
import {
  getCitiesWithListings,
  getCityCategoriesWithListings,
  getCityTownsWithListings,
} from "@/lib/seo/coverage";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { GenericLanding } from "@/components/seo/pages/generic-landing";

export const revalidate = 3600;

type Props = {
  params: Promise<{ segments: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params;
  const resolved = await resolveVehiclesSegments(segments);
  if (resolved.type === "not_found") return {};
  return generateSeoMetadata(resolved);
}

export default async function VehiclesPage({ params }: Props) {
  const { segments } = await params;
  const resolved = await resolveVehiclesSegments(segments);

  if (resolved.type === "not_found") {
    notFound();
  }

  // Existence gate
  if (resolved.type === "vehicle_category" && resolved.category) {
    const cityCats = await getCityCategoriesWithListings();
    let any = false;
    for (const set of cityCats.values()) {
      if (set.has(resolved.category.slug)) { any = true; break; }
    }
    if (!any) notFound();
  }
  if (resolved.type === "vehicle_model_city" && resolved.city) {
    const cities = await getCitiesWithListings();
    if (!cities.has(resolved.city.slug)) notFound();
  }
  if (resolved.type === "vehicle_model_city_town" && resolved.city && resolved.town) {
    const cityTowns = await getCityTownsWithListings();
    const towns = cityTowns.get(resolved.city.slug);
    if (!towns?.has(resolved.town.slug)) notFound();
  }

  const h1 = generateH1(resolved);
  const faqs = generateFaqs(resolved);
  const breadcrumbItems = generateBreadcrumbs(resolved);

  const [listings, cities] = await Promise.all([
    getAllApprovedListings(100),
    getCities(),
  ]);

  // Pass full country-wide set; client filters by active city.
  const allBusinesses = await getAllLivePublishedBusinesses(500);

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);
  const faqSchema = generateFaqSchema(faqs);
  const itemListSchema = listings.length > 0
    ? generateItemListSchema(
        listings.map((l: any) => ({
          title: l.title, slug: l.slug,
          imageUrl: l.primary_image_url, businessName: l.business?.name,
        })),
        { name: h1, description: `Browse vehicles: ${h1}` },
      )
    : null;

  return (
    <div className="min-h-screen">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={itemListSchema} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 lg:py-10">
        <Breadcrumbs items={breadcrumbItems} />
        <GenericLanding
          h1={h1}
          resolved={resolved}
          allCities={cities}
          listings={listings}
          faqs={faqs}
          allBusinesses={allBusinesses}
        />
      </div>
    </div>
  );
}
