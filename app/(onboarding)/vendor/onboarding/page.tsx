import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingWizard } from "@/components/vendor/onboarding/onboarding-wizard";

export default async function VendorOnboardingPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: business }, kycRes] = await Promise.all([
    (supabase as any)
      .from("businesses")
      .select("id, name, city")
      .eq("owner_user_id", profile.id)
      .maybeSingle(),
    (admin as any)
      .from("kyc_documents")
      .select("id, status")
      .eq("vendor_user_id", profile.id)
      .in("status", ["pending", "approved"])
      .limit(1),
  ]);

  const hasBusiness = !!business;
  const kycDoc = kycRes.data?.[0] ?? null;
  const hasKyc = !!kycDoc;
  const hasTerms = !!(profile as any).terms_agreed_at;

  // Already fully onboarded — send to dashboard
  if (hasBusiness && hasKyc && hasTerms) redirect("/vendor");

  // Determine which step to start on (advance past already-completed steps)
  let initialStep = 0;
  if (hasBusiness) initialStep = 1;
  if (hasBusiness && hasKyc) initialStep = 2;
  if (hasBusiness && hasKyc && hasTerms) initialStep = 3;

  // Fetch actual auth user to get verified email/phone if missing on profile
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <OnboardingWizard
      profile={{
        full_name: profile.full_name,
        email: user?.email ?? (profile as any).email ?? "",
        phone: user?.phone ?? (profile as any).phone ?? "",
      }}
      initialStep={initialStep}
      hasBusiness={hasBusiness}
      hasKyc={hasKyc}
      kycStatus={kycDoc?.status ?? null}
      hasTerms={hasTerms}
    />
  );
}
