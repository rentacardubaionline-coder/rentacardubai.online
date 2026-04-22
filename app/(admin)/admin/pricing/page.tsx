import { requireRole } from "@/lib/auth/guards";
import { getPricingTiers } from "@/lib/pricing/tiers";
import { PricingEditor } from "@/components/admin/pricing-editor";

export default async function AdminPricingPage() {
  await requireRole("admin");
  const tiers = await getPricingTiers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-900">Pricing</h1>
        <p className="mt-1 text-sm text-ink-500">
          Per-lead rates vendors are charged. Updates take effect immediately on the vendor
          dashboard and are applied to future leads. Past billed leads are not reprised.
        </p>
      </div>

      <PricingEditor tiers={tiers} />
    </div>
  );
}
