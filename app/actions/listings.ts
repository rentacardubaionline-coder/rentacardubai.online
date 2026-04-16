"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

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
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  city: z.enum(["Karachi", "Lahore", "Islamabad"]),
  year: z.coerce.number().int().min(1970).max(new Date().getFullYear() + 1),
  color: z.string().max(40).optional(),
  transmission: z.enum(["manual", "automatic"]).optional(),
  fuel: z.enum(["petrol", "diesel", "hybrid"]).optional(),
  seats: z.coerce.number().int().min(1).max(20).optional(),
  mileage_km: z.coerce.number().int().min(0).optional(),
  description: z.string().max(2000).optional(),
});

export async function saveDraftStep1Action(
  formData: FormData
): Promise<{ listingId?: string; error?: string }> {
  const profile = await requireVendorMode();

  const parsed = step1Schema.safeParse({
    listingId: formData.get("listingId") || undefined,
    businessId: formData.get("businessId"),
    title: formData.get("title"),
    city: formData.get("city"),
    year: formData.get("year"),
    color: formData.get("color") || undefined,
    transmission: formData.get("transmission") || undefined,
    fuel: formData.get("fuel") || undefined,
    seats: formData.get("seats") || undefined,
    mileage_km: formData.get("mileage_km") || undefined,
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { listingId, businessId, ...fields } = parsed.data;

  try {
    await assertBusinessOwnership(businessId, profile.id);
  } catch {
    return { error: "You do not own this business" };
  }

  const supabase = await createClient();

  if (listingId) {
    // Update existing draft
    try {
      await assertOwnership(listingId, profile.id);
    } catch {
      return { error: "Listing not found" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("listings")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", listingId);

    if (error) return { error: error.message };
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
  return { listingId: data.id };
}

// ─── Step 2: Pricing & Modes ──────────────────────────────────────────────────

const step2Schema = z.object({
  listingId: z.string().uuid(),
  dailyPrice: z.coerce.number().int().positive("Daily price is required"),
  weeklyPrice: z.coerce.number().int().positive().optional(),
  monthlyPrice: z.coerce.number().int().positive().optional(),
  rentalMode: z.enum(["self_drive", "with_driver", "both"]),
  withDriverSurcharge: z.coerce.number().int().min(0).default(0),
  selfDriveSurcharge: z.coerce.number().int().min(0).default(0),
});

export async function saveDraftStep2Action(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  const parsed = step2Schema.safeParse({
    listingId: formData.get("listingId"),
    dailyPrice: formData.get("dailyPrice"),
    weeklyPrice: formData.get("weeklyPrice") || undefined,
    monthlyPrice: formData.get("monthlyPrice") || undefined,
    rentalMode: formData.get("rentalMode"),
    withDriverSurcharge: formData.get("withDriverSurcharge") || 0,
    selfDriveSurcharge: formData.get("selfDriveSurcharge") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { listingId, dailyPrice, weeklyPrice, monthlyPrice, rentalMode, withDriverSurcharge, selfDriveSurcharge } = parsed.data;

  try {
    await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  const supabase = await createClient();

  // Upsert pricing tiers
  const pricingRows = [
    { listing_id: listingId, tier: "daily", price_pkr: dailyPrice },
    ...(weeklyPrice ? [{ listing_id: listingId, tier: "weekly", price_pkr: weeklyPrice }] : []),
    ...(monthlyPrice ? [{ listing_id: listingId, tier: "monthly", price_pkr: monthlyPrice }] : []),
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pricingError } = await (supabase as any)
    .from("listing_pricing")
    .upsert(pricingRows, { onConflict: "listing_id,tier" });

  if (pricingError) return { error: pricingError.message };

  // Delete tiers that are no longer set
  const activeTiers = pricingRows.map((r) => r.tier);
  const inactiveTiers = ["daily", "weekly", "monthly"].filter((t) => !activeTiers.includes(t));
  if (inactiveTiers.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("listing_pricing")
      .delete()
      .eq("listing_id", listingId)
      .in("tier", inactiveTiers);
  }

  // Rebuild listing_modes (delete all then insert fresh)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("listing_modes")
    .delete()
    .eq("listing_id", listingId);

  const modeRows =
    rentalMode === "both"
      ? [
          { listing_id: listingId, mode: "self_drive", surcharge_pkr: selfDriveSurcharge },
          { listing_id: listingId, mode: "with_driver", surcharge_pkr: withDriverSurcharge },
        ]
      : [
          {
            listing_id: listingId,
            mode: rentalMode,
            surcharge_pkr: rentalMode === "with_driver" ? withDriverSurcharge : selfDriveSurcharge,
          },
        ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: modeError } = await (supabase as any)
    .from("listing_modes")
    .insert(modeRows);

  if (modeError) return { error: modeError.message };
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
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
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

  const supabase = await createClient();

  // Upsert images
  const rows = images.map((img) => ({ listing_id: listingId, ...img }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listing_images")
    .upsert(rows, { onConflict: "cloudinary_public_id" });

  if (error) return { error: error.message };

  // Update primary_image_url on listing
  const primary = images.find((img) => img.is_primary) ?? images[0];
  if (primary) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("listings")
      .update({ primary_image_url: primary.url })
      .eq("id", listingId);
  }

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

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listing_images")
    .delete()
    .eq("listing_id", listingId)
    .eq("cloudinary_public_id", cloudinaryPublicId);

  if (error) return { error: error.message };
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

  if (listing.status !== "draft") {
    return { error: "Only draft listings can be submitted for approval" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listings")
    .update({ status: "pending", published_at: new Date().toISOString() })
    .eq("id", listingId);

  if (error) return { error: error.message };
  revalidatePath("/vendor/listings");
  return {};
}

export async function deleteListingAction(
  listingId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  let listing: { id: string; status: string };
  try {
    listing = await assertOwnership(listingId, profile.id);
  } catch {
    return { error: "Listing not found" };
  }

  if (listing.status !== "draft") {
    return { error: "Only draft listings can be deleted" };
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("listings")
    .delete()
    .eq("id", listingId);

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
