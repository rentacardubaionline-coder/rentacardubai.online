import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListingDetail } from "@/components/listing/listing-detail";
import { ListingDeleteButton } from "@/components/admin/listing-delete-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminListingPreviewPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const db = createAdminClient();

  const { data: listing } = await (db as any)
    .from("listings")
    .select(
      `
      id, slug, title, description, year, city, transmission, fuel, seats,
      color, mileage_km, primary_image_url, status, created_at,
      business:business_id (
        id, name, slug, phone, whatsapp_phone, address_line, city,
        cover_url, rating, reviews_count, claim_status
      ),
      images:listing_images (id, url, sort_order, is_primary),
      pricing:listing_pricing (tier, price_pkr, included_km_per_day, extra_km_rate_pkr, min_hours),
      policies:listing_policies (
        deposit_pkr, min_age, license_required, cancellation_text,
        delivery_available, delivery_fee_pkr
      ),
      mode:listing_modes (mode, surcharge_pkr),
      features:listing_features (
        feature:feature_id (id, name, slug, group)
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 border-amber-200 text-amber-800",
    draft: "bg-surface-muted border-border text-ink-600",
    rejected: "bg-rose-50 border-rose-200 text-rose-800",
    unavailable: "bg-surface-muted border-border text-ink-600",
    approved: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  const bannerCls = statusColors[listing.status] ?? statusColors.draft;

  return (
    <div className="space-y-4">
      {/* Admin nav bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/listings"
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>
        <ListingDeleteButton id={listing.id} title={listing.title} />
      </div>

      {/* Status banner */}
      {listing.status !== "approved" && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${bannerCls}`}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Admin preview — this listing is{" "}
          <strong className="ml-1 capitalize">{listing.status}</strong> and not
          visible to the public yet.
        </div>
      )}

      {/* Reuse the public listing detail component */}
      <ListingDetail listing={listing as any} />
    </div>
  );
}
