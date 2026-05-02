import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { Database } from "@/types/database";

/**
 * Session-less anon client for public reads.
 * Avoids forwarding expired user JWTs from cookies, which causes "JWT expired"
 * errors on public pages even when the data is accessible to everyone.
 */
function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

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
  const supabase = createPublicClient();

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
  const supabase = createPublicClient();
  // "dera-ghazi-khan" → "dera ghazi khan%"  — prefix-matches "Dera Ghazi Khan" and variants
  const cityPrefix = citySlug.replace(/-/g, " ") + "%";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select(BUSINESS_DETAIL_SELECT)
    .eq("slug", slug)
    .ilike("city", cityPrefix)
    .maybeSingle();

  if (error) {
    console.error(
      `Error fetching business by city+slug (slug="${slug}", cityPrefix="${cityPrefix}"):`,
      error.message ?? error,
    );
    return null;
  }
  return data;
});

export const getBusinessListings = cache(async function getBusinessListings(businessId: string) {
  const supabase = createPublicClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
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

/**
 * Pull a flat list of car-photo URLs from every listing this business has
 * uploaded. Used by the business detail page hero gallery for self-signup
 * vendors so the strip shows real cars from their fleet instead of stock
 * placeholders. Scraped businesses (owner_user_id null) keep using their
 * `business_images` rows in the hero.
 *
 * No status / is_live filter — the goal is "show me what this vendor has",
 * including drafts and pending listings. Uses the admin client because the
 * `listing_images` RLS policy only exposes images of *approved* listings to
 * the public, which would silently drop most images for a freshly-signed-up
 * vendor whose cars haven't gone through the admin queue yet.
 */
export const getBusinessListingImages = cache(
  async function getBusinessListingImages(businessId: string, limit = 12) {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from("listings")
      .select(
        `id, primary_image_url, status, created_at,
         images:listing_images(url, sort_order, is_primary)`,
      )
      .eq("business_id", businessId)
      .neq("status", "rejected")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `[getBusinessListingImages] fetch error for business ${businessId}: ` +
          `message="${error.message ?? ""}" code=${error.code ?? ""} ` +
          `details="${error.details ?? ""}" hint="${error.hint ?? ""}"`,
      );
      return [];
    }
    if (!data) return [];

    const urls: string[] = [];
    for (const listing of data) {
      // Sort each listing's images: primary first, then by sort_order
      const sorted = ((listing.images ?? []) as {
        url: string;
        sort_order: number | null;
        is_primary: boolean | null;
      }[])
        .slice()
        .sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        })
        .map((i) => i.url);

      if (sorted.length > 0) {
        urls.push(...sorted);
      } else if (listing.primary_image_url) {
        // Listing has a primary photo but no listing_images rows yet.
        urls.push(listing.primary_image_url);
      }
    }

    // Dedupe and cap
    return Array.from(new Set(urls.filter(Boolean))).slice(0, limit);
  },
);

export const getSimilarBusinesses = cache(async function getSimilarBusinesses(city: string, excludeId: string) {
  const supabase = createPublicClient();

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
  const supabase = createPublicClient();
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
  const supabase = createPublicClient();

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
