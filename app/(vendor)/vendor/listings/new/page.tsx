import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { WizardProgress } from "@/components/vendor/wizard/wizard-progress";
import { Step1Basics } from "@/components/vendor/wizard/step1-basics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewListingPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Require vendor to have a business first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name")
    .eq("owner_user_id", profile.id)
    .single();

  if (!business) {
    redirect("/vendor/business");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">New listing</h1>
        <p className="mt-1 text-sm text-ink-500">{business.name}</p>
      </div>

      <WizardProgress currentStep={1} />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Step 1 — Basic details</CardTitle>
        </CardHeader>
        <CardContent>
          <Step1Basics businessId={business.id} />
        </CardContent>
      </Card>
    </div>
  );
}
