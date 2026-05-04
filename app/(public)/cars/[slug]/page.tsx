import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListingDetail } from "@/components/listing/listing-detail";
import {
  FeaturedCarsRow,
  FeaturedCarsSkeleton,
} from "@/components/home/featured-cars-row";
import { SuspenseBoundary } from "@/components/shared/suspense-boundary";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/structured-data";

// Detail page is rendered on every request so DB edits + OCD re-scrapes show
// instantly. The client `ListingRealtimeRefresher` calls router.refresh() on
// realtime change events to make this near-instant for visitors mid-session.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("listings")
    .select("title, city, description, primary_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Car not found — RentNow" };

  const title = `${data.title} for Rent in ${data.city} | Book Now`;
  const description = `Rent ${data.title} in ${data.city} from a verified vendor. Compare prices, view real photos, and book instantly via WhatsApp. No hidden charges.`;
  const canonical = `https://www.rentacardubai.online/cars/${slug}`;

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
  const supabase = createAdminClient();

  // Resilient fetch: try extended columns first, fallback to core if migration
  // 0033/0035 hasn't run yet.
  const SELECT_EXTENDED = `
    id, slug, title, description, year, city,
    transmission, fuel, seats, color, mileage_km, primary_image_url,
    body_type, color_interior, doors, luggage_bags, spec_type, engine_size,
    source_platform, source_url, source_listing_id,
    created_at, updated_at, published_at,
    model:model_id (name, make:make_id (name, logo_url)),
    business:business_id (
      id, name, slug, phone, whatsapp_phone, email,
      address_line, city, lat, lng,
      logo_url, cover_url, description, website_url,
      established_year, total_fleet_count, working_hours, languages,
      google_maps_url,
      rating, reviews_count, claim_status
    ),
    images:listing_images (id, url, sort_order, is_primary),
    pricing:listing_pricing (
      tier, price_pkr, price_aed, currency, included_km_per_day,
      extra_km_rate_pkr, min_hours
    ),
    policies:listing_policies (
      deposit_pkr, min_age, license_required, cancellation_text,
      delivery_available, delivery_fee_pkr, deposit_refund_days,
      insurance_included, fuel_policy, min_rental_days,
      salik_charges_aed, payment_methods
    ),
    mode:listing_modes (mode, surcharge_pkr),
    features:listing_features (feature:feature_id (id, name, slug, group))
  `;

  // Note: source_platform and source_listing_id are required for OCD overlay
  // and live on the listings table since migration 0035. They MUST be in CORE
  // so the OCD branch fires even when EXTENDED fails (e.g. if migration 0033
  // body_type hasn't been applied).
  const SELECT_CORE = `
    id, slug, title, description, year, city,
    transmission, fuel, seats, color, mileage_km, primary_image_url,
    source_platform, source_listing_id,
    created_at,
    model:model_id (name, make:make_id (name)),
    business:business_id (
      id, name, slug, phone, whatsapp_phone, address_line, city,
      cover_url, rating, reviews_count, claim_status
    ),
    images:listing_images (id, url, sort_order, is_primary),
    pricing:listing_pricing (tier, price_pkr, included_km_per_day, extra_km_rate_pkr, min_hours),
    policies:listing_policies (
      deposit_pkr, min_age, license_required, cancellation_text,
      delivery_available, delivery_fee_pkr
    ),
    mode:listing_modes (mode, surcharge_pkr),
    features:listing_features (feature:feature_id (id, name, slug, group))
  `;

  let res = await supabase
    .from("listings")
    .select(SELECT_EXTENDED)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle();

  // 42703 = undefined_column
  if (res.error?.code === "42703") {
    res = await supabase
      .from("listings")
      .select(SELECT_CORE)
      .eq("slug", slug)
      .eq("status", "approved")
      .maybeSingle();
  }

  if (res.error) {
    console.error(`[ListingPage] query error for slug="${slug}":`, res.error.message);
    notFound();
  }

  const data = res.data;
  if (!data) {
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

  // Fetch add-ons — tolerate missing table the same way as custom policies.
  let addons: {
    title: string;
    description: string | null;
    price_pkr: number;
  }[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: addonRows } = await (supabase as any)
      .from("listing_addons")
      .select("title, description, price_pkr")
      .eq("listing_id", (data as any).id)
      .order("sort_order");
    addons = addonRows ?? [];
  } catch {
    addons = [];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any).addons = addons;

  // Fetch the original OCD scraped row for listings imported from OneClickDrive
  // — this is the rich superset our scraper captures (videos, original
  // pre-discount rates, per-period extra-km, features-by-category, mileage /
  // deposit / rental policy texts, dealer note, etc.). The public RLS policy
  // added in migration 0039 lets the anon key read rows where status='imported'.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ocd: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((data as any).source_platform === "oneclickdrive") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ocdRow } = await (supabase as any)
        .from("ocd_scraped_listings")
        .select("*")
        .eq("imported_listing_id", (data as any).id)
        .eq("status", "imported")
        .maybeSingle();
      ocd = ocdRow ?? null;
    } catch {
      ocd = null;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data as any).ocd = ocd;

  // Extract pricing for schema
  const dailyPrice = ((data as any).pricing ?? []).find(
    (p: any) => p.tier === "daily",
  )?.price_pkr;
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
        <SuspenseBoundary fallback={<FeaturedCarsSkeleton />}>
          <FeaturedCarsRow />
        </SuspenseBoundary>
      </div>
    </>
  );
}
