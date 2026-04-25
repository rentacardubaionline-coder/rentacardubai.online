import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { VendorShell } from "@/components/layout/vendor-shell";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const db = createAdminClient();

  const [
    { data: authUser },
    { data: business },
    kycRes,
    { count: unreadCount },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("businesses")
      .select("id, name, city, claim_status")
      .eq("owner_user_id", profile.id)
      .maybeSingle(),
    // Fetch the latest KYC document regardless of status so we can detect
    // a rejection and surface a resubmit prompt — the onboarding wizard does
    // its own filtering on pending/approved when deciding which step to show.
    (db as any)
      .from("kyc_documents")
      .select("id, status")
      .eq("vendor_user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1),
    (db as any)
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null),
  ]);

  const hasBusiness = !!business;
  const latestKyc = kycRes?.data?.[0] ?? null;
  const kycStatus = (latestKyc?.status ?? null) as
    | "approved" | "pending" | "rejected" | null;
  // hasKyc is "true" only for in-flight or approved KYC — a rejected doc
  // shouldn't satisfy the onboarding gate (vendor must resubmit).
  const hasKyc = kycStatus === "approved" || kycStatus === "pending";
  const onboardingSkipped = !!(profile as any).onboarding_skipped_at;

  // Redirect new vendors to onboarding if they haven't skipped AND aren't set up yet.
  // (The onboarding page lives in a different route group so this layout won't wrap it.)
  if (!onboardingSkipped && !hasBusiness) {
    redirect("/vendor/onboarding");
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface-muted">
      <VendorShell
        profile={{
          full_name: profile.full_name,
          email: authUser.user?.email ?? (profile as any).email ?? "",
        }}
        business={business ?? null}
        notificationCount={unreadCount ?? 0}
        notificationUserId={profile.id}
        hasBusiness={hasBusiness}
        hasKyc={hasKyc}
        kycStatus={kycStatus}
      >
        {children}
      </VendorShell>
    </div>
  );
}
