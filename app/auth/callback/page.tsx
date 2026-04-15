"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Destination after successful auth, keyed by role
const DASHBOARD_BY_ROLE = {
  admin: "/admin",
  vendor: "/vendor",
  customer: "/customer",
} as const satisfies Record<string, string>;

const DEFAULT_DASHBOARD = "/customer";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      // getSession() automatically exchanges the hash-fragment tokens
      // (access_token + refresh_token) and persists the session in localStorage
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setErrorMsg(
          "We couldn't verify your magic link. It may have expired — please request a new one.",
        );
        return;
      }

      // Fetch the user's role from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_vendor")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile) {
        // New sign-up: profile may not exist yet — send to customer dashboard
        router.replace(DEFAULT_DASHBOARD);
        return;
      }

      // Determine the correct dashboard
      const role = profile.role as keyof typeof DASHBOARD_BY_ROLE;
      const destination =
        DASHBOARD_BY_ROLE[role] ??
        (profile.is_vendor ? DASHBOARD_BY_ROLE.vendor : DEFAULT_DASHBOARD);

      router.replace(destination);
    }

    handleCallback().catch(() => {
      setErrorMsg("An unexpected error occurred. Please try again.");
    });
  }, [router]);

  if (errorMsg) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 max-w-sm w-full">
          <p className="font-semibold text-destructive">Authentication failed</p>
          <p className="mt-1 text-sm text-ink-600">{errorMsg}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-brand-600 underline hover:text-brand-700"
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted">
      <div
        className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"
        role="status"
        aria-label="Signing you in"
      />
      <p className="text-sm text-ink-500 font-medium">Signing you in…</p>
    </div>
  );
}
