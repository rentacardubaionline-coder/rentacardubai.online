import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveVehiclesSegments } from "@/lib/seo/seo-resolver";
import { generateSeoMetadata, generateH1, generateFaqs, generateBreadcrumbs } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateFaqSchema, generateItemListSchema } from "@/lib/seo/structured-data";
import { getListingsForModel, getAllApprovedListings } from "@/lib/seo/data";
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

  const h1 = generateH1(resolved);
  const faqs = generateFaqs(resolved);
  const breadcrumbItems = generateBreadcrumbs(resolved);

  let listings: any[] = [];
  if (resolved.model) {
    listings = await getListingsForModel(
      resolved.model.slug,
      resolved.city?.name,
    );
  } else {
    listings = await getAllApprovedListings(12);
  }

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
        <GenericLanding h1={h1} resolved={resolved} listings={listings} faqs={faqs} />
      </div>
    </div>
  );
}
