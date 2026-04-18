// SEO data queries — fetches cities, towns, routes, models, categories from Supabase
// Uses admin client to bypass RLS (these are public SEO pages)

import { createAdminClient } from "@/lib/supabase/admin";
import { cache } from "react";

const db = () => createAdminClient();

// ── Cities ───────────────────────────────────────────────────────────────────

export const getCities = cache(async () => {
  const { data } = await (db() as any)
    .from("cities")
    .select("id, name, slug, province")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as { id: string; name: string; slug: string; province: string | null }[];
});

export const getCityBySlug = cache(async (slug: string) => {
  const { data } = await (db() as any)
    .from("cities")
    .select("id, name, slug, province")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as { id: string; name: string; slug: string; province: string | null } | null;
});

// ── Towns ────────────────────────────────────────────────────────────────────

export const getTownsByCity = cache(async (cityId: string) => {
  const { data } = await (db() as any)
    .from("towns")
    .select("id, name, slug")
    .eq("city_id", cityId)
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as { id: string; name: string; slug: string }[];
});

export const getTownBySlug = cache(async (slug: string, cityId: string) => {
  const { data } = await (db() as any)
    .from("towns")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("city_id", cityId)
    .eq("is_active", true)
    .maybeSingle();
  return data as { id: string; name: string; slug: string } | null;
});

export const getTownsForSitemap = cache(async () => {
  const { data } = await (db() as any)
    .from("towns")
    .select("id, name, slug, city:city_id(slug)")
    .eq("is_active", true);
  return (data ?? []) as { id: string; name: string; slug: string; city: { slug: string } }[];
});

// ── Routes ───────────────────────────────────────────────────────────────────

export const getRouteBySlug = cache(async (slug: string) => {
  const { data } = await (db() as any)
    .from("routes")
    .select(`
      id, slug, distance_km, estimated_time,
      origin_city:origin_city_id(name, slug),
      destination_city:destination_city_id(name, slug)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as {
    id: string; slug: string; distance_km: number | null; estimated_time: string | null;
    origin_city: { name: string; slug: string };
    destination_city: { name: string; slug: string };
  } | null;
});

export const getRoutesForSitemap = cache(async () => {
  const { data } = await (db() as any)
    .from("routes")
    .select("slug")
    .eq("is_active", true);
  return (data ?? []) as { slug: string }[];
});

export const getRoutesByOriginCity = cache(async (citySlug: string) => {
  const city = await getCityBySlug(citySlug);
  if (!city) return [];
  const { data } = await (db() as any)
    .from("routes")
    .select(`
      id, slug,
      destination_city:destination_city_id(name, slug)
    `)
    .eq("origin_city_id", city.id)
    .eq("is_active", true);
  return (data ?? []) as { id: string; slug: string; destination_city: { name: string; slug: string } }[];
});

// ── Models (from existing makes/models tables) ──────────────────────────────

export const getModelBySlug = cache(async (slug: string) => {
  const { data } = await (db() as any)
    .from("models")
    .select("id, name, slug, body_type, make:make_id(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  return data as {
    id: string; name: string; slug: string; body_type: string | null;
    make: { name: string; slug: string };
  } | null;
});

export const getModelSlugs = cache(async () => {
  const { data } = await (db() as any)
    .from("models")
    .select("slug");
  return (data ?? []) as { slug: string }[];
});

export const getModelsWithMakes = cache(async () => {
  const { data } = await (db() as any)
    .from("models")
    .select("id, name, slug, make:make_id(name, slug)")
    .order("name");
  return (data ?? []) as { id: string; name: string; slug: string; make: { name: string; slug: string } }[];
});

// ── Vehicle Categories ───────────────────────────────────────────────────────

export const getCategoryBySlug = cache(async (slug: string) => {
  const { data } = await (db() as any)
    .from("vehicle_categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  return data as { id: string; name: string; slug: string } | null;
});

export const getCategorySlugs = cache(async () => {
  const { data } = await (db() as any)
    .from("vehicle_categories")
    .select("slug");
  return (data ?? []) as { slug: string }[];
});

// ── Listings (for landing page vehicle grids) ────────────────────────────────

export const getListingsForCity = cache(async (cityName: string, limit = 12) => {
  const { data } = await (db() as any)
    .from("listings")
    .select(`
      id, slug, title, city, primary_image_url, status,
      business:business_id(name, slug, whatsapp_phone, phone, rating, reviews_count),
      pricing:listing_pricing(tier, price_pkr)
    `)
    .eq("status", "approved")
    .ilike("city", cityName)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as any[];
});

export const getListingsForModel = cache(async (modelSlug: string, cityName?: string, limit = 12) => {
  // Join through model_id → models table to match by slug
  const model = await getModelBySlug(modelSlug);
  if (!model) return [];

  let query = (db() as any)
    .from("listings")
    .select(`
      id, slug, title, city, primary_image_url, status,
      business:business_id(name, slug, whatsapp_phone, phone, rating, reviews_count),
      pricing:listing_pricing(tier, price_pkr)
    `)
    .eq("status", "approved")
    .eq("model_id", model.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cityName) {
    query = query.ilike("city", cityName);
  }

  const { data } = await query;
  return (data ?? []) as any[];
});

export const getAllApprovedListingSlugs = cache(async () => {
  const { data } = await (db() as any)
    .from("listings")
    .select("slug")
    .eq("status", "approved");
  return (data ?? []) as { slug: string }[];
});

export const getAllApprovedListings = cache(async (limit = 20) => {
  const { data } = await (db() as any)
    .from("listings")
    .select(`
      id, slug, title, city, primary_image_url,
      business:business_id(name, slug, whatsapp_phone, phone, rating, reviews_count),
      pricing:listing_pricing(tier, price_pkr)
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as any[];
});

// ── Vendors/Businesses ───────────────────────────────────────────────────────

export const getAllBusinessSlugs = cache(async () => {
  // Sitemap only lists PUBLISHED businesses (is_live=true)
  const { data } = await (db() as any)
    .from("businesses")
    .select("slug")
    .eq("is_live", true);
  return (data ?? []) as { slug: string }[];
});
