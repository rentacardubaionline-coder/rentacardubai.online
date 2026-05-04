// SEO coverage: which (city, town, category, route) combos actually have
// approved listings. Both the render-side guards and the sitemap generator
// use these sets to avoid emitting / serving thin-content pages.
//
// All queries run with the admin client (service-role) so RLS does not block
// public-facing SEO checks. Wrapped in `cache()` so a single sitemap request
// or single page render only hits Supabase once.

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

const db = () => createAdminClient();

/** Lower-case canonical city-name slugifier (kept identical to admin shaping). */
function slugify(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Cities ──────────────────────────────────────────────────────────────────

/**
 * Set of city slugs that have ≥ 1 approved+live listing. Slugs match
 * `cities.slug` rows exactly (the `cities` table is the only place where
 * slug-form is stable; we map free-text `listings.city` to a slug here).
 */
export const getCitiesWithListings = cache(async (): Promise<Set<string>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (db() as any)
    .from("listings")
    .select("city")
    .eq("status", "approved")
    .eq("is_live", true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cities } = await (db() as any)
    .from("cities")
    .select("slug");

  const cityNames = new Set<string>();
  for (const r of (rows ?? []) as { city: string | null }[]) {
    if (r.city) cityNames.add(slugify(r.city));
  }
  // Restrict to slugs that actually exist in the cities table — otherwise a
  // free-text typo on a listing would create a phantom landing page.
  const validSlugs = new Set<string>((cities ?? []).map((c: { slug: string }) => c.slug));
  const out = new Set<string>();
  for (const slug of cityNames) {
    if (validSlugs.has(slug)) out.add(slug);
  }
  return out;
});

// ── Towns ───────────────────────────────────────────────────────────────────

/**
 * Map<citySlug, Set<townSlug>> for towns where ≥ 1 approved+live listing
 * exists in that town. We approximate town containment by matching the
 * listing's `city` free-text field for the city, and the
 * `business.address_line` free-text for the town name (case-insensitive
 * substring). This is the same heuristic the listings page filter uses.
 */
export const getCityTownsWithListings = cache(
  async (): Promise<Map<string, Set<string>>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (db() as any)
      .from("listings")
      .select("city, business:business_id(address_line, city)")
      .eq("status", "approved")
      .eq("is_live", true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: towns } = await (db() as any)
      .from("towns")
      .select("slug, name, city:city_id(slug)");

    const townsByCity = new Map<string, { slug: string; name: string }[]>();
    for (const t of (towns ?? []) as {
      slug: string;
      name: string;
      city: { slug: string } | null;
    }[]) {
      if (!t.city?.slug) continue;
      const list = townsByCity.get(t.city.slug) ?? [];
      list.push({ slug: t.slug, name: t.name });
      townsByCity.set(t.city.slug, list);
    }

    const out = new Map<string, Set<string>>();
    for (const r of (rows ?? []) as {
      city: string | null;
      business: { address_line: string | null; city: string | null } | null;
    }[]) {
      const citySlug = slugify(r.city);
      const candidates = townsByCity.get(citySlug);
      if (!candidates) continue;
      const haystack = `${r.business?.address_line ?? ""} ${r.city ?? ""}`.toLowerCase();
      for (const t of candidates) {
        if (haystack.includes(t.name.toLowerCase())) {
          const set = out.get(citySlug) ?? new Set<string>();
          set.add(t.slug);
          out.set(citySlug, set);
        }
      }
    }
    return out;
  },
);

// ── Categories ──────────────────────────────────────────────────────────────

/**
 * Map<citySlug, Set<categorySlug>> — category coverage per city.
 *
 * Categories on the public side resolve from `vehicle_categories.slug`. We
 * map listings to category by `body_type` (lower-cased) since the import
 * pipeline writes `body_type` as the customer-facing category label.
 */
export const getCityCategoriesWithListings = cache(
  async (): Promise<Map<string, Set<string>>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (db() as any)
      .from("listings")
      .select("city, body_type")
      .eq("status", "approved")
      .eq("is_live", true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cats } = await (db() as any)
      .from("vehicle_categories")
      .select("slug, name");

    const validCatSlugs = new Set<string>((cats ?? []).map((c: { slug: string }) => c.slug));
    const out = new Map<string, Set<string>>();
    for (const r of (rows ?? []) as { city: string | null; body_type: string | null }[]) {
      const citySlug = slugify(r.city);
      if (!citySlug) continue;
      const catSlug = slugify(r.body_type);
      if (!catSlug || !validCatSlugs.has(catSlug)) continue;
      const set = out.get(citySlug) ?? new Set<string>();
      set.add(catSlug);
      out.set(citySlug, set);
    }
    return out;
  },
);

