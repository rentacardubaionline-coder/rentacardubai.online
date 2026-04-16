"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SignupInput, LoginInput } from "@/lib/auth/validations";
import type { Database } from "@/types/database";

export async function signupAction(
  input: SignupInput
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError) {
      return {
        error:
          authError.message ||
          "Failed to create account. Please check your email and password.",
      };
    }

    if (!authData.user) {
      return { error: "Failed to create account" };
    }

    // Use admin client to update phone — the user has no session yet
    // (email not yet confirmed), so the anon client would fail RLS.
    const admin = createAdminClient();
    const { error: profileError } = await admin
      .from("profiles")
      .upsert({ 
        id: authData.user.id,
        email: input.email,
        phone: input.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile phone update error:", profileError);
      // Non-fatal: account was created, user can update phone later in profile settings
    }
  } catch (err: unknown) {
    console.error("Signup error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `An unexpected error occurred: ${msg}` };
  }

  // Email confirmation is disabled; session is active instantly.
  // Redirect to customer dashboard after signup
  redirect("/customer");
}

export async function loginAction(
  input: LoginInput
): Promise<{ error?: string }> {
  let role: string | null = null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      return {
        error: error.message || "Invalid email or password. Please try again.",
      };
    }

    // Fetch role so we can redirect to the right dashboard
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    role = profile?.role ?? null;
  } catch (err: unknown) {
    console.error("Login error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `An unexpected error occurred: ${msg}` };
  }

  if (role === "admin") redirect("/admin");
  redirect("/customer");
}

export async function switchModeAction(
  newMode: Database["public"]["Enums"]["active_mode"]
): Promise<{ error?: string }> {
  try {
    // We use the admin client here to bypass RLS "infinite recursion" policies.
    // The policy for the profiles table likely calls a function that checks the profiles table.
    const admin = createAdminClient();
    const supabase = await createClient();
    
    // Safety check: Ensure the user is authenticated before we update their profile via admin
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    const updateData: Database["public"]["Tables"]["profiles"]["Update"] = { 
      active_mode: newMode,
      updated_at: new Date().toISOString()
    };
    
    if (newMode === 'vendor') {
      updateData.is_vendor = true;
    }

    const { error } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }
  } catch (err: unknown) {
    console.error("Switch mode error:", err);
    return { error: "An unexpected error occurred" };
  }

  // Use a hard redirect to ensure cookies and server state are refreshed
  redirect(newMode === "vendor" ? "/vendor" : "/customer");
}
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(
  email: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `An unexpected error occurred: ${msg}` };
  }
}

export async function resetPasswordAction(
  password: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { error: error.message };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `An unexpected error occurred: ${msg}` };
  }

  redirect("/login?reset=success");
}
