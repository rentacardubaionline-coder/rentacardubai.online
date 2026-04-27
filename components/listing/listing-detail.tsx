"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  MessageCircle,
  Gauge,
  Fuel,
  Users,
  Settings2,
  Calendar,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  CheckCircle2,
  ImageIcon,
  Grid3x3,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPkr, cn } from "@/lib/utils";
import { WhatsAppLeadModal, useWhatsAppLead } from "@/components/shared/whatsapp-lead-modal";
import { vendorUrl } from "@/lib/vendor/url";

interface ListingDetailProps {
  listing: any;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const rawImages: { url: string; is_primary?: boolean; sort_order?: number }[] = (
    listing.images ?? []
  )
    .slice()
    .sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  if (rawImages.length === 0 && listing.primary_image_url) {
    rawImages.push({ url: listing.primary_image_url, is_primary: true });
  }

  // Show only the actual images the vendor uploaded — no synthetic placeholders.
  const images = rawImages;

  const business = listing.business ?? {};
  const pricing: any[] = listing.pricing ?? [];
  const daily = pricing.find((p) => p.tier === "daily");
  const weekly = pricing.find((p) => p.tier === "weekly");
  const monthly = pricing.find((p) => p.tier === "monthly");
  const policies = listing.policies ?? {};

  const rating = Number.isFinite(business.rating) ? business.rating : 0;
  const reviewsCount = business.reviews_count ?? 0;

  const hasWhatsApp = !!(business.whatsapp_phone || business.phone);

  const { modalState, openModal, setOpen } = useWhatsAppLead();

