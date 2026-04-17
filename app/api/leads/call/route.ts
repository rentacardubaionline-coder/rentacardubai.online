import { NextResponse } from "next/server";

/**
 * Call lead tracking has been removed.
 * All leads now go through the WhatsApp modal flow.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Call tracking is no longer available. Use WhatsApp." },
    { status: 410 },
  );
}
