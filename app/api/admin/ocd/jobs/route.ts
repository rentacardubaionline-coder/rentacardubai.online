import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

// POST — create a new scrape job
export async function POST(req: NextRequest) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await requireRole("admin");
  const body = await req.json().catch(() => ({}));
  const sourceCity = (body.source_city as string) || "dubai";
  const sourceCityUrls: Record<string, string> = {
    dubai: "https://www.oneclickdrive.com/rent-a-car-dubai",
    "abu-dhabi": "https://www.oneclickdrive.com/rent-a-car-abu-dhabi",
    sharjah: "https://www.oneclickdrive.com/rent-a-car-sharjah",
  };

  const db = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any)
    .from("ocd_scrape_jobs")
    .insert({
      source: "oneclickdrive",
      source_city: sourceCity,
      source_url: sourceCityUrls[sourceCity] ?? sourceCityUrls.dubai,
      status: "pending",
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ jobId: data.id });
}

// GET — list all jobs
export async function GET() {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any)
    .from("ocd_scrape_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ jobs: data });
}
