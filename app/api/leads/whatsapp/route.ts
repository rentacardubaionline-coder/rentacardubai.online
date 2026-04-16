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

  // Fetch listing + business phone in one query
  const { data: listing } = await (db as any)
    .from("listings")
    .select("id, title, city, business:business_id(whatsapp_phone, phone, owner_user_id)")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const business = listing.business as {
    whatsapp_phone: string | null;
    phone: string | null;
    owner_user_id: string | null;
  } | null;

  const phone = business?.whatsapp_phone ?? business?.phone ?? null;

  // Log the lead (fire-and-forget — don't block the redirect on errors)
  if (business?.owner_user_id) {
    await db.from("leads").insert({
      listing_id: listingId,
      vendor_user_id: business.owner_user_id,
      channel: "whatsapp",
      source,
    });
  }

  // Build prefilled WhatsApp URL
  if (!phone) {
    return NextResponse.json({ error: "No phone number" }, { status: 404 });
  }

  const digits = phone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(
    `Hi! I'm interested in renting your ${listing.title} (${listing.city}). Please share availability and pricing. Thank you!`
  );
  const waUrl = `https://wa.me/${digits}?text=${text}`;

  return NextResponse.redirect(waUrl);
}
