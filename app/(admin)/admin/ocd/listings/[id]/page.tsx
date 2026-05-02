export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ArrowLeft, ExternalLink, Car, CheckCircle2, MapPin, Phone,
  MessageCircle, Video, Info, Shield, Truck, Calendar,
  Fuel, Gauge, Users, DoorOpen, Briefcase, Palette, Clock,
  CreditCard, ChevronRight, Sparkles,
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
    .select("*, dealer:dealer_id(id, ocd_company_name, logo_url, area, city, phone, whatsapp, status, dealer_note)")
    .eq("id", id)
    .single();

  if (error || !listing) notFound();

  const dealer = listing.dealer ?? {};
  const images: string[] = listing.image_urls ?? [];
  const videos: string[] = listing.video_urls ?? [];
  const features: string[] = listing.features ?? [];
  const featuresByCategory = listing.features_by_category as Record<string, string[]> | null;
  const paymentMethods: string[] = listing.payment_methods ?? [];
  const cur: string = listing.currency || "AED";
  const hasPricing = listing.daily_rate_aed || listing.weekly_rate_aed || listing.monthly_rate_aed;

  const fmtMoney = (v: number | null | undefined, currency = cur) =>
    v != null ? `${currency} ${Number(v).toLocaleString()}` : null;

  return (
    <div className="min-h-screen bg-surface-muted/30">
      {/* ── Sticky top nav bar ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href={dealer.id ? `/admin/ocd/dealers/${dealer.id}` : "/admin/ocd/dealers"}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {dealer.ocd_company_name ?? "Back to Dealers"}
          </Link>
          <div className="flex items-center gap-2">
            {listing.status === "imported" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" /> Imported
              </span>
            )}
            {listing.is_premium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                <Sparkles className="h-3 w-3" /> Premium
              </span>
            )}
            <a
              href={listing.ocd_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-surface-muted shadow-sm transition-colors"
            >
              View on OCD <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero Image Gallery ───────────────────────────────────────────── */}
      <div className="relative bg-ink-950 overflow-hidden" style={{ height: 420 }}>
        {images.length > 0 ? (
          <div className="grid h-full gap-0.5" style={{ gridTemplateColumns: "55% 1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
            {/* Hero image — spans 2 rows */}
            <div className="row-span-2 overflow-hidden relative">
              <OcdImage
                src={images[0]}
                alt="Main photo"
                href={images[0]}
                className="h-full w-full object-cover hover:scale-[1.03] transition-transform duration-700"
                placeholderClassName="h-full w-full flex items-center justify-center bg-ink-900"
              />
              {/* Special offer badge */}
              {(listing.special_offer_heading || listing.special_offer) && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    🎁 Special Offer
                  </span>
                </div>
              )}
            </div>
            {/* 4 smaller thumbnails */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative overflow-hidden">
                {images[i] ? (
                  <>
                    <OcdImage
                      src={images[i]}
                      alt={`Photo ${i + 1}`}
                      href={images[i]}
                      className="h-full w-full object-cover hover:scale-[1.05] transition-transform duration-500"
                      placeholderClassName="h-full w-full flex items-center justify-center bg-ink-900"
                    />
                    {/* "Show all" overlay on the last thumbnail */}
                    {i === 4 && images.length > 5 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/55 hover:bg-black/65 transition-colors cursor-pointer">
                        <div className="text-center">
                          <p className="text-lg font-black text-white">+{images.length - 5}</p>
                          <p className="text-xs font-medium text-white/80">more photos</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-ink-900" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-ink-600">
              <Car className="mx-auto h-14 w-14 mb-3 opacity-30" />
              <p className="text-sm font-medium">No images scraped</p>
            </div>
          </div>
        )}

        {/* Bottom-right pill badges */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {images.length > 0 && (
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              📷 {images.length} photos
            </span>
          )}
          {videos.length > 0 && (
            <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm flex items-center gap-1">
              <Video className="h-3 w-3" /> {videos.length} video{videos.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ══════════════ Left / Main column ══════════════ */}
        <div className="lg:col-span-2 space-y-5">

          {/* ── Title + badges + location ──────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h1 className="text-[22px] font-black text-ink-900 leading-snug">
              Rent {listing.make} {listing.model} {listing.year ?? ""}
            </h1>

            {/* Spec pill badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {listing.year && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600">
                  <Calendar className="h-3 w-3" /> {listing.year}
                </span>
              )}
              {listing.spec_type && (
                <span className="rounded-full bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
                  {listing.spec_type}
                </span>
              )}
              {listing.body_type && (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600">
                  {listing.body_type}
                </span>
              )}
              {listing.transmission && (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600 capitalize">
                  {listing.transmission}
                </span>
              )}
              {listing.fuel_type && (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600 capitalize">
                  {listing.fuel_type}
                </span>
              )}
            </div>

            {/* Location + last-updated */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-500">
              {(listing.location || dealer.area) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  {listing.location || `${dealer.area}, ${dealer.city}`}
                </span>
              )}
              {listing.ocd_last_updated && (
                <span className="flex items-center gap-1 text-xs text-ink-400">
                  <Clock className="h-3 w-3" /> Updated {listing.ocd_last_updated}
                </span>
              )}
            </div>
          </div>

          {/* ── Pricing ────────────────────────────────────────────────── */}
          {hasPricing && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Pricing</p>
              </div>

              {/* Three period columns */}
              <div className="mt-3 grid grid-cols-3 border-t border-b border-border divide-x divide-border">
                {[
                  { label: "/day",   rate: listing.daily_rate_aed,   orig: listing.daily_rate_original,   km: listing.daily_km_included,   extraKm: listing.daily_extra_km_rate,   extraCur: listing.daily_extra_km_currency },
                  { label: "/week",  rate: listing.weekly_rate_aed,  orig: listing.weekly_rate_original,  km: listing.weekly_km_included,  extraKm: listing.weekly_extra_km_rate,  extraCur: listing.weekly_extra_km_currency },
                  { label: "/month", rate: listing.monthly_rate_aed, orig: listing.monthly_rate_original, km: listing.monthly_km_included, extraKm: listing.monthly_extra_km_rate, extraCur: listing.monthly_extra_km_currency },
                ].map(({ label, rate, orig, km, extraKm, extraCur }) => (
                  <div key={label} className={`px-4 py-5 text-center ${!rate ? "opacity-40" : ""}`}>
                    {/* Original price (strikethrough) */}
                    {orig && orig !== rate ? (
                      <p className="text-[11px] text-ink-400 line-through leading-none mb-0.5">
                        {cur} {Number(orig).toLocaleString()}
                      </p>
                    ) : <div className="h-4" />}
                    {/* Current price */}
                    <p className="text-2xl font-black text-ink-900 leading-none">
                      {rate ? `${cur} ${Number(rate).toLocaleString()}` : "—"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-ink-400">{label}</p>
                    {/* KM included */}
                    {km && (
                      <p className="mt-2 inline-flex items-center gap-0.5 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-ink-500">
                        <Gauge className="h-2.5 w-2.5" /> {Number(km).toLocaleString()} km
                      </p>
                    )}
                    {/* Per-period extra km rate */}
                    {extraKm && (
                      <p className="mt-1 text-[10px] text-ink-400">
                        +{extraCur || cur} {extraKm}/km
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Mileage info row */}
              <div className="px-5 py-3 space-y-2.5">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-600">
                  {listing.daily_km_included && (
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5 text-ink-400" />
                      Included mileage limit:{" "}
                      <strong className="text-ink-900">{Number(listing.daily_km_included).toLocaleString()} km</strong>
                    </span>
                  )}
                  {(listing.extra_km_rate || listing.extra_km_rate_aed) && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-ink-400 font-bold">+</span>
                      Additional mileage charge:{" "}
                      <strong className="text-ink-900">
                        {listing.extra_km_rate
                          ? `${listing.extra_km_currency || cur} ${listing.extra_km_rate}/km`
                          : `AED ${listing.extra_km_rate_aed}/km`}
                      </strong>
                    </span>
                  )}
                </div>

                {/* Policy badge row */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {listing.min_rental_days <= 1 ? "1 day rental available" : `Min. ${listing.min_rental_days} days`}
                  </span>
                  {listing.insurance_included && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Shield className="h-3 w-3" /> Insurance included
                    </span>
                  )}
                  {listing.free_delivery && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <Truck className="h-3 w-3" /> Free delivery
                    </span>
                  )}
                  {listing.deposit_aed && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted border border-border px-3 py-1 text-xs font-medium text-ink-600">
                      Deposit: AED {Number(listing.deposit_aed).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Special Offer ───────────────────────────────────────────── */}
          {(listing.special_offer_heading || listing.special_offer_body || listing.special_offer) && (
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0 mt-0.5">🎁</span>
                <div className="min-w-0">
                  <p className="font-bold text-amber-900 text-base leading-tight">
                    {listing.special_offer_heading || "Special Offer"}
                  </p>
                  {listing.special_offer_body && (
                    <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                      {listing.special_offer_body}
                    </p>
                  )}
                  {!listing.special_offer_body && listing.special_offer &&
                    listing.special_offer !== listing.special_offer_heading && (
                      <p className="mt-1 text-sm text-amber-800">{listing.special_offer}</p>
                  )}
                  {listing.special_offer_disclaimer && (
                    <p className="mt-2.5 text-[11px] text-amber-600/80 italic border-t border-amber-200/70 pt-2">
                      ⓘ {listing.special_offer_disclaimer}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Car Overview ────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Car Overview</p>
            </div>
            <div className="divide-y divide-border">
              {([
                [
                  { icon: <Car className="h-3.5 w-3.5" />,         label: "Body Type",               value: listing.body_type },
                  { icon: <CreditCard className="h-3.5 w-3.5" />,  label: "Payment Modes",           value: listing.payment_modes || (paymentMethods.length ? paymentMethods.join(", ") : null) },
                ],
                [
                  { icon: <span className="text-xs">🛣️</span>,    label: "Salik / Toll Charges",    value: listing.salik_charges_aed ? `AED ${listing.salik_charges_aed}/day` : null },
                  { icon: null,                                      label: "Make",                    value: listing.make },
                ],
                [
                  { icon: null,                                      label: "Model",                   value: listing.model },
                  { icon: null,                                      label: "Gearbox",                 value: listing.transmission ? listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1) : null },
                ],
                [
                  { icon: <Fuel className="h-3.5 w-3.5" />,        label: "Engine Capacity",         value: listing.engine_capacity },
                  { icon: <Users className="h-3.5 w-3.5" />,       label: "Seating Capacity",        value: listing.seats ? `${listing.seats} passengers` : null },
                ],
                [
                  { icon: <DoorOpen className="h-3.5 w-3.5" />,    label: "No. of Doors",            value: listing.doors },
                  { icon: <Briefcase className="h-3.5 w-3.5" />,   label: "Fits No. of Bags",        value: listing.luggage_bags },
                ],
                [
                  { icon: <Fuel className="h-3.5 w-3.5" />,        label: "Fuel Type",               value: listing.fuel_type ? listing.fuel_type.charAt(0).toUpperCase() + listing.fuel_type.slice(1) : null },
                  { icon: <Palette className="h-3.5 w-3.5" />,     label: "Exterior / Interior Color", value: [listing.color_exterior, listing.color_interior].filter(Boolean).join(" / ") || null },
                ],
              ] as { icon: React.ReactNode; label: string; value: string | number | null }[][]).map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 divide-x divide-border">
                  {row.map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5 px-5 py-3.5">
                      {icon && <span className="mt-0.5 text-ink-400 shrink-0">{icon}</span>}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 leading-none">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink-900">
                          {value != null ? String(value) : <span className="text-ink-300 font-normal">—</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Features & Specs ─────────────────────────────────────────── */}
          {(features.length > 0 || (featuresByCategory && Object.keys(featuresByCategory).length > 0)) && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Features & Specs</p>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-500">
                  {featuresByCategory
                    ? Object.values(featuresByCategory).flat().length
                    : features.length}
                </span>
              </div>

              {featuresByCategory && Object.keys(featuresByCategory).length > 0 ? (
                <div className="divide-y divide-border">
                  {Object.entries(featuresByCategory).map(([cat, items]) => (
                    <div key={cat} className="px-5 py-4">
                      <p className="mb-3 text-sm font-bold text-ink-700">{cat}</p>
                      <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                        {(items as string[]).map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-ink-700">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-ink-700">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Requirements to Rent ─────────────────────────────────────── */}
          {listing.requirements_to_rent && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Info className="h-4 w-4 text-sky-500 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Requirements to Rent This Car</p>
                <ChevronRight className="h-4 w-4 text-ink-300 ml-auto" />
              </div>
              <div className="px-5 py-4 space-y-3">
                {/* Structured quick stats if available */}
                {(listing.min_driver_age || listing.security_deposit_amount) && (
                  <div className="flex flex-wrap gap-3 mb-1">
                    {listing.min_driver_age && (
                      <div className="rounded-xl bg-sky-50 border border-sky-100 px-4 py-3 text-center min-w-[110px]">
                        <p className="text-lg font-black text-sky-700">{listing.min_driver_age}+</p>
                        <p className="text-[11px] text-sky-600 font-medium">Min. Driver Age</p>
                      </div>
                    )}
                    {listing.security_deposit_amount && (
                      <div className="rounded-xl bg-ink-50 border border-border px-4 py-3 text-center min-w-[110px]">
                        <p className="text-lg font-black text-ink-800">
                          {fmtMoney(listing.security_deposit_amount, listing.security_deposit_currency || "AED")}
                        </p>
                        <p className="text-[11px] text-ink-500 font-medium">Security Deposit</p>
                        {listing.deposit_refund_period && (
                          <p className="text-[10px] text-ink-400 mt-0.5">Refund: {listing.deposit_refund_period}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-line">
                  {listing.requirements_to_rent}
                </p>
              </div>
            </div>
          )}

          {/* ── Videos ───────────────────────────────────────────────────── */}
          {videos.length > 0 && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Videos</p>
              </div>
              <div className="p-4 space-y-2">
                {videos.map((v, i) => (
                  <a
                    key={i}
                    href={v}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 px-4 py-3 text-sm text-ink-700 hover:bg-surface-muted hover:border-ink-200 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Video className="h-4 w-4" />
                    </div>
                    <span className="flex-1 truncate text-ink-700">Video {i + 1}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Admin metadata strip ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-white/60 px-5 py-4 text-xs text-ink-500 grid grid-cols-2 gap-x-6 gap-y-1.5 shadow-sm">
            <div><span className="font-semibold text-ink-700">OCD ID</span> · {listing.ocd_listing_id}</div>
            <div>
              <span className="font-semibold text-ink-700">Status</span> ·{" "}
              <span className={listing.status === "imported" ? "text-emerald-600 font-bold" : ""}>{listing.status}</span>
            </div>
            <div><span className="font-semibold text-ink-700">Currency</span> · {listing.currency || "AED"}</div>
            <div><span className="font-semibold text-ink-700">Scraped</span> · {new Date(listing.scraped_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        </div>

        {/* ══════════════ Right sidebar ══════════════ */}
        <div className="space-y-4 lg:sticky lg:top-[57px] lg:self-start">

          {/* ── Dealer Card ─────────────────────────────────────────────── */}
          {dealer.ocd_company_name && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {/* Open status banner */}
              <div className="bg-emerald-500 py-1.5 text-center text-[11px] font-bold tracking-widest text-white uppercase">
                Open Now
              </div>

              <div className="p-5">
                {/* Logo + name */}
                <div className="flex flex-col items-center text-center mb-5">
                  {dealer.logo_url ? (
                    <OcdImage
                      src={dealer.logo_url}
                      alt={dealer.ocd_company_name}
                      className="h-[72px] w-[72px] rounded-2xl border border-border object-contain bg-white mb-3 shadow-sm"
                      placeholderClassName="flex h-[72px] w-[72px] rounded-2xl items-center justify-center bg-surface-muted mb-3"
                    />
                  ) : (
                    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-surface-muted text-ink-400 mb-3">
                      <Car className="h-8 w-8" />
                    </div>
                  )}
                  <p className="font-bold text-ink-900 text-[15px] leading-tight">{dealer.ocd_company_name}</p>
                  {dealer.area && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                      <MapPin className="h-3 w-3" />
                      {dealer.area}, {dealer.city}
                    </p>
                  )}
                </div>

                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-widest text-ink-400">
                  Book Directly from the Dealer
                </p>

                {/* Call + WhatsApp */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <a
                    href={dealer.phone ? `tel:${dealer.phone}` : "#"}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white py-2.5 text-sm font-semibold text-ink-800 hover:bg-surface-muted transition-colors shadow-sm"
                  >
                    <Phone className="h-4 w-4 text-ink-500" /> Call
                  </a>
                  <a
                    href={dealer.whatsapp
                      ? `https://wa.me/${dealer.whatsapp.replace(/\D/g, "")}`
                      : (dealer.phone ? `https://wa.me/${dealer.phone.replace(/\D/g, "")}` : "#")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>

                {/* Dealer note */}
                {(listing.dealer_note || dealer.dealer_note) && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">Dealer Note</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      {listing.dealer_note || dealer.dealer_note}
                    </p>
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center justify-between text-xs border-t border-border pt-3">
                  <Link
                    href={`/admin/ocd/dealers/${dealer.id}`}
                    className="font-medium text-amber-600 hover:underline"
                  >
                    More Ads by the Dealer
                  </Link>
                  <a
                    href={listing.ocd_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 font-medium text-sky-600 hover:underline"
                  >
                    Dealer Info <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ── Rental Terms ────────────────────────────────────────────── */}
          {(listing.mileage_policy || listing.fuel_policy || listing.deposit_policy || listing.rental_policy) && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Rental Terms</p>
              </div>
              <div className="divide-y divide-border">
                {[
                  { emoji: "🛣️", label: "Mileage Policy",  text: listing.mileage_policy },
                  { emoji: "⛽",  label: "Fuel Policy",     text: listing.fuel_policy },
                  { emoji: "🔒",  label: "Deposit Policy",  text: listing.deposit_policy },
                  { emoji: "📋",  label: "Rental Policy",   text: listing.rental_policy },
                ].filter(({ text }) => text).map(({ emoji, label, text }) => (
                  <div key={label} className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span>{emoji}</span>
                      <p className="text-xs font-semibold text-ink-700">{label}</p>
                    </div>
                    <p className="text-xs text-ink-500 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Policies summary ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Quick Policies</p>
            </div>
            <dl className="divide-y divide-border">
              {[
                { label: "Deposit",       value: fmtMoney(listing.deposit_aed, "AED") },
                { label: "Salik / Toll",  value: listing.salik_charges_aed ? `AED ${listing.salik_charges_aed}/day` : null },
                { label: "VAT",           value: listing.vat_percentage ? `${listing.vat_percentage}%` : null },
                { label: "Min. Rental",   value: listing.min_rental_days > 1 ? `${listing.min_rental_days} days` : "1 day" },
                { label: "Insurance",     value: listing.insurance_included ? "✓ Included" : "Not included", green: listing.insurance_included },
                { label: "Delivery",      value: listing.free_delivery ? "✓ Free" : "Not available", green: listing.free_delivery },
              ].filter(({ value }) => value != null).map(({ label, value, green }) => (
                <div key={label} className="flex items-center justify-between px-5 py-2.5">
                  <dt className="text-xs text-ink-500">{label}</dt>
                  <dd className={`text-xs font-semibold ${green ? "text-emerald-600" : "text-ink-900"}`}>{value}</dd>
                </div>
              ))}
              {listing.additional_charges && (
                <div className="px-5 py-3">
                  <p className="text-[11px] font-bold text-ink-400 uppercase tracking-wide mb-1">Additional Charges</p>
                  <p className="text-xs text-ink-600 leading-relaxed">{listing.additional_charges}</p>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
