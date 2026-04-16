import { notFound, redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { WizardProgress } from "@/components/vendor/wizard/wizard-progress";
import { Step1Basics } from "@/components/vendor/wizard/step1-basics";
import { Step2Features } from "@/components/vendor/wizard/step2-features";
import { Step2Pricing } from "@/components/vendor/wizard/step2-pricing";
import { Step3Policies } from "@/components/vendor/wizard/step3-policies";
import { Step4Images } from "@/components/vendor/wizard/step4-images";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_TITLES = ["Basic details", "Features", "Pricing & modes", "Policies", "Photos"];

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const profile = await requireVendorMode();
  const { id } = await params;
  const { step: stepParam } = await searchParams;
  const step = Math.min(5, Math.max(1, Number(stepParam ?? 1))) as 1 | 2 | 3 | 4 | 5;

  const supabase = await createClient();

  // Fetch listing with all related data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing } = await (supabase as any)
    .from("listings")
    .select(
      `id, title, city, year, color, transmission, fuel, seats, mileage_km, description, status, model_id,
       business:business_id(id, owner_user_id),
       pricing:listing_pricing(tier, price_pkr),
       modes:listing_modes(mode, surcharge_pkr),
       policy:listing_policies(deposit_pkr, min_age, license_required, cancellation_text, delivery_available, delivery_fee_pkr),
       images:listing_images(cloudinary_public_id, url, sort_order, is_primary),
       selected_features:listing_features(feature_id)`
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();
  // If business is missing or not owned by this vendor, deny access
  if (!listing.business || listing.business.owner_user_id !== profile.id) redirect("/vendor/listings");

  // Fetch reference data (always fetch for step 1 & 2; minimal cost)
  const [{ data: makes }, { data: models }, { data: allFeatures }] = await Promise.all([
    supabase.from("makes").select("id, name, slug, logo_url").order("name"),
    supabase.from("models").select("id, make_id, name, slug, body_type").order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("vehicle_features").select("id, name, slug, group, icon_url").order("name"),
  ]);

  const policy = Array.isArray(listing.policy) ? listing.policy[0] : listing.policy;
  const selectedFeatureIds: string[] = (listing.selected_features ?? []).map(
    (f: { feature_id: string }) => f.feature_id
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Edit listing</h1>
        <p className="mt-1 line-clamp-1 text-sm text-ink-500">{listing.title}</p>
      </div>

      <WizardProgress currentStep={step} listingId={id} />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Step {step} — {STEP_TITLES[step - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Step1Basics
              businessId={listing.business.id}
              listingId={listing.id}
              makes={makes ?? []}
              models={models ?? []}
              defaults={{
                title: listing.title,
                city: listing.city,
                year: listing.year,
                color: listing.color,
                transmission: listing.transmission,
                fuel: listing.fuel,
                seats: listing.seats,
                mileage_km: listing.mileage_km,
                description: listing.description,
                model_id: listing.model_id ?? undefined,
              }}
            />
          )}
          {step === 2 && (
            <Step2Features
              listingId={listing.id}
              features={allFeatures ?? []}
              selectedIds={selectedFeatureIds}
            />
          )}
          {step === 3 && (
            <Step2Pricing
              listingId={listing.id}
              pricing={listing.pricing ?? []}
              modes={listing.modes ?? []}
            />
          )}
          {step === 4 && (
            <Step3Policies listingId={listing.id} policy={policy ?? {}} />
          )}
          {step === 5 && (
            <Step4Images
              listingId={listing.id}
              existingImages={
                [...(listing.images ?? [])].sort(
                  (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
                )
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