  return (
    <div className="bg-surface-muted/40 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-0 md:px-6 md:py-8">
        {/* Breadcrumb — desktop has the full path; mobile gets a single
            truncated back-context line so the user knows where they are. */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm text-ink-500 mb-4">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/search" className="hover:text-brand-600">Cars</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/search?city=${listing.city}`}
            className="hover:text-brand-600"
          >
            {listing.city}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink-900 font-medium truncate">{listing.title}</span>
        </nav>

        <nav className="md:hidden flex items-center gap-1 text-xs text-ink-500 px-4 pt-3">
          <Link href="/search" className="hover:text-brand-600">Cars</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link
            href={`/search?city=${listing.city}`}
            className="hover:text-brand-600 truncate"
          >
            {listing.city}
          </Link>
        </nav>

        <Gallery images={images} title={listing.title} />

        {/* Title block */}
        <div className="px-4 pt-5 md:px-0 md:pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-ink-900 leading-tight">
                {listing.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-brand-600 font-medium">
                  <MapPin className="h-4 w-4" /> {listing.city}
                </span>
                {reviewsCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {rating.toFixed(1)}
                    <span className="font-normal text-amber-600">
                      ({reviewsCount})
                    </span>
                  </span>
                )}
                {business.name && (
                  <span className="text-ink-500">
                    by{" "}
                    <span className="font-medium text-ink-700">
                      {business.name}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-8 md:grid-cols-12 md:gap-8">
          {/* Left: content */}
          <div className="md:col-span-8 space-y-6">
            <PricingCard daily={daily} weekly={weekly} monthly={monthly} />

            <SpecsCard listing={listing} />

            {listing.description && (
              <section className="bg-white rounded-none md:rounded-2xl md:border md:border-black/5 md:shadow-card overflow-hidden px-4 py-5 md:p-6">
                <h2 className="text-base font-bold text-ink-900 mb-3">
                  About this car
                </h2>
                <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </section>
            )}

            {/* Features */}
            {(() => {
              const rawFeatures = (listing as any).features ?? [];
              const features = rawFeatures
                .map((f: any) => f.feature)
                .filter(Boolean) as { id: string; name: string; group: string | null }[];
              if (features.length === 0) return null;

              const groups = features.reduce<Record<string, typeof features>>((acc, f) => {
                const g = f.group ?? "Other";
                if (!acc[g]) acc[g] = [];
                acc[g].push(f);
                return acc;
              }, {});

              return (
                <section className="bg-white rounded-none md:rounded-2xl md:border md:border-black/5 md:shadow-card overflow-hidden px-4 py-5 md:p-6">
                  <h2 className="text-base font-bold text-ink-900 mb-4">Features & Amenities</h2>
                  <div className="space-y-4">
                    {Object.entries(groups).map(([groupName, items]) => (
                      <div key={groupName}>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-ink-400">{groupName}</p>
                        <div className="flex flex-wrap gap-2">
                          {items.map((feat) => (
                            <span
                              key={feat.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-surface-muted bg-surface-muted/50 px-3 py-1 text-xs font-medium text-ink-700"
                            >
                              {feat.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}
          </div>

          {/* Right: sidebar */}
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <div className="bg-white md:rounded-2xl md:border md:border-black/5 md:shadow-card overflow-hidden">
                <VendorCard
                  business={business}
                  hasWhatsApp={hasWhatsApp}
                  onWhatsAppClick={() => openModal(listing.title, "listing_detail", { listingId: listing.id })}
                />
                <RentalTerms
                  daily={daily}
                  policies={policies}
                  customPolicies={(listing as any).custom_policies ?? []}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {daily && (
              <>
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-500">
                  From
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-brand-600">
                    {formatPkr(daily.price_pkr)}
                  </span>
                  <span className="text-xs text-ink-500">/ day</span>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => openModal(listing.title, "listing_detail", { listingId: listing.id })}
            disabled={!hasWhatsApp}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-500 px-4 text-sm font-semibold text-white hover:bg-green-600 transition-colors",
              !hasWhatsApp && "pointer-events-none opacity-50",
            )}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>
      </div>

      {/* Lead capture modal */}
      <WhatsAppLeadModal
        open={modalState.open}
        onOpenChange={setOpen}
        listingId={modalState.listingId}
        listingTitle={modalState.listingTitle}
        source={modalState.source}
      />
    </div>
  );
}

/* ------------------------------ Gallery ------------------------------ */

function Gallery({
  images,
  title,
}: {
  images: { url: string }[];
  title: string;
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  // Keyboard nav for the lightbox
  React.useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight")
        setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === "ArrowLeft")
        setLightboxIdx((i) =>
          i === null ? null : (i - 1 + images.length) % images.length,
        );
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] w-full bg-surface-muted md:rounded-2xl flex items-center justify-center text-ink-300 text-sm">
        No image available
      </div>
    );
  }

  // Always render 3 tiles on desktop — fill empty slots with placeholders
  // if the vendor hasn't uploaded at least 3 photos.
  const heroSlots = Array.from({ length: 3 }, (_, i) => images[i] ?? null);
  const extraCount = Math.max(0, images.length - 3);

  return (
    <>
      {/* Mobile: horizontal scroll-snap carousel */}
      <div className="md:hidden">
        <div className="relative flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-surface-muted"
            >
              <Image
                src={img.url}
                alt={`${title} — ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: fixed 3-col 4:3 grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-3 gap-2.5">
          {heroSlots.map((img, i) => {
            // 3rd tile doubles as the "See all" trigger when there are extras
            const isLastWithExtras = i === 2 && extraCount > 0;

            if (!img) {
              return (
                <div
                  key={`empty-${i}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-dashed border-ink-200 bg-surface-muted/50"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-ink-300">
                    <ImageIcon className="size-7" strokeWidth={1.5} />
                    <span className="text-xs font-medium">Photo coming soon</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                type="button"
                key={i}
                onClick={() => setLightboxIdx(i)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-muted transition-all hover:brightness-95 active:scale-[0.99]"
              >
                <Image
                  src={img.url}
                  alt={`${title} — ${i + 1}`}
                  fill
                  sizes="33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={i === 0}
                />

              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox — single slidable gallery viewer (used by both the
          per-tile clicks AND the "See all photos" button). Has prev/next
          arrows, swipeable image, counter top-left, thumbnail strip at
          the bottom for fast jumping. */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightboxIdx(null)}
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) =>
                    i === null ? null : (i - 1 + images.length) % images.length,
                  );
                }}
                className="absolute left-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx((i) =>
                    i === null ? null : (i + 1) % images.length,
                  );
                }}
                className="absolute right-4 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div
            className="relative h-[72vh] w-full max-w-6xl touch-pan-y select-none md:h-[78vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              const t = e.touches[0];
              (e.currentTarget as HTMLDivElement).dataset.startX = String(t.clientX);
              (e.currentTarget as HTMLDivElement).dataset.startY = String(t.clientY);
            }}
            onTouchEnd={(e) => {
              const startX = Number(
                (e.currentTarget as HTMLDivElement).dataset.startX ?? 0,
              );
              const startY = Number(
                (e.currentTarget as HTMLDivElement).dataset.startY ?? 0,
              );
              const t = e.changedTouches[0];
              const dx = t.clientX - startX;
              const dy = t.clientY - startY;
              // Only treat as a horizontal swipe if X movement clearly
              // dominates vertical (avoid stealing scroll gestures).
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) {
                  setLightboxIdx((i) =>
                    i === null ? null : (i + 1) % images.length,
                  );
                } else {
                  setLightboxIdx((i) =>
                    i === null ? null : (i - 1 + images.length) % images.length,
                  );
                }
              }
            }}
          >
            <Image
              src={images[lightboxIdx].url}
              alt={`${title} — ${lightboxIdx + 1}`}
              fill
              sizes="95vw"
              className="object-contain transition-opacity"
              priority
            />
          </div>

          {/* Counter — top-left, matches reference */}
          <div className="absolute left-4 top-4 rounded-md bg-white/10 px-2.5 py-1 text-sm font-semibold text-white">
            {lightboxIdx + 1} / {images.length}
          </div>

          {/* Thumbnail strip — bottom of viewport, scrolls horizontally on
              overflow. Active thumb gets a brand-orange ring. Click any
              thumbnail to jump to that image. */}
          {images.length > 1 && (
            <div
              className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, i) => {
                  const active = i === lightboxIdx;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setLightboxIdx(i)}
                      aria-label={`View image ${i + 1}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded-lg transition-all md:h-20",
                        active
                          ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-black/95"
                          : "opacity-60 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ------------------------------ Pricing ------------------------------ */

function PricingCard({ daily, weekly, monthly }: { daily?: any; weekly?: any; monthly?: any }) {
  const tiers = [
    { label: "1 Day", price: daily?.price_pkr, limit: daily?.included_km_per_day },
    { label: "1 Week", price: weekly?.price_pkr, limit: weekly?.included_km_per_day },
    { label: "1 Month", price: monthly?.price_pkr, limit: monthly?.included_km_per_day },
  ];

  return (
    <section className="bg-white rounded-none md:rounded-2xl md:border md:border-black/5 md:shadow-card overflow-hidden">
      <div className="px-4 py-5 md:p-6">
        <h2 className="text-base font-bold text-ink-900 mb-4">Pricing</h2>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {tiers.map((t, i) => {
            const active = i === 0;
            return (
              <div
                key={t.label}
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border px-2 py-4 text-center transition-all",
                  active
                    ? "border-brand-200 bg-brand-50/50 ring-1 ring-brand-200"
                    : "border-transparent bg-surface-muted/60",
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", active ? "text-brand-600" : "text-ink-500")}>
                  {t.label}
                </span>
                <span className={cn("text-sm md:text-base font-bold tracking-tight", active ? "text-ink-900" : "text-ink-500")}>
                  {t.price ? formatPkr(t.price) : "—"}
                </span>
                {/* {t.limit ? <span className="mt-1 text-[10px] text-ink-500">{t.limit} km/day</span> : null} */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Specs ------------------------------ */

function SpecsCard({ listing }: { listing: any }) {
  const specs = [
    { icon: Calendar, label: "Year", value: listing.year },
    { icon: Settings2, label: "Transmission", value: cap(listing.transmission) },
    { icon: Fuel, label: "Fuel", value: cap(listing.fuel) },
    { icon: Users, label: "Seats", value: listing.seats },
    { icon: Gauge, label: "Mileage", value: listing.mileage_km ? `${listing.mileage_km.toLocaleString()} km` : null },
    { icon: CheckCircle2, label: "Color", value: cap(listing.color) },
  ].filter((s) => s.value);

  if (specs.length === 0) return null;

  return (
    <section className="bg-white rounded-none md:rounded-2xl md:border md:border-black/5 md:shadow-card overflow-hidden">
      <div className="px-4 py-5 md:p-6">
        <h2 className="text-base font-bold text-ink-900 mb-4">Specifications</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-3">
          {specs.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-ink-500">{s.label}</div>
                <div className="text-sm font-semibold text-ink-900 truncate">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function cap(s?: string | null) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------ Vendor ------------------------------ */

function VendorCard({
  business,
  hasWhatsApp,
  onWhatsAppClick,
}: {
  business: any;
  hasWhatsApp: boolean;
  onWhatsAppClick: () => void;
}) {
  return (
    <div className="flex flex-col border-b border-black/5">
      {/* Premium Banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#ffd8be] via-[#ffebd2] to-[#ffdfc4] p-4 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-10 -left-10 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute top-3 right-4 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-ink-900 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Open Now
          <ChevronRight className="h-3 w-3 opacity-50" />
        </div>
      </div>

      {/* Profile/Logo Overlap */}
      <div className="relative -mt-10 mb-2 flex justify-center">
        <div className="h-20 w-20 rounded-full bg-white p-1 shadow-xl ring-4 ring-white">
          <div className="relative h-full w-full rounded-full bg-surface-muted overflow-hidden">
            {business.cover_url ? (
              <Image
                src={business.cover_url}
                alt={business.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold text-xl">
                {business.name?.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 pb-6 text-center">
        <h3 className="text-lg font-bold text-ink-900 leading-tight">
          {business.name ?? "Vendor"}
        </h3>
        <p className="mt-3 text-[13px] font-medium text-ink-600">
          Book Directly from the Dealer
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={onWhatsAppClick}
            disabled={!hasWhatsApp}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-sm font-bold text-green-700 transition-all hover:bg-green-100 active:scale-95",
              !hasWhatsApp && "pointer-events-none opacity-50",
            )}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>

        {business.slug && (
          <Link
            href={vendorUrl(business)}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-brand-600 transition-colors"
          >
            View all listings from this dealer <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Rental Terms ------------------------------ */

// Default fallback when a listing has no custom policies saved yet.
const DEFAULT_POLICIES_DISPLAY: { title: string; content: string }[] = [
  {
    title: "Delivery",
    content:
      "Cars booked with driver are reached at pickup points by our drivers — the driver comes with the car and picks you up at the agreed location.",
  },
  {
    title: "Toll Taxes",
    content:
      "Toll taxes are paid by the customer, for both with-driver and self-drive rentals. Please keep small change handy for motorway and city toll plazas.",
  },
  {
    title: "Fuel Policy",
    content:
      "Cars booked with a driver come with a specific starting fuel level — on return the customer is expected to return the car at the same fuel level. Please contact the agency while booking to confirm the exact amount.\n\nThe prices you see cover the driver + car for a 12-hour day.",
  },
];

function iconForPolicy(title: string): React.ElementType {
  const t = title.toLowerCase();
  if (t.includes("deliver")) return MapPin;
  if (t.includes("toll") || t.includes("tax")) return Shield;
  if (t.includes("fuel")) return Gauge;
  if (t.includes("cancel")) return Info;
  if (t.includes("rent") || t.includes("age") || t.includes("license")) return Calendar;
  return Info;
}

function RentalTerms({
  customPolicies = [],
}: {
  daily?: any;
  policies?: any;
  customPolicies?: { title: string; content: string }[];
}) {
  const source = customPolicies.length > 0 ? customPolicies : DEFAULT_POLICIES_DISPLAY;
  const items = source.map((p) => ({
    title: p.title,
    icon: iconForPolicy(p.title),
    content: p.content,
  }));

  return (
    <div className="px-6 py-5">
      <h3 className="text-sm font-bold text-ink-900 mb-3">Rental Terms</h3>
      <div className="grid grid-cols-1 gap-1">
        {items.map((item) => (
          <Sheet key={item.title}>
            <SheetTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <span className="flex min-w-0 items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-600" />
                <span className="truncate text-sm font-medium text-ink-700 group-hover:text-ink-900">{item.title}</span>
              </span>
              <Info className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-500" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
              <PolicyPanel title={item.title} content={item.content} />
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}

function PolicyPanel({ title, content }: { title: string; content: string }) {
  const paragraphs = content.split("\n\n").filter(Boolean);
  return (
    <div className="flex h-full flex-col bg-white">
      <SheetHeader className="border-b border-black/5 px-6 py-5">
        <SheetTitle className="text-lg font-bold text-ink-900">{title}</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {paragraphs.map((p, i) => {
          const isTip = p.startsWith("Tip:") || p.startsWith("Important:");
          return (
            <p
              key={i}
              className={cn(
                "text-sm leading-relaxed text-ink-700",
                isTip && "rounded-lg border-l-4 border-brand-400 bg-brand-50/60 p-3 font-medium text-brand-900",
              )}
            >
              {p}
            </p>
          );
        })}
      </div>
      <div className="border-t border-black/5 px-6 py-4">
        <Button className="w-full h-11 rounded-lg font-semibold">Continue</Button>
      </div>
    </div>
  );
}
