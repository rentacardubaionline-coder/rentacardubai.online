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
    .select("id, name, city")
    .eq("owner_user_id", profile.id)
    .single();

  if (!business) redirect("/vendor/business");

  const [{ data: makes }, { data: models }] = await Promise.all([
    supabase.from("makes").select("id, name, slug, logo_url").order("name"),
    supabase.from("models").select("id, make_id, name, slug, body_type").order("name"),
  ]);

  return (
    /* Full-height app screen on mobile, constrained on desktop */
    <div className="flex min-h-0 flex-col">
      {/* App-style page header */}
      <div className="sticky top-0 z-10 border-b border-surface-muted bg-white/95 backdrop-blur px-4 py-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:px-0 sm:py-0">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600 sm:mb-1">
            {business.name}
          </p>
          <h1 className="text-lg font-extrabold text-ink-900 sm:text-2xl">Add a car</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-0 sm:pb-8 sm:pt-6">
          <WizardProgress currentStep={1} />

          {/* Step card */}
          <div className="rounded-none border-0 bg-white sm:rounded-2xl sm:border sm:border-surface-muted sm:shadow-card">
            {/* Card header */}
            <div className="border-b border-surface-muted px-4 py-4 sm:px-6">
              <h2 className="text-base font-bold text-ink-900">Basic details</h2>
              <p className="mt-0.5 text-sm text-ink-400">
                Make, model, year, and key specs about this vehicle.
              </p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <Step1Basics
                businessId={business.id}
                makes={makes ?? []}
                models={models ?? []}
                defaultCity={business.city}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
