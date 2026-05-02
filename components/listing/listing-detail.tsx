"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  MessageCircle,
  Phone,
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
  PackagePlus,
  DoorOpen,
  Briefcase,
  Palette,
  Globe,
  CreditCard,
  ShieldCheck,
  Car,
  Truck,
  Flame,
  Maximize2,
  BadgeCheck,
  Play,
  Languages as LanguagesIcon,
  Clock,
  Award,
  ExternalLink,
  Sparkles,
  Quote,
  TrendingDown,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  WhatsAppLeadModal,
  useWhatsAppLead,
} from "@/components/shared/whatsapp-lead-modal";
import { ListingRealtimeRefresher } from "@/components/listing/listing-realtime-refresher";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function fmtAed(v: number | null | undefined): string {
  if (v == null) return "—";
  return `AED ${Math.round(v).toLocaleString()}`;
}

function fmtCurrency(
  v: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (v == null) return "—";
  const code = (currency ?? "AED").toUpperCase();
  return `${code} ${Math.round(Number(v)).toLocaleString()}`;
}

function fmtDecimal(
  v: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (v == null) return "—";
  const code = (currency ?? "AED").toUpperCase();
  const n = Number(v);
  return `${code} ${n.toFixed(2)}`;
}

function priceTierAed(tier: any): string | null {
  if (!tier) return null;
  if (tier.currency === "AED" && tier.price_aed != null)
    return fmtAed(tier.price_aed);
  if (tier.price_pkr != null) return fmtAed(tier.price_pkr / 75);
  return null;
}

function cap(s?: string | null) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function discountPct(
  original: number | null | undefined,
  current: number | null | undefined,
): number | null {
  if (original == null || current == null) return null;
  const o = Number(original);
  const c = Number(current);
  if (!o || o <= c) return null;
  return Math.round(((o - c) / o) * 100);
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(url);
}

function relativeTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const diff = Math.max(0, Date.now() - t);
  const day = 86_400_000;
  const days = Math.floor(diff / day);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/* ─── main component ──────────────────────────────────────────────────────── */

interface ListingDetailProps {
  listing: any;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  const [showSticky, setShowSticky] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const images = (listing.images ?? [])
    .slice()
    .sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  if (images.length === 0 && listing.primary_image_url) {
    images.push({ url: listing.primary_image_url, is_primary: true });
  }

  const business = listing.business ?? {};
  const pricing: any[] = listing.pricing ?? [];
  const daily = pricing.find((p) => p.tier === "daily");
  const weekly = pricing.find((p) => p.tier === "weekly");
  const monthly = pricing.find((p) => p.tier === "monthly");
  const policies = listing.policies ?? {};
  const ocd = listing.ocd ?? null;
  const isOcd = listing.source_platform === "oneclickdrive" && !!ocd;
  const lastScraped = ocd?.ocd_last_updated || ocd?.scraped_at || null;

  const hasWhatsApp = !!(business.whatsapp_phone || business.phone);
  const dailyDisplay = priceTierAed(daily);
  const { modalState, openModal, setOpen } = useWhatsAppLead();

  const fullLocation = [business.address_line, listing.city]
    .filter(Boolean)
    .join(", ");

