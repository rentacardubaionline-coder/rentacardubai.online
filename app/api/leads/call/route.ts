import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("leads").insert({
      listing_id: listingId,
      vendor_user_id: business.owner_user_id,
      channel: "call",
      source,
    });

    // In-app notification for vendor
    void createNotification(
      business.owner_user_id,
      "new_lead",
      "New call lead",
      `Someone called about "${listing.title}"`,
      "/vendor/leads"
    );
  }

  if (!phone) {
    return NextResponse.json({ error: "No phone number" }, { status: 404 });
  }

  return NextResponse.redirect(`tel:${phone}`);
}
