"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";

export async function approveListingAction(
  id: string
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const { error } = await db
    .from("listings")
    .update({ status: "approved", published_at: new Date().toISOString() } as any)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  return {};
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
  return {};
}
