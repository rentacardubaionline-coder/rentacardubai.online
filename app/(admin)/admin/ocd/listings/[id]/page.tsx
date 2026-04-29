import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ArrowLeft, ExternalLink, Car, CheckCircle2, MapPin,
  Video, AlertCircle, Info,
} from "lucide-react";
import { OcdImage } from "@/components/admin/ocd/ocd-image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OCDListingDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const db = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing, error } = await (db as any)
    .from("ocd_scraped_listings")
    .select("*, dealer:dealer_id(id, ocd_company_name, logo_url, area, city, phone, whatsapp, status)")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  const dealer          = listing.dealer ?? {};
  const images: string[]  = listing.image_urls  ?? [];
  const videos: string[]  = listing.video_urls  ?? [];
  const features: string[] = listing.features   ?? [];
  const paymentMethods: string[] = listing.payment_methods ?? [];
  const cur: string = listing.currency || "AED";

  function fmt(v: number | null | undefined) {
    if (v == null) return null;
    return `${cur} ${v.toLocaleString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={dealer.id ? `/admin/ocd/dealers/${dealer.id}` : "/admin/ocd/dealers"}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to {dealer.ocd_company_name ?? "Dealer"}
      </Link>

      {/* Title row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black text-ink-900">
              {listing.make} {listing.model} {listing.year ?? ""}
            </h1>
            {listing.status === "imported" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Imported
              </span>
            )}
            {listing.is_premium && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                PREMIUM
              </span>
            )}
          </div>

          {/* Location */}
          {(listing.location || dealer.area) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {listing.location || `${dealer.area}, ${dealer.city}`}
            </p>
          )}

          <p className="mt-1 text-sm text-ink-400">
            OCD #{listing.ocd_listing_id} · scraped{" "}
            {new Date(listing.scraped_at).toLocaleDateString("en-AE", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <a
          href={listing.ocd_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-surface-muted shadow-sm transition-colors"
        >
          View on OCD <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Left: images + specs ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Image gallery */}
          {images.length > 0 ? (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">
                Photos ({images.length})
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((imgUrl, i) => (
                  <OcdImage
                    key={i}
                    src={imgUrl}
                    alt={`Photo ${i + 1}`}
                    href={imgUrl}
                    className="aspect-[4/3] w-full rounded-lg object-cover bg-surface-muted hover:opacity-90 transition-opacity"
                    placeholderClassName="aspect-[4/3] w-full flex items-center justify-center rounded-lg bg-surface-muted"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted/50">
              <div className="text-center text-ink-400">
                <Car className="mx-auto h-8 w-8 mb-1" />
                <p className="text-sm">No images scraped</p>
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">
                Videos ({videos.length})
              </p>
              <div className="flex flex-col gap-2">
                {videos.map((v, i) => (
                  <a
                    key={i}
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted/40 px-3 py-2 text-sm text-ink-700 hover:bg-surface-muted transition-colors"
                  >
                    <Video className="h-4 w-4 shrink-0 text-sky-500" />
                    <span className="truncate">{v}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-400 ml-auto" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Car specs */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-400">
              Specifications
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 text-sm">
              {[
                ["Make",           listing.make],
                ["Model",          listing.model],
                ["Year",           listing.year],
                ["Body Type",      listing.body_type],
                ["Transmission",   listing.transmission],
                ["Fuel",           listing.fuel_type],
                ["Engine",         listing.engine_capacity],
                ["Seats",          listing.seats],
                ["Doors",          listing.doors],
                ["Luggage",        listing.luggage_bags ? `${listing.luggage_bags} bags` : null],
                ["Ext. Color",     listing.color_exterior],
                ["Int. Color",     listing.color_interior],
                ["Spec",           listing.spec_type],
                ["Payment Modes",  listing.payment_modes],
              ].filter(([, v]) => v != null).map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
                  <dd className="mt-0.5 font-medium text-ink-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">
                Features ({features.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {features.map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-surface-muted bg-surface-muted/50 px-3 py-1 text-xs font-medium text-ink-700"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements to rent */}
          {listing.requirements_to_rent && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-sky-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Requirements to Rent</p>
              </div>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                {listing.requirements_to_rent}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: pricing + policies + dealer ──────────────────────────── */}
        <div className="space-y-4">

          {/* Pricing */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-400">
              Pricing <span className="normal-case font-normal text-ink-400">({cur})</span>
            </p>
            <div className="space-y-2">
              {[
                {
                  label: "Daily",
                  rate: listing.daily_rate_aed,
                  original: listing.daily_rate_original,
                  km: listing.daily_km_included,
                },
                {
                  label: "Weekly",
                  rate: listing.weekly_rate_aed,
                  original: listing.weekly_rate_original,
                  km: listing.weekly_km_included,
                },
                {
                  label: "Monthly",
                  rate: listing.monthly_rate_aed,
                  original: listing.monthly_rate_original,
                  km: listing.monthly_km_included,
                },
              ].map(({ label, rate, original, km }) =>
                rate ? (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-surface-muted/60 px-3 py-2.5">
                    <span className="text-sm font-medium text-ink-700">{label}</span>
                    <div className="text-right">
                      {original && original !== rate && (
                        <p className="text-[11px] text-ink-400 line-through">
                          {cur} {original.toLocaleString()}
                        </p>
                      )}
                      <p className="text-sm font-bold text-ink-900">
                        {cur} {rate.toLocaleString()}
                      </p>
                      {km && <p className="text-[11px] text-ink-500">{km.toLocaleString()} km incl.</p>}
                    </div>
                  </div>
                ) : null
              )}
            </div>

            {/* Extra km */}
            {(listing.extra_km_rate || listing.extra_km_rate_aed) && (
              <p className="mt-2 text-xs text-ink-500">
                Extra km:{" "}
                {listing.extra_km_rate
                  ? `${listing.extra_km_currency || cur} ${listing.extra_km_rate}/km`
                  : `AED ${listing.extra_km_rate_aed}/km`}
              </p>
            )}
          </div>

          {/* Policies */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-ink-400">Policies</p>
            <dl className="space-y-2 text-sm">
              {listing.deposit_aed && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Deposit</dt>
                  <dd className="font-medium text-ink-900">AED {listing.deposit_aed.toLocaleString()}</dd>
                </div>
              )}
              {listing.salik_charges_aed && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Salik / Toll</dt>
                  <dd className="font-medium text-ink-900">AED {listing.salik_charges_aed}/day</dd>
                </div>
              )}
              {listing.vat_percentage && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">VAT</dt>
                  <dd className="font-medium text-ink-900">{listing.vat_percentage}%</dd>
                </div>
              )}
              {listing.min_rental_days > 1 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Min. Rental</dt>
                  <dd className="font-medium text-ink-900">{listing.min_rental_days} days</dd>
                </div>
              )}
              {listing.fuel_policy && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Fuel Policy</dt>
                  <dd className="font-medium text-ink-900 text-right max-w-[55%]">{listing.fuel_policy}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Insurance</dt>
                <dd className={`font-medium ${listing.insurance_included ? "text-emerald-600" : "text-ink-900"}`}>
                  {listing.insurance_included ? "Included" : "Not included"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Delivery</dt>
                <dd className={`font-medium ${listing.free_delivery ? "text-emerald-600" : "text-ink-900"}`}>
                  {listing.free_delivery ? "Free" : "Not available"}
                </dd>
              </div>
              {paymentMethods.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-500">Payment</dt>
                  <dd className="font-medium text-ink-900 text-right">{paymentMethods.join(", ")}</dd>
                </div>
              )}
              {listing.additional_charges && (
                <div className="pt-1 border-t border-border">
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 mb-0.5">Additional Charges</dt>
                  <dd className="text-xs text-ink-600">{listing.additional_charges}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Rental Terms */}
          {(listing.mileage_policy || listing.deposit_policy || listing.rental_policy || listing.fuel_policy) && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Rental Terms</p>
              {[
                ["Mileage Policy",  listing.mileage_policy],
                ["Fuel Policy",     listing.fuel_policy],
                ["Deposit Policy",  listing.deposit_policy],
                ["Rental Policy",   listing.rental_policy],
              ].filter(([, v]) => v).map(([label, text]) => (
                <div key={label as string}>
                  <p className="text-xs font-semibold text-ink-700 mb-0.5">{label}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Special offer */}
          {(listing.special_offer_heading || listing.special_offer || listing.special_offer_body) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="font-semibold text-amber-800">
                  {listing.special_offer_heading || "Special Offer"}
                </p>
              </div>
              {listing.special_offer_body && (
                <p className="text-amber-700 text-sm leading-relaxed pl-5">
                  {listing.special_offer_body}
                </p>
              )}
              {!listing.special_offer_body && listing.special_offer && (
                <p className="text-amber-700 text-sm pl-5">{listing.special_offer}</p>
              )}
              {listing.special_offer_disclaimer && (
                <p className="text-[11px] text-amber-600/80 italic pl-5 border-t border-amber-200 pt-1 mt-1">
                  {listing.special_offer_disclaimer}
                </p>
              )}
            </div>
          )}

          {/* Dealer */}
          {dealer.ocd_company_name && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-400">Dealer</p>
              <div className="flex items-start gap-3">
                {dealer.logo_url ? (
                  <OcdImage
                    src={dealer.logo_url}
                    alt={dealer.ocd_company_name}
                    className="h-10 w-10 rounded-lg border border-border object-contain bg-white shrink-0"
                    placeholderClassName="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                    <Car className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900">{dealer.ocd_company_name}</p>
                  {dealer.area && (
                    <p className="flex items-center gap-1 text-xs text-ink-500 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {dealer.area}, {dealer.city}
                    </p>
                  )}
                </div>
              </div>
              {/* Dealer note */}
              {listing.dealer_note && (
                <p className="mt-3 text-xs text-ink-500 leading-relaxed border-t border-border pt-2">
                  {listing.dealer_note}
                </p>
              )}
              <Link
                href={`/admin/ocd/dealers/${dealer.id}`}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
              >
                View all listings from this dealer →
              </Link>
            </div>
          )}

          {/* OCD metadata */}
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm text-xs text-ink-500 space-y-1">
            <p><span className="font-medium text-ink-700">OCD ID:</span> {listing.ocd_listing_id}</p>
            {listing.ocd_last_updated && (
              <p><span className="font-medium text-ink-700">Last updated on OCD:</span> {listing.ocd_last_updated}</p>
            )}
            <p>
              <span className="font-medium text-ink-700">Scraped:</span>{" "}
              {new Date(listing.scraped_at).toLocaleString("en-AE")}
            </p>
            <p>
              <span className="font-medium text-ink-700">Currency:</span>{" "}
              {listing.currency || "AED"}
            </p>
            <p>
              <span className="font-medium text-ink-700">Status:</span>{" "}
              <span className={listing.status === "imported" ? "text-emerald-600 font-semibold" : ""}>{listing.status}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
