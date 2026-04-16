import Link from "next/link";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ListingRow } from "@/components/vendor/listing-row";
import { ListingsTabs } from "@/components/vendor/listings-tabs";
import { Plus } from "lucide-react";

export default async function VendorListingsPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  // Get vendor's business
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business } = await (supabase as any)
    .from("businesses")
    .select("id, name")
    .eq("owner_user_id", profile.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings: any[] = business
    ? (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("listings")
          .select(
            "id, slug, title, city, status, rejection_reason, primary_image_url, created_at, pricing:listing_pricing(tier, price_pkr)"
          )
          .eq("business_id", business.id)
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  const tabs = [
    { label: "All", filter: null },
    { label: "Draft", filter: "draft" },
    { label: "Pending", filter: "pending" },
    { label: "Live", filter: "approved" },
    { label: "Rejected", filter: "rejected" },
    { label: "Unavailable", filter: "unavailable" },
  ];

  // Suppress unused import warning — ListingRow is used inside ListingsTabs
  void ListingRow;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">My Listings</h1>
          <p className="mt-1 text-sm text-ink-500">
            {business ? business.name : "Set up your business to start adding listings"}
          </p>
        </div>
        {business && (
          <Button render={<Link href="/vendor/listings/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            New listing
          </Button>
        )}
      </div>

      {!business ? (
        <div className="rounded-xl border border-dashed border-surface-muted bg-white p-12 text-center">
          <p className="text-sm text-ink-500">You need a business profile before adding listings.</p>
          <Button render={<Link href="/vendor/business" />} className="mt-4">
            Set up business
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-muted bg-white p-12 text-center">
          <p className="font-medium text-ink-700">No listings yet</p>
          <p className="mt-1 text-sm text-ink-400">Add your first vehicle to get started.</p>
          <Button render={<Link href="/vendor/listings/new" />} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add listing
          </Button>
        </div>
      ) : (
        <ListingsTabs listings={listings} tabs={tabs} />
      )}
    </div>
  );
}
