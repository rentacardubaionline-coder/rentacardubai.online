"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Phone, Globe, MessageSquare, Image as ImageIcon, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrapedBusinessCardData {
  id: string;
  name: string;
  category: string | null;
  city_name: string | null;
  rating: number | null;
  total_ratings: number | null;
  normalised_phone: string | null;
  website: string | null;
  image_urls: string[] | null;
  review_count: number;
  working_hours: unknown;
}

interface Props {
  business: ScrapedBusinessCardData;
  selected: boolean;
  onToggle: () => void;
}

export function ScrapedBusinessCard({ business, selected, onToggle }: Props) {
  const firstImage = business.image_urls?.[0];
  const imageCount = business.image_urls?.length ?? 0;
  const hasHours = !!(business.working_hours && Object.keys(business.working_hours as Record<string, unknown>).length > 0);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 transition-all",
        selected ? "ring-2 ring-amber-400 shadow-pop" : "ring-black/5 hover:shadow-pop",
      )}
    >
      {/* Selection checkbox */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "absolute left-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-md border-2 shadow-sm transition-colors",
          selected
            ? "border-amber-500 bg-amber-500 text-white"
            : "border-white bg-white/90 text-transparent hover:border-amber-300",
        )}
        aria-label={selected ? "Deselect" : "Select for bulk action"}
      >
        {selected && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-8 8a1 1 0 01-1.415 0l-4-4a1 1 0 011.415-1.415L8 12.586l7.29-7.296a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Image */}
      <Link
        href={`/admin/scraper/review/${business.id}`}
        className="relative aspect-[16/10] overflow-hidden bg-surface-muted"
      >
        {firstImage ? (
          <Image
            src={firstImage}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-ink-300" />
          </div>
        )}
        {business.city_name && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur">
            <MapPin className="h-3 w-3 text-amber-500" />
            {business.city_name}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/admin/scraper/review/${business.id}`}
            className="min-w-0 flex-1"
          >
            <h3 className="line-clamp-1 text-[15px] font-semibold text-ink-900 group-hover:text-amber-700">
              {business.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
              {business.category ?? "Uncategorised"}
            </p>
          </Link>

          {business.rating && (
            <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{Number(business.rating).toFixed(1)}</span>
              <span className="text-amber-500">({business.total_ratings ?? 0})</span>
            </div>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-1 text-[11px]">
          {business.normalised_phone && (
            <p className="flex items-center gap-1.5 text-ink-600">
              <Phone className="h-3 w-3 text-emerald-600" />
              <span className="font-mono">{business.normalised_phone}</span>
            </p>
          )}
          {business.website && (
            <p className="flex items-center gap-1.5 truncate text-ink-500">
              <Globe className="h-3 w-3 text-brand-500 shrink-0" />
              <span className="truncate">{cleanUrl(business.website)}</span>
            </p>
          )}
        </div>

        {/* Data badges */}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {imageCount > 0 && (
            <Badge icon={<ImageIcon className="h-2.5 w-2.5" />} label={`${imageCount} photos`} color="blue" />
          )}
          {business.review_count > 0 && (
            <Badge icon={<MessageSquare className="h-2.5 w-2.5" />} label={`${business.review_count} reviews`} color="amber" />
          )}
          {hasHours && (
            <Badge icon={<Clock className="h-2.5 w-2.5" />} label="hours" color="emerald" />
          )}
        </div>

        {/* View detail link */}
        <Link
          href={`/admin/scraper/review/${business.id}`}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-xs font-semibold text-white hover:bg-ink-700 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Review & Import
        </Link>
      </div>
    </div>
  );
}

function Badge({
  icon, label, color,
}: {
  icon: React.ReactNode;
  label: string;
  color: "blue" | "amber" | "emerald";
}) {
  const colors = {
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset", colors[color])}>
      {icon}
      {label}
    </span>
  );
}

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
