import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

export const getBusinessBySlug = cache(async function getBusinessBySlug(slug: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select(`
      id,
      slug,
      name,
      city,
      address_line,
      description,
      phone,
      whatsapp_phone,
      email,
      website,
      logo_url,
      cover_url,
      rating,
      reviews_count,
      claim_status,
      is_live,
      owner_user_id,
      working_hours,
      services,
      lat,
      lng,
      google_maps_url,
      created_at,
      business_images (
        url,
        is_primary,
        sort_order
      ),
      business_reviews (
        reviewer_name,
        reviewer_avatar_url,
        rating,
        comment,
        created_at
      )
    `)
    .eq("slug", slug)
    .maybeSingle();
    // NOTE: no is_live filter — owners must still be able to find & claim
    // unpublished businesses via direct URL. Discovery (sitemap, search,
    // featured, similar) filters by is_live=true elsewhere.

  if (error) {
    console.error("Error fetching business:", error);
    return null;
  }

  return data;
});

export const getBusinessListings = cache(async function getBusinessListings(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      slug,
      title,
      year,
      city,
      transmission,
      fuel,
      seats,
      color,
      mileage_km,
      primary_image_url,
      status,
      pricing:listing_pricing (
        tier,
        price_pkr
      )
    `)
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching business listings:", error);
    return [];
  }

  return data;
});

export const getSimilarBusinesses = cache(async function getSimilarBusinesses(city: string, excludeId: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select("id, name, slug, address_line, city, phone, logo_url")
    .eq("is_live", true) // only live businesses in similar
    .eq("city", city)
    .neq("id", excludeId)
    .limit(3);

  if (error) {
    console.error("Error fetching similar businesses:", error);
    return [];
  }

  return data;
});
