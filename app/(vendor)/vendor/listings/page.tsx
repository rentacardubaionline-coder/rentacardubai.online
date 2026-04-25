import Link from "next/link";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { VendorListingsDashboard } from "@/components/vendor/listings/vendor-listings-dashboard";
import type { VendorListing } from "@/components/vendor/listings/vendor-listing-card";
import { Plus, Car } from "lucide-react";

function startOfMonth(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

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

  if (!business) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-ink-900">My listings</h1>
          <p className="mt-1 text-sm text-ink-500">
            Set up your business profile first, then start adding vehicles.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-muted bg-white p-12 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Car className="size-7" />
          </div>
          <h2 className="text-lg font-extrabold text-ink-900">Business profile needed</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Before adding vehicles you'll need to set up your rental agency profile — name, city,
            phone, and cover photo.
          </p>
          <Button render={<Link href="/vendor/business" />} className="mt-5">
            Set up business
          </Button>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(new Date());

  // Fetch listings + this-month's leads in parallel
  const [listingsRes, leadsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("listings")
      .select(
        "id, slug, title, city, status, rejection_reason, primary_image_url, created_at, pricing:listing_pricing(tier, price_pkr)",
      )
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("leads")
      .select("listing_id")
      .eq("vendor_user_id", profile.id)
      .gte("created_at", monthStart.toISOString()),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawListings = (listingsRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawLeads = (leadsRes.data ?? []) as { listing_id: string | null }[];

  const leadsByListing = new Map<string, number>();
  for (const l of rawLeads) {
    if (!l.listing_id) continue;
    leadsByListing.set(l.listing_id, (leadsByListing.get(l.listing_id) ?? 0) + 1);
  }

  const listings: VendorListing[] = rawListings.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    city: l.city,
    status: l.status,
    rejection_reason: l.rejection_reason ?? null,
    primary_image_url: l.primary_image_url ?? null,
    created_at: l.created_at,
    pricing: l.pricing ?? [],
    leads_this_month: leadsByListing.get(l.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-900 sm:text-3xl">My listings</h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage cars for <span className="font-semibold text-ink-700">{business.name}</span> — add,
            edit, and track leads per vehicle.
          </p>
        </div>
        <Button render={<Link href="/vendor/listings/new" />} className="shrink-0">
          <Plus className="mr-1.5 size-4" />
          New listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-muted bg-gradient-to-br from-white to-brand-50/30 p-12 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Car className="size-7" />
          </div>
          <h2 className="text-lg font-extrabold text-ink-900">Add your first vehicle</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-500">
            Listings with 3+ photos and clear pricing get the most leads. Takes about 2 minutes.
          </p>
          <Button render={<Link href="/vendor/listings/new" />} className="mt-5">
            <Plus className="mr-1.5 size-4" /> Add a listing
          </Button>
        </div>
      ) : (
        <VendorListingsDashboard listings={listings} />
      )}
    </div>
  );
}
