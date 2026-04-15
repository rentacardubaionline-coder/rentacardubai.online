"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatPkr } from "@/lib/utils";
import { motion } from "framer-motion";
import { cardHover } from "@/lib/motion";
import type { SearchResult } from "@/lib/search/query";

interface SearchResultCardProps {
  listing: SearchResult;
}

export function SearchResultCard({ listing }: SearchResultCardProps) {
  const dailyPrice = listing.pricing?.[0]?.price_pkr || null;

  return (
    <motion.div variants={cardHover} whileHover="hover" whileTap="tap">
      <Link href={`/cars/${listing.slug}`}>
        <div className="group flex flex-col overflow-hidden rounded-lg border border-surface-muted bg-white shadow-card transition-shadow hover:shadow-pop">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-surface-muted">
            {listing.primary_image_url ? (
              <Image
                src={listing.primary_image_url}
                alt={listing.title}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-surface-sunken text-ink-300">
                No image
              </div>
            )}
            {/* City badge */}
            <div className="absolute top-3 right-3">
              <span className="inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white capitalize">
                {listing.city}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-2 p-4">
            {/* Title */}
            <h3 className="line-clamp-2 font-semibold text-ink-900">{listing.title}</h3>

            {/* Rating */}
            {listing.business.rating > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(listing.business.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-surface-muted"
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-ink-500">
                  {listing.business.rating.toFixed(1)} ({listing.business.reviews_count})
                </span>
              </div>
            )}

            {/* Specs */}
            <div className="flex flex-wrap gap-2 text-xs text-ink-600">
              <span>{listing.year}</span>
              <span>•</span>
              <span className="capitalize">{listing.transmission}</span>
              <span>•</span>
              <span>{listing.seats} seats</span>
            </div>

            {/* Price */}
            {dailyPrice && (
              <div className="mt-auto pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-brand-600">
                    {formatPkr(dailyPrice)}
                  </span>
                  <span className="text-xs text-ink-500">/day</span>
                </div>
              </div>
            )}

            {/* Business name */}
            <div className="mt-2 border-t border-surface-muted pt-2">
              <p className="text-xs text-ink-500 line-clamp-1">{listing.business.name}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
