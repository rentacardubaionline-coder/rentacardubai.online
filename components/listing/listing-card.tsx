"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatPkr } from "@/lib/utils";
import { cardHover } from "@/lib/motion";
import { WhatsAppLeadModal, useWhatsAppLead } from "@/components/shared/whatsapp-lead-modal";
import { HoverZoneImage } from "@/components/listing/hover-zone-image";

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  city: string;
  primaryImageUrl: string | null;
  /** Up to 3 image URLs for the hover-zone preview. The first should be the
   *  primary image; the next two are alternates revealed when the user moves
   *  their cursor across the card. Falls back to primaryImageUrl when empty. */
  previewImages?: string[];
  pricePerDayPkr: number | null;
  business: {
    name: string;
    rating: number;
    reviewsCount: number;
    whatsappPhone?: string | null;
    phone?: string | null;
  };
}

interface ListingCardProps {
  listing: ListingCardData;
  /** Source tag passed to lead logger for attribution. */
  source?: string;
}

export function ListingCard({ listing, source = "listing_card" }: ListingCardProps) {
  const {
    slug,
    title,
    city,
    primaryImageUrl,
    previewImages,
    pricePerDayPkr,
    business,
  } = listing;

  const rating = Number.isFinite(business.rating) ? business.rating : 0;
  const reviewsCount = business.reviewsCount ?? 0;
  const hasWhatsApp = !!(business.whatsappPhone || business.phone);

  // Build the preview set: any explicit `previewImages`, plus the primary as
  // a fallback when nothing else is available. Dedupe so we don't show the
  // same picture twice.
  const sourceImages =
    previewImages && previewImages.length > 0
      ? previewImages
      : primaryImageUrl
        ? [primaryImageUrl]
        : [];
  const uniqueImages = Array.from(new Set(sourceImages));
  const hasMultiplePreviews = uniqueImages.length > 1;

  const { modalState, openModal, setOpen } = useWhatsAppLead();

  return (
    <motion.div {...cardHover} className="group h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-pop">
        {/* Image — hover-zone preview when 2+ images exist, single image otherwise */}
        <Link
          href={`/cars/${slug}`}
          aria-label={`View ${title}`}
          className="relative block aspect-[16/10] overflow-hidden bg-surface-muted"
        >
          {hasMultiplePreviews ? (
            <HoverZoneImage
              images={uniqueImages}
              alt={title}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : primaryImageUrl ? (
            <Image
              src={primaryImageUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-300">
              No image
            </div>
          )}

          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur">
            <MapPin className="h-3 w-3 text-brand-500" />
            {city}
          </span>
        </Link>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Title + rating */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/cars/${slug}`} className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-brand-600">
                {title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                {business.name}
              </p>
            </Link>

            {reviewsCount > 0 && (
              <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{rating.toFixed(1)}</span>
                <span className="text-amber-500">({reviewsCount})</span>
              </div>
            )}
          </div>

          {/* Price */}
          {pricePerDayPkr !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-brand-600">
                {formatPkr(pricePerDayPkr)}
              </span>
              <span className="text-xs text-ink-500">/ day</span>
            </div>
          )}

          {/* WhatsApp button */}
          <div className="mt-auto pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal(title, source, { listingId: listing.id });
              }}
              disabled={!hasWhatsApp}
              className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 ${
                !hasWhatsApp ? "pointer-events-none opacity-50" : ""
              }`}
              aria-label={`WhatsApp ${business.name}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
          </div>
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
    </motion.div>
  );
}
