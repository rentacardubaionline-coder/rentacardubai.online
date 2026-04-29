import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ArrowLeft,
  Building2,
  Phone,
  MessageCircle,
  MapPin,
  Car,
  BadgeCheck,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { OcdDealerActions } from "@/components/admin/ocd/dealer-actions";
import { OcdImage } from "@/components/admin/ocd/ocd-image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OCDDealerDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const db = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dealer, error } = await (db as any)
    .from("ocd_scraped_dealers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !dealer) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listings } = await (db as any)
    .from("ocd_scraped_listings")
    .select("*")
    .eq("dealer_id", id)
    .order("daily_rate_aed", { ascending: true });

  const allListings: any[] = listings ?? [];
  const importedCount = allListings.filter((l) => l.status === "imported").length;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/admin/ocd/dealers"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dealers
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Dealer info */}
          <div className="flex items-start gap-4">
            {dealer.logo_url ? (
              <OcdImage
                src={dealer.logo_url}
                alt={dealer.ocd_company_name}
                className="h-16 w-16 rounded-xl border border-border object-contain bg-white"
                placeholderClassName="flex h-16 w-16 items-center justify-center rounded-xl bg-ink-100 text-ink-400"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-ink-100 text-ink-400">
                <Building2 className="h-8 w-8" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black text-ink-900">{dealer.ocd_company_name}</h1>
                {dealer.is_verified && (
                  <BadgeCheck className="h-5 w-5 text-sky-500" aria-label="Verified on OCD" />
                )}
                {dealer.is_premium && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                    PREMIUM
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                {dealer.area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {dealer.area}, {dealer.city}
                  </span>
                )}
                {dealer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {dealer.phone}
                  </span>
                )}
                {dealer.whatsapp && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {dealer.whatsapp}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" />
                  {dealer.listing_count ?? allListings.length} listings
                </span>
              </div>

              {dealer.description && (
                <p className="mt-2 text-sm text-ink-600 max-w-xl leading-relaxed">
                  {dealer.description}
                </p>
              )}

              {dealer.working_hours && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {Object.entries(dealer.working_hours as Record<string, string>)
                      .slice(0, 2)
                      .map(([day, hrs]) => `${day}: ${hrs}`)
                      .join(" · ")}
                    {Object.keys(dealer.working_hours as object).length > 2 ? " …" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <OcdDealerActions dealer={dealer} />
        </div>

        {/* Import status if already done */}
        {dealer.status === "imported" && dealer.imported_business_id && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-700 font-medium">
              Imported — {importedCount} listings live
            </span>
            <Link
              href={`/admin/businesses`}
              className="ml-auto flex items-center gap-1 text-xs text-emerald-600 hover:underline"
            >
              View Business <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Listings */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">
            Listings ({allListings.length})
          </h2>
          {importedCount > 0 && (
            <span className="text-xs text-emerald-600 font-medium">
              {importedCount} imported
            </span>
          )}
        </div>

        {allListings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white py-12 text-center">
            <Car className="h-8 w-8 text-ink-300" />
            <p className="text-sm text-ink-500">No listings scraped for this dealer yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allListings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const isImported = listing.status === "imported";

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${isImported ? "border-emerald-200 bg-emerald-50/30" : "border-border"}`}
    >
      {/* Image */}
      {listing.primary_image_url ? (
        <OcdImage
          src={listing.primary_image_url}
          alt={`${listing.make} ${listing.model}`}
          className="mb-3 h-36 w-full rounded-lg object-cover bg-surface-muted"
          placeholderClassName="mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-surface-muted"
        />
      ) : (
        <div className="mb-3 flex h-36 w-full items-center justify-center rounded-lg bg-surface-muted">
          <Car className="h-10 w-10 text-ink-300" />
        </div>
      )}

      {/* Title + status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink-900">
            {listing.make} {listing.model} {listing.year ?? ""}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            {listing.body_type ?? "—"} · {listing.transmission ?? "—"} · {listing.fuel_type ?? "—"}
          </p>
        </div>
        {isImported && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
        )}
      </div>

      {/* Specs row */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
        {listing.seats && <span>{listing.seats} seats</span>}
        {listing.doors && <span>{listing.doors} doors</span>}
        {listing.luggage_bags && <span>{listing.luggage_bags} bags</span>}
        {listing.spec_type && (
          <span className="font-medium text-sky-700">{listing.spec_type}</span>
        )}
        {listing.color_exterior && <span>{listing.color_exterior}</span>}
      </div>

      {/* Pricing */}
      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-2 text-center">
        {listing.daily_rate_aed && (
          <div>
            <p className="text-[10px] text-ink-400">Daily</p>
            <p className="text-xs font-bold text-ink-900">AED {listing.daily_rate_aed}</p>
          </div>
        )}
        {listing.weekly_rate_aed && (
          <div>
            <p className="text-[10px] text-ink-400">Weekly</p>
            <p className="text-xs font-bold text-ink-900">AED {listing.weekly_rate_aed}</p>
          </div>
        )}
        {listing.monthly_rate_aed && (
          <div>
            <p className="text-[10px] text-ink-400">Monthly</p>
            <p className="text-xs font-bold text-ink-900">AED {listing.monthly_rate_aed}</p>
          </div>
        )}
      </div>

      {/* Policies */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
        {listing.insurance_included && <span className="text-emerald-600">✓ Insurance</span>}
        {listing.free_delivery && <span className="text-emerald-600">✓ Free Delivery</span>}
        {listing.deposit_aed && (
          <span className="text-ink-500">Deposit: AED {listing.deposit_aed}</span>
        )}
        {listing.salik_charges_aed && (
          <span className="text-ink-500">Salik: AED {listing.salik_charges_aed}</span>
        )}
      </div>

      {/* Features preview */}
      {listing.features && listing.features.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(listing.features as string[]).slice(0, 4).map((f: string) => (
            <span
              key={f}
              className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600"
            >
              {f}
            </span>
          ))}
          {listing.features.length > 4 && (
            <span className="text-[10px] text-ink-400">
              +{listing.features.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Image count + links */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
        <span>{listing.image_urls?.length ?? 0} photos · OCD #{listing.ocd_listing_id}</span>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/ocd/listings/${listing.id}`}
            className="font-medium text-amber-600 hover:underline"
          >
            View
          </Link>
          <a
            href={listing.ocd_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-0.5 hover:text-amber-600 transition-colors"
          >
            OCD <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
