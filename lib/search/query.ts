import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { formatCity } from "./params";
import type { SearchParams } from "./params";

const RESULTS_PER_PAGE = 12;

/**
 * PostgREST errors print as `{}` through Next 16's Turbopack overlay because
 * the error's diagnostic properties are non-enumerable. Inline them into a
 * single string so the overlay (which renders the format string verbatim)
 * shows the message, code, details, and a JSON dump of the raw error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeSupabaseError(err: any): string {
  if (!err) return "(no error)";
  const message = err.message ?? "(no message)";
  const code = err.code ?? "n/a";
  const details = err.details ?? "n/a";
  const hint = err.hint ?? "n/a";
  let raw = "";
  try {
    raw = JSON.stringify(
      err,
      Object.getOwnPropertyNames(err) as string[],
    );
  } catch {
    raw = String(err);
  }
  return `message="${message}" code=${code} details="${details}" hint="${hint}" raw=${raw}`;
}

/**
 * Detect "column listings.is_live does not exist" so we can retry without
 * that filter on environments where migration 0027 hasn't been applied.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMissingIsLiveColumn(err: any): boolean {
  if (!err) return false;
  if (err.code === "42703") return true;
  const msg = String(err.message ?? "").toLowerCase();
  return msg.includes("is_live") && msg.includes("does not exist");
}

// Build the listing select string. We embed model / listing_modes / listing_pricing
// as inner joins (`!inner`) when those tables also carry an active filter, so
// PostgREST drops listings whose joined rows don't match. Without the bang, the
// filter is silently a no-op (a left-joined null row passes through).
function buildSelect(params: SearchParams): string {
  const modelEmbed = params.bodyType
    ? "model:model_id!inner ( body_type )"
    : "model:model_id ( body_type )";
  const modeEmbed = params.mode
    ? "mode:listing_modes!inner ( mode )"
    : "mode:listing_modes ( mode )";
  const pricingEmbed = params.priceMin || params.priceMax
    ? "pricing:listing_pricing!inner ( tier, price_pkr )"
    : "pricing:listing_pricing ( tier, price_pkr )";

  return `
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
      reviews_count,
      phone,
      whatsapp_phone
    ),
    images:listing_images ( url, sort_order, is_primary ),
    ${pricingEmbed},
    ${modelEmbed},
    ${modeEmbed}
  `;
}

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
    phone: string | null;
    whatsapp_phone: string | null;
  };
  images?: {
    url: string;
    sort_order: number | null;
    is_primary: boolean | null;
  }[];
  pricing: {
    tier?: string;
    price_pkr: number;
  }[];
}

/** Whether the deployed `listings` table has migration 0027 applied. Cached
 *  for the lifetime of the process so we only probe once. */
let listingsHasIsLive: boolean | null = null;

export async function searchListings(params: SearchParams): Promise<{
  data: SearchResult[];
  count: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildQuery = (withIsLive: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase as any)
      .from("listings")
      .select(buildSelect(params), { count: "exact" })
      .eq("status", "approved");
    if (withIsLive) q = q.eq("is_live", true);

    if (params.city) {
      q = q.ilike("city", `%${params.city}%`);
    }
    if (params.transmission) {
      q = q.eq("transmission", params.transmission);
    }
    if (params.fuel) {
      q = q.eq("fuel", params.fuel);
    }
    if (params.seats) {
      q = q.eq("seats", params.seats);
    }
    if (params.bodyType) {
      q = q.ilike("model.body_type", params.bodyType);
    }
    if (params.mode) {
      q = q.eq("listing_modes.mode", params.mode);
    }
    if (params.priceMin || params.priceMax) {
      q = q.eq("listing_pricing.tier", "daily");
      if (params.priceMin) q = q.gte("listing_pricing.price_pkr", params.priceMin);
      if (params.priceMax) q = q.lte("listing_pricing.price_pkr", params.priceMax);
    }
    if (params.q) {
      const t = params.q.toLowerCase();
      q = q.or(`title.ilike.%${t}%,description.ilike.%${t}%`);
    }
    switch (params.sort) {
      case "price_asc":
        q = q.order("listing_pricing.price_pkr", { ascending: true });
        break;
      case "price_desc":
        q = q.order("listing_pricing.price_pkr", { ascending: false });
        break;
      case "newest":
      case "relevance":
      default:
        q = q.order("created_at", { ascending: false });
    }
    const offset = (params.page - 1) * RESULTS_PER_PAGE;
    q = q.range(offset, offset + RESULTS_PER_PAGE - 1);
    return q;
  };

  let res = await buildQuery(listingsHasIsLive !== false);
  if (res.error && isMissingIsLiveColumn(res.error)) {
    listingsHasIsLive = false;
    res = await buildQuery(false);
  } else if (!res.error && listingsHasIsLive === null) {
    listingsHasIsLive = true;
  }

  const { data, count, error } = res;

  if (error) {
    console.error(`Search error: ${describeSupabaseError(error)}`);
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
export const getMakesForFacets = cache(async function getMakesForFacets(params: SearchParams) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("listings")
    .select("model:model_id (make:make_id (id, name, slug))")
    .eq("status", "approved")
    .eq("is_live", true);

  if (params.city) {
    const c = formatCity(params.city);
    query = query.or(`city.ilike.${c},city.ilike.${c} %`);
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
});

// Get available cities with count — deduped per request via React cache().
// Wrapped in try/catch so the home page never crashes when Supabase is
// unreachable (DNS, paused project, env var typo) — the await itself
// rejects on network errors, not just on response-level errors.
export const getAvailableCities = cache(async function getAvailableCities() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  let error: unknown = null;
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (supabase as any)
      .from("listings")
      .select("city")
      .eq("status", "approved")
      .eq("is_live", true);
    data = res.data;
    error = res.error;
  } catch (err) {
    console.error("[getAvailableCities] network error", err);
    return [];
  }

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
    count: count as number,
  }));
});
