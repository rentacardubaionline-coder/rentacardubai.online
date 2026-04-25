"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireVendorMode, requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, normalizePhone } from "@/lib/utils";
import { createNotification, createNotificationsForAdmins } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { claimApprovedVendor, claimRejectedVendor } from "@/lib/email/templates";
import { revalidateVendorContext } from "@/lib/vendor/context";

// ─── Vendor: create own business ──────────────────────────────────────────────

const createBusinessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(120),
  phone: z.string().min(7, "Phone number is required").max(20),
  whatsapp_phone: z.string().min(7).max(20).optional(),
  city: z.string().min(2, "City is required").max(100),
});

export async function createBusinessAction(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  const parsed = createBusinessSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsapp_phone: formData.get("whatsapp_phone") || undefined,
    city: formData.get("city"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  // Ensure vendor doesn't already own a business
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("owner_user_id", profile.id)
    .single();

  if (existing) {
    return { error: "You already have a business registered" };
  }

  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const slug = `${slugify(parsed.data.name)}-${randomSuffix}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("businesses").insert({
    ...parsed.data,
    phone: normalizePhone(parsed.data.phone),
    whatsapp_phone: normalizePhone(parsed.data.whatsapp_phone),
    slug,
    owner_user_id: profile.id,
    claim_status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/vendor/business");
  revalidateVendorContext(profile.id);
  return {};
}

// ─── Vendor: update own business profile ─────────────────────────────────────

const updateBusinessSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(7).max(20).optional(),
  whatsapp_phone: z.string().min(7).max(20).optional(),
  email: z.string().email().optional(),
  address_line: z.string().max(200).optional(),
  city: z.string().min(2).max(100).optional(),
});

export async function updateBusinessAction(
  formData: FormData
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  const parsed = updateBusinessSchema.safeParse({
    businessId: formData.get("businessId"),
    name: formData.get("name") || undefined,
    phone: formData.get("phone") || undefined,
    whatsapp_phone: formData.get("whatsapp_phone") || undefined,
    email: formData.get("email") || undefined,
    address_line: formData.get("address_line") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { businessId, ...fields } = parsed.data;
  if (fields.phone) fields.phone = normalizePhone(fields.phone);
  if (fields.whatsapp_phone) fields.whatsapp_phone = normalizePhone(fields.whatsapp_phone);
  const supabase = await createClient();

  // RLS ensures owner_user_id = auth.uid() on update
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("businesses")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", businessId)
    .eq("owner_user_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/vendor/business");
  revalidateVendorContext(profile.id);
  return {};
}

// ─── Vendor: claim an existing business ──────────────────────────────────────

export async function claimBusinessAction(
  businessId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Verify the business is unclaimed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, claim_status, slug")
    .eq("id", businessId)
    .single();

  if (!business) return { error: "Business not found" };
  if (business.claim_status !== "unclaimed") {
    return { error: "This business is not available to claim" };
  }

  // Insert claim
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: claimError } = await (supabase as any)
    .from("business_claims")
    .insert({ business_id: businessId, claimant_user_id: profile.id });

  if (claimError) {
    if (claimError.code === "23505") return { error: "You have already submitted a claim for this business" };
    return { error: claimError.message };
  }

  // Mark business as pending so others can't also claim it simultaneously
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("businesses")
    .update({ claim_status: "pending" })
    .eq("id", businessId);

  revalidatePath(`/businesses/${business.slug}`);

  // Fire-and-forget: notify admins of new claim
  const businessName = (business as any).name ?? "a business";
  void createNotificationsForAdmins(
    "claim_submitted",
    "New business claim",
    `${profile.full_name ?? profile.email ?? "A vendor"} wants to claim "${businessName}"`,
    "/admin/claims"
  );

  return {};
}

// ─── Admin: approve claim ─────────────────────────────────────────────────────

export async function approveClaimAction(
  claimId: string,
  reviewerNotes?: string
): Promise<{ error?: string }> {
  const admin = await requireRole("admin");
  const adminClient = createAdminClient();

  // Fetch the claim (cast to any — business_claims not yet in generated types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: claim } = await (adminClient as any)
    .from("business_claims")
    .select("id, business_id, claimant_user_id, status, business:business_id(name), claimant:claimant_user_id(email)")
    .eq("id", claimId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = claim as any;
  if (!c) return { error: "Claim not found" };
  if (c.status !== "pending") return { error: "Claim is not pending" };

  // Link business to claimant
  await adminClient
    .from("businesses")
    .update({ owner_user_id: c.claimant_user_id, claim_status: "claimed" })
    .eq("id", c.business_id);

  // Grant vendor role to claimant
  await adminClient
    .from("profiles")
    .update({ is_vendor: true })
    .eq("id", c.claimant_user_id);

  // Mark claim approved
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient as any)
    .from("business_claims")
    .update({
      status: "approved",
      reviewer_notes: reviewerNotes ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  revalidatePath("/admin/claims");
  if (c.claimant_user_id) revalidateVendorContext(c.claimant_user_id);

  // Fire-and-forget: notify vendor
  const businessName = c.business?.name ?? "your business";
  const vendorEmail = Array.isArray(c.claimant) ? c.claimant[0]?.email : c.claimant?.email;
  void createNotification(
    c.claimant_user_id,
    "claim_approved",
    "Business claim approved!",
    `"${businessName}" is now live on RentNowPk`,
    "/vendor"
  );
  if (vendorEmail) {
    void (async () => {
      try {
        const { subject, html } = claimApprovedVendor(businessName);
        await sendEmail(vendorEmail, subject, html);
      } catch (e) { console.error("[approveClaimAction] email error", e); }
    })();
  }

  return {};
}

// ─── Admin: reject claim ──────────────────────────────────────────────────────

export async function rejectClaimAction(
  claimId: string,
  reviewerNotes?: string
): Promise<{ error?: string }> {
  const admin = await requireRole("admin");
  const adminClient = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: claim } = await (adminClient as any)
    .from("business_claims")
    .select("id, business_id, claimant_user_id, status, business:business_id(name), claimant:claimant_user_id(email)")
    .eq("id", claimId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = claim as any;
  if (!c) return { error: "Claim not found" };
  if (c.status !== "pending") return { error: "Claim is not pending" };

  // Reset business back to unclaimed
  await adminClient
    .from("businesses")
    .update({ claim_status: "unclaimed" })
    .eq("id", c.business_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient as any)
    .from("business_claims")
    .update({
      status: "rejected",
      reviewer_notes: reviewerNotes ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  revalidatePath("/admin/claims");

  // Fire-and-forget: notify vendor
  const businessName = c.business?.name ?? "the business";
  const vendorEmail = Array.isArray(c.claimant) ? c.claimant[0]?.email : c.claimant?.email;
  if (c.claimant_user_id) {
    void createNotification(
      c.claimant_user_id,
      "claim_rejected",
      "Business claim not approved",
      `Your claim for "${businessName}" could not be approved`,
      "/vendor"
    );
  }
  if (vendorEmail) {
    void (async () => {
      try {
        const { subject, html } = claimRejectedVendor(businessName);
        await sendEmail(vendorEmail, subject, html);
      } catch (e) { console.error("[rejectClaimAction] email error", e); }
    })();
  }

  return {};
}

// ─── Vendor: business image management ───────────────────────────────────────

export async function saveBusinessImageAction(input: {
  businessId: string;
  cloudinary_public_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
}): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Verify ownership
  const { data: biz } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("id", input.businessId)
    .eq("owner_user_id", profile.id)
    .single();

  if (!biz) return { error: "Business not found" };

  // If this is primary, unset all others first
  if (input.is_primary) {
    await (supabase as any)
      .from("business_images")
      .update({ is_primary: false })
      .eq("business_id", input.businessId);
  }

  const { error } = await (supabase as any)
    .from("business_images")
    .upsert(
      {
        business_id: input.businessId,
        cloudinary_public_id: input.cloudinary_public_id,
        url: input.url,
        sort_order: input.sort_order,
        is_primary: input.is_primary,
      },
      { onConflict: "cloudinary_public_id" }
    );

  if (error) return { error: error.message };

  // Update cover_url on business if primary
  if (input.is_primary) {
    await (supabase as any)
      .from("businesses")
      .update({ cover_url: input.url, updated_at: new Date().toISOString() })
      .eq("id", input.businessId);
  }

  revalidatePath("/vendor/business");
  return {};
}

export async function deleteBusinessImageAction(
  businessId: string,
  cloudinaryPublicId: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  const { data: biz } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_user_id", profile.id)
    .single();

  if (!biz) return { error: "Business not found" };

  const { error } = await (supabase as any)
    .from("business_images")
    .delete()
    .eq("cloudinary_public_id", cloudinaryPublicId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath("/vendor/business");
  return {};
}

export async function setPrimaryBusinessImageAction(
  businessId: string,
  cloudinaryPublicId: string,
  url: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  const { data: biz } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_user_id", profile.id)
    .single();

  if (!biz) return { error: "Business not found" };

  await (supabase as any)
    .from("business_images")
    .update({ is_primary: false })
    .eq("business_id", businessId);

  await (supabase as any)
    .from("business_images")
    .update({ is_primary: true })
    .eq("cloudinary_public_id", cloudinaryPublicId);

  await (supabase as any)
    .from("businesses")
    .update({ cover_url: url, updated_at: new Date().toISOString() })
    .eq("id", businessId);

  revalidatePath("/vendor/business");
  return {};
}

// ─── Vendor: save business logo ───────────────────────────────────────────────

export async function saveBusinessLogoAction(
  businessId: string,
  logoUrl: string
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("businesses")
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("id", businessId)
    .eq("owner_user_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/vendor/profile");
  revalidatePath("/vendor/business");
  return {};
}
