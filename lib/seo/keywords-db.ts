import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SeoTemplate } from "./routes-config";

export interface DbKeyword {
  id: string;
  slug: string;
  label: string;
  include_in_sitemap_towns: boolean;
  template_overrides: {
    city?: SeoTemplate;
    town?: SeoTemplate;
    category?: SeoTemplate;
    model?: SeoTemplate;
    route?: SeoTemplate;
  } | null;
  is_active: boolean;
  sort_order: number;
}

const db = () => createAdminClient();

/** Fetch all active keywords (sorted) */
export const getAllKeywords = cache(async (): Promise<DbKeyword[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (db() as any)
    .from("seo_keywords")
    .select("id, slug, label, include_in_sitemap_towns, template_overrides, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []) as DbKeyword[];
});

/** Fetch ALL keywords including inactive (for admin) */
export const getAllKeywordsAdmin = cache(async (): Promise<DbKeyword[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (db() as any)
    .from("seo_keywords")
    .select("id, slug, label, include_in_sitemap_towns, template_overrides, is_active, sort_order, created_at")
    .order("sort_order");
  return (data ?? []) as DbKeyword[];
});

/** Fetch a single keyword by slug (only if active) */
export const getKeywordBySlug = cache(async (slug: string): Promise<DbKeyword | null> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (db() as any)
    .from("seo_keywords")
    .select("id, slug, label, include_in_sitemap_towns, template_overrides, is_active, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as DbKeyword | null;
});

/** Quick check: is this slug a valid keyword? */
export const isKeywordSlug = cache(async (slug: string): Promise<boolean> => {
  const kw = await getKeywordBySlug(slug);
  return !!kw;
});

/** Keyword slugs that should generate keyword+city+town URLs in sitemap */
export const getTownKeywordSlugs = cache(async (): Promise<string[]> => {
  const keywords = await getAllKeywords();
  return keywords.filter((k) => k.include_in_sitemap_towns).map((k) => k.slug);
});
