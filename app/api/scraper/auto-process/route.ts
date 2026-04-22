import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { importScrapedBusiness } from "@/lib/scraper/import-pipeline";

/**
 * POST /api/scraper/auto-process
 *
 * Auto-publishes pending scraped businesses with ≥ minImages photos, deletes rest.
 * Called by the Python scraper worker after every job completes, and can also be
 * hit manually to process existing pending rows.
 *
 * Auth: shared bearer token via SCRAPER_WEBHOOK_SECRET env var (must match on
 * worker side). This endpoint does not use user session auth since the worker
 * is a server-to-server caller.
 *
 * Body (optional):
 *   { cityName?: string; minImages?: number; jobId?: string }
 *   - cityName filters to a single city
 *   - jobId filters to rows from that job
 *   - both can be combined (AND)
 */
export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const expected = process.env.SCRAPER_WEBHOOK_SECRET;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    cityName?: string;
    minImages?: number;
    jobId?: string;
    /** Skip the (slow) import pass — only delete the <minImages rows */
    deleteOnly?: boolean;
    /** Cap number of imports this call performs (import pass is the slow one) */
    maxImports?: number;
  } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const minImages = body.minImages ?? 5;
  const maxImports = body.maxImports ?? 200;
  const admin = createAdminClient();

  // Paginate the scan — Supabase caps each response at 1000 rows
  const PAGE = 1000;
  const passIds: string[] = [];
  const failIds: string[] = [];
  let scanned = 0;
  let offset = 0;

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (admin as any)
      .from("scraped_businesses")
      .select("id, image_urls")
      .eq("status", "pending")
      .order("scraped_at", { ascending: true })
      .range(offset, offset + PAGE - 1);
    if (body.cityName?.trim()) q = q.ilike("city_name", `%${body.cityName.trim()}%`);
    if (body.jobId) q = q.eq("job_id", body.jobId);

    const { data: rows, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!rows || rows.length === 0) break;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const r of rows as any[]) {
      const count = Array.isArray(r.image_urls) ? r.image_urls.length : 0;
      if (count >= minImages) passIds.push(r.id);
      else failIds.push(r.id);
    }
    scanned += rows.length;
    if (rows.length < PAGE) break;
    offset += PAGE;
  }

  // Import passers sequentially (each does ~7 Supabase round-trips).
  // Capped per call so a single HTTP request returns in reasonable time.
  let imported = 0;
  let failed = 0;
  const toImport = body.deleteOnly ? [] : passIds.slice(0, maxImports);
  for (const id of toImport) {
    try {
      const res = await importScrapedBusiness(id);
      if (res.error) failed++;
      else imported++;
    } catch {
      failed++;
    }
  }
  const importRemaining = body.deleteOnly
    ? passIds.length
    : Math.max(0, passIds.length - toImport.length);

  // Delete in chunks — .in() URL can't hold thousands of UUIDs at once
  let deleted = 0;
  const deleteErrors: string[] = [];
  const CHUNK = 200;
  for (let i = 0; i < failIds.length; i += CHUNK) {
    const slice = failIds.slice(i, i + CHUNK);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: delErr, count } = await (admin as any)
      .from("scraped_businesses")
      .delete({ count: "exact" })
      .in("id", slice);
    if (delErr) {
      deleteErrors.push(delErr.message);
    } else {
      deleted += count ?? slice.length;
    }
  }

  return NextResponse.json({
    imported,
    deleted,
    failed,
    minImages,
    scanned,
    passEligible: passIds.length,
    failEligible: failIds.length,
    importRemaining,
    deleteErrors: deleteErrors.length > 0 ? deleteErrors : undefined,
  });
}
