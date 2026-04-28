import { notFound, redirect } from "next/navigation";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { WizardProgress } from "@/components/vendor/wizard/wizard-progress";
import { Step1Basics } from "@/components/vendor/wizard/step1-basics";
import { Step2Features } from "@/components/vendor/wizard/step2-features";
import { Step3Pricing } from "@/components/vendor/wizard/step3-pricing";
import { Step4Policies } from "@/components/vendor/wizard/step4-policies";
import { Step5Images } from "@/components/vendor/wizard/step5-images";

const STEP_META = [
  { title: "Basic details", desc: "Vehicle make, model, year, and key specs." },
  { title: "Features", desc: "Select all features and amenities that apply." },
  {
    title: "Pricing & modes",
    desc: "Set your rental rates and available rental modes.",
  },
  {
    title: "Policies",
    desc: "Security deposit, age requirement, and delivery options.",
  },
  {
    title: "Photos",
    desc: "Upload clear photos — well-lit exteriors and interior.",
  },
] as const;

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
  const step = Math.min(5, Math.max(1, Number(stepParam ?? 1))) as
    | 1
    | 2
    | 3
    | 4
    | 5;

  const supabase = await createClient();

  // Fetch listing with all related data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing } = await (supabase as any)
    .from("listings")
    .select(
      `id, title, city, year, color, transmission, fuel, seats, description, status, model_id, tier_code,
       business:business_id(id, owner_user_id),
       pricing:listing_pricing(tier, price_pkr),
       modes:listing_modes(mode, surcharge_pkr),
       policy:listing_policies(deposit_pkr, min_age, license_required, cancellation_text, delivery_available, delivery_fee_pkr),
       images:listing_images(cloudinary_public_id, url, sort_order, is_primary),
       selected_features:listing_features(feature_id)`,
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();

  // Add-ons fetched separately so a missing table (migration not yet run)
  // doesn't break the whole edit page — just hides the add-ons list.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let addons: {
    id: string;
    title: string;
    description: string | null;
    price_pkr: number;
  }[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: addonRows } = await (supabase as any)
      .from("listing_addons")
      .select("id, title, description, price_pkr")
      .eq("listing_id", id)
      .order("sort_order");
    addons = addonRows ?? [];
  } catch {
    addons = [];
  }
  // If business is missing or not owned by this vendor, deny access
  // Admins can bypass this to fix/update any listing.
  const isOwner =
    listing.business && listing.business.owner_user_id === profile.id;
  const isAdmin = profile.role === "admin";

  if (!isOwner && !isAdmin) {
    redirect("/vendor/listings");
  }

  // Fetch reference data (always fetch for step 1 & 2; minimal cost)
  const [
    { data: makes },
    { data: models },
    { data: allFeatures },
    { data: cities },
  ] = await Promise.all([
    supabase.from("makes").select("id, name, slug").order("name"),
    supabase
      .from("models")
      .select("id, make_id, name, slug, body_type")
      .order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("vehicle_features")
      .select("id, name, slug, group, icon_url")
      .order("name"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("cities")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name"),
  ]);

  const policy = Array.isArray(listing.policy)
    ? listing.policy[0]
    : listing.policy;
  const selectedFeatureIds: string[] = (listing.selected_features ?? []).map(
    (f: { feature_id: string }) => f.feature_id,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasSelfDrive = (listing.modes ?? []).some(
    (m: any) => m.mode === "self_drive",
  );

  // Fetch custom policies — tolerate a missing table (pre-migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let customPolicies: { title: string; content: string }[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: polRows } = await (supabase as any)
      .from("listing_custom_policies")
      .select("title, content")
      .eq("listing_id", id)
      .order("sort_order");
    customPolicies = polRows ?? [];
  } catch {
    customPolicies = [];
  }

  const meta = STEP_META[step - 1];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Edit listing</h1>
        <p className="mt-1 line-clamp-1 text-sm text-ink-500">
          {listing.title} · Step {step} of 5
        </p>
      </div>

      <WizardProgress
        currentStep={step}
        listingId={id}
        hasSelfDrive={hasSelfDrive}
      />

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-bold text-ink-900">{meta.title}</h2>
          <p className="mt-0.5 text-sm text-ink-400">{meta.desc}</p>
        </div>
        {step === 1 && (
          <Step1Basics
            businessId={listing.business.id}
            listingId={listing.id}
            makes={makes ?? []}
            models={models ?? []}
            cities={
              (cities ?? []) as { id: string; name: string; slug: string }[]
            }
            defaults={{
              title: listing.title,
              city: listing.city,
              year: listing.year,
              color: listing.color,
              transmission: listing.transmission,
              fuel: listing.fuel,
              seats: listing.seats,
              model_id: listing.model_id ?? undefined,
              tier_code: listing.tier_code ?? null,
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
          <Step3Pricing
            listingId={listing.id}
            pricing={listing.pricing ?? []}
            modes={listing.modes ?? []}
            addons={addons}
          />
        )}
        {step === 4 && (
          <Step4Policies listingId={listing.id} policies={customPolicies} />
        )}
        {step === 5 && (
          <Step5Images
            listingId={listing.id}
            hasSelfDrive={hasSelfDrive}
            existingImages={[...(listing.images ?? [])].sort(
              (a: { sort_order: number }, b: { sort_order: number }) =>
                a.sort_order - b.sort_order,
            )}
          />
        )}
      </div>
    </div>
  );
}