  const specTokens = [
    listing.year,
    listing.body_type ?? null,
    cap(listing.transmission),
    cap(listing.fuel),
    listing.seats ? `${listing.seats} seats` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="relative">
      {/* ── Desktop sticky header ── */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] hidden md:flex bg-white/95 backdrop-blur-md border-b border-black/5 shadow-sm transition-transform duration-300",
          showSticky ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto max-w-7xl w-full px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {listing.primary_image_url && (
              <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-black/5">
                <Image src={listing.primary_image_url} alt="" fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-ink-900 truncate">{listing.title}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-ink-500 uppercase tracking-wider">
                {dailyDisplay && <span className="text-brand-600">{dailyDisplay}/day</span>}
                {dailyDisplay && <span>·</span>}
                <span>{listing.city}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={business.phone ? `tel:${business.phone}` : "#"}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-4 text-xs font-bold text-ink-700 hover:bg-surface-muted transition-colors"
            >
              <Phone className="size-3.5" /> Call
            </a>
            <button
              onClick={() => openModal(listing.title, "sticky_header", { listingId: listing.id })}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
        {/* Desktop breadcrumb */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm text-ink-500 mb-4">
          <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href="/search" className="hover:text-brand-600 transition-colors">Cars</Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={`/search?city=${listing.city}`} className="hover:text-brand-600 transition-colors">
            {listing.city}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-ink-900 font-medium truncate max-w-xs">{listing.title}</span>
        </nav>

        {/* Mobile mini breadcrumb */}
        <nav className="md:hidden flex items-center gap-1 text-xs text-ink-500 mb-3">
          <Link href="/search" className="hover:text-brand-600 transition-colors">Cars</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href={`/search?city=${listing.city}`} className="hover:text-brand-600 transition-colors truncate">
            {listing.city}
          </Link>
        </nav>

        {/* ── GALLERY ── */}
        <Gallery
          images={images}
          videos={ocd?.video_urls ?? []}
          title={listing.title}
        />
      </div>

      {/* ── Page content below gallery ── */}
      <div className="bg-surface-muted/40 pb-24 md:pb-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 pt-5 md:pt-8">

          {/* ── Mobile dealer tile (opens vendor sheet) ── */}
          <div className="md:hidden mb-3">
            <MobileDealerTile
              business={business}
              ocd={ocd}
              listingTitle={listing.title}
              listingId={listing.id}
              hasWhatsApp={hasWhatsApp}
              openModal={openModal}
            />
          </div>

          {/* ── Title block ── */}
          <div className="mb-5 md:mb-8">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              {/* Desktop heading: long form */}
              <h1 className="hidden md:block text-2xl md:text-[32px] font-black tracking-tight text-ink-900 leading-tight">
                Rent {listing.title} in {listing.city}
              </h1>
              {/* Mobile heading: title only, single line */}
              <h1 className="md:hidden text-xl font-black tracking-tight text-ink-900 leading-tight line-clamp-2">
                {listing.title}
              </h1>
              <div className="hidden md:flex">
                <ListingRealtimeRefresher
                  listingId={listing.id}
                  businessId={business?.id}
                  ocdImported={isOcd}
                />
              </div>
            </div>

            {/* Mobile-only Live pill (compact, separate row) */}
            <div className="md:hidden mt-1.5">
              <ListingRealtimeRefresher
                listingId={listing.id}
                businessId={business?.id}
                ocdImported={isOcd}
              />
            </div>

            {/* Full location */}
            {fullLocation && (
              <div className="mt-2 flex items-start gap-1.5">
                <MapPin className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span className="text-[13px] md:text-sm text-ink-600 font-medium break-words">
                  {fullLocation}
                  {ocd?.location && !fullLocation.includes(ocd.location)
                    ? ` · ${ocd.location}`
                    : ""}
                </span>
              </div>
            )}

            {/* Spec tokens row — wraps on desktop, scroll-snaps on mobile */}
            {specTokens.length > 0 && (
              <>
                <div className="hidden md:flex mt-2 items-center flex-wrap gap-x-2 gap-y-1 text-sm text-ink-500">
                  {specTokens.map((tok, i) => (
                    <React.Fragment key={tok}>
                      {i > 0 && <span className="text-ink-300 select-none">·</span>}
                      <span className="capitalize">{tok}</span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="md:hidden mt-2 -mx-4 px-4 flex gap-1.5 overflow-x-auto no-scrollbar snap-x">
                  {specTokens.map((tok) => (
                    <span
                      key={tok}
                      className="snap-start shrink-0 inline-flex items-center rounded-full bg-surface-muted border border-black/5 px-2.5 py-1 text-[11px] font-semibold text-ink-700 capitalize whitespace-nowrap"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Source attribution + listing freshness — single scroll row on mobile */}
            <div className="mt-3 -mx-4 px-4 md:mx-0 md:px-0 flex md:flex-wrap items-center gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
              {isOcd && (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-100 px-2.5 py-1 text-[11px] font-bold text-brand-700 whitespace-nowrap">
                  <BadgeCheck className="h-3 w-3" />
                  Imported from OneClickDrive
                </span>
              )}
              {ocd?.is_premium && (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-700 whitespace-nowrap">
                  <Award className="h-3 w-3" />
                  Premium
                </span>
              )}
              {ocd?.is_featured && (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-200 px-2.5 py-1 text-[11px] font-bold text-violet-700 whitespace-nowrap">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </span>
              )}
              {lastScraped && (
                <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-surface-muted border border-black/5 px-2.5 py-1 text-[11px] font-medium text-ink-500 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  Updated {relativeTime(lastScraped)}
                </span>
              )}
              {ocd?.ocd_url && (
                <a
                  href={ocd.ocd_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white border border-black/10 px-2.5 py-1 text-[11px] font-medium text-ink-500 hover:text-brand-600 hover:border-brand-200 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on OCD
                </a>
              )}
            </div>

            {/* Rating row */}
            {business.reviews_count > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i <= Math.round(business.rating ?? 0)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-ink-200 text-ink-200",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-ink-700">{Number(business.rating).toFixed(1)}</span>
                <span className="text-xs text-ink-400">({business.reviews_count} reviews)</span>
              </div>
            )}
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">

            {/* ══ Left / main column ══ */}
            <div className="md:col-span-8 space-y-5">
              <SpecialOfferBanner ocd={ocd} />
              <PricingCard
                daily={daily}
                weekly={weekly}
                monthly={monthly}
                policies={policies}
                ocd={ocd}
              />

              {/* Mobile: collapsible accordion of long sections */}
              <div className="md:hidden">
                <MobileSectionsAccordion
                  listing={listing}
                  policies={policies}
                  ocd={ocd}
                  daily={daily}
                />
              </div>

              {/* Desktop: full-card stack of sections */}
              <div className="hidden md:contents">
                <SpecsAndFeatures listing={listing} policies={policies} ocd={ocd} />
                <RequirementsCard policies={policies} ocd={ocd} />

                {listing.description && (
                  <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                    <div className="px-5 py-5 md:p-6">
                      <h2 className="text-base font-bold text-ink-900 mb-3 flex items-center gap-2">
                        <Info className="size-4 text-brand-500" />
                        About this Car
                      </h2>
                      <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">{listing.description}</p>
                    </div>
                  </section>
                )}

                <DealerNoteCard ocd={ocd} />

                <RentalPoliciesCard
                  daily={daily}
                  policies={policies}
                  customPolicies={(listing as any).custom_policies ?? []}
                  addons={(listing as any).addons ?? []}
                  ocd={ocd}
                />
              </div>
            </div>

            {/* ══ Right / sidebar (desktop only — mobile uses MobileDealerTile + bottom bar) ══ */}
            <aside className="hidden md:block md:col-span-4">
              <div className="md:sticky md:top-[76px] space-y-4">
                <VendorContactCard
                  business={business}
                  hasWhatsApp={hasWhatsApp}
                  listingTitle={listing.title}
                  listingId={listing.id}
                  openModal={openModal}
                  ocd={ocd}
                />
                <QuickPoliciesCard policies={policies} daily={daily} ocd={ocd} />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-black/8 bg-white/95 backdrop-blur-md px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-6px_18px_-6px_rgba(237,106,42,0.12)]">
        <div className="flex items-center gap-2">
          {dailyDisplay && (
            <div className="shrink-0 min-w-[80px]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400 leading-none">From</div>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-[17px] font-black text-brand-600 leading-none">{dailyDisplay}</span>
                <span className="text-[10px] text-ink-500">/day</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => openModal(listing.title, "listing_detail", { listingId: listing.id })}
            disabled={!hasWhatsApp}
            className={cn(
              "flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white shadow-md shadow-green-500/25 active:scale-[0.98] transition-transform",
              !hasWhatsApp && "pointer-events-none opacity-50",
            )}
          >
            <MessageCircle className="size-4" /> WhatsApp Now
          </button>
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 text-ink-700 hover:bg-surface-muted transition-colors"
              aria-label="Call dealer"
            >
              <Phone className="size-4" />
            </a>
          )}
        </div>
      </div>

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

/* ─── Gallery ─────────────────────────────────────────────────────────────── */

function Gallery({
  images,
  videos = [],
  title,
}: {
  images: { url: string }[];
  videos?: string[];
  title: string;
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  // Combine images + videos into a single ordered media list. Images first.
  const media: { url: string; isVideo: boolean }[] = React.useMemo(
    () => [
      ...images.map((i) => ({ url: i.url, isVideo: false })),
      ...(videos ?? [])
        .filter(Boolean)
        .map((u) => ({ url: u, isVideo: true })),
    ],
    [images, videos],
  );

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") setLightboxIdx((i) => i === null ? null : (i + 1) % media.length);
      if (e.key === "ArrowLeft")  setLightboxIdx((i) => i === null ? null : (i - 1 + media.length) % media.length);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxIdx, media.length]);

  if (media.length === 0) {
    return (
      <div className="w-full bg-surface-muted flex items-center justify-center text-ink-300" style={{ height: "60vw", maxHeight: 480 }}>
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 mb-2 opacity-30" />
          <p className="text-sm font-medium">No image available</p>
        </div>
      </div>
    );
  }

  const renderTile = (m: { url: string; isVideo: boolean }, i: number, sizeHint: string, priority = false) => (
    <button
      type="button"
      onClick={() => setLightboxIdx(i)}
      className="relative h-full w-full overflow-hidden rounded-2xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {m.isVideo ? (
        <>
          <video
            src={m.url}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/50 transition-opacity group-hover:opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
              <Play className="h-5 w-5 fill-brand-600 text-brand-600 ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <Image
          src={m.url}
          alt={`${title} — ${i + 1}`}
          fill
          sizes={sizeHint}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
      )}
    </button>
  );

  return (
    <>
      {/* ── Mobile: full-width carousel with snap dots + photos overlay ── */}
      <MobileCarousel media={media} title={title} onTileTap={setLightboxIdx} />


      {/* ── Desktop: 3-column grid ── */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 h-[400px]">
        {renderTile(media[0], 0, "33vw", true)}
        {media.length > 1 ? (
          renderTile(media[1], 1, "33vw")
        ) : (
          <div className="rounded-2xl bg-surface-muted flex items-center justify-center">
            <Car className="size-8 text-ink-200" />
          </div>
        )}
        {media.length > 2 ? (
          <button
            type="button"
            onClick={() => setLightboxIdx(2)}
            className="relative h-full w-full overflow-hidden rounded-2xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {media[2].isVideo ? (
              <>
                <video
                  src={media[2].url}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg">
                    <Play className="h-5 w-5 fill-brand-600 text-brand-600 ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={media[2].url}
                alt={`${title} — 3`}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {media.length > 3 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                <div className="flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-bold text-ink-900 shadow-lg">
                  <PackagePlus className="size-4 text-brand-600" />
                  <span>+{media.length - 2} more</span>
                </div>
              </div>
            )}
          </button>
        ) : (
          <div className="rounded-2xl bg-surface-muted flex items-center justify-center">
            <Car className="size-8 text-ink-200" />
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[80] grid grid-rows-[auto_1fr_auto] bg-black text-white"
          onClick={() => setLightboxIdx(null)}
          role="dialog"
          aria-modal
          aria-label="Photo gallery"
        >
          {/* Header row */}
          <div
            className="row-start-1 flex items-center justify-between px-4 md:px-6 py-3 z-10 bg-gradient-to-b from-black/70 to-transparent"
            style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
          >
            <div className="flex h-10 items-center rounded-full bg-zinc-900/80 px-4 text-sm font-bold text-white backdrop-blur-md ring-1 ring-white/10">
              {lightboxIdx + 1} / {media.length}
              {media[lightboxIdx]?.isVideo && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-300">
                  <Play className="h-2.5 w-2.5 fill-current" /> video
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white transition-all hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              style={{ touchAction: "manipulation" }}
              aria-label="Close gallery"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Stage row */}
          <div
            className="row-start-2 relative min-h-0 overflow-hidden flex items-center justify-center px-4 md:px-12 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : (i - 1 + media.length) % media.length));
                  }}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 text-white transition hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ touchAction: "manipulation" }}
                >
                  <ChevronLeft className="size-7" />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx((i) => (i === null ? null : (i + 1) % media.length));
                  }}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900/80 text-white transition hover:bg-zinc-800 active:scale-95 backdrop-blur-md ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ touchAction: "manipulation" }}
                >
                  <ChevronRight className="size-7" />
                </button>
              </>
            )}

