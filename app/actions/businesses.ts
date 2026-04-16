"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireVendorMode, requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

// ─── Vendor: create own business ──────────────────────────────────────────────

const createBusinessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(120),
  phone: z.string().min(7, "Phone number is required").max(20),
  whatsapp_phone: z.string().min(7).max(20).optional(),
  city: z.enum(["Karachi", "Lahore", "Islamabad"]),
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
    slug,
    owner_user_id: profile.id,
    claim_status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/vendor/business");
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
  city: z.enum(["Karachi", "Lahore", "Islamabad"]).optional(),
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
    .select("id, business_id, claimant_user_id, status")
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
    .select("id, business_id, status")
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
  return {};
}
