import { redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { WizardProgress } from "@/components/vendor/wizard/wizard-progress";
import { Step1Basics } from "@/components/vendor/wizard/step1-basics";

export default async function NewListingPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name")
    .eq("owner_user_id", profile.id)
    .single();

  if (!business) redirect("/vendor/business");

  const [{ data: makes }, { data: models }] = await Promise.all([
    supabase.from("makes").select("id, name, slug, logo_url").order("name"),
    supabase.from("models").select("id, make_id, name, slug, body_type").order("name"),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Add a car</h1>
        <p className="mt-1 text-sm text-ink-500">
          {business.name} · Step 1 of 5
        </p>
      </div>

      <WizardProgress currentStep={1} />

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-ink-900">Basic details</h2>
          <p className="mt-0.5 text-sm text-ink-400">
            Tell us about the vehicle — make, model, year, and key specs.
          </p>
        </div>
        <Step1Basics
          businessId={business.id}
          makes={makes ?? []}
          models={models ?? []}
        />
      </div>
    </div>
  );
}
