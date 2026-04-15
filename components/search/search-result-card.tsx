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

  const data: ListingCardData = {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    city: listing.city,
    primaryImageUrl: listing.primary_image_url,
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
