"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";
import { createNotification } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { listingApprovedVendor, listingRejectedVendor } from "@/lib/email/templates";
import { isVendorKycApproved } from "@/lib/kyc/helpers";

async function getListingVendor(id: string) {
  const db = createAdminClient();
  const { data } = await (db as any)
    .from("listings")
    .select("title, slug, business:business_id(owner_user_id, profiles:owner_user_id(email, full_name))")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const profile = Array.isArray(data.business?.profiles)
    ? data.business.profiles[0]
    : data.business?.profiles;
  return {
    title: data.title as string,
    slug: data.slug as string,
    vendorUserId: data.business?.owner_user_id as string | undefined,
    vendorEmail: profile?.email as string | undefined,
  };
}

/**
 * Approve many listings in one round-trip. Admin-only. Each listing is
 * processed independently — partial failures are reported back.
 */
export async function bulkApproveListingsAction(
  ids: string[],
): Promise<{ approved: number; failed: number; kycHeld: number }> {
  await requireRole("admin");
  if (!Array.isArray(ids) || ids.length === 0) {
    return { approved: 0, failed: 0, kycHeld: 0 };
  }

  const results = await Promise.all(ids.map((id) => approveListingAction(id)));

  let approved = 0;
  let failed = 0;
  let kycHeld = 0;
  for (const r of results) {
    if (r.error) failed++;
    else if (r.kycPending) {
      approved++;
      kycHeld++;
    } else {
      approved++;
    }
  }

  revalidatePath("/admin/listings");
  return { approved, failed, kycHeld };
}

export async function approveListingAction(
  id: string
): Promise<{ error?: string; kycPending?: boolean }> {
  await requireRole("admin");
  const db = createAdminClient();

  // Resolve the vendor so we can check their KYC state.
  const v = await getListingVendor(id);
  const kycApproved = v?.vendorUserId
    ? await isVendorKycApproved(v.vendorUserId)
    : false;

  const { error } = await db
    .from("listings")
    .update({
      status: "approved",
      is_live: kycApproved, // only go live if vendor's KYC is approved
      published_at: new Date().toISOString(),
      rejection_reason: null,
    } as any)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/admin");

  void (async () => {
    try {
      if (!v?.vendorUserId) return;
      if (kycApproved) {
        await createNotification(
          v.vendorUserId,
          "listing_approved",
          "Listing approved!",
          `"${v.title}" is now live on RentNowPk`,
          `/vendor/listings`,
        );
        if (v.vendorEmail) {
          const { subject, html } = listingApprovedVendor(v.title, v.slug);
          await sendEmail(v.vendorEmail, subject, html);
        }
      } else {
        // Content approved but held until KYC is done.
        await createNotification(
          v.vendorUserId,
          "listing_approved",
          "Listing approved — KYC pending",
          `"${v.title}" passed review but will only go live after your KYC is approved.`,
          `/vendor/kyc`,
        );
      }
    } catch (e) {
      console.error("[approveListingAction] notification error", e);
    }
  })();

  return { kycPending: !kycApproved };
}

export async function rejectListingAction(
  id: string,
  reason: string
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const { error } = await db
    .from("listings")
    .update({ status: "rejected", rejection_reason: reason || null } as any)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/admin");

  void (async () => {
    try {
      const v = await getListingVendor(id);
      if (!v?.vendorUserId) return;
      await createNotification(
        v.vendorUserId,
        "listing_rejected",
        "Listing needs updates",
        reason ? `"${v.title}" — ${reason}` : `"${v.title}" was not approved`,
        `/vendor/listings`
      );
      if (v.vendorEmail) {
        const { subject, html } = listingRejectedVendor(v.title, reason);
        await sendEmail(v.vendorEmail, subject, html);
      }
    } catch (e) {
      console.error("[rejectListingAction] notification error", e);
    }
  })();

  return {};
}
