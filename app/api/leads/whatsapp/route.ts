import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { normalizePhone } from "@/lib/utils";
import { vendorUrl } from "@/lib/vendor/url";

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
  let itemTitle: string = "";       // car title (listing) OR business name
  let itemCity: string = "";        // city for context
  let businessName: string = "";    // business name (for salutation)
  let businessSlug: string = "";    // for "claim your listing" link
  let claimStatus: string = "unclaimed";
  let resolvedListingId: string | null = listing_id ?? null;

  if (listing_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing } = await (db as any)
      .from("listings")
      .select("id, title, city, business:business_id(name, slug, claim_status, whatsapp_phone, phone, owner_user_id)")
      .eq("id", listing_id)
      .single();

    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    const biz = listing.business as {
      name: string;
      slug: string;
      claim_status: string;
      whatsapp_phone: string | null;
      phone: string | null;
      owner_user_id: string | null;
    } | null;

    vendorPhone = biz?.whatsapp_phone ?? biz?.phone ?? null;
    ownerId = biz?.owner_user_id ?? null;
    itemTitle = listing.title;
    itemCity = listing.city;
    businessName = biz?.name ?? "";
    businessSlug = biz?.slug ?? "";
    claimStatus = biz?.claim_status ?? "unclaimed";
  } else if (business_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: biz } = await (db as any)
      .from("businesses")
      .select("name, slug, city, claim_status, whatsapp_phone, phone, owner_user_id")
      .eq("id", business_id)
      .single();

    if (!biz) return NextResponse.json({ error: "Business not found" }, { status: 404 });

    vendorPhone = biz.whatsapp_phone ?? biz.phone ?? null;
    ownerId = biz.owner_user_id ?? null;
    itemTitle = biz.name;
    itemCity = biz.city;
    businessName = biz.name;
    businessSlug = biz.slug;
    claimStatus = biz.claim_status ?? "unclaimed";
  }

  if (!vendorPhone) {
    return NextResponse.json({ error: "No vendor phone number" }, { status: 404 });
  }

  const refCode = generateRefCode();
  const normalizedPhone = normalizePhone(customer_phone);

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

  // ── Build the WhatsApp message ──────────────────────────────────────
  const baseUrl = "https://www.rentnowpk.com";
  const claimUrl = businessSlug
    ? `${baseUrl}${vendorUrl({ slug: businessSlug, city: itemCity })}`
    : null;
  const claimLine = claimStatus !== "claimed" && claimUrl
    ? `\n— Sent via RentNowPK.com | Claim your listing free: ${claimUrl}`
    : `\n— Sent via RentNowPK.com`;

  let message: string;

  if (source === "city_fallback") {
    // No exact match in search — customer asking if business has anything available
    const salutation = businessName ? `Hi ${businessName},` : "Hi,";
    message =
      `${salutation}\n\n` +
      `I'm looking for a rental car in ${itemCity || "your city"} via RentNowPK.com. ` +
      `I didn't find the exact car I needed, but found your business.\n\n` +
      `Do you have any cars available for rent? Please share options and pricing.\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  } else if (listing_id && itemTitle) {
    // Specific car inquiry
    message =
      `Hi${businessName ? ` ${businessName}` : ""},\n\n` +
      `I'm interested in renting your ${itemTitle}${itemCity ? ` in ${itemCity}` : ""} — ` +
      `found on RentNowPK.com.\n\n` +
      `Is it available? Please share pricing and availability.\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  } else {
    // General business inquiry (from vendor profile hero)
    const salutation = businessName ? `Hi ${businessName},` : "Hi,";
    message =
      `${salutation}\n\n` +
      `I found your business on RentNowPK.com and I'm interested in renting a car` +
      `${itemCity ? ` in ${itemCity}` : ""}.\n\n` +
      `Could you share available vehicles and pricing for my trip?\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  }

  const digits = vendorPhone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(message);
  const waUrl = `https://wa.me/${digits}?text=${text}`;

  return NextResponse.json({ url: waUrl, ref_code: refCode });
}

/**
 * Legacy GET — direct redirect without lead capture.
 * Kept for backwards compatibility with old indexed URLs.
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
