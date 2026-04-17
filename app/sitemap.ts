import type { MetadataRoute } from "next";
import { KEYWORD_SLUGS, TOWN_KEYWORDS } from "@/lib/seo/routes-config";
import {
  getCities,
  getRoutesForSitemap,
  getTownsForSitemap,
  getModelSlugs,
  getCategorySlugs,
  getAllApprovedListingSlugs,
  getAllBusinessSlugs,
} from "@/lib/seo/data";

const BASE = "https://www.rentnowpk.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, routes, towns, models, categories, listings, businesses] =
    await Promise.all([
      getCities(),
      getRoutesForSitemap(),
      getTownsForSitemap(),
      getModelSlugs(),
      getCategorySlugs(),
      getAllApprovedListingSlugs(),
      getAllBusinessSlugs(),
    ]);

  const entries: MetadataRoute.Sitemap = [];

  // 1. Home
  entries.push({ url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });

  // 2. Keyword-only pages (54)
  for (const kw of KEYWORD_SLUGS) {
    entries.push({ url: `${BASE}/${kw}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 });
  }

  // 3. Keyword + city pages (54 × cities)
  for (const kw of KEYWORD_SLUGS) {
    for (const city of cities) {
      entries.push({ url: `${BASE}/${kw}/${city.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }
  }

  // 4. Keyword + city + town (limited keywords to keep sitemap manageable)
  for (const kw of TOWN_KEYWORDS) {
    for (const town of towns) {
      entries.push({
        url: `${BASE}/${kw}/${town.city.slug}/${town.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // 5. Vehicle category pages
  for (const cat of categories) {
    entries.push({ url: `${BASE}/vehicles/${cat.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 });
  }

  // 6. Vehicle model pages
  for (const model of models) {
    entries.push({ url: `${BASE}/vehicles/${model.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 });
  }

  // 7. Route pages
  for (const route of routes) {
    entries.push({ url: `${BASE}/routes/${route.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
  }

  // 8. Keyword + route pages (54 × routes)
  for (const kw of KEYWORD_SLUGS) {
    for (const route of routes) {
      entries.push({ url: `${BASE}/${kw}/${route.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }
  }

  // 9. Individual listing pages
  for (const listing of listings) {
    entries.push({ url: `${BASE}/cars/${listing.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 });
  }

  // 10. Vendor pages
  for (const biz of businesses) {
    entries.push({ url: `${BASE}/vendors/${biz.slug}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 });
  }

  return entries;
}
