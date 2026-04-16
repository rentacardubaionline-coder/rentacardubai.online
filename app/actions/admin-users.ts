"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/guards";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export async function setUserRoleAction(
  userId: string,
  role: UserRole
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  const { error } = await db
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return {};
}

export async function setVendorStatusAction(
  userId: string,
  isVendor: boolean
): Promise<{ error?: string }> {
  await requireRole("admin");
  const db = createAdminClient();

  // If removing vendor status, also reset active_mode to customer
  const update = isVendor
    ? { is_vendor: true, updated_at: new Date().toISOString() }
    : { is_vendor: false, active_mode: "customer" as const, updated_at: new Date().toISOString() };

  const { error } = await db.from("profiles").update(update).eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return {};
}
