import type { MetadataRoute } from "next";
import { getAllKeywords } from "@/lib/seo/keywords-db";
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
  const [keywords, cities, routes, towns, models, categories, listings, businesses] =
    await Promise.all([
      getAllKeywords(),
      getCities(),
      getRoutesForSitemap(),
      getTownsForSitemap(),
      getModelSlugs(),
      getCategorySlugs(),
      getAllApprovedListingSlugs(),
      getAllBusinessSlugs(),
    ]);

  const activeKeywords = keywords.filter((k) => k.is_active);
  const townKeywords = activeKeywords.filter((k) => k.include_in_sitemap_towns);

  const entries: MetadataRoute.Sitemap = [];

  // 1. Home
  entries.push({ url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 });

  // 2. Keyword-only pages
  for (const kw of activeKeywords) {
    entries.push({ url: `${BASE}/${kw.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 });
  }

  // 3. Keyword + city pages
  for (const kw of activeKeywords) {
    for (const city of cities) {
      entries.push({ url: `${BASE}/${kw.slug}/${city.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
    }
  }

  // 4. Keyword + city + town (only keywords marked include_in_sitemap_towns)
  for (const kw of townKeywords) {
    for (const town of towns) {
      entries.push({
        url: `${BASE}/${kw.slug}/${town.city.slug}/${town.slug}`,
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

  // 8. Keyword + route pages
  for (const kw of activeKeywords) {
    for (const route of routes) {
      entries.push({ url: `${BASE}/${kw.slug}/${route.slug}`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 });
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
