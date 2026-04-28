import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getCurrentProfile() {
  const user = await requireUser();
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return profile;
}

export async function requireRole(role: Database["public"]["Enums"]["user_role"]) {
  const profile = await getCurrentProfile();

  if (profile.role !== role) {
    redirect("/");
  }

  return profile;
}

export async function requireVendorMode() {
  const profile = await getCurrentProfile();

  // Admins are allowed to access vendor pages to manage listings etc.
  if (!profile.is_vendor && profile.role !== "admin") {
    redirect("/");
  }

  return profile;
}