            {media[lightboxIdx].isVideo ? (
              <video
                key={media[lightboxIdx].url}
                src={media[lightboxIdx].url}
                controls
                autoPlay
                playsInline
                className="block max-h-full max-w-full mx-auto"
              />
            ) : (
              // Plain <img> on purpose: lightbox is a single full-resolution
              // asset; next/image's `fill` interacts poorly with grid tracks.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media[lightboxIdx].url}
                alt={`${title} — ${lightboxIdx + 1}`}
                loading="eager"
                className="block max-h-full max-w-full mx-auto object-contain select-none"
                draggable={false}
              />
            )}
          </div>

          {/* Thumbnails row */}
          {media.length > 1 && (
            <div
              className="row-start-3 w-full bg-zinc-950/90 backdrop-blur-md border-t border-white/10 px-4 md:px-6 pt-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
                {media.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIdx(i);
                    }}
                    className={cn(
                      "relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                      i === lightboxIdx
                        ? "border-brand-500"
                        : "border-white/10 opacity-50 hover:opacity-100",
                    )}
                    aria-label={m.isVideo ? `Play video ${i + 1}` : `Go to photo ${i + 1}`}
                  >
                    {m.isVideo ? (
                      <>
                        <video src={m.url} muted preload="metadata" className="h-full w-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-3 w-3 fill-white text-white" />
                        </span>
                      </>
                    ) : (
                      <Image src={m.url} alt="" fill sizes="80px" className="object-cover" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ─── Mobile Carousel (snap-x scroller with dot indicator + photos button) ── */

function MobileCarousel({
  media,
  title,
  onTileTap,
}: {
  media: { url: string; isVideo: boolean }[];
  title: string;
  onTileTap: (i: number) => void;
}) {
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const w = track.clientWidth;
      if (!w) return;
      const idx = Math.round(track.scrollLeft / w);
      setActiveIdx(Math.max(0, Math.min(media.length - 1, idx)));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [media.length]);

  if (media.length === 0) return null;

  return (
    <div className="md:hidden relative w-full overflow-hidden bg-ink-950">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
      >
        {media.map((m, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onTileTap(i)}
            className="relative w-full aspect-[4/3] shrink-0 snap-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
            aria-label={m.isVideo ? `Play video ${i + 1}` : `Open photo ${i + 1}`}
          >
            {m.isVideo ? (
              <>
                <video
                  src={m.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
                    <Play className="h-6 w-6 fill-brand-600 text-brand-600 ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={m.url}
                alt={`${title} — ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            )}
          </button>
        ))}
      </div>

      {/* "X photos" overlay button — bottom-right */}
      {media.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onTileTap(0);
          }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-lg ring-1 ring-white/10 active:scale-95 transition-transform"
          aria-label={`View all ${media.length} photos`}
        >
          <PackagePlus className="h-3 w-3" />
          {media.length} photos
        </button>
      )}

      {/* Counter pill — bottom-left */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white ring-1 ring-white/10">
          {activeIdx + 1}/{media.length}
        </div>
      )}

      {/* Dots */}
      {media.length > 1 && media.length <= 8 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {media.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Pricing Card ────────────────────────────────────────────────────────── */

function PricingCard({
  daily, weekly, monthly, policies, ocd,
}: {
  daily?: any; weekly?: any; monthly?: any; policies: any; ocd?: any;
}) {
  // When the listing is OCD-imported, prefer the scraper's exact rates +
  // original (pre-discount) rates + per-period extra-km rates over the
  // simplified imported tier rows.
  const currency = (ocd?.currency ?? "AED") as string;

  type Period = {
    label: string;
    short: string;
    current: number | null;
    original: number | null;
    km: number | null;
    extraRate: number | null;
    extraCurrency: string;
  };

  const fromOcd = (
    label: string,
    short: string,
    current: number | null,
    original: number | null,
    km: number | null,
    extraRate: number | null,
    extraCurrency: string | null,
  ): Period => ({
    label,
    short,
    current,
    original,
    km,
    extraRate,
    extraCurrency: extraCurrency ?? currency,
  });

  const periods: Period[] = ocd
    ? [
        fromOcd(
          "Per Day", "/day",
          ocd.daily_rate_aed,
          ocd.daily_rate_original,
          ocd.daily_km_included,
          ocd.daily_extra_km_rate ?? ocd.extra_km_rate ?? ocd.extra_km_rate_aed,
          ocd.daily_extra_km_currency ?? ocd.extra_km_currency,
        ),
        fromOcd(
          "Per Week", "/week",
          ocd.weekly_rate_aed,
          ocd.weekly_rate_original,
          ocd.weekly_km_included,
          ocd.weekly_extra_km_rate ?? ocd.extra_km_rate ?? ocd.extra_km_rate_aed,
          ocd.weekly_extra_km_currency ?? ocd.extra_km_currency,
        ),
        fromOcd(
          "Per Month", "/month",
          ocd.monthly_rate_aed,
          ocd.monthly_rate_original,
          ocd.monthly_km_included,
          ocd.monthly_extra_km_rate ?? ocd.extra_km_rate ?? ocd.extra_km_rate_aed,
          ocd.monthly_extra_km_currency ?? ocd.extra_km_currency,
        ),
      ].filter((p) => p.current != null)
    : [
        // Fallback to imported tier rows (PKR/AED)
        {
          label: "Per Day", short: "/day",
          current: daily?.price_aed ?? (daily?.price_pkr != null ? daily.price_pkr / 75 : null),
          original: null, km: daily?.included_km_per_day ?? null,
          extraRate: daily?.extra_km_rate_pkr != null ? daily.extra_km_rate_pkr / 75 : null,
          extraCurrency: "AED",
        },
        {
          label: "Per Week", short: "/week",
          current: weekly?.price_aed ?? (weekly?.price_pkr != null ? weekly.price_pkr / 75 : null),
          original: null, km: weekly?.included_km_per_day ?? null,
          extraRate: weekly?.extra_km_rate_pkr != null ? weekly.extra_km_rate_pkr / 75 : null,
          extraCurrency: "AED",
        },
        {
          label: "Per Month", short: "/month",
          current: monthly?.price_aed ?? (monthly?.price_pkr != null ? monthly.price_pkr / 75 : null),
          original: null, km: monthly?.included_km_per_day ?? null,
          extraRate: monthly?.extra_km_rate_pkr != null ? monthly.extra_km_rate_pkr / 75 : null,
          extraCurrency: "AED",
        },
      ].filter((p) => p.current != null);

  if (periods.length === 0) return null;

  // Extras row: VAT, Salik, Deposit, Refund
  const vat = ocd?.vat_percentage != null ? Number(ocd.vat_percentage) : null;
  const salikValue = ocd?.salik_charges_aed ?? policies.salik_charges_aed;
  const depositAmount = ocd?.security_deposit_amount ?? ocd?.deposit_aed ??
    (policies.deposit_pkr != null ? policies.deposit_pkr / 75 : null);
  const depositCurrency = ocd?.security_deposit_currency ?? "AED";
  const depositRefund = ocd?.deposit_refund_period ??
    (policies.deposit_refund_days != null ? `${policies.deposit_refund_days} days` : null);

  const minDays = ocd?.min_rental_days ?? policies.min_rental_days;
  const insuranceIncluded = ocd?.insurance_included ?? policies.insurance_included;
  const freeDelivery = ocd?.free_delivery ?? policies.delivery_available;

  return (
    <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5 md:px-6">
        <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
          <CreditCard className="size-4 text-brand-500" /> Rental Pricing
        </h2>
      </div>

      <div className="px-5 py-4 md:px-6">
        {/* Tiers: snap-row on mobile so prices breathe at narrow widths;
            equal-width grid on tablet+ */}
        <div
          className={cn(
            // Mobile: horizontal scroll-snap row
            "flex md:hidden -mx-5 px-5 gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory",
            // Tablet+: equal columns
          )}
        >
          {periods.map(({ label, short, current, original, km, extraRate, extraCurrency }, idx) => {
            const isFirst = idx === 0;
            const pct = discountPct(original, current);
            return (
              <div
                key={label}
                className={cn(
                  "snap-start shrink-0 basis-[78%] min-w-0 rounded-2xl border p-4 flex flex-col relative",
                  isFirst ? "border-brand-200 bg-brand-50" : "border-black/5 bg-surface-muted/60",
                )}
              >
                {pct != null && (
                  <span className="absolute -top-2 right-3 inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                    <TrendingDown className="h-2.5 w-2.5" /> {pct}% off
                  </span>
                )}
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1.5">{label}</div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-2xl font-black leading-none", isFirst ? "text-brand-600" : "text-ink-900")}>
                    {fmtCurrency(current, currency)}
                  </span>
                  <span className="text-xs font-semibold text-ink-400">{short}</span>
                </div>
                {original != null && pct != null && (
                  <div className="mt-1 text-[11px] text-ink-400 line-through">
                    {fmtCurrency(original, currency)}
                  </div>
                )}
                {km != null && (
                  <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white border border-black/5 px-2 py-0.5 text-[10px] font-semibold text-ink-600 w-fit">
                    <Gauge className="h-2.5 w-2.5" /> {Number(km).toLocaleString()} km incl.
                  </div>
                )}
                {extraRate != null && (
                  <p className="mt-1 text-[10px] text-ink-400">
                    +{fmtDecimal(extraRate, extraCurrency)}/km extra
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className={cn("hidden md:grid gap-3", periods.length === 1 ? "grid-cols-1" : periods.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {periods.map(({ label, short, current, original, km, extraRate, extraCurrency }, idx) => {
            const isFirst = idx === 0;
            const pct = discountPct(original, current);
            return (
              <div
                key={label}
                className={cn(
                  "rounded-2xl border p-4 flex flex-col relative",
                  isFirst ? "border-brand-200 bg-brand-50" : "border-black/5 bg-surface-muted/60",
                )}
              >
                {pct != null && (
                  <span className="absolute -top-2 right-3 inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                    <TrendingDown className="h-2.5 w-2.5" /> {pct}% off
                  </span>
                )}
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1.5">{label}</div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-2xl font-black leading-none", isFirst ? "text-brand-600" : "text-ink-900")}>
                    {fmtCurrency(current, currency)}
                  </span>
                  <span className="text-xs font-semibold text-ink-400">{short}</span>
                </div>
                {original != null && pct != null && (
                  <div className="mt-1 text-[11px] text-ink-400 line-through">
                    {fmtCurrency(original, currency)}
                  </div>
                )}
                {km != null && (
                  <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-white border border-black/5 px-2 py-0.5 text-[10px] font-semibold text-ink-600 w-fit">
                    <Gauge className="h-2.5 w-2.5" /> {Number(km).toLocaleString()} km incl.
                  </div>
                )}
                {extraRate != null && (
                  <p className="mt-1 text-[10px] text-ink-400">
                    +{fmtDecimal(extraRate, extraCurrency)}/km extra
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* VAT / Salik / Deposit / Refund row */}
        {(vat != null || salikValue != null || depositAmount != null) && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {vat != null && vat > 0 && (
              <div className="rounded-xl border border-black/5 bg-surface-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">VAT</p>
                <p className="text-sm font-bold text-ink-900 mt-0.5">+{vat}%</p>
              </div>
            )}
            {salikValue != null && (
              <div className="rounded-xl border border-black/5 bg-surface-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Salik / Toll</p>
                <p className="text-sm font-bold text-ink-900 mt-0.5">AED {Number(salikValue).toFixed(2)}/day</p>
              </div>
            )}
            {depositAmount != null && (
              <div className="rounded-xl border border-black/5 bg-surface-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Deposit</p>
                <p className="text-sm font-bold text-ink-900 mt-0.5">{fmtCurrency(depositAmount, depositCurrency)}</p>
              </div>
            )}
            {depositRefund && (
              <div className="rounded-xl border border-black/5 bg-surface-muted/40 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Refund</p>
                <p className="text-sm font-bold text-ink-900 mt-0.5">{depositRefund}</p>
              </div>
            )}
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {minDays != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              {minDays <= 1 ? "1-day rental OK" : `Min. ${minDays} days`}
            </span>
          )}
          {insuranceIncluded !== false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <Shield className="h-3 w-3" /> Insurance included
            </span>
          )}
          {freeDelivery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <Truck className="h-3 w-3" />
              {policies.delivery_fee_pkr ? `Delivery: ${fmtAed(policies.delivery_fee_pkr / 75)}` : "Free delivery"}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Special-offer Banner ────────────────────────────────────────────────── */

function SpecialOfferBanner({ ocd }: { ocd?: any }) {
  if (!ocd) return null;
  const heading = ocd.special_offer_heading;
  const body = ocd.special_offer_body || ocd.special_offer;
  const disclaimer = ocd.special_offer_disclaimer;
  if (!heading && !body) return null;

  return (
    <section className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 via-white to-amber-50 overflow-hidden">
      <div className="px-5 py-4 md:p-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 ring-1 ring-brand-200">
          <Flame className="h-5 w-5 text-brand-600" />
        </div>
        <div className="min-w-0 flex-1">
          {heading && (
            <p className="text-sm md:text-base font-black text-brand-700 leading-tight">{heading}</p>
          )}
          {body && (
            <p className={cn("text-sm text-ink-700 leading-relaxed whitespace-pre-line", heading && "mt-1")}>
              {body}
            </p>
          )}
          {disclaimer && (
            <p className="mt-2 text-[11px] text-ink-400 italic whitespace-pre-line">{disclaimer}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Dealer Note ─────────────────────────────────────────────────────────── */

function DealerNoteCard({ ocd, bare }: { ocd?: any; bare?: boolean }) {
  if (!ocd?.dealer_note) return null;
  if (bare) {
    return (
      <div className="px-1 py-2">
        <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line break-words">
          {ocd.dealer_note}
        </p>
      </div>
    );
  }
  return (
    <section className="bg-amber-50/40 rounded-2xl border border-amber-200/60 overflow-hidden">
      <div className="px-5 py-4 md:p-6 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/60">
          <Quote className="h-4 w-4 text-amber-700" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-1">
            Note from the dealer
          </p>
          <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line break-words">
            {ocd.dealer_note}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Specs & Features — admin-style combined layout ─────────────────────── */

function SpecsAndFeatures({ listing, policies, ocd, bare }: { listing: any; policies: any; ocd?: any; bare?: boolean }) {
  // Derive make/model names from the joined relation (model_id → models → makes)
  // Fall back to the raw OCD scraped values when the imported listing has no
  // model link.
  const makeName: string | null =
    listing.model?.make?.name ?? ocd?.make ?? null;
  const modelName: string | null = listing.model?.name ?? ocd?.model ?? null;

  // Rental mode label
  const modeLabel = listing.mode?.mode === "with_driver"
    ? "With Driver"
    : listing.mode?.mode === "self_drive"
      ? "Self Drive"
      : null;

  // Payment methods array from policies
  const paymentMethods: string | null = policies.payment_methods?.length
    ? (policies.payment_methods as string[]).join(", ")
    : null;

  // Engine: prefer scraped engine_capacity (e.g. "2.0L V6") over imported engine_size.
  const engine = ocd?.engine_capacity ?? listing.engine_size ?? null;
  const exteriorColor = cap(ocd?.color_exterior ?? listing.color);
  const interiorColor = cap(ocd?.color_interior ?? listing.color_interior);

  const specRows: { label: string; value: string | number | null }[][] = [
    [
      { label: "Make",             value: makeName },
      { label: "Model",            value: modelName },
    ],
    [
      { label: "Year",             value: ocd?.year ?? listing.year ?? null },
      { label: "Body Type",        value: ocd?.body_type ?? listing.body_type ?? null },
    ],
    [
      { label: "Gearbox",          value: cap(ocd?.transmission ?? listing.transmission) },
      { label: "Fuel Type",        value: cap(ocd?.fuel_type ?? listing.fuel) },
    ],
    [
      { label: "Engine",           value: engine },
      { label: "Seats",            value: (ocd?.seats ?? listing.seats) ? `${ocd?.seats ?? listing.seats} passengers` : null },
    ],
    [
      { label: "Doors",            value: (ocd?.doors ?? listing.doors) ? `${ocd?.doors ?? listing.doors} doors` : null },
      { label: "Luggage Bags",     value: (ocd?.luggage_bags ?? listing.luggage_bags) ? `${ocd?.luggage_bags ?? listing.luggage_bags} bags` : null },
    ],
    [
      { label: "Ext. Color",       value: exteriorColor },
      { label: "Int. Color",       value: interiorColor },
    ],
    [
      { label: "Spec Type",        value: ocd?.spec_type ?? listing.spec_type ?? null },
      { label: "Rental Mode",      value: modeLabel },
    ],
    [
      { label: "Payment Methods",  value: paymentMethods },
      { label: "Salik / Toll",     value: (ocd?.salik_charges_aed ?? policies.salik_charges_aed) != null ? `AED ${Number(ocd?.salik_charges_aed ?? policies.salik_charges_aed).toFixed(2)}/day` : null },
    ],
  ].filter((row) => row.some((c) => c.value != null));

  const specIconMap: Record<string, React.ElementType> = {
    Make: Car, Model: Car, Year: Calendar, "Body Type": Car,
    Gearbox: Settings2, "Fuel Type": Fuel, Engine: Flame,
    Seats: Users, Doors: DoorOpen, "Luggage Bags": Briefcase,
    "Ext. Color": Palette, "Int. Color": Palette,
    "Spec Type": Globe, "Rental Mode": Settings2,
    "Payment Methods": CreditCard, "Salik / Toll": Info,
  };

  // Features — prefer ocd.features_by_category (jsonb { Category: [strings] })
  // over the imported listing_features relation.
  const ocdGrouped: Record<string, string[]> | null =
    ocd?.features_by_category && typeof ocd.features_by_category === "object" && !Array.isArray(ocd.features_by_category)
      ? (ocd.features_by_category as Record<string, string[]>)
      : null;

  const ocdFlat: string[] | null = Array.isArray(ocd?.features) ? (ocd.features as string[]) : null;

  let groups: Record<string, { name: string; id?: string }[]> = {};
  let totalFeatures = 0;
  if (ocdGrouped && Object.keys(ocdGrouped).length > 0) {
    for (const [cat, items] of Object.entries(ocdGrouped)) {
      const list = (items ?? []).filter(Boolean);
      if (list.length === 0) continue;
      groups[cat] = list.map((name) => ({ name }));
      totalFeatures += list.length;
    }
  } else if (ocdFlat && ocdFlat.length > 0) {
    groups["Features"] = ocdFlat.filter(Boolean).map((name) => ({ name }));
    totalFeatures = ocdFlat.length;
  } else {
    const rawFeatures = (listing.features as any[]) ?? [];
    const features = rawFeatures.map((f: any) => f.feature).filter(Boolean) as any[];
    groups = features.reduce((acc, f) => {
      const g = f.group ?? "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push({ name: f.name, id: f.id });
      return acc;
    }, {} as Record<string, { name: string; id?: string }[]>);
    totalFeatures = features.length;
  }

  const hasFeatures = totalFeatures > 0;
  if (specRows.length === 0 && !hasFeatures) return null;

  const Wrapper: React.ElementType = bare ? "div" : "section";
  const wrapperClass = bare
    ? "bg-white"
    : "bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden";

  return (
    <Wrapper className={wrapperClass}>
      {!bare && (
        <div className="px-5 py-4 border-b border-black/5 md:px-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
            <Settings2 className="size-4 text-brand-500" /> Specifications &amp; Features
          </h2>
          {hasFeatures && (
            <span className="rounded-full bg-surface-muted border border-black/5 px-2.5 py-0.5 text-[11px] font-semibold text-ink-500">
              {totalFeatures} features
            </span>
          )}
        </div>
      )}

      {/* ── Spec rows (admin-style paired grid) ── */}
      {specRows.length > 0 && (
        <div className="divide-y divide-black/[0.04]">
          {specRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-2 divide-x divide-black/[0.04]">
              {row.map(({ label, value }) => {
                const Icon = specIconMap[label] ?? Info;
                return (
                  <div key={label} className="flex items-start gap-2.5 px-5 py-3.5 md:px-6">
                    <Icon className="h-3.5 w-3.5 mt-0.5 text-ink-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 leading-none">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-ink-900">
                        {value != null
                          ? String(value)
                          : <span className="text-ink-300 font-normal">—</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ── Features grouped by category ── */}
      {hasFeatures && (
        <div className={cn("divide-y divide-black/[0.04]", specRows.length > 0 && "border-t border-black/[0.06]")}>
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="px-5 py-4 md:px-6">
              <p className="mb-3 text-sm font-bold text-ink-700">{groupName}</p>
              <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                {items.map((feat, idx) => (
                  <div key={feat.id ?? `${groupName}-${idx}`} className="flex items-center gap-2 text-sm text-ink-700">
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                    {feat.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  );
}

/* ─── Requirements Card ───────────────────────────────────────────────────── */

function RequirementsCard({ policies, ocd, bare }: { policies: any; ocd?: any; bare?: boolean }) {
  const minAge = ocd?.min_driver_age ?? policies.min_age;
  const depositAmount = ocd?.security_deposit_amount ?? ocd?.deposit_aed ??
    (policies.deposit_pkr != null ? policies.deposit_pkr / 75 : null);
  const depositCurrency = ocd?.security_deposit_currency ?? "AED";
  const refundPeriod = ocd?.deposit_refund_period ??
    (policies.deposit_refund_days != null ? `${policies.deposit_refund_days} days` : null);
  const insurance = ocd?.insurance_included ?? policies.insurance_included;
  const licenseRequired = policies.license_required;
  const requirementsText: string | null = ocd?.requirements_to_rent ?? null;

  if (
    minAge == null && depositAmount == null && insurance == null &&
    licenseRequired == null && !requirementsText
  ) return null;

  const Wrapper: React.ElementType = bare ? "div" : "section";
  const wrapperClass = bare
    ? "bg-white"
    : "bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden";

  return (
    <Wrapper className={wrapperClass}>
      {!bare && (
        <div className="px-5 py-4 border-b border-black/5 md:px-6">
          <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-500" /> Requirements to Rent
          </h2>
        </div>
      )}
      <div className={cn("space-y-4", bare ? "px-1 py-3" : "px-5 py-4 md:px-6")}>
        <div className="flex flex-wrap gap-3">
          {minAge != null && (
            <div className="rounded-2xl bg-sky-50 border border-sky-100 px-5 py-4 text-center min-w-[110px]">
              <p className="text-2xl font-black text-sky-700">{minAge}+</p>
              <p className="text-[11px] text-sky-600 font-semibold mt-0.5">Min. Driver Age</p>
            </div>
          )}
          {depositAmount != null && (
            <div className="rounded-2xl bg-surface-muted border border-black/5 px-5 py-4 text-center min-w-[140px]">
              <p className="text-lg font-black text-ink-800">{fmtCurrency(depositAmount, depositCurrency)}</p>
              <p className="text-[11px] text-ink-500 font-semibold mt-0.5">Security Deposit</p>
              {refundPeriod && (
                <p className="text-[10px] text-ink-400 mt-1">Refund in {refundPeriod}</p>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {insurance !== false && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              <span className="text-ink-700">Comprehensive insurance included</span>
            </div>
          )}
          {licenseRequired !== false && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              <span className="text-ink-700">Valid driving license required</span>
            </div>
          )}
        </div>
        {requirementsText && (
          <div className="border-t border-black/5 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-2">
              Full requirements
            </p>
            <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">
              {requirementsText}
            </p>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

/* ─── Rental Policies Card ────────────────────────────────────────────────── */

function RentalPoliciesCard({
  daily, policies, customPolicies, addons, ocd, bare,
}: {
  daily: any; policies: any; customPolicies: any[]; addons: any[]; ocd?: any; bare?: boolean;
}) {
  // Mileage: prefer the scraped mileage_policy text. Fall back to a derived
  // sentence from the imported tier row.
  const mileageDerived = [
    daily?.included_km_per_day ? `Included: ${Number(daily.included_km_per_day).toLocaleString()} km per day.` : null,
    daily?.extra_km_rate_pkr ? `Additional mileage: ${fmtAed(daily.extra_km_rate_pkr / 75)}/km.` : null,
  ].filter(Boolean).join("\n");
  const mileageContent = ocd?.mileage_policy || mileageDerived || null;

  // Insurance summary
  const insuranceIncluded = ocd?.insurance_included ?? policies.insurance_included;
  const insuranceContent = insuranceIncluded !== false
    ? "Comprehensive insurance is included in the rental price."
    : "Insurance is not included — standard terms apply.";

  // Deposit: prefer scraped deposit_policy paragraph; otherwise build a sentence
  // from amount + currency + refund period.
  const depositAmount = ocd?.security_deposit_amount ?? ocd?.deposit_aed ??
    (policies.deposit_pkr != null ? policies.deposit_pkr / 75 : null);
  const depositCurrency = ocd?.security_deposit_currency ?? "AED";
  const depositRefund = ocd?.deposit_refund_period ??
    (policies.deposit_refund_days != null ? `${policies.deposit_refund_days} days` : null);
  const depositDerived = depositAmount != null
    ? `A refundable deposit of ${fmtCurrency(depositAmount, depositCurrency)} is required.${depositRefund ? ` Refunded within ${depositRefund}.` : ""}`
    : null;
  const depositContent = ocd?.deposit_policy || depositDerived;

  // Payment modes — render the raw scraped text plus the imported payment_methods array (if any)
  const paymentMethodsArr: string[] = Array.isArray(policies.payment_methods)
    ? (policies.payment_methods as string[])
    : [];
  const paymentContent = [
    ocd?.payment_modes ?? null,
    paymentMethodsArr.length ? `Accepted: ${paymentMethodsArr.join(", ")}.` : null,
  ].filter(Boolean).join("\n\n") || null;

  const policyItems = [
    { key: "mileage",      title: "Mileage Policy",       icon: Gauge,       content: mileageContent },
    { key: "fuel",         title: "Fuel Policy",          icon: Fuel,        content: ocd?.fuel_policy ?? policies.fuel_policy ?? null },
    { key: "insurance",    title: "Insurance",            icon: Shield,      content: insuranceContent },
    { key: "deposit",      title: "Security Deposit",     icon: CreditCard,  content: depositContent },
    { key: "rental",       title: "Rental Terms",         icon: ShieldCheck, content: ocd?.rental_policy ?? null },
    { key: "additional",   title: "Additional Charges",   icon: Info,        content: ocd?.additional_charges ?? null },
    { key: "payments",     title: "Payment Methods",      icon: CreditCard,  content: paymentContent },
    { key: "cancellation", title: "Cancellation Policy",  icon: Info,        content: policies.cancellation_text ?? null },
    ...customPolicies.map((cp) => ({ key: cp.title, title: cp.title, icon: Info, content: cp.content })),
  ].filter((p) => p.content);

  if (policyItems.length === 0 && addons.length === 0) return null;

  const Wrapper: React.ElementType = bare ? "div" : "section";
  const wrapperClass = bare
    ? "bg-white"
    : "bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden";

  return (
    <Wrapper className={wrapperClass}>
      {!bare && (
        <div className="px-5 py-4 border-b border-black/5 md:px-6">
          <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
            <Shield className="size-4 text-brand-500" /> Rental Policies
          </h2>
        </div>
      )}

      {policyItems.length > 0 && (
        <div className={cn("divide-y divide-black/[0.04]", bare ? "px-1" : "px-5 py-2 md:px-6")}>
          {policyItems.map((item) => {
            const Icon = item.icon;
            return (
              <Sheet key={item.key}>
                <SheetTrigger className="group flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface-muted/40 transition-colors rounded-lg px-2 -mx-2">
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-ink-400 group-hover:text-brand-500 transition-colors" />
                    <span className="truncate text-sm font-medium text-ink-700 group-hover:text-ink-900">{item.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-300 group-hover:text-brand-500 transition-colors" />
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
                  <SheetHeader className="border-b border-black/5 px-6 py-5">
                    <SheetTitle className="text-lg font-bold text-ink-900">{item.title}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">{item.content}</p>
                  </div>
                </SheetContent>
              </Sheet>
            );
          })}
        </div>
      )}

      {addons.length > 0 && (
        <>
          <div className={cn("border-t border-black/[0.04]", bare ? "px-1 pt-3 pb-1" : "px-5 pt-3 pb-1 md:px-6")}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400">Optional Add-ons</p>
          </div>
          <div className={cn("divide-y divide-black/[0.04]", bare ? "px-1 pb-3" : "px-5 pb-3 md:px-6")}>
            {addons.map((ad, i) => (
              <Sheet key={`${ad.title}-${i}`}>
                <SheetTrigger className="group flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-surface-muted/40 transition-colors rounded-lg px-2 -mx-2">
                  <span className="flex min-w-0 items-center gap-3">
                    <PackagePlus className="h-4 w-4 shrink-0 text-ink-400 group-hover:text-brand-500" />
                    <span className="truncate text-sm font-medium text-ink-700 group-hover:text-ink-900">{ad.title}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                    {fmtAed(ad.price_pkr / 75)}
                  </span>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
                  <SheetHeader className="border-b border-black/5 px-6 py-5">
                    <SheetTitle className="text-lg font-bold text-ink-900">{ad.title}</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">{fmtAed(ad.price_pkr / 75)}</div>
                    {ad.description && <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line">{ad.description}</p>}
                    <p className="text-xs text-ink-400">This add-on is optional — discuss with the vendor over WhatsApp when booking.</p>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </>
      )}
    </Wrapper>
  );
}

/* ─── Vendor Contact Card — branded ──────────────────────────────────────── */

/* ─── Mobile Dealer Tile (opens a Sheet with the full VendorContactCard) ──── */

function MobileDealerTile({
  business, ocd, listingTitle, listingId, hasWhatsApp, openModal,
}: {
  business: any; ocd?: any;
  listingTitle: string; listingId: string;
  hasWhatsApp: boolean;
  openModal: (title: string, source: string, meta: { listingId: string }) => void;
}) {
  if (!business?.name) return null;
  const logo = business.logo_url || business.cover_url;
  const isVerified = business.claim_status === "verified" || business.claim_status === "claimed";

  return (
    <Sheet>
      <SheetTrigger
        className="group flex w-full items-center gap-3 rounded-2xl bg-white border border-black/5 shadow-sm px-3 py-2.5 text-left hover:border-brand-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={`Open dealer info for ${business.name}`}
      >
        <div className="relative h-10 w-10 shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-brand-100 to-orange-50 ring-1 ring-black/5">
          {logo ? (
            <Image src={logo} alt="" fill sizes="40px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-brand-600 uppercase">
              {business.name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-[13px] font-bold text-ink-900">{business.name}</p>
            {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" aria-label="Verified" />}
          </div>
          <p className="truncate text-[11px] text-ink-500">
            {[business.address_line, business.city].filter(Boolean).join(", ") || "Tap for dealer info"}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
          Info
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-white">
        <SheetHeader className="border-b border-black/5 px-5 py-4">
          <SheetTitle className="text-base font-black text-ink-900">Dealer info</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <VendorContactCard
            business={business}
            hasWhatsApp={hasWhatsApp}
            listingTitle={listingTitle}
            listingId={listingId}
            openModal={openModal}
            ocd={ocd}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VendorContactCard({
  business, hasWhatsApp, listingTitle, listingId, openModal, ocd,
}: {
  business: any; hasWhatsApp: boolean; listingTitle: string; listingId: string;
  openModal: (title: string, source: string, meta: { listingId: string }) => void;
  ocd?: any;
}) {
  const rating = Number.isFinite(business.rating) ? Number(business.rating) : 0;
  const isVerified = business.claim_status === "verified" || business.claim_status === "claimed";

  // Logo: prefer business.logo_url, fall back to cover_url for legacy rows.
  const logo = business.logo_url || business.cover_url;

  // Build the full address shown above the rating: prefer the business
  // address_line + city + country; otherwise use the OCD scraped location.
  const fullAddress = [
    business.address_line,
    business.city,
    business.country ?? "UAE",
  ]
    .filter(Boolean)
    .join(", ") || ocd?.location || null;

  const workingHours = business.working_hours;
  const languages: string[] = Array.isArray(business.languages) ? business.languages : [];
  const fleetCount = business.total_fleet_count;
  const establishedYear = business.established_year;
  const description = business.description;

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">

      {/* ── Branded gradient header ── */}
      <div className="relative h-28 bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-white/5" />

        {/* Availability badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-white tracking-wide">Available Now</span>
        </div>
      </div>

      {/* ── Logo overlapping header ── */}
      <div className="relative -mt-10 flex justify-center">
        <div className="h-20 w-20 rounded-2xl bg-white shadow-xl ring-4 ring-white overflow-hidden flex items-center justify-center">
          {logo ? (
            <Image
              src={logo}
              alt={business.name ?? "Dealer"}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-brand-100 to-orange-50 flex items-center justify-center">
              <span className="text-2xl font-black text-brand-600 uppercase select-none">
                {business.name?.charAt(0) ?? "?"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 text-center">
        {/* Name + verified badge */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <h3 className="text-[15px] font-black text-ink-900 leading-tight">{business.name ?? "Rental Partner"}</h3>
          {isVerified && (
            <BadgeCheck className="size-4 text-brand-500 shrink-0" aria-label="Verified dealer" />
          )}
        </div>

        {/* Full address — area, city, country */}
        {fullAddress && (
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500">
            <MapPin className="h-3 w-3 shrink-0 text-brand-400" />
            {fullAddress}
          </p>
        )}

        {/* Quick credibility row — fleet / established / verified-from-OCD */}
        {(fleetCount != null || establishedYear != null || ocd?.is_verified || ocd?.is_premium) && (
          <div className="mt-2 flex items-center justify-center flex-wrap gap-1.5">
            {establishedYear != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted border border-black/5 px-2 py-0.5 text-[10px] font-bold text-ink-600">
                Since {establishedYear}
              </span>
            )}
            {fleetCount != null && fleetCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted border border-black/5 px-2 py-0.5 text-[10px] font-bold text-ink-600">
                <Car className="h-2.5 w-2.5" /> {fleetCount} cars
              </span>
            )}
            {(ocd?.is_premium || ocd?.is_verified) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Award className="h-2.5 w-2.5" /> Premium dealer
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {business.reviews_count > 0 ? (
          <div className="mt-2.5 flex items-center justify-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-3.5",
                    i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-ink-200 text-ink-200",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-ink-800">{rating.toFixed(1)}</span>
            <span className="text-xs text-ink-400">({business.reviews_count} reviews)</span>
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-2.5 py-0.5">
            <BadgeCheck className="h-3 w-3 text-brand-500" />
            <span className="text-[11px] font-bold text-brand-700">Verified Dealer</span>
          </div>
        )}

        {/* Divider */}
        <div className="my-4 border-t border-black/5" />

        {/* CTA buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => openModal(listingTitle, "listing_detail", { listingId })}
            disabled={!hasWhatsApp}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-sm font-bold text-white shadow-lg shadow-green-500/25 hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-40"
          >
            <MessageCircle className="size-4" /> WhatsApp Now
          </button>
          <a
            href={business.phone ? `tel:${business.phone}` : "#"}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-black/10 text-sm font-semibold text-ink-700 hover:bg-surface-muted transition-colors"
          >
            <Phone className="size-4" /> Call Dealer
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-black/5 text-center">
          <div>
            <p className="text-[11px] font-black text-ink-900">✓ Verified</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Dealer</p>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-900">No Hidden</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Fees</p>
          </div>
          <div>
            <p className="text-[11px] font-black text-ink-900">Instant</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Booking</p>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-4 pt-4 border-t border-black/5 text-left">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-1">About</p>
            <p className="text-xs leading-relaxed text-ink-600 whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Working hours */}
        <WorkingHours hours={workingHours} />

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/5 text-left">
            <div className="flex items-center gap-1.5 mb-2">
              <LanguagesIcon className="h-3.5 w-3.5 text-ink-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400">Languages spoken</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <span key={lang} className="inline-flex items-center rounded-full bg-surface-muted border border-black/5 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* View all cars */}
        {business.slug && (
          <div className="mt-4 pt-3 border-t border-black/5">
            <Link
              href={`/vendor/${business.slug}`}
              className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              View all cars from this dealer
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Working Hours (vendor card sub-component) ───────────────────────────── */

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABEL: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

function WorkingHours({ hours }: { hours: any }) {
  if (!hours || typeof hours !== "object") return null;
  const entries = DAY_ORDER
    .map((day) => {
      const v = hours[day];
      if (v == null) return null;
      let label = "";
      if (typeof v === "string") {
        label = v;
      } else if (typeof v === "object") {
        if (v.closed === true) label = "Closed";
        else if (v.open && v.close) label = `${v.open} – ${v.close}`;
        else if (v.from && v.to) label = `${v.from} – ${v.to}`;
        else label = JSON.stringify(v);
      } else {
        label = String(v);
      }
      return { day, label };
    })
    .filter(Boolean) as { day: string; label: string }[];

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-black/5 text-left">
      <div className="flex items-center gap-1.5 mb-2">
        <Clock className="h-3.5 w-3.5 text-ink-400" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400">Working hours</p>
      </div>
      <dl className="grid grid-cols-1 gap-y-0.5">
        {entries.map(({ day, label }) => (
          <div key={day} className="flex items-center justify-between text-xs">
            <dt className="text-ink-500 font-medium">{DAY_LABEL[day] ?? day}</dt>
            <dd className="text-ink-800 font-semibold">{label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ─── Mobile Sections Accordion ───────────────────────────────────────────── */

function MobileSectionsAccordion({
  listing, policies, ocd, daily,
}: {
  listing: any; policies: any; ocd?: any; daily: any;
}) {
  // Compute counts/flags so we can label triggers without expanding
  const featureCount = (() => {
    const grouped = ocd?.features_by_category;
    if (grouped && typeof grouped === "object" && !Array.isArray(grouped)) {
      return Object.values(grouped).reduce(
        (n: number, items: any) => n + (Array.isArray(items) ? items.length : 0),
        0,
      );
    }
    if (Array.isArray(ocd?.features)) return (ocd.features as string[]).length;
    return ((listing.features as any[]) ?? []).length;
  })();

  const policyCount = [
    ocd?.mileage_policy ?? (daily?.included_km_per_day || daily?.extra_km_rate_pkr),
    ocd?.fuel_policy ?? policies.fuel_policy,
    ocd?.deposit_policy,
    ocd?.rental_policy,
    ocd?.additional_charges,
    ocd?.payment_modes ?? (Array.isArray(policies.payment_methods) && policies.payment_methods.length > 0),
    policies.cancellation_text,
  ].filter(Boolean).length;

  const hasDealerNote = !!ocd?.dealer_note;
  const hasDescription = !!listing.description;
  const hasRequirements =
    (ocd?.min_driver_age ?? policies.min_age) != null ||
    (ocd?.security_deposit_amount ?? ocd?.deposit_aed ?? policies.deposit_pkr) != null ||
    !!ocd?.requirements_to_rent;

  type Item = {
    value: string;
    title: string;
    icon: React.ElementType;
    badge?: string;
    body: React.ReactNode;
  };

  const items: Item[] = [
    {
      value: "specs",
      title: "Specifications & Features",
      icon: Settings2,
      badge: featureCount > 0 ? `${featureCount} features` : undefined,
      body: <SpecsAndFeatures listing={listing} policies={policies} ocd={ocd} bare />,
    },
    hasRequirements && {
      value: "requirements",
      title: "Requirements to Rent",
      icon: ShieldCheck,
      body: <RequirementsCard policies={policies} ocd={ocd} bare />,
    },
    hasDescription && {
      value: "about",
      title: "About this Car",
      icon: Info,
      body: (
        <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-line break-words px-1 py-2">
          {listing.description}
        </p>
      ),
    },
    policyCount > 0 && {
      value: "policies",
      title: "Rental Policies",
      icon: Shield,
      badge: `${policyCount}`,
      body: (
        <RentalPoliciesCard
          daily={daily}
          policies={policies}
          customPolicies={(listing as any).custom_policies ?? []}
          addons={(listing as any).addons ?? []}
          ocd={ocd}
          bare
        />
      ),
    },
    hasDealerNote && {
      value: "dealer-note",
      title: "Note from the Dealer",
      icon: Quote,
      body: <DealerNoteCard ocd={ocd} bare />,
    },
  ].filter(Boolean) as Item[];

  if (items.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <Accordion defaultValue={["specs"]} multiple>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <AccordionItem
              key={item.value}
              value={item.value}
              className="px-4 border-b last:border-b-0 border-black/[0.06]"
            >
              <AccordionTrigger className="min-h-[52px] py-3.5 text-[14px] font-bold text-ink-900">
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 shrink-0 text-brand-500" />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="shrink-0 inline-flex items-center rounded-full bg-surface-muted border border-black/5 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                      {item.badge}
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pb-4">{item.body}</div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}

/* ─── Quick Policies Card ─────────────────────────────────────────────────── */

function QuickPoliciesCard({ policies, daily, ocd }: { policies: any; daily: any; ocd?: any }) {
  const depositAmount = ocd?.security_deposit_amount ?? ocd?.deposit_aed ??
    (policies.deposit_pkr != null ? policies.deposit_pkr / 75 : null);
  const depositCurrency = ocd?.security_deposit_currency ?? "AED";
  const minDays = ocd?.min_rental_days ?? policies.min_rental_days;
  const insurance = ocd?.insurance_included ?? policies.insurance_included;
  const delivery = ocd?.free_delivery ?? policies.delivery_available;
  const salik = ocd?.salik_charges_aed ?? policies.salik_charges_aed;
  const dailyKm = ocd?.daily_km_included ?? daily?.included_km_per_day;
  const dailyExtraRate = ocd?.daily_extra_km_rate ?? ocd?.extra_km_rate ?? ocd?.extra_km_rate_aed;
  const dailyExtraCurrency = ocd?.daily_extra_km_currency ?? ocd?.extra_km_currency ?? "AED";
  const vat = ocd?.vat_percentage != null ? Number(ocd.vat_percentage) : null;

  const items = [
    { label: "Security Deposit",    value: depositAmount != null ? fmtCurrency(depositAmount, depositCurrency) : null, green: false },
    { label: "Min. Rental Period",  value: minDays != null ? (minDays <= 1 ? "1 day" : `${minDays} days`) : null, green: false },
    { label: "Insurance",           value: insurance !== undefined ? (insurance !== false ? "✓ Included" : "Not included") : null, green: insurance !== false },
    { label: "Delivery",            value: delivery !== undefined
      ? (delivery
          ? (ocd?.free_delivery ? "✓ Free" : (policies.delivery_fee_pkr ? fmtAed(policies.delivery_fee_pkr / 75) : "✓ Free"))
          : "Not available")
      : null, green: !!delivery },
    { label: "Salik / Toll",        value: salik != null ? `AED ${Number(salik).toFixed(2)}/day` : null, green: false },
    { label: "VAT",                 value: vat != null && vat > 0 ? `+${vat}%` : null, green: false },
    { label: "Included Mileage",    value: dailyKm ? `${Number(dailyKm).toLocaleString()} km/day` : null, green: false },
    { label: "Extra Mileage Rate",  value: dailyExtraRate != null
      ? `${fmtDecimal(dailyExtraRate, dailyExtraCurrency)}/km`
      : (daily?.extra_km_rate_pkr ? `${fmtAed(daily.extra_km_rate_pkr / 75)}/km` : null), green: false },
  ].filter((i) => i.value != null);

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-black/5">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Quick Summary</p>
      </div>
      <dl className="divide-y divide-black/[0.04]">
        {items.map(({ label, value, green }) => (
          <div key={label} className="flex items-center justify-between px-5 py-2.5">
            <dt className="text-xs text-ink-500">{label}</dt>
            <dd className={cn("text-xs font-semibold", green ? "text-emerald-600" : "text-ink-900")}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
