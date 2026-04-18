"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { importScrapedBusiness } from "@/lib/scraper/import-pipeline";

// ══════════════════════════════════════════════════════════════════
// JOB CONTROL
// ══════════════════════════════════════════════════════════════════

const startScrapeInputSchema = z.object({
  cityIds: z.array(z.string().uuid()).optional(),
  allCities: z.boolean().default(false),
  category: z.string().trim().min(2).max(80).default("Car rental"),
});

export async function createScrapeJobsAction(
  input: z.infer<typeof startScrapeInputSchema>,
): Promise<{ error?: string; createdCount?: number }> {
  const profile = await requireRole("admin");
  const parsed = startScrapeInputSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();

  // Resolve city list
  let cities: { id: string; name: string; slug: string }[] = [];
  if (parsed.data.allCities) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from("cities")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");
    cities = data || [];
  } else if (parsed.data.cityIds && parsed.data.cityIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from("cities")
      .select("id, name, slug")
      .in("id", parsed.data.cityIds);
    cities = data || [];
  } else {
    return { error: "Provide cityIds or allCities=true" };
  }

  if (cities.length === 0) return { error: "No matching cities found" };

  // Insert job rows
  const rows = cities.map((c) => ({
    city_id: c.id,
    city_name: c.name,
    city_slug: c.slug,
    category: parsed.data.category,
    status: "pending",
    created_by: profile.id,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insertedJobs, error: insertErr } = await (admin as any)
    .from("scrape_jobs")
    .insert(rows)
    .select("id");

  if (insertErr) return { error: insertErr.message };

  // Jobs are queued — the worker (running on Render or locally) will pick them up.
  // No dispatch needed — worker polls every 30s.

  revalidatePath("/admin/scraper/jobs");
  return { createdCount: (insertedJobs as unknown[])?.length ?? 0 };
}

export async function cancelScrapeJobAction(jobId: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("scrape_jobs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", jobId)
    .in("status", ["pending", "running"]);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/jobs");
  return {};
}

export async function deleteScrapeJobAction(jobId: string): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("scrape_jobs").delete().eq("id", jobId);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/jobs");
  return {};
}

// ══════════════════════════════════════════════════════════════════
// SCRAPED BUSINESS REVIEW
// ══════════════════════════════════════════════════════════════════

export async function approveScrapedBusinessAction(
  scrapedId: string,
): Promise<{ error?: string; businessId?: string }> {
  await requireRole("admin");
  const res = await importScrapedBusiness(scrapedId);
  revalidatePath("/admin/scraper/review");
  revalidatePath("/admin/scraper/imported");
  return res;
}

export async function bulkApproveScrapedAction(
  scrapedIds: string[],
): Promise<{ error?: string; imported: number; failed: number }> {
  await requireRole("admin");
  let imported = 0;
  let failed = 0;
  for (const id of scrapedIds) {
    try {
      const res = await importScrapedBusiness(id);
      if (res.error) failed++;
      else imported++;
    } catch {
      failed++;
    }
  }
  revalidatePath("/admin/scraper/review");
  revalidatePath("/admin/scraper/imported");
  return { imported, failed };
}

export async function rejectScrapedBusinessAction(
  scrapedId: string,
  reason?: string,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("scraped_businesses")
    .update({ status: "rejected", rejection_reason: reason ?? null })
    .eq("id", scrapedId);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/review");
  return {};
}

export async function bulkRejectScrapedAction(
  scrapedIds: string[],
  reason?: string,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("scraped_businesses")
    .update({ status: "rejected", rejection_reason: reason ?? null })
    .in("id", scrapedIds);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/review");
  return {};
}

export async function deleteScrapedBusinessAction(
  scrapedId: string,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("scraped_businesses")
    .delete()
    .eq("id", scrapedId);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/review");
  return {};
}

const scrapedUpdateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  normalised_phone: z.string().trim().max(40).nullable().optional(),
  website: z.string().trim().url().max(200).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  matched_city_id: z.string().uuid().nullable().optional(),
  image_urls: z.array(z.string().url()).max(5).optional(),
});

export async function updateScrapedBusinessAction(
  scrapedId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: any,
): Promise<{ error?: string }> {
  await requireRole("admin");
  const parsed = scrapedUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("scraped_businesses")
    .update(parsed.data)
    .eq("id", scrapedId);
  if (error) return { error: error.message };
  revalidatePath("/admin/scraper/review");
  return {};
}
