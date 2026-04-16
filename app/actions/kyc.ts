"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

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
  const { data: existing } = await admin
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

  const { error } = await admin.from("kyc_documents").insert({
    vendor_user_id: user.id,
    cnic_number: input.cnic_number,
    front_url: input.front_url,
    back_url: input.back_url,
    selfie_url: input.selfie_url,
    status: "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/vendor/kyc");
  return { success: true };
}

export async function approveKycAction(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("kyc_documents")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/kyc");
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
  const { error } = await admin
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
  return {};
}
