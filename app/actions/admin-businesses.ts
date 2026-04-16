"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";
import { slugify } from "@/lib/utils";

export interface BusinessInput {
  name: string;
  category?: string;
  city: string;
  phone?: string;
  whatsapp_phone?: string;
  email?: string;
  website_url?: string;
  address_line?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  image_urls?: string[];
  rating?: number;
  established_year?: number;
  google_maps_url?: string;
  reviews?: { reviewer_name: string; rating: number; comment?: string }[];
}

export interface CsvRow {
  name: string;
  category?: string;
  city: string;
  phone?: string;
  whatsapp_phone?: string;
  email?: string;
  website_url?: string;
  address_line?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  image_1_url?: string;
  image_2_url?: string;
  image_3_url?: string;
  image_4_url?: string;
  image_5_url?: string;
  image_6_url?: string;
  rating?: string;
  established_year?: string;
  google_maps_url?: string;
}

function makeSlug(name: string): string {
  return `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createBusinessAdminAction(
  data: BusinessInput
): Promise<{ error?: string; id?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const slug = makeSlug(data.name);
  const rating = data.rating ?? 4.0;

  const { data: biz, error } = await (db as any)
    .from("businesses")
    .insert({
      name: data.name.trim(),
      slug,
      category: data.category?.trim() || null,
      city: data.city,
      phone: data.phone?.trim() || null,
      whatsapp_phone: data.whatsapp_phone?.trim() || null,
      email: data.email?.trim() || null,
      website_url: data.website_url?.trim() || null,
      address_line: data.address_line?.trim() || null,
      description: data.description?.trim() || null,
      logo_url: data.logo_url?.trim() || null,
      cover_url: data.cover_url?.trim() || null,
      google_maps_url: data.google_maps_url?.trim() || null,
      established_year: data.established_year || null,
      rating,
      reviews_count: data.reviews?.length ?? 0,
      claim_status: "unclaimed",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const bizId = biz.id as string;

  // Insert grid images
  const imageUrls = (data.image_urls ?? []).filter(Boolean);
  if (imageUrls.length > 0) {
    await (db as any).from("business_images").insert(
      imageUrls.map((url, i) => ({
        business_id: bizId,
        url,
        sort_order: i,
        is_primary: i === 0,
      }))
    );
  }

  // Insert reviews and recompute rating
  const reviews = data.reviews?.filter((r) => r.reviewer_name?.trim()) ?? [];
  if (reviews.length > 0) {
    await (db as any).from("business_reviews").insert(
      reviews.map((r) => ({
        business_id: bizId,
        reviewer_name: r.reviewer_name.trim(),
        rating: r.rating,
        comment: r.comment?.trim() || null,
      }))
    );

    // Recompute average rating
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await (db as any)
      .from("businesses")
      .update({ rating: parseFloat(avg.toFixed(1)), reviews_count: reviews.length })
      .eq("id", bizId);
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/admin");
  return { id: bizId };
}

export async function importBusinessesCSVAction(
  rows: CsvRow[]
): Promise<{ created: number; errors: string[] }> {
  await requireRole("admin");
  const db = createAdminClient();

  let created = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.name?.trim() || !row.city?.trim()) {
      errors.push(`Row skipped: missing name or city (name="${row.name}")`);
      continue;
    }

    const slug = makeSlug(row.name);
    const rating = row.rating ? parseFloat(row.rating) : 4.0;
    const estYear = row.established_year ? parseInt(row.established_year) : null;

    const { data: biz, error } = await (db as any)
      .from("businesses")
      .insert({
        name: row.name.trim(),
        slug,
        category: row.category?.trim() || null,
        city: row.city.trim(),
        phone: row.phone?.trim() || null,
        whatsapp_phone: row.whatsapp_phone?.trim() || null,
        email: row.email?.trim() || null,
        website_url: row.website_url?.trim() || null,
        address_line: row.address_line?.trim() || null,
        description: row.description?.trim() || null,
        logo_url: row.logo_url?.trim() || null,
        cover_url: row.cover_url?.trim() || null,
        google_maps_url: row.google_maps_url?.trim() || null,
        established_year: estYear,
        rating: isNaN(rating) ? 4.0 : rating,
        reviews_count: 0,
        claim_status: "unclaimed",
      })
      .select("id")
      .single();

    if (error) {
      errors.push(`"${row.name}": ${error.message}`);
      continue;
    }

    // Insert grid images
    const imageUrls = [
      row.image_1_url, row.image_2_url, row.image_3_url,
      row.image_4_url, row.image_5_url, row.image_6_url,
    ].filter(Boolean) as string[];

    if (imageUrls.length > 0) {
      await (db as any).from("business_images").insert(
        imageUrls.map((url, i) => ({
          business_id: biz.id,
          url,
          sort_order: i,
          is_primary: i === 0,
        }))
      );
    }

    created++;
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/admin");
  return { created, errors };
}

export async function deleteBusinessAction(
  id: string
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const { error } = await db.from("businesses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/businesses");
  revalidatePath("/admin");
  return {};
}

export async function approveBusinessAction(
  id: string
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  // Approve the business itself
  const { error } = await (db as any)
    .from("businesses")
    .update({ claim_status: "claimed" })
    .eq("id", id);
  if (error) return { error: error.message };

  // Also approve any matching pending business_claim record
  await (db as any)
    .from("business_claims")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("business_id", id)
    .eq("status", "pending");

  revalidatePath("/admin/businesses");
  revalidatePath("/admin/claims");
  revalidatePath("/admin");
  return {};
}

export async function rejectBusinessAction(
  id: string
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const { error } = await (db as any)
    .from("businesses")
    .update({ claim_status: "unclaimed" })
    .eq("id", id);
  if (error) return { error: error.message };

  // Also reject any pending claim record
  await (db as any)
    .from("business_claims")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("business_id", id)
    .eq("status", "pending");

  revalidatePath("/admin/businesses");
  revalidatePath("/admin/claims");
  revalidatePath("/admin");
  return {};
}
