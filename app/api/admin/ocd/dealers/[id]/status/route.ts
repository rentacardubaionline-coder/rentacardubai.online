import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { updateDealerStatus } from "@/lib/ocd/import-pipeline";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: dealerId } = await params;
  const body = await req.json().catch(() => ({}));
  const { status, notes, outreach_email } = body;

  const validStatuses = ["contacted", "agreed", "rejected"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Save outreach email separately if provided
  if (outreach_email) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const db = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any)
      .from("ocd_scraped_dealers")
      .update({ outreach_email })
      .eq("id", dealerId);
  }

  const result = await updateDealerStatus(dealerId, status, notes);
  if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true });
}
