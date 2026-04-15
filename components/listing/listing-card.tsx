"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { formatPkr } from "@/lib/utils";
import { cardHover } from "@/lib/motion";

export interface ListingCardData {
  id: string;
  slug: string;
  title: string; // e.g. "Toyota Corolla 2023"
  city: string;
  primaryImageUrl: string | null;
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
  /** Source tag passed to lead logger for attribution (e.g., "home_featured", "search_results"). */
  source?: string;
}

/**
 * oneclickdrive-style car rental card.
 *
 * Layout:
 *   [ image — 16:9, object-cover, city chip top-right ]
 *   Title
 *   📍 City             ★ 4.5 (156)
 *   PKR 4,500  /day
 *   [ WhatsApp (green) ] [ Call (orange) ]
 *
 * Buttons prevent bubbling so tapping them never accidentally navigates to the detail page.
 * The whole card (minus buttons) is a link to /cars/[slug].
 */
export function ListingCard({ listing, source = "listing_card" }: ListingCardProps) {
  const {
    slug,
    title,
    city,
    primaryImageUrl,
    pricePerDayPkr,
    business,
  } = listing;

  const rating = Number.isFinite(business.rating) ? business.rating : 0;
  const reviewsCount = business.reviewsCount ?? 0;

  // Lead-logging URLs — server route handlers in /api/leads/* log and redirect.
  // Fallback to direct wa.me/tel: if phone is available but API route isn't wired yet.
  const whatsappHref = business.whatsappPhone
    ? `/api/leads/whatsapp?listing=${listing.id}&source=${encodeURIComponent(source)}`
    : null;
  const callHref = business.phone
    ? `/api/leads/call?listing=${listing.id}&source=${encodeURIComponent(source)}`
    : null;

  // Fallback raw links if lead API not available (during early phases)
  const waFallback = business.whatsappPhone
    ? `https://wa.me/${business.whatsappPhone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(`Hi! I'm interested in renting your ${title}.`)}`
    : null;
  const telFallback = business.phone ? `tel:${business.phone}` : null;

  return (
    <motion.div {...cardHover} className="group h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-pop">
        {/* Image — whole image area is a link to detail page */}
        <Link
          href={`/cars/${slug}`}
          aria-label={`View ${title}`}
          className="relative block aspect-[16/10] overflow-hidden bg-surface-muted"
        >
          {primaryImageUrl ? (
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

          {/* City chip, top-left */}
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

          {/* Action buttons: WhatsApp + Call */}
          <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
            <a
              href={whatsappHref ?? waFallback ?? "#"}
              target={whatsappHref ? undefined : "_blank"}
              rel="nofollow noopener"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 ${
                !whatsappHref && !waFallback ? "pointer-events-none opacity-50" : ""
              }`}
              aria-label={`WhatsApp ${business.name}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={callHref ?? telFallback ?? "#"}
              rel="nofollow noopener"
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 ${
                !callHref && !telFallback ? "pointer-events-none opacity-50" : ""
              }`}
              aria-label={`Call ${business.name}`}
            >
              <Phone className="h-4 w-4" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
