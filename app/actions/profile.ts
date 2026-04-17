"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/utils";

export async function updateProfileAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const full_name = (formData.get("full_name") as string | null)?.trim() || null;
  const rawPhone = (formData.get("phone") as string | null)?.trim() || null;
  const phone = rawPhone ? normalizePhone(rawPhone) || rawPhone : null;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ full_name, phone, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/vendor/profile");
  return { success: true };
}

export async function changePasswordAction(
  password: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return {};
}