// ── City + Town + Category ─────────────────────────────────────────────────

/**
 * Three-level coverage: Map<citySlug, Map<townSlug, Set<categorySlug>>>.
 * Used by Milestone 3 to gate the depth-5 listing redirect URLs in the
 * sitemap.
 */
export const getCityTownCategoriesWithListings = cache(
  async (): Promise<Map<string, Map<string, Set<string>>>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rows } = await (db() as any)
      .from("listings")
      .select("city, body_type, business:business_id(address_line)")
      .eq("status", "approved")
      .eq("is_live", true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: towns } = await (db() as any)
      .from("towns")
      .select("slug, name, city:city_id(slug)");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cats } = await (db() as any)
      .from("vehicle_categories")
      .select("slug");

    const validCatSlugs = new Set<string>((cats ?? []).map((c: { slug: string }) => c.slug));
    const townsByCity = new Map<string, { slug: string; name: string }[]>();
    for (const t of (towns ?? []) as {
      slug: string;
      name: string;
      city: { slug: string } | null;
    }[]) {
      if (!t.city?.slug) continue;
      const list = townsByCity.get(t.city.slug) ?? [];
      list.push({ slug: t.slug, name: t.name });
      townsByCity.set(t.city.slug, list);
    }

    const out = new Map<string, Map<string, Set<string>>>();
    for (const r of (rows ?? []) as {
      city: string | null;
      body_type: string | null;
      business: { address_line: string | null } | null;
    }[]) {
      const citySlug = slugify(r.city);
      const catSlug = slugify(r.body_type);
      if (!citySlug || !catSlug || !validCatSlugs.has(catSlug)) continue;
      const candidates = townsByCity.get(citySlug);
      if (!candidates) continue;
      const haystack = `${r.business?.address_line ?? ""} ${r.city ?? ""}`.toLowerCase();
      for (const t of candidates) {
        if (haystack.includes(t.name.toLowerCase())) {
          const cityMap = out.get(citySlug) ?? new Map<string, Set<string>>();
          const set = cityMap.get(t.slug) ?? new Set<string>();
          set.add(catSlug);
          cityMap.set(t.slug, set);
          out.set(citySlug, cityMap);
        }
      }
    }
    return out;
  },
);

// ── Routes ──────────────────────────────────────────────────────────────────

/**
 * Set of route slugs that are "served" — at least one approved listing
 * exists in the route's origin city. Until we model trip-specific availability
 * this is the practical signal.
 */
export const getRoutesWithListings = cache(async (): Promise<Set<string>> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: routes } = await (db() as any)
    .from("routes")
    .select("slug, origin_city:origin_city_id(slug)")
    .eq("is_active", true);

  const cities = await getCitiesWithListings();
  const out = new Set<string>();
  for (const r of (routes ?? []) as {
    slug: string;
    origin_city: { slug: string } | null;
  }[]) {
    if (r.origin_city?.slug && cities.has(r.origin_city.slug)) {
      out.add(r.slug);
    }
  }
  return out;
});

// ── Helpers used by render-side gates ───────────────────────────────────────

/** Count approved listings in a given city. */
export async function countListingsInCity(cityName: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (db() as any)
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")
    .eq("is_live", true)
    .ilike("city", cityName);
  return count ?? 0;
}

/**
 * Look up a single listing by slug, restricted to one (citySlug, townSlug,
 * categorySlug) tuple. Used by the depth-5 redirect to confirm the URL
 * actually maps to a real listing in this combo before redirecting.
 */
export async function findListingForCombo(params: {
  citySlug: string;
  townSlug: string;
  categorySlug: string;
  listingSlug: string;
}): Promise<{ slug: string } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: city } = await (db() as any)
    .from("cities")
    .select("name")
    .eq("slug", params.citySlug)
    .maybeSingle();
  if (!city?.name) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: town } = await (db() as any)
    .from("towns")
    .select("name")
    .eq("slug", params.townSlug)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing } = await (db() as any)
    .from("listings")
    .select("slug, city, body_type, business:business_id(address_line)")
    .eq("slug", params.listingSlug)
    .eq("status", "approved")
    .eq("is_live", true)
    .maybeSingle();
  if (!listing) return null;

  const cityMatches =
    typeof listing.city === "string" &&
    listing.city.toLowerCase() === city.name.toLowerCase();
  if (!cityMatches) return null;

  const catMatches = slugify(listing.body_type) === params.categorySlug;
  if (!catMatches) return null;

  if (town?.name) {
    const haystack = `${listing.business?.address_line ?? ""} ${listing.city ?? ""}`.toLowerCase();
    if (!haystack.includes(town.name.toLowerCase())) return null;
  }

  return { slug: listing.slug };
}
