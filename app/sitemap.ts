import type { MetadataRoute } from "next";
import { getAllKeywords } from "@/lib/seo/keywords-db";
import {
  getCities,
  getRoutesForSitemap,
  getCategorySlugs,
  getModelSlugs,
  getAllApprovedListingSlugs,
  getAllBusinessSlugs,
} from "@/lib/seo/data";
import {
  getCitiesWithListings,
  getCityTownsWithListings,
  getCityCategoriesWithListings,
  getCityTownCategoriesWithListings,
  getRoutesWithListings,
} from "@/lib/seo/coverage";
import { vendorUrl } from "@/lib/vendor/url";
import { getAllGuides } from "@/lib/guides/get";
import { LEGAL_LIST } from "@/lib/legal/data";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://www.rentacardubai.online";

/**
 * The sitemap is the single source of truth Google uses to crawl. We refuse
 * to emit any programmatic landing-page URL whose target page would render
 * empty (zero approved listings). The render-side `notFound()` guards in
 * `app/(seo)/**` enforce the same invariant from the other side.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    keywords,
    cities,
    routes,
    models,
    categories,
    listings,
    businesses,
    citiesWithListings,
    cityTownsWithListings,
    cityCategoriesWithListings,
    cityTownCategoriesWithListings,
    routesWithListings,
    listingMeta,
  ] = await Promise.all([
    getAllKeywords(),
    getCities(),
    getRoutesForSitemap(),
    getModelSlugs(),
    getCategorySlugs(),
    getAllApprovedListingSlugs(),
    getAllBusinessSlugs(),
    getCitiesWithListings(),
    getCityTownsWithListings(),
    getCityCategoriesWithListings(),
    getCityTownCategoriesWithListings(),
    getRoutesWithListings(),
    getListingMetaForDeepUrls(),
  ]);

  const activeKeywords = keywords.filter((k) => k.is_active);
  const townKeywords = activeKeywords.filter((k) => k.include_in_sitemap_towns);

  // Cities the user can land on at all = active cities ∩ cities with listings.
  const activeCitySlugs = new Set(cities.map((c) => c.slug));
  const liveCities = cities.filter(
    (c) => activeCitySlugs.has(c.slug) && citiesWithListings.has(c.slug),
  );

  const entries: MetadataRoute.Sitemap = [];

  // 1. Home
  entries.push({ url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });

  // 2. Keyword-only pages
  for (const kw of activeKeywords) {
    entries.push({ url: `${BASE}/${kw.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 });
  }

  // 3. Keyword + city pages — gated by coverage
  for (const kw of activeKeywords) {
    for (const city of liveCities) {
      entries.push({
        url: `${BASE}/${kw.slug}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  // 4. Keyword + city + town pages — gated by per-city town coverage AND
  //    keyword.include_in_sitemap_towns
  for (const kw of townKeywords) {
    for (const city of liveCities) {
      const towns = cityTownsWithListings.get(city.slug);
      if (!towns) continue;
      for (const townSlug of towns) {
        entries.push({
          url: `${BASE}/${kw.slug}/${city.slug}/${townSlug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  // 5. Vehicle category pages — only for categories that have listings
  //    in any city
  const categoriesWithAnyListing = new Set<string>();
  for (const set of cityCategoriesWithListings.values()) {
    for (const slug of set) categoriesWithAnyListing.add(slug);
  }
  for (const cat of categories) {
    if (!categoriesWithAnyListing.has(cat.slug)) continue;
    entries.push({
      url: `${BASE}/vehicles/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // 6. Vehicle model pages — emitted as today (we don't currently have a
  //    listings-by-model coverage map, so all model pages stay)
  for (const model of models) {
    entries.push({
      url: `${BASE}/vehicles/${model.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // 7. Route pages — gated by coverage
  for (const route of routes) {
    if (!routesWithListings.has(route.slug)) continue;
    entries.push({
      url: `${BASE}/routes/${route.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // 8. Keyword + route pages — gated by coverage
  for (const kw of activeKeywords) {
    for (const route of routes) {
      if (!routesWithListings.has(route.slug)) continue;
      entries.push({
        url: `${BASE}/${kw.slug}/${route.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  // 9. Individual listing pages
  for (const listing of listings) {
    entries.push({
      url: `${BASE}/cars/${listing.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // 10. Vendor pages
  for (const biz of businesses) {
    entries.push({
      url: `${BASE}${vendorUrl(biz)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // 11. Depth-5 long-tail URLs: /{keyword}/{city}/{town}/{category}/{listing}
  //     These 301 to /cars/{slug} but we still emit them so Google discovers
  //     the long-tail keyword variants and consolidates link equity through
  //     the redirect.
  for (const kw of townKeywords) {
    for (const meta of listingMeta) {
      const cityMap = cityTownCategoriesWithListings.get(meta.citySlug);
      if (!cityMap) continue;
      const set = cityMap.get(meta.townSlug);
      if (!set?.has(meta.categorySlug)) continue;
      entries.push({
        url: `${BASE}/${kw.slug}/${meta.citySlug}/${meta.townSlug}/${meta.categorySlug}/${meta.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // 12. Guides — index + individual articles
  entries.push({ url: `${BASE}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
  for (const guide of getAllGuides()) {
    entries.push({
      url: `${BASE}/guides/${guide.slug}`,
      lastModified: new Date(guide.updatedAt ?? guide.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // 13. Legal pages
  for (const doc of LEGAL_LIST) {
    entries.push({
      url: `${BASE}/${doc.slug}`,
      lastModified: new Date(doc.lastReviewed),
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  return entries;
}

// ── Listing-meta helper for depth-5 URLs ───────────────────────────────────

interface ListingMeta {
  slug: string;
  citySlug: string;
  townSlug: string;
  categorySlug: string;
}

/**
 * Pull every approved listing's (citySlug, townSlug, categorySlug, slug) so
 * we can emit depth-5 URLs in the sitemap. Each listing matches at most one
 * town (the first town whose name appears in the business address) and at
 * most one category (slugified body_type).
 */
