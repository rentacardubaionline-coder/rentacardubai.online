import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

const BUSINESS_DETAIL_SELECT = `
  id,
  slug,
  name,
  city,
  address_line,
  description,
  phone,
  whatsapp_phone,
  email,
  logo_url,
  cover_url,
  rating,
  reviews_count,
  claim_status,
  is_live,
  owner_user_id,
  working_hours,
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
`;

export const getBusinessBySlug = cache(async function getBusinessBySlug(slug: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select(BUSINESS_DETAIL_SELECT)
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

/**
 * Look up a business by city + slug. Matches city name with the same prefix
 * tolerance we use elsewhere ("Lahore Cantt" is still "lahore"). Keeps URLs
 * stable when a scraped `city` field has a variant form.
 */
export const getBusinessByCityAndSlug = cache(async function getBusinessByCityAndSlug(
  citySlug: string,
  slug: string,
) {
  const supabase = await createClient();
  // Translate URL slug back to a city-name matcher: "dera-ghazi-khan" → "dera ghazi khan"
  const cityPattern = citySlug.replace(/-/g, " ");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select(BUSINESS_DETAIL_SELECT)
    .eq("slug", slug)
    .or(`city.ilike.${cityPattern},city.ilike.${cityPattern} %`)
    .maybeSingle();

  if (error) {
    console.error("Error fetching business by city+slug:", error);
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

export async function searchBusinesses(params: { city?: string; q?: string; page?: number }) {
  const supabase = await createClient();
  const limit = 12;
  const offset = ((params.page || 1) - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("businesses")
    .select(
      `
      id, name, slug, address_line, city, phone, whatsapp_phone,
      logo_url, cover_url, rating, reviews_count,
      business_images(url, is_primary, sort_order)
      `,
      { count: "exact" },
    )
    .eq("is_live", true);

  if (params.city) {
    const c = params.city.trim();
    query = query.or(`city.ilike.${c},city.ilike.${c} %`);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  query = query
    .order("rating", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error searching businesses:", error);
    return { data: [], count: 0, totalPages: 0 };
  }

  return {
    data: data || [],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export const getAvailableVendorCities = cache(async function getAvailableVendorCities() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select("city")
    .eq("is_live", true);

  if (error || !data) {
    return [];
  }

  const cityCounts = data.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item.city] = (acc[item.city] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count: count as number,
  }));
});
