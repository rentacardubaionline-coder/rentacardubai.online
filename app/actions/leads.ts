"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["new", "contacted", "won", "lost"] as const;
export type LeadStatus = (typeof STATUSES)[number];

const updateSchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(STATUSES),
});

/**
 * Vendor-only: change the lifecycle status of one of their own leads.
 * RLS filters by `vendor_user_id`; we double-check ownership server-side
 * before issuing the admin-client write.
 */
export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
): Promise<{ ok?: true; error?: string }> {
  const parsed = updateSchema.safeParse({ leadId, status });
  if (!parsed.success) return { error: "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const db = createAdminClient();

  // Ownership check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lead } = await (db as any)
    .from("leads")
    .select("id, vendor_user_id")
    .eq("id", parsed.data.leadId)
    .single();

  if (!lead || lead.vendor_user_id !== user.id) {
    return { error: "Lead not found" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db as any)
    .from("leads")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.leadId);

  if (error) {
    console.error("[updateLeadStatusAction] update failed", error);
    return { error: "Could not update lead status" };
  }

  revalidatePath("/vendor/leads");
  return { ok: true };
}
