import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { normalizePhone } from "@/lib/utils";

/** Generate a short human-readable ref code like "RN-7X3K" */
function generateRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RN-${code}`;
}

/**
 * POST /api/leads/whatsapp
 *
 * Accepts customer contact info, records a verified lead, and returns the
 * WhatsApp redirect URL. The customer already provided their name + phone
 * before reaching this endpoint, so the lead is high-intent.
 */
export async function POST(req: NextRequest) {
  let body: {
    listing_id?: string;
    business_id?: string;
    customer_name?: string;
    customer_phone?: string;
    source?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { listing_id, business_id, customer_name, customer_phone, source = "unknown" } = body;

  if ((!listing_id && !business_id) || !customer_name?.trim() || !customer_phone?.trim()) {
    return NextResponse.json(
      { error: "listing_id or business_id, customer_name, and customer_phone are required" },
      { status: 400 },
    );
  }

  const db = createAdminClient();

  let vendorPhone: string | null = null;
  let ownerId: string | null = null;
  let itemTitle: string = "";
  let itemCity: string = "";
  let resolvedListingId: string | null = listing_id ?? null;

  if (listing_id) {
    // Fetch listing + business phone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing } = await (db as any)
      .from("listings")
      .select("id, title, city, business:business_id(whatsapp_phone, phone, owner_user_id)")
      .eq("id", listing_id)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const biz = listing.business as {
      whatsapp_phone: string | null;
      phone: string | null;
      owner_user_id: string | null;
    } | null;

    vendorPhone = biz?.whatsapp_phone ?? biz?.phone ?? null;
    ownerId = biz?.owner_user_id ?? null;
    itemTitle = listing.title;
    itemCity = listing.city;
  } else if (business_id) {
    // Direct business inquiry (vendor profile page)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: biz } = await (db as any)
      .from("businesses")
      .select("name, city, whatsapp_phone, phone, owner_user_id")
      .eq("id", business_id)
      .single();

    if (!biz) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    vendorPhone = biz.whatsapp_phone ?? biz.phone ?? null;
    ownerId = biz.owner_user_id ?? null;
    itemTitle = biz.name;
    itemCity = biz.city;
  }

  if (!vendorPhone) {
    return NextResponse.json({ error: "No vendor phone number" }, { status: 404 });
  }

  const refCode = generateRefCode();
  const normalizedPhone = normalizePhone(customer_phone);

  // Insert verified lead
  if (ownerId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("leads").insert({
      listing_id: resolvedListingId,
      vendor_user_id: ownerId,
      channel: "whatsapp",
      source,
      customer_name: customer_name.trim(),
      customer_phone: normalizedPhone,
      ref_code: refCode,
    });

    void createNotification(
      ownerId,
      "new_lead",
      `New lead: ${customer_name.trim()}`,
      `${customer_name.trim()} (${normalizedPhone}) is interested in "${itemTitle}"`,
      "/vendor/leads",
    );
  }

  // Build WhatsApp URL with ref code in message
  const digits = vendorPhone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(
    `Hi! I'm interested in renting from ${itemTitle}${itemCity ? ` (${itemCity})` : ""}. Ref: ${refCode}`,
  );
  const waUrl = `https://wa.me/${digits}?text=${text}`;

  return NextResponse.json({ url: waUrl, ref_code: refCode });
}

/**
 * Legacy GET still works for backward compatibility (direct redirect).
 * Will be removed once all buttons use the modal flow.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const listingId = searchParams.get("listing");
  const source = searchParams.get("source") ?? "unknown";

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing" }, { status: 400 });
  }

  const db = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  if (business?.owner_user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("leads").insert({
      listing_id: listingId,
      vendor_user_id: business.owner_user_id,
      channel: "whatsapp",
      source,
    });

    void createNotification(
      business.owner_user_id,
      "new_lead",
      "New WhatsApp lead",
      `Someone contacted you about "${listing.title}"`,
      "/vendor/leads",
    );
  }

  if (!phone) {
    return NextResponse.json({ error: "No phone number" }, { status: 404 });
  }

  const digits = phone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(
    `Hi! I'm interested in renting your ${listing.title} (${listing.city}). Please share availability and pricing. Thank you!`,
  );

  return NextResponse.redirect(`https://wa.me/${digits}?text=${text}`);
}
