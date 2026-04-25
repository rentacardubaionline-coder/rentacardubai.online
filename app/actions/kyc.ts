"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { createNotification, createNotificationsForAdmins } from "@/lib/notifications/create";
import { sendEmail } from "@/lib/email/send";
import { kycSubmittedAdmin, kycApprovedVendor, kycRejectedVendor } from "@/lib/email/templates";
import { revalidateVendorContext } from "@/lib/vendor/context";

export interface KycSubmitInput {
  cnic_number: string;
  front_url: string;
  back_url: string;
  selfie_url: string;
}

export async function submitKycAction(
  input: KycSubmitInput
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Validate CNIC format: XXXXX-XXXXXXX-X
  const cnicRegex = /^\d{5}-\d{7}-\d$/;
  if (!cnicRegex.test(input.cnic_number)) {
    return { error: "Invalid CNIC format. Use XXXXX-XXXXXXX-X" };
  }

  const admin = createAdminClient();

  // Check for existing pending/approved submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from("kyc_documents")
    .select("id, status")
    .eq("vendor_user_id", user.id)
    .in("status", ["pending", "approved"])
    .maybeSingle();

  if (existing?.status === "approved") {
    return { error: "Your KYC is already verified." };
  }
  if (existing?.status === "pending") {
    return { error: "You already have a KYC submission under review." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("kyc_documents").insert({
    vendor_user_id: user.id,
    cnic_number: input.cnic_number,
    front_url: input.front_url,
    back_url: input.back_url,
    selfie_url: input.selfie_url,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/vendor/kyc");
  revalidateVendorContext(user.id);

  // Fire-and-forget: notify admins
  void (async () => {
    try {
      const { data: profile } = await admin
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      const vendorName = profile?.full_name ?? profile?.email ?? "A vendor";

      await createNotificationsForAdmins(
        "kyc_submitted",
        "New KYC submission",
        `${vendorName} submitted identity documents`,
        "/admin/kyc"
      );

      const { data: adminProfiles } = await admin
        .from("profiles")
        .select("email")
        .eq("role", "admin");
      const { subject, html } = kycSubmittedAdmin(vendorName);
      for (const a of adminProfiles ?? []) {
        if (a.email) await sendEmail(a.email, subject, html);
      }
    } catch (e) {
      console.error("[submitKycAction] notification error", e);
    }
  })();

  return { success: true };
}

export async function approveKycAction(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();

  // Fetch vendor info before updating
  const { data: kycDoc } = await (admin as any)
    .from("kyc_documents")
    .select("vendor_user_id, profiles:vendor_user_id(email)")
    .eq("id", id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("kyc_documents")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  // Release any listings this vendor already had admin-approved but were
  // waiting on KYC. Go live in one shot, no further admin action needed.
  let releasedCount = 0;
  if (kycDoc?.vendor_user_id) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: releasedRows } = await (admin as any)
        .from("listings")
        .update({ is_live: true })
        .eq("status", "approved")
        .eq("is_live", false)
        .in(
          "business_id",
          ((await (admin as any)
            .from("businesses")
            .select("id")
            .eq("owner_user_id", kycDoc.vendor_user_id)).data ?? [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((b: any) => b.id),
        )
        .select("id");
      releasedCount = (releasedRows ?? []).length;
    } catch (e) {
      console.error("[approveKycAction] failed to release listings", e);
    }
  }

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/listings");
  revalidatePath("/vendor/listings");
  if (kycDoc?.vendor_user_id) {
    revalidateVendorContext(kycDoc.vendor_user_id);
  }

  void (async () => {
    try {
      if (!kycDoc?.vendor_user_id) return;
      const vendorEmail = Array.isArray(kycDoc.profiles)
        ? kycDoc.profiles[0]?.email
        : kycDoc.profiles?.email;

      await createNotification(
        kycDoc.vendor_user_id,
        "kyc_approved",
        "Identity verified!",
        releasedCount > 0
          ? `KYC approved — ${releasedCount} of your listings are now live.`
          : "Your KYC has been approved. Your business profile now shows a verified badge.",
        "/vendor/kyc",
      );
      if (vendorEmail) {
        const { subject, html } = kycApprovedVendor();
        await sendEmail(vendorEmail, subject, html);
      }
    } catch (e) {
      console.error("[approveKycAction] notification error", e);
    }
  })();

  return {};
}

export async function rejectKycAction(
  id: string,
  reason: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();

  // Fetch vendor info before updating
  const { data: kycDoc } = await (admin as any)
    .from("kyc_documents")
    .select("vendor_user_id, profiles:vendor_user_id(email)")
    .eq("id", id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("kyc_documents")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: reason || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/kyc");
  if (kycDoc?.vendor_user_id) {
    revalidateVendorContext(kycDoc.vendor_user_id);
  }

  void (async () => {
    try {
      if (!kycDoc?.vendor_user_id) return;
      const vendorEmail = Array.isArray(kycDoc.profiles)
        ? kycDoc.profiles[0]?.email
        : kycDoc.profiles?.email;

      await createNotification(
        kycDoc.vendor_user_id,
        "kyc_rejected",
        "KYC needs attention",
        reason || "Your submission could not be verified. Please resubmit.",
        "/vendor/kyc"
      );
      if (vendorEmail) {
        const { subject, html } = kycRejectedVendor(reason);
        await sendEmail(vendorEmail, subject, html);
      }
    } catch (e) {
      console.error("[rejectKycAction] notification error", e);
    }
  })();

  return {};
}
