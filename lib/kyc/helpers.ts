import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns true if the given vendor has an approved KYC document.
 * Uses the admin client (bypasses RLS) so this is safe to call from any
 * server context. Silent `false` on errors — callers treat "unknown" as
 * "not approved" to be conservative.
 */
export async function isVendorKycApproved(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const db = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (db as any)
      .from("kyc_documents")
      .select("status")
      .eq("vendor_user_id", userId)
      .eq("status", "approved")
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}
