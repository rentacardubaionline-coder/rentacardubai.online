import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";
import { normalizePhoneStrict } from "@/lib/utils";
import { vendorUrl } from "@/lib/vendor/url";
import { getPricingTiers, resolveTierForListing, type TierCode } from "@/lib/pricing/tiers";

/** Window for treating a repeat submission as a duplicate of the prior lead. */
const DEDUPE_WINDOW_SECONDS = 60;

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

  // Holds the tier/amount we'll write to the lead row. Resolved below from
  // the listing body_type when available, falling back to "sedan".
  let tierCode: TierCode = "sedan";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tierListing: any = null;

  if (listing_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listing } = await (db as any)
      .from("listings")
      .select("id, title, city, tier_code, model:model_id(body_type), business:business_id(name, slug, claim_status, whatsapp_phone, phone, owner_user_id)")
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
    tierListing = listing;
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

  // Validate vendor phone — if it can't normalize to E.164 PK, treat as missing
  // (we'd otherwise hand a broken wa.me link to the customer).
  const vendorPhoneNormalized = normalizePhoneStrict(vendorPhone);
  if (!vendorPhoneNormalized) {
    return NextResponse.json(
      { error: "Vendor's WhatsApp number is unavailable — please try a different vendor" },
      { status: 404 },
    );
  }

  // Validate customer phone — reject hard if it doesn't match a PK mobile.
  const normalizedPhone = normalizePhoneStrict(customer_phone);
  if (!normalizedPhone) {
    return NextResponse.json(
      {
        error:
          "Please enter a valid UAE mobile number (e.g. 0501234567 or +971501234567).",

      },
      { status: 400 },
    );
  }

  // Dedupe: if the same customer phoned the same listing/business in the last
  // DEDUPE_WINDOW_SECONDS, return the prior ref code instead of writing a new
  // row. Catches accidental double-submits and rapid-click abuse.
  const dedupeSince = new Date(Date.now() - DEDUPE_WINDOW_SECONDS * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dedupeQuery = (db as any)
    .from("leads")
    .select("ref_code")
    .eq("customer_phone", normalizedPhone)
    .gte("created_at", dedupeSince)
    .order("created_at", { ascending: false })
    .limit(1);

  if (resolvedListingId) {
    dedupeQuery.eq("listing_id", resolvedListingId);
  } else if (business_id) {
    // Business-level leads write listing_id=null but tie to the vendor by
    // vendor_user_id. Match on owner instead.
    dedupeQuery.is("listing_id", null).eq("vendor_user_id", ownerId);
  }

  const { data: existingLead } = await dedupeQuery.maybeSingle();

  let refCode: string = existingLead?.ref_code ?? generateRefCode();
  const isDuplicate = Boolean(existingLead?.ref_code);

  if (ownerId && !isDuplicate) {
    // Resolve tier + price from pricing config
    if (tierListing) {
      tierCode = resolveTierForListing({
        tier_code: tierListing.tier_code ?? null,
        model: tierListing.model ?? null,
        title: tierListing.title ?? null,
      });
    }
    const pricingTiers = await getPricingTiers();
    const tierRow = pricingTiers.find((t) => t.code === tierCode);
    const billedAmount = tierRow?.price_pkr ?? 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (db as any).from("leads").insert({
      listing_id: resolvedListingId,
      vendor_user_id: ownerId,
      channel: "whatsapp",
      source,
      customer_name: customer_name.trim(),
      customer_phone: normalizedPhone,
      ref_code: refCode,
      tier_code: tierCode,
      billed_amount_pkr: billedAmount,
    });

    if (insertError) {
      console.error("[leads/whatsapp] insert failed", insertError);
      return NextResponse.json(
        { error: "Could not record your enquiry. Please try again." },
        { status: 500 },
      );
    }

    // createNotification fans out to both the in-app bell AND push.
    void createNotification(
      ownerId,
      "new_lead",
      `New lead · ${customer_name.trim()}`,
      `${itemTitle}${itemCity ? ` · ${itemCity}` : ""} · ${normalizedPhone}`,
      "/vendor/leads",
    );
  }

  // ── Build the WhatsApp message ──────────────────────────────────────
  const baseUrl = "https://www.rentacardubai.online";


  const claimUrl = businessSlug
    ? `${baseUrl}${vendorUrl({ slug: businessSlug, city: itemCity })}`
    : null;
  const claimLine = claimStatus !== "claimed" && claimUrl
    ? `\n— Sent via rentacardubai.online | Claim your listing free: ${claimUrl}`
    : `\n— Sent via rentacardubai.online`;



  let message: string;

  if (source === "city_fallback") {
    // No exact match in search — customer asking if business has anything available
    const salutation = businessName ? `Hi ${businessName},` : "Hi,";
    message =
      `${salutation}\n\n` +
      `I'm looking for a rental car in ${itemCity || "your city"} via rentacardubai.online. ` +


      `I didn't find the exact car I needed, but found your business.\n\n` +
      `Do you have any cars available for rent? Please share options and pricing.\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  } else if (listing_id && itemTitle) {
    // Specific car inquiry
    message =
      `Hi${businessName ? ` ${businessName}` : ""},\n\n` +
      `I'm interested in renting your ${itemTitle}${itemCity ? ` in ${itemCity}` : ""} — ` +
      `found on rentacardubai.online.\n\n` +


      `Is it available? Please share pricing and availability.\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  } else {
    // General business inquiry (from vendor profile hero)
    const salutation = businessName ? `Hi ${businessName},` : "Hi,";
    message =
      `${salutation}\n\n` +
      `I found your business on rentacardubai.online and I'm interested in renting a car` +


      `${itemCity ? ` in ${itemCity}` : ""}.\n\n` +
      `Could you share available vehicles and pricing for my trip?\n\n` +
      `Ref: ${refCode}` +
      claimLine;
  }

  const digits = vendorPhoneNormalized.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  const waUrl = `https://wa.me/${digits}?text=${text}`;

  return NextResponse.json({ url: waUrl, ref_code: refCode, deduped: isDuplicate });
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
  const phoneNormalized = normalizePhoneStrict(phone);

  if (!phoneNormalized) {
    return NextResponse.json(
      { error: "Vendor's WhatsApp number is unavailable" },
      { status: 404 },
    );
  }

  if (business?.owner_user_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from("leads").insert({
      listing_id: listingId,
      vendor_user_id: business.owner_user_id,
      channel: "whatsapp",
      source,
    });

    // createNotification fans out to both the in-app bell AND push.
    void createNotification(
      business.owner_user_id,
      "new_lead",
      "New WhatsApp lead",
      `Someone contacted you about "${listing.title}"`,
      "/vendor/leads",
    );
  }

  const digits = phoneNormalized.replace(/\D/g, "");
  const text = encodeURIComponent(
    `Hi! I'm interested in renting your ${listing.title} (${listing.city}). Please share availability and pricing. Thank you!`,
  );

  return NextResponse.redirect(`https://wa.me/${digits}?text=${text}`);
}
