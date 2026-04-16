"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  Gauge,
  Fuel,
  Users,
  Settings2,
  Calendar,
  Info,
  ChevronRight,
  Shield,
  CheckCircle2,
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

  // Ensure primary image is at least present
  if (rawImages.length === 0 && listing.primary_image_url) {
    rawImages.push({ url: listing.primary_image_url, is_primary: true });
  }

  // Generic car-detail placeholders (Interior, steering, wheel, dashboard)
  const placeholders = [
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  ];

  // Fill up to 5 images to make gallery look complete
  const images = [...rawImages];
  if (images.length > 0 && images.length < 5) {
    const diff = 5 - images.length;
    for (let i = 0; i < diff; i++) {
      images.push({ 
        url: placeholders[i % placeholders.length],
        is_primary: false 
      });
    }
  }

  const business = listing.business ?? {};
  const pricing: any[] = listing.pricing ?? [];
  const daily = pricing.find((p) => p.tier === "daily");
  const weekly = pricing.find((p) => p.tier === "weekly");
  const monthly = pricing.find((p) => p.tier === "monthly");
  const policies = listing.policies ?? {};

  const rating = Number.isFinite(business.rating) ? business.rating : 0;
  const reviewsCount = business.reviews_count ?? 0;

  const whatsappHref = business.whatsapp_phone
    ? `/api/leads/whatsapp?listing=${listing.id}&source=listing_detail`
    : null;
  const callHref = business.phone
    ? `/api/leads/call?listing=${listing.id}&source=listing_detail`
    : null;
  const waFallback = business.whatsapp_phone
    ? `https://wa.me/${business.whatsapp_phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
        `Hi! I'm interested in renting your ${listing.title}.`
      )}`
    : null;
  const telFallback = business.phone ? `tel:${business.phone}` : null;

  return (
    <div className="bg-surface-muted/40 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-0 md:px-6 md:py-8">
        {/* Breadcrumb — desktop only */}
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

              // Group by group field
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
                  whatsappHref={whatsappHref ?? waFallback}
                  callHref={callHref ?? telFallback}
                />
                <RentalTerms
                  daily={daily}
                  policies={policies}
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
          <a
            href={callHref ?? telFallback ?? "#"}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-4 text-sm font-semibold text-white",
              !callHref && !telFallback && "pointer-events-none opacity-50"
            )}
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <a
            href={whatsappHref ?? waFallback ?? "#"}
            target={whatsappHref ? undefined : "_blank"}
            rel="nofollow noopener"
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-green-500 px-4 text-sm font-semibold text-white",
              !whatsappHref && !waFallback && "pointer-events-none opacity-50"
            )}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
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
  const [showAllPhotos, setShowAllPhotos] = React.useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] w-full bg-surface-muted md:rounded-2xl flex items-center justify-center text-ink-300 text-sm">
        No image available
      </div>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll-snap carousel */}
      <div className="md:hidden">
        <div className="relative flex snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <div
              key={i}
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
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Premium 4-Column Layout */}
      <div className="hidden md:grid grid-cols-10 gap-2.5 h-[400px]">
        {/* Column 1: Main (Left) */}
        <div className="relative col-span-3 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
          <Image
            src={images[0].url}
            alt={title}
            fill
            sizes="30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-600 shadow-sm border border-brand-100">
              <span className="text-sm">📣</span> Special Offer
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-600 shadow-sm border border-purple-100">
              <span className="text-sm">💎</span> Premium
            </div>
          </div>
        </div>

        {/* Column 2: Interior */}
        <div className="relative col-span-3 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
          <Image
            src={images[1].url}
            alt={`${title} interior`}
            fill
            sizes="30vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Column 3: Stacked Details */}
        <div className="col-span-2 flex flex-col gap-2.5">
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
            <Image
              src={images[2].url}
              alt={`${title} detail 1`}
              fill
              sizes="20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
            <Image
              src={images[3].url}
              alt={`${title} detail 2`}
              fill
              sizes="20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Column 4: Rear (Right) */}
        <div className="relative col-span-2 rounded-2xl overflow-hidden bg-surface-muted group cursor-pointer transition-all hover:brightness-[0.9] active:scale-[0.98]">
          <Image
            src={images[4].url}
            alt={`${title} rear`}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Show All Photos Button */}
          <button 
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink-900 shadow-lg ring-1 ring-black/5 hover:bg-surface-sunken transition-all active:scale-95"
            onClick={() => setShowAllPhotos(true)}
          >
            Show all photos
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------ Pricing ------------------------------ */

function PricingCard({
  daily,
  weekly,
  monthly,
}: {
  daily?: any;
  weekly?: any;
  monthly?: any;
}) {
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
                    : "border-transparent bg-surface-muted/60"
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mb-1",
                    active ? "text-brand-600" : "text-ink-500"
                  )}
                >
                  {t.label}
                </span>
                <span
                  className={cn(
                    "text-sm md:text-base font-bold tracking-tight",
                    active ? "text-ink-900" : "text-ink-500"
                  )}
                >
                  {t.price ? formatPkr(t.price) : "—"}
                </span>
                {t.limit ? (
                  <span className="mt-1 text-[10px] text-ink-500">
                    {t.limit} km/day
                  </span>
                ) : null}
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
                <div className="text-[11px] uppercase tracking-wider text-ink-500">
                  {s.label}
                </div>
                <div className="text-sm font-semibold text-ink-900 truncate">
                  {s.value}
                </div>
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
  whatsappHref,
  callHref,
}: {
  business: any;
  whatsappHref: string | null;
  callHref: string | null;
}) {
  return (
    <div className="flex flex-col border-b border-black/5">
      {/* Premium Banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#ffd8be] via-[#ffebd2] to-[#ffdfc4] p-4 overflow-hidden">
        {/* Abstract Mesh Effect (Soft blobs) */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute top-10 -left-10 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />
        
        {/* Status Badge */}
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

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <a
            href={callHref ?? "#"}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 text-sm font-bold text-brand-700 transition-all hover:bg-brand-100 active:scale-95",
              !callHref && "pointer-events-none opacity-50"
            )}
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <a
            href={whatsappHref ?? "#"}
            target={whatsappHref?.startsWith("http") ? "_blank" : undefined}
            rel="nofollow noopener"
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 text-sm font-bold text-green-700 transition-all hover:bg-green-100 active:scale-95",
              !whatsappHref && "pointer-events-none opacity-50"
            )}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        {business.slug && (
          <Link
            href={`/vendors/${business.slug}`}
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

function RentalTerms({ daily, policies }: { daily?: any; policies: any }) {
  const mileageText = (() => {
    const km = daily?.included_km_per_day;
    const extra = daily?.extra_km_rate_pkr;
    const parts = [];
    if (km) parts.push(`Includes ${km} km per rental day.`);
    if (extra) parts.push(`Extra mileage charged at ${formatPkr(extra)} per km.`);
    if (parts.length === 0)
      parts.push(
        "Mileage terms are set by the vendor. Confirm the daily km allowance and extra-km rate when booking."
      );
    parts.push(
      "Tip: For long trips, ask the vendor in advance for a discounted extra-mileage package."
    );
    return parts.join("\n\n");
  })();

  const depositText = policies?.deposit_pkr
    ? `Security deposit of ${formatPkr(
        policies.deposit_pkr
      )} is collected at pickup and refunded after the return — once the vehicle is inspected for damage and any traffic fines are cleared.\n\nTip: Keep the payment receipt until the deposit is fully refunded.`
    : "A refundable security deposit may apply. The amount and refund window are set by the vendor — please confirm before booking.";

  const rentalText = [
    `Minimum rental age: ${policies?.min_age ?? 21} years.`,
    policies?.license_required
      ? "A valid driving license and government-issued ID are required at pickup."
      : "Driving license may be required at pickup.",
    "Rentals run on a 24-hour cycle. Returning the car late may result in an extra-day charge.",
  ].join("\n\n");

  const cancellationText =
    policies?.cancellation_text ||
    "Cancellation terms are set by the vendor. Please confirm the cancellation window and any fees when booking.";

  const deliveryText = policies?.delivery_available
    ? `Vehicle delivery is available${
        policies.delivery_fee_pkr
          ? ` for ${formatPkr(policies.delivery_fee_pkr)}.`
          : "."
      }\n\nContact the vendor to arrange a drop-off location and time.`
    : "Vehicle delivery is not offered for this listing. You can pick the car up from the vendor's location.";

  const items = [
    { title: "Mileage Policy", icon: Gauge, content: mileageText },
    { title: "Deposit Policy", icon: Shield, content: depositText },
    { title: "Rental Policy", icon: Calendar, content: rentalText },
    { title: "Cancellation Policy", icon: Info, content: cancellationText },
    { title: "Delivery", icon: MapPin, content: deliveryText },
  ];

  return (
    <div className="px-6 py-5">
      <h3 className="text-sm font-bold text-ink-900 mb-3">Rental Terms</h3>
      <div className="grid grid-cols-1 gap-1">
        {items.map((item) => (
          <Sheet key={item.title}>
            <SheetTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg py-2 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
              <span className="flex min-w-0 items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0 text-ink-500 group-hover:text-brand-600" />
                <span className="truncate text-sm font-medium text-ink-700 group-hover:text-ink-900">
                  {item.title}
                </span>
              </span>
              <Info className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-500" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md p-0 flex flex-col bg-white"
            >
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
        <SheetTitle className="text-lg font-bold text-ink-900">
          {title}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {paragraphs.map((p, i) => {
          const isTip = p.startsWith("Tip:") || p.startsWith("Important:");
          return (
            <p
              key={i}
              className={cn(
                "text-sm leading-relaxed text-ink-700",
                isTip &&
                  "rounded-lg border-l-4 border-brand-400 bg-brand-50/60 p-3 font-medium text-brand-900"
              )}
            >
              {p}
            </p>
          );
        })}
      </div>

      <div className="border-t border-black/5 px-6 py-4">
        <Button className="w-full h-11 rounded-lg font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
}
