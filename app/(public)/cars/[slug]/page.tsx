import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingDetail } from "@/components/listing/listing-detail";
import { FeaturedCarsRow, FeaturedCarsSkeleton } from "@/components/home/featured-cars-row";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("title, city")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Car not found – RentNowPk" };

  return {
    title: `${data.title} in ${data.city} – RentNowPk`,
    description: `Rent ${data.title} in ${data.city}. Book directly with the vendor via WhatsApp or call.`,
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

  return (
    <>
      <ListingDetail listing={data as any} />
      
      <div className="border-t border-surface-muted bg-white">
        <Suspense fallback={<FeaturedCarsSkeleton />}>
          <FeaturedCarsRow />
        </Suspense>
      </div>
    </>
  );
}
