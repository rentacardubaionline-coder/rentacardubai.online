import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, MessageCircle, ArrowUpRight } from "lucide-react";
import { vendorUrl } from "@/lib/vendor/url";
import { formatCity } from "@/lib/search/params";

interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    slug: string;
    city: string;
    address_line: string | null;
    phone: string | null;
    whatsapp_phone?: string | null;
    logo_url: string | null;
    cover_url?: string | null;
    rating: number | null;
    reviews_count: number | null;
    business_images?: { url: string; is_primary: boolean | null; sort_order: number | null }[];
  };
}

export function VendorCard({ vendor }: VendorCardProps) {
  const url = vendorUrl({ slug: vendor.slug, city: vendor.city });

  const coverImage =
    vendor.business_images?.find((i) => i.is_primary)?.url ??
    vendor.business_images?.[0]?.url ??
    vendor.cover_url ??
    null;

  const whatsappNumber = vendor.whatsapp_phone || vendor.phone;
  const whatsappMsg = encodeURIComponent(
    `Hi ${vendor.name}, I found your business on RentNowPK and I'm interested in your rental services.`,
  );
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${whatsappMsg}`
    : null;

  const rating = vendor.rating ?? 0;
  const reviews = vendor.reviews_count ?? 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(234,88,12,0.25)] hover:ring-brand-200">
      {/* Cover image — clean, no overlays */}
      <Link
        href={url}
        className="relative block aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-orange-50"
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={vendor.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="select-none text-6xl font-black text-brand-300/60">
              {vendor.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Link href={url} className="block min-w-0">
          <h3 className="line-clamp-1 text-[15px] font-extrabold text-ink-900 transition-colors group-hover:text-brand-600">
            {vendor.name}
          </h3>
        </Link>

        {/* Rating & reviews */}
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-ink-900">
            {rating > 0 ? Number(rating).toFixed(1) : "New"}
          </span>
          {reviews > 0 && (
            <span className="text-xs text-ink-500">
              ({reviews} {reviews === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>

        {/* City — under rating */}
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" />
          <span className="line-clamp-1">
            {formatCity(vendor.city)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-3">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : (
            <div className="inline-flex items-center justify-center rounded-xl bg-surface-muted/50 px-3 py-2.5 text-xs font-semibold text-ink-400">
              No phone
            </div>
          )}
          <Link
            href={url}
            aria-label={`View ${vendor.name}`}
            className="inline-flex items-center justify-center rounded-xl border border-surface-muted bg-white px-3 py-2.5 text-ink-500 transition-all hover:border-brand-300 hover:text-brand-600"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
