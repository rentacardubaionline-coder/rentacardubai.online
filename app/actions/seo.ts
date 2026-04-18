"use server";

import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateSeoPages } from "@/lib/seo/revalidate";

// ── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ══════════════════════════════════════════════════════════════════
// KEYWORDS
// ══════════════════════════════════════════════════════════════════

const seoTemplateSchema = z.object({
  h1: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const keywordInputSchema = z.object({
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  label: z.string().trim().min(2).max(120),
  is_active: z.boolean().default(true),
  include_in_sitemap_towns: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  template_overrides: z
    .object({
      city: seoTemplateSchema.optional(),
      model: seoTemplateSchema.optional(),
      route: seoTemplateSchema.optional(),
    })
    .nullable()
    .optional(),
});

export type KeywordInput = z.infer<typeof keywordInputSchema>;

export async function createKeywordAction(input: KeywordInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = keywordInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("seo_keywords").insert({
    slug: parsed.data.slug,
    label: parsed.data.label,
    is_active: parsed.data.is_active,
    include_in_sitemap_towns: parsed.data.include_in_sitemap_towns,
    sort_order: parsed.data.sort_order,
    template_overrides: parsed.data.template_overrides ?? null,
  });
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function updateKeywordAction(id: string, input: KeywordInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = keywordInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("seo_keywords")
    .update({
      slug: parsed.data.slug,
      label: parsed.data.label,
      is_active: parsed.data.is_active,
      include_in_sitemap_towns: parsed.data.include_in_sitemap_towns,
      sort_order: parsed.data.sort_order,
      template_overrides: parsed.data.template_overrides ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function deleteKeywordAction(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("seo_keywords").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidateSeoPages();
  return {};
}

// ══════════════════════════════════════════════════════════════════
// CITIES
// ══════════════════════════════════════════════════════════════════

const cityInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  province: z.string().trim().max(50).nullable().optional(),
  is_active: z.boolean().default(true),
});

export type CityInput = z.infer<typeof cityInputSchema>;

export async function createCityAction(input: CityInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = cityInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("cities").insert({
    name: parsed.data.name,
    slug,
    province: parsed.data.province ?? null,
    is_active: parsed.data.is_active,
  });
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function updateCityAction(id: string, input: CityInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = cityInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("cities")
    .update({
      name: parsed.data.name,
      slug,
      province: parsed.data.province ?? null,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function deleteCityAction(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("cities").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidateSeoPages();
  return {};
}

// ══════════════════════════════════════════════════════════════════
// TOWNS
// ══════════════════════════════════════════════════════════════════

const townInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  city_id: z.string().uuid(),
  is_active: z.boolean().default(true),
});

export type TownInput = z.infer<typeof townInputSchema>;

export async function createTownAction(input: TownInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = townInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("towns").insert({
    name: parsed.data.name,
    slug,
    city_id: parsed.data.city_id,
    is_active: parsed.data.is_active,
  });
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function updateTownAction(id: string, input: TownInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = townInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("towns")
    .update({
      name: parsed.data.name,
      slug,
      city_id: parsed.data.city_id,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function deleteTownAction(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("towns").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidateSeoPages();
  return {};
}

// ══════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════

const routeInputSchema = z.object({
  origin_city_id: z.string().uuid(),
  destination_city_id: z.string().uuid(),
  distance_km: z.coerce.number().int().positive().nullable().optional(),
  estimated_time: z.string().trim().max(60).nullable().optional(),
  is_active: z.boolean().default(true),
});

export type RouteInput = z.infer<typeof routeInputSchema>;

async function buildRouteSlug(originId: string, destId: string): Promise<string | null> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from("cities")
    .select("id, slug")
    .in("id", [originId, destId]);
  const cities = (data ?? []) as { id: string; slug: string }[];
  const origin = cities.find((c) => c.id === originId);
  const dest = cities.find((c) => c.id === destId);
  if (!origin || !dest) return null;
  return `${origin.slug}-to-${dest.slug}`;
}

export async function createRouteAction(input: RouteInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = routeInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (parsed.data.origin_city_id === parsed.data.destination_city_id) {
    return { error: "Origin and destination must be different cities" };
  }

  const slug = await buildRouteSlug(parsed.data.origin_city_id, parsed.data.destination_city_id);
  if (!slug) return { error: "Origin or destination city not found" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("routes").insert({
    slug,
    origin_city_id: parsed.data.origin_city_id,
    destination_city_id: parsed.data.destination_city_id,
    distance_km: parsed.data.distance_km ?? null,
    estimated_time: parsed.data.estimated_time ?? null,
    is_active: parsed.data.is_active,
  });
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function updateRouteAction(id: string, input: RouteInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = routeInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (parsed.data.origin_city_id === parsed.data.destination_city_id) {
    return { error: "Origin and destination must be different cities" };
  }

  const slug = await buildRouteSlug(parsed.data.origin_city_id, parsed.data.destination_city_id);
  if (!slug) return { error: "Origin or destination city not found" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("routes")
    .update({
      slug,
      origin_city_id: parsed.data.origin_city_id,
      destination_city_id: parsed.data.destination_city_id,
      distance_km: parsed.data.distance_km ?? null,
      estimated_time: parsed.data.estimated_time ?? null,
      is_active: parsed.data.is_active,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function deleteRouteAction(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("routes").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidateSeoPages();
  return {};
}

// ══════════════════════════════════════════════════════════════════
// VEHICLE CATEGORIES
// ══════════════════════════════════════════════════════════════════

const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export async function createCategoryAction(input: CategoryInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("vehicle_categories").insert({
    name: parsed.data.name,
    slug,
  });
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function updateCategoryAction(id: string, input: CategoryInput): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  const slug = parsed.data.slug || toSlug(parsed.data.name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("vehicle_categories")
    .update({ name: parsed.data.name, slug })
    .eq("id", id);
  if (error) return { error: error.message };

  await revalidateSeoPages();
  return {};
}

export async function deleteCategoryAction(id: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("vehicle_categories").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidateSeoPages();
  return {};
}
