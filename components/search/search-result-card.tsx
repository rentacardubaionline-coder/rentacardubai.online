import { ListingCard, type ListingCardData } from "@/components/listing/listing-card";
import type { SearchResult } from "@/lib/search/query";

interface SearchResultCardProps {
  listing: SearchResult;
}

/**
 * Thin wrapper mapping the search query result shape to the shared ListingCard.
 * Keeps the search page consistent with the home-page featured row.
 */
export function SearchResultCard({ listing }: SearchResultCardProps) {
  const daily = listing.pricing?.find((p) => p.tier === "daily");
  const price = daily?.price_pkr ?? listing.pricing?.[0]?.price_pkr ?? null;

  // Build the hover-preview set: primary first, then by sort_order, deduped.
  // Capped at 3 — the HoverZoneImage component clips beyond that anyway.
  const previewImages =
    listing.images && listing.images.length > 0
      ? [...listing.images]
          .sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
          })
          .slice(0, 3)
          .map((img) => img.url)
      : listing.primary_image_url
        ? [listing.primary_image_url]
        : [];

  const data: ListingCardData = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    city: listing.city,
    primaryImageUrl: listing.primary_image_url,
    previewImages,
    pricePerDayPkr: price,
    business: {
      name: listing.business.name,
      rating: listing.business.rating,
      reviewsCount: listing.business.reviews_count,
      phone: listing.business.phone,
      whatsappPhone: listing.business.whatsapp_phone,
    },
  };

  return <ListingCard listing={data} source="search_results" />;
}
