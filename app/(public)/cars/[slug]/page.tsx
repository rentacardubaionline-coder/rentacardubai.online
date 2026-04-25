import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ListingDetail } from "@/components/listing/listing-detail";
import { FeaturedCarsRow, FeaturedCarsSkeleton } from "@/components/home/featured-cars-row";
import { JsonLd } from "@/components/seo/json-ld";
import { generateProductSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title, city, description, primary_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Car not found – RentNowPk" };

  const title = `${data.title} for Rent in ${data.city} | Book Now`;
  const description = `Rent ${data.title} in ${data.city} from a verified vendor. Compare prices, view real photos, and book instantly via WhatsApp. No hidden charges.`;
  const canonical = `https://www.rentnowpk.com/cars/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      // og:image is auto-emitted from app/(public)/cars/[slug]/opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      // twitter:image falls back to og:image when not overridden
    },
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      slug,
      title,
      description,
      year,
      city,
      transmission,
      fuel,
      seats,
      color,
      mileage_km,
      primary_image_url,
      created_at,
      business:business_id (
        id,
        name,
        slug,
        phone,
        whatsapp_phone,
        address_line,
        city,
        cover_url,
        rating,
        reviews_count,
        claim_status
      ),
      images:listing_images (
        id,
        url,
        sort_order,
        is_primary
      ),
      pricing:listing_pricing (
        tier,
        price_pkr,
        included_km_per_day,
        extra_km_rate_pkr,
        min_hours
      ),
      policies:listing_policies (
        deposit_pkr,
        min_age,
        license_required,
        cancellation_text,
        delivery_available,
        delivery_fee_pkr
      ),
      mode:listing_modes (
        mode,
        surcharge_pkr
      ),
      features:listing_features (
        feature:feature_id (
          id,
          name,
          slug,
          group
        )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  // Fetch custom policies separately — tolerate missing table (pre-migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let customPolicies: { title: string; content: string }[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: polRows } = await (supabase as any)
      .from("listing_custom_policies")
      .select("title, content")
      .eq("listing_id", (data as any).id)
      .order("sort_order");
    customPolicies = polRows ?? [];
  } catch {
    customPolicies = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any).custom_policies = customPolicies;

  // Extract pricing for schema
  const dailyPrice = ((data as any).pricing ?? []).find((p: any) => p.tier === "daily")?.price_pkr;
  const businessName = (data as any).business?.name;

  const productSchema = generateProductSchema({
    title: data.title,
    description: data.description,
    city: data.city,
    slug: data.slug,
    primaryImageUrl: data.primary_image_url,
    dailyPrice,
    businessName,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: "/" },
    { name: "Cars", href: "/search" },
    { name: data.city, href: `/search?city=${data.city}` },
    { name: data.title, href: `/cars/${data.slug}` },
  ]);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ListingDetail listing={data as any} />

      <div className="border-t border-surface-muted bg-white">
        <Suspense fallback={<FeaturedCarsSkeleton />}>
          <FeaturedCarsRow />
        </Suspense>
      </div>
    </>
  );
}
