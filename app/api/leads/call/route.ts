import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const listingId = searchParams.get("listing");
  const source = searchParams.get("source") ?? "unknown";

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing" }, { status: 400 });
  }

  const db = createAdminClient();

  // Fetch listing + business phone
  const { data: listing } = await (db as any)
    .from("listings")
    .select("id, title, business:business_id(phone, owner_user_id)")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const business = listing.business as {
    phone: string | null;
    owner_user_id: string | null;
  } | null;

  const phone = business?.phone ?? null;

  // Log the lead
  if (business?.owner_user_id) {
    await db.from("leads").insert({
      listing_id: listingId,
      vendor_user_id: business.owner_user_id,
      channel: "call",
      source,
    });
  }

  if (!phone) {
    return NextResponse.json({ error: "No phone number" }, { status: 404 });
  }

  return NextResponse.redirect(`tel:${phone}`);
}
