"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { createNotificationsForAdmins } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { listingSubmittedAdmin } from "@/lib/email/templates";
import { isVendorKycApproved } from "@/lib/kyc/helpers";
import { generateListingDescription } from "@/lib/listings/description";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Verify that the given listing belongs to the current vendor. */
async function assertOwnership(listingId: string, profileId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("listings")
    .select("id, status, business:business_id(owner_user_id)")
    .eq("id", listingId)
    .single();

  if (error || !data) throw new Error("Listing not found");
  if (data.business?.owner_user_id !== profileId) throw new Error("Forbidden");
  return data as { id: string; status: string };
}

/**
 * Re-generate and persist the auto-description for a listing. Pulls the
 * latest title/specs/business/pricing/model so the description always reflects
 * what the vendor has entered. Safe to call after any wizard step save —
 * fields that aren't filled yet just drop out of the generated copy.
 */
async function refreshAutoDescription(listingId: string): Promise<void> {
  // Use admin client throughout — the final UPDATE on listings would fail RLS
  // for KYC-approved (status='approved') listings under the cookie-bound
  // client. Caller has already verified ownership.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from("listings")
    .select(
      `title, year, city, color, transmission, fuel, seats,
       business:business_id ( name ),
       model:model_id ( body_type ),
       pricing:listing_pricing ( tier, price_pkr )`,
    )
    .eq("id", listingId)
    .maybeSingle();
  if (!data) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pricing: any[] = data.pricing ?? [];
  const tierPrice = (t: string) =>
    pricing.find((p) => p.tier === t)?.price_pkr ?? null;

  const description = generateListingDescription({
    title: data.title,
    year: data.year,
    city: data.city,
    color: data.color,
    transmission: data.transmission,
    fuel: data.fuel,
    seats: data.seats,
    businessName: data.business?.name ?? null,
    bodyType: data.model?.body_type ?? null,
    pricing: {
      daily: tierPrice("daily"),
      weekly: tierPrice("weekly"),
      monthly: tierPrice("monthly"),
      selfDriveDaily: tierPrice("self_drive_daily"),
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("listings")
    .update({ description, updated_at: new Date().toISOString() })
    .eq("id", listingId);
}

/** Verify that the given business belongs to the current vendor. */
async function assertBusinessOwnership(businessId: string, profileId: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_user_id", profileId)
    .single();

  if (error || !data) throw new Error("Business not found or not owned by this vendor");
}

// ─── Step 1: Basics ───────────────────────────────────────────────────────────

const step1Schema = z.object({
  listingId: z.string().uuid().optional(),
  businessId: z.string().uuid(),
  // model_id is optional; any non-UUID value (empty string, stale state, etc.) is silently dropped
  model_id: z.string().uuid().optional().catch(undefined as unknown as string),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  city: z.string().trim().min(2).max(80),
  year: z.coerce.number().int().min(1970).max(new Date().getFullYear() + 1),
  color: z.string().max(40).optional(),
  transmission: z.enum(["manual", "automatic"]).optional(),
  fuel: z.enum(["petrol", "diesel", "hybrid"]).optional(),
  seats: z.coerce.number().int().min(1).max(20).optional(),
  // Vendor-facing category (4 cards on step 1) — also the billing tier.
  tier_code: z.enum(["economy", "sedan", "suv", "luxury"]).optional(),
  // Description is no longer collected from the form — it's auto-generated
  // server-side from the basics + pricing + business info.
});

export async function saveDraftStep1Action(
  formData: FormData
): Promise<{ listingId?: string; error?: string }> {
  const profile = await requireVendorMode();

  const parsed = step1Schema.safeParse({
    listingId: formData.get("listingId") || undefined,
    businessId: formData.get("businessId") as string,
    model_id: formData.get("model_id"),
    title: formData.get("title"),
    city: formData.get("city"),
    year: formData.get("year"),
    color: formData.get("color") || undefined,
    transmission: formData.get("transmission") || undefined,
    fuel: formData.get("fuel") || undefined,
    seats: formData.get("seats") || undefined,
    tier_code: formData.get("tier_code") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.[0] ? String(issue.path[0]) : null;
    const msg = issue?.message ?? "Invalid input";
    return { error: field ? `${field}: ${msg}` : msg };
  }

  const { listingId, businessId, ...rest } = parsed.data;
  const fields = rest;

  try {
    await assertBusinessOwnership(businessId, profile.id);
  } catch {
    return { error: "You do not own this business" };
  }

  const supabase = await createClient();

  if (listingId) {
    // Update existing draft.
    // Note: ownership is verified in code via assertOwnership, so we use the
    // admin client for the UPDATE to bypass the RLS policy that blocks vendor
    // updates once status='approved' (which happens for KYC-approved vendors
    // who auto-publish). The cookie-bound client would fail with RLS: "new
    // row violates row-level security policy for table 'listings'".
    try {
      await assertOwnership(listingId, profile.id);
    } catch {
      return { error: "Listing not found" };
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any)
      .from("listings")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", listingId);

    if (error) return { error: error.message };
    await refreshAutoDescription(listingId);
    // Bust the edit-page cache so the next render sees the new make/model/
    // year/tier_code instead of stale draft values.
    revalidatePath(`/vendor/listings/${listingId}/edit`);
    revalidatePath("/vendor/listings");
    return { listingId };
  }

  // Create new draft
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const slug = `${slugify(fields.title)}-${fields.year}-${randomSuffix}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("listings")
    .insert({
      business_id: businessId,
      slug,
      status: "draft",
      ...fields,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  await refreshAutoDescription(data.id);
  revalidatePath(`/vendor/listings/${data.id}/edit`);
  revalidatePath("/vendor/listings");
  return { listingId: data.id };
}

// ─── Step 2: Features ────────────────────────────────────────────────────────

export async function saveFeaturesAction(
  listingId: string,
  featureIds: string[]
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  const supabase = await createClient();

  // Delete existing feature links and re-insert selected ones
  await supabase.from("listing_features").delete().eq("listing_id", listingId);

  if (featureIds.length > 0) {
    const { error } = await supabase.from("listing_features").insert(
      featureIds.map((feature_id) => ({ listing_id: listingId, feature_id }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath(`/vendor/listings/${listingId}/edit`);
  return {};
}

// ─── Step 3: Pricing & Modes ──────────────────────────────────────────────────

const addonSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional().nullable(),
  price_pkr: z.coerce.number().int().min(0),
});

const step2Schema = z.object({
  listingId: z.string().uuid(),
  // Daily rate is WITH-DRIVER, standard 12-hour day. Always required.
  dailyPrice: z.coerce.number().int().positive("Daily rate is required"),
  weeklyPrice: z.coerce.number().int().positive().optional(),
  monthlyPrice: z.coerce.number().int().positive().optional(),
  // Self-drive toggle + optional self-drive daily rate
  offersSelfDrive: z.string().transform((v) => v === "true" || v === "on").default(false),
  selfDrivePrice: z.coerce.number().int().positive().optional(),
  addons: z.array(addonSchema).max(20).default([]),
});

export async function saveDraftStep2Action(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  let addons: unknown = [];
  const addonsRaw = formData.get("addons");
  if (typeof addonsRaw === "string" && addonsRaw.length > 0) {
    try {
      addons = JSON.parse(addonsRaw);
    } catch {
      return { error: "Invalid add-ons payload" };
    }
  }

  const parsed = step2Schema.safeParse({
    listingId: formData.get("listingId"),
    dailyPrice: formData.get("dailyPrice"),
    weeklyPrice: formData.get("weeklyPrice") || undefined,
    monthlyPrice: formData.get("monthlyPrice") || undefined,
    offersSelfDrive: formData.get("offersSelfDrive") || "false",
    selfDrivePrice: formData.get("selfDrivePrice") || undefined,
    addons,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.[0] ? String(issue.path[0]) : null;
    const msg = issue?.message ?? "Invalid input";
    return { error: field ? `${field}: ${msg}` : msg };
  }

  const { listingId, dailyPrice, weeklyPrice, monthlyPrice, offersSelfDrive, selfDrivePrice } =
    parsed.data;

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = supabase as any;

  // Upsert standard pricing tiers (daily = with-driver 12h, plus optional
  // weekly/monthly). These three are accepted by every version of the
  // listing_pricing CHECK constraint shipped to production.
  const standardRows: { listing_id: string; tier: string; price_pkr: number }[] = [
    { listing_id: listingId, tier: "daily", price_pkr: dailyPrice },
  ];
  if (weeklyPrice) standardRows.push({ listing_id: listingId, tier: "weekly", price_pkr: weeklyPrice });
  if (monthlyPrice) standardRows.push({ listing_id: listingId, tier: "monthly", price_pkr: monthlyPrice });

  const { error: pricingError } = await a
    .from("listing_pricing")
    .upsert(standardRows, { onConflict: "listing_id,tier" });
  if (pricingError) return { error: pricingError.message };

  // Self-drive tier — written separately because the CHECK constraint that
  // permits 'self_drive_daily' (migration 0032) hasn't been applied on every
  // environment. On a DB without the migration the upsert returns a
  // check_violation (23514); we swallow that so vendors can still finish the
  // wizard. Once 0032 is applied, self-drive pricing persists automatically.
  let selfDriveSaved = false;
  if (offersSelfDrive && selfDrivePrice) {
    const { error: selfDriveError } = await a
      .from("listing_pricing")
      .upsert(
        [
          {
            listing_id: listingId,
            tier: "self_drive_daily",
            price_pkr: selfDrivePrice,
          },
        ],
        { onConflict: "listing_id,tier" },
      );
    if (selfDriveError) {
      const msg = String(selfDriveError.message ?? "");
      const isConstraint =
        (selfDriveError as { code?: string }).code === "23514" ||
        msg.includes("listing_pricing_tier_check");
      if (!isConstraint) return { error: selfDriveError.message };
      // Constraint missing on this environment — log and continue.
      console.warn(
        "[saveDraftStep2Action] self_drive_daily tier rejected; migration 0032 not applied. Skipping.",
      );
    } else {
      selfDriveSaved = true;
    }
  }

  // Clean up tiers that are no longer active for this listing. Always include
  // the standard set; only include self_drive_daily if we successfully wrote
  // it (otherwise the delete on a legacy DB is a no-op anyway).
  const activeTiers = [
    ...standardRows.map((r) => r.tier),
    ...(selfDriveSaved ? ["self_drive_daily"] : []),
  ];
  const inactiveTiers = ["daily", "weekly", "monthly", "self_drive_daily"].filter(
    (t) => !activeTiers.includes(t),
  );
  if (inactiveTiers.length > 0) {
    await a.from("listing_pricing").delete().eq("listing_id", listingId).in("tier", inactiveTiers);
  }

  // Modes: always with_driver; self_drive only if vendor offers it.
  await a.from("listing_modes").delete().eq("listing_id", listingId);
  const modeRows: { listing_id: string; mode: string; surcharge_pkr: number }[] = [
    { listing_id: listingId, mode: "with_driver", surcharge_pkr: 0 },
  ];
  if (offersSelfDrive) {
    modeRows.push({ listing_id: listingId, mode: "self_drive", surcharge_pkr: 0 });
  }
  const { error: modeError } = await a.from("listing_modes").insert(modeRows);
  if (modeError) return { error: modeError.message };

  // Rebuild listing_addons — tolerate missing table (pre-migration) so the
  // core pricing save still succeeds even if 0026 hasn't run yet.
  try {
    await a.from("listing_addons").delete().eq("listing_id", listingId);
    if (parsed.data.addons.length > 0) {
      const addonRows = parsed.data.addons.map((ad, i) => ({
        listing_id: listingId,
        title: ad.title,
        description: ad.description ?? null,
        price_pkr: ad.price_pkr,
        sort_order: i,
      }));
      await a.from("listing_addons").insert(addonRows);
    }
  } catch (err) {
    console.warn("listing_addons unavailable — skipping addons save:", err);
  }

  // Pricing changed — re-generate the description so the customer-facing
  // copy reflects the new daily / weekly / self-drive rates.
  await refreshAutoDescription(listingId);

  // Invalidate the edit-page server cache so step 3 reads fresh pricing rows
  // when the vendor navigates back. Without this, the cached render keeps
  // showing the previous empty pricing array.
  revalidatePath(`/vendor/listings/${listingId}/edit`);
  revalidatePath("/vendor/listings");

  return {};
}

// ─── Step 3: Policies ─────────────────────────────────────────────────────────

const step3Schema = z.object({
  listingId: z.string().uuid(),
  deposit_pkr: z.coerce.number().int().min(0).optional(),
  min_age: z.coerce.number().int().min(18).max(99).default(21),
  license_required: z.string().transform((v) => v === "true" || v === "on").default(true),
  cancellation_text: z.string().max(500).optional(),
  delivery_available: z.string().transform((v) => v === "true" || v === "on").default(false),
  delivery_fee_pkr: z.coerce.number().int().min(0).optional(),
});

export async function saveDraftStep3Action(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  const parsed = step3Schema.safeParse({
    listingId: formData.get("listingId"),
    deposit_pkr: formData.get("deposit_pkr") || undefined,
    min_age: formData.get("min_age") || 21,
    license_required: formData.get("license_required") || "true",
    cancellation_text: formData.get("cancellation_text") || undefined,
    delivery_available: formData.get("delivery_available") || "false",
    delivery_fee_pkr: formData.get("delivery_fee_pkr") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.[0] ? String(issue.path[0]) : null;
    const msg = issue?.message ?? "Invalid input";
    return { error: field ? `${field}: ${msg}` : msg };
  }

  const { listingId, ...policyFields } = parsed.data;

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listing_policies")
    .upsert({ listing_id: listingId, ...policyFields }, { onConflict: "listing_id" });

  if (error) return { error: error.message };
  revalidatePath(`/vendor/listings/${listingId}/edit`);
  return {};
}

// ─── Step 4: Images ───────────────────────────────────────────────────────────

export interface ImageRecord {
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}

export async function saveImagesAction(
  listingId: string,
  images: ImageRecord[]
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  // Use admin client: vendors have INSERT/SELECT policies on listing_images
  // but no UPDATE/DELETE, so upsert (which can update on conflict) and the
  // primary_image_url update on `listings` (blocked when status='approved')
  // both fail under the cookie-bound client. Ownership is verified above.
  const admin = createAdminClient();

  const rows = images.map((img) => ({ listing_id: listingId, ...img }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("listing_images")
    .upsert(rows, { onConflict: "cloudinary_public_id" });

  if (error) return { error: error.message };

  // Update primary_image_url on listing
  const primary = images.find((img) => img.is_primary) ?? images[0];
  if (primary) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("listings")
      .update({ primary_image_url: primary.url })
      .eq("id", listingId);
  }

  revalidatePath(`/vendor/listings/${listingId}/edit`);
  revalidatePath("/vendor/listings");
  return {};
}

export async function deleteImageAction(
  listingId: string,
  cloudinaryPublicId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  // Admin client — vendor has no DELETE policy on listing_images.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("listing_images")
    .delete()
    .eq("listing_id", listingId)
    .eq("cloudinary_public_id", cloudinaryPublicId);

  if (error) return { error: error.message };
  revalidatePath(`/vendor/listings/${listingId}/edit`);
  return {};
}

// ─── Custom policies ─────────────────────────────────────────────────────────

const policyItemSchema = z.object({
  title: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(2000),
});

export async function savePoliciesAction(
  listingId: string,
  policies: { title: string; content: string }[],
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  const parsed = z.array(policyItemSchema).max(20).safeParse(policies);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid policy" };
  }

  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  try {
    await a.from("listing_custom_policies").delete().eq("listing_id", listingId);

    if (parsed.data.length > 0) {
      const rows = parsed.data.map((p, i) => ({
        listing_id: listingId,
        title: p.title,
        content: p.content,
        sort_order: i,
      }));
      const { error } = await a.from("listing_custom_policies").insert(rows);
      if (error) return { error: error.message };
    }

    revalidatePath(`/vendor/listings/${listingId}/edit`);
  } catch (err) {
    console.warn("listing_custom_policies not available:", err);
    return { error: "Policies table not set up yet" };
  }

  return {};
}

// ─── Submit / lifecycle ───────────────────────────────────────────────────────

export async function submitForApprovalAction(
  listingId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  let listing: { id: string; status: string };
  try {
    listing = await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  // KYC-approved vendors don't need admin re-approval for any edit, even on
  // already-approved listings — their changes stay live. Non-KYC vendors get
  // the admin queue: drafts and rejected go to pending; already-pending or
  // already-approved listings are left untouched (we don't demote a live
  // listing on every save).
  const kycApproved = await isVendorKycApproved(profile.id);

  let update: {
    status: "approved" | "pending";
    is_live: boolean;
    published_at: string;
    rejection_reason: null;
  } | null = null;

  if (kycApproved) {
    update = {
      status: "approved",
      is_live: true,
      published_at: new Date().toISOString(),
      rejection_reason: null,
    };
  } else if (listing.status === "draft" || listing.status === "rejected") {
    update = {
      status: "pending",
      is_live: false,
      published_at: new Date().toISOString(),
      rejection_reason: null,
    };
  } else {
    // Non-KYC vendor on an already-pending or approved listing: nothing to
    // do — the listing is already in flight or live; refuse silently.
    revalidatePath("/vendor/listings");
    return {};
  }

  // Admin client because the vendor RLS policy blocks updates when
  // status='approved'. Ownership was verified above.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("listings")
    .update(update)
    .eq("id", listingId);

  if (error) return { error: error.message };
  revalidatePath("/vendor/listings");

  // KYC-approved vendors go live immediately; skip the admin-notify flow.
  if (kycApproved) return {};

  // Fire-and-forget: notify admins + send emails
  void (async () => {
    try {
      const db = createAdminClient();
      const { data: listingData } = await (db as any)
        .from("listings")
        .select("title")
        .eq("id", listingId)
        .maybeSingle();
      const title = listingData?.title ?? "New listing";
      const vendorName = profile.full_name ?? profile.email ?? "A vendor";

      await createNotificationsForAdmins(
        "listing_submitted",
        "New listing to review",
        `${vendorName} submitted "${title}"`,
        "/admin/listings"
      );

      const { data: adminProfiles } = await db
        .from("profiles")
        .select("email")
        .eq("role", "admin");
      const { subject, html } = listingSubmittedAdmin(title, vendorName);
      for (const admin of adminProfiles ?? []) {
        if (admin.email) await sendEmail(admin.email, subject, html);
      }
    } catch (e) {
      console.error("[submitForApproval] notification error", e);
    }
  })();

  return {};
}

export async function deleteListingAction(
  listingId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  // Use admin client so RLS doesn't swallow the delete. Ownership is already
  // verified above, so bypassing RLS is safe.
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  // Clear dependent rows first in case FKs don't cascade.
  await a.from("listing_features").delete().eq("listing_id", listingId);
  await a.from("listing_pricing").delete().eq("listing_id", listingId);
  await a.from("listing_modes").delete().eq("listing_id", listingId);
  await a.from("listing_images").delete().eq("listing_id", listingId);

  const { error } = await a.from("listings").delete().eq("id", listingId);

  if (error) return { error: error.message };
  revalidatePath("/vendor/listings");
  return {};
}

export async function markUnavailableAction(
  listingId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  let listing: { id: string; status: string };
  try {
    listing = await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  if (listing.status !== "approved") {
    return { error: "Only approved listings can be marked unavailable" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listings")
    .update({ status: "unavailable" })
    .eq("id", listingId);

  if (error) return { error: error.message };
  revalidatePath("/vendor/listings");
  return {};
}
