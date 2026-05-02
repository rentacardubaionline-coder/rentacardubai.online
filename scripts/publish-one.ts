import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const slug = "lamborghini-huracan-2023-dubai";
  console.log("Querying for slug:", slug);

  const { data, error } = await db
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
      engine_size,
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
        price_aed,
        currency,
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
        delivery_fee_pkr,
        deposit_refund_days,
        insurance_included
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

  if (error) {
    console.error("DB Error:", error);
  } else if (!data) {
    console.log("No data returned! Either it doesn't exist, status is wrong, or a relation is breaking it.");
  } else {
    console.log("Successfully fetched listing data!");
    console.log(data.title);
  }
}

main();
