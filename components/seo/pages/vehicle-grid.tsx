import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, MessageCircle } from "lucide-react";
import { formatPkr } from "@/lib/utils";

interface VehicleGridProps {
  listings: any[];
}

export function VehicleGrid({ listings }: VehicleGridProps) {
  if (listings.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {listings.map((listing: any) => {
        const daily = (listing.pricing ?? []).find((p: any) => p.tier === "daily");
        const rating = listing.business?.rating;
        const reviewsCount = listing.business?.reviews_count ?? 0;

        return (
          <Link
            key={listing.id}
            href={`/cars/${listing.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-pop"
          >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
              {listing.primary_image_url ? (
                <Image
                  src={listing.primary_image_url}
                  alt={listing.title}
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
                {listing.city}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-brand-600">
                    {listing.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                    {listing.business?.name ?? "Vendor"}
                  </p>
                </div>
                {rating > 0 && reviewsCount > 0 && (
                  <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {Number(rating).toFixed(1)}
                  </div>
                )}
              </div>

              {daily && (
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-brand-600">
                    {formatPkr(daily.price_pkr)}
                  </span>
                  <span className="text-xs text-ink-500">/ day</span>
                </div>
              )}

              <div className="mt-auto pt-1">
                <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white group-hover:bg-green-600 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
