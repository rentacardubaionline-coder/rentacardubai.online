import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/guards";
import { activateOCDDealer } from "@/lib/ocd/import-pipeline";

export async function POST(
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
  const outreachEmail = body.email as string;

  if (!outreachEmail || !outreachEmail.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const result = await activateOCDDealer(dealerId, outreachEmail);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ businessId: result.businessId, userId: result.userId });
}