async function getListingMetaForDeepUrls(): Promise<ListingMeta[]> {
  const db = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows } = await (db as any)
    .from("listings")
    .select("slug, city, body_type, business:business_id(address_line)")
    .eq("status", "approved")
    .eq("is_live", true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: towns } = await (db as any)
    .from("towns")
    .select("slug, name, city:city_id(slug)");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cats } = await (db as any)
    .from("vehicle_categories")
    .select("slug");

  const validCats = new Set<string>(
    (cats ?? []).map((c: { slug: string }) => c.slug),
  );
  const townsByCity = new Map<string, { slug: string; name: string }[]>();
  for (const t of (towns ?? []) as {
    slug: string; name: string; city: { slug: string } | null;
  }[]) {
    if (!t.city?.slug) continue;
    const list = townsByCity.get(t.city.slug) ?? [];
    list.push({ slug: t.slug, name: t.name });
    townsByCity.set(t.city.slug, list);
  }

  const slugify = (s: string | null | undefined) =>
    (s ?? "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const out: ListingMeta[] = [];
  for (const r of (rows ?? []) as {
    slug: string;
    city: string | null;
    body_type: string | null;
    business: { address_line: string | null } | null;
  }[]) {
    const citySlug = slugify(r.city);
    const categorySlug = slugify(r.body_type);
    if (!citySlug || !categorySlug || !validCats.has(categorySlug)) continue;
    const candidates = townsByCity.get(citySlug);
    if (!candidates) continue;
    const haystack = `${r.business?.address_line ?? ""} ${r.city ?? ""}`.toLowerCase();
    const town = candidates.find((t) => haystack.includes(t.name.toLowerCase()));
    if (!town) continue;
    out.push({
      slug: r.slug,
      citySlug,
      townSlug: town.slug,
      categorySlug,
    });
  }
  return out;
}
