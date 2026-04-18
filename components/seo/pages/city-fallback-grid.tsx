"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, MessageCircle, MapPin, Lightbulb } from "lucide-react";
import { WhatsAppLeadModal, useWhatsAppLead } from "@/components/shared/whatsapp-lead-modal";

interface FallbackBusiness {
  id: string;
  slug: string;
  name: string;
  city: string;
  address_line: string | null;
  logo_url: string | null;
  cover_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  business_images?: { url: string; is_primary: boolean | null; sort_order: number | null }[];
}

interface CityFallbackGridProps {
  city: string;
  businesses: FallbackBusiness[];
}

export function CityFallbackGrid({ city, businesses }: CityFallbackGridProps) {
  const { modalState, openModal, setOpen } = useWhatsAppLead();

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
        <p className="text-sm font-medium text-ink-500">No cars match your filters.</p>
        <p className="mt-1 text-xs text-ink-400">Try adjusting your filters or browse all cars.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Helpful banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-900">
            No exact matches in {city} — but these local businesses can help
          </p>
          <p className="mt-0.5 text-xs text-amber-800/90">
            Message them directly on WhatsApp — they may have a car that fits your needs even if
            it&apos;s not listed here.
          </p>
        </div>
      </div>

      {/* Grid of businesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((biz) => {
          const image =
            biz.business_images?.find((i) => i.is_primary)?.url ??
            biz.business_images?.[0]?.url ??
            biz.cover_url ??
            biz.logo_url ??
            null;
          const rating = biz.rating ?? 0;
          const reviewsCount = biz.reviews_count ?? 0;

          return (
            <div
              key={biz.id}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-shadow hover:shadow-pop"
            >
              {/* Image / header */}
              <Link
                href={`/vendors/${biz.slug}`}
                className="relative block aspect-[16/10] overflow-hidden bg-surface-muted"
              >
                {image ? (
                  <Image
                    src={image}
                    alt={biz.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-brand-50">
                    <span className="text-3xl font-black text-brand-400">
                      {biz.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur">
                  <MapPin className="h-3 w-3 text-brand-500" />
                  {biz.city}
                </span>
              </Link>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/vendors/${biz.slug}`} className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-brand-600">
                      {biz.name}
                    </h3>
                    {biz.address_line && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                        {biz.address_line}
                      </p>
                    )}
                  </Link>
                  {rating > 0 && reviewsCount > 0 && (
                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {Number(rating).toFixed(1)}
                      <span className="text-amber-500">({reviewsCount})</span>
                    </div>
                  )}
                </div>

                {/* WhatsApp CTA */}
                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      openModal(biz.name, "city_fallback", { businessId: biz.id })
                    }
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ask on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single modal for all cards */}
      <WhatsAppLeadModal
        open={modalState.open}
        onOpenChange={setOpen}
        listingId={modalState.listingId}
        businessId={modalState.businessId}
        listingTitle={modalState.listingTitle}
        source={modalState.source}
      />
    </div>
  );
}
