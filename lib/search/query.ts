import { createClient } from "@/lib/supabase/server";
import type { SearchParams } from "./params";

const RESULTS_PER_PAGE = 12;

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  year: number;
  city: string;
  transmission: string;
  fuel: string;
  seats: number;
  color: string;
  mileage_km: number;
  primary_image_url: string | null;
  status: string;
  business: {
    id: string;
    name: string;
    slug: string;
    rating: number;
    reviews_count: number;
  };
  pricing: {
    price_pkr: number;
  }[];
}

export async function searchListings(params: SearchParams): Promise<{
  data: SearchResult[];
  count: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("listings")
    .select(
      `
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
      business:business_id (
        id,
        name,
        slug,
        rating,
        reviews_count
      ),
      pricing:listing_pricing (
        price_pkr
      )
    `,
      { count: "exact" }
    )
    // Always filter for approved listings
    .eq("status", "approved");

  // Apply filters
  if (params.city) {
    query = query.eq("city", params.city.charAt(0).toUpperCase() + params.city.slice(1));
  }

  if (params.transmission) {
    query = query.eq("transmission", params.transmission);
  }

  if (params.fuel) {
    query = query.eq("fuel", params.fuel);
  }

  if (params.seats) {
    query = query.eq("seats", params.seats);
  }

  if (params.mode) {
    // Filter by rental mode available for listing
    query = query
      .select(
        `
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
        business:business_id (
          id,
          name,
          slug,
          rating,
          reviews_count
        ),
        pricing:listing_pricing (
          price_pkr
        ),
        mode:listing_modes (
          mode
        )
      `
      )
      .eq("listing_modes.mode", params.mode);
  }

  // Price filtering (using daily pricing tier)
  if (params.priceMin || params.priceMax) {
    query = query
      .select(
        `
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
        business:business_id (
          id,
          name,
          slug,
          rating,
          reviews_count
        ),
        pricing:listing_pricing (
          price_pkr
        )
      `
      )
      .eq("listing_pricing.tier", "daily");

    if (params.priceMin) {
      query = query.gte("listing_pricing.price_pkr", params.priceMin);
    }
    if (params.priceMax) {
      query = query.lte("listing_pricing.price_pkr", params.priceMax);
    }
  }

  // Text search on title and description
  if (params.q) {
    const searchTerm = params.q.toLowerCase();
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Sorting
  switch (params.sort) {
    case "price_asc":
      query = query.order("listing_pricing.price_pkr", { ascending: true });
      break;
    case "price_desc":
      query = query.order("listing_pricing.price_pkr", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "relevance":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  const offset = (params.page - 1) * RESULTS_PER_PAGE;
  query = query.range(offset, offset + RESULTS_PER_PAGE - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return { data: [], count: 0, totalPages: 0 };
  }

  const totalPages = count ? Math.ceil(count / RESULTS_PER_PAGE) : 0;

  return {
    data: (data as unknown as SearchResult[]) || [],
    count: count || 0,
    totalPages,
  };
}

// Get available makes for faceting/filtering
export async function getMakesForFacets(params: SearchParams) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("listings")
    .select("model:model_id (make:make_id (id, name, slug))")
    .eq("status", "approved");

  if (params.city) {
    query = query.eq("city", params.city.charAt(0).toUpperCase() + params.city.slice(1));
  }

  const { data, error } = await query;

  if (error) {
    console.error("Facet error:", error);
    return [];
  }

  // Extract unique makes
  const makesMap = new Map();
  if (data) {
    for (const item of data) {
      if (item.model && item.model.make) {
        const make = item.model.make;
        makesMap.set(make.slug, make);
      }
    }
  }

  return Array.from(makesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Get available cities with count
export async function getAvailableCities() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("listings")
    .select("city")
    .eq("status", "approved");

  if (error || !data) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityCounts = data.reduce(
    (acc: Record<string, number>, item: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc[item.city] = (acc[item.city] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(cityCounts).map(([city, count]) => ({
    city,
    count,
  }));
}
