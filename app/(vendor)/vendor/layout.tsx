import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { VendorShell } from "@/components/layout/vendor-shell";
import { createClient } from "@/lib/supabase/server";
import { getVendorContext } from "@/lib/vendor/context";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Auth user fetch must run per-request (auth-bound) — kept outside the cache.
  // Everything else (business, kyc, unread count) goes through getVendorContext
  // which caches per-user for 30s. Mutations that change any of these call
  // revalidateVendorContext(userId) so the cache is fresh on the next nav.
  const [{ data: authUser }, ctx] = await Promise.all([
    supabase.auth.getUser(),
    getVendorContext(profile.id),
  ]);

  const onboardingSkipped = !!(profile as any).onboarding_skipped_at;

  // Redirect new vendors to onboarding if they haven't skipped AND aren't set up yet.
  // (The onboarding page lives in a different route group so this layout won't wrap it.)
  if (!onboardingSkipped && !ctx.hasBusiness) {
    redirect("/vendor/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface-muted">
      <VendorShell
        profile={{
          full_name: profile.full_name,
          email: authUser.user?.email ?? (profile as any).email ?? "",
        }}
        business={ctx.business}
        notificationCount={ctx.unreadCount}
        notificationUserId={profile.id}
        hasBusiness={ctx.hasBusiness}
        hasKyc={ctx.hasKyc}
        kycStatus={ctx.kycStatus}
      >
        {children}
      </VendorShell>
    </div>
  );
}
