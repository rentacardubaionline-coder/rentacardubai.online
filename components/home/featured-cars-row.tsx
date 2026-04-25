import { cache } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { ListingCard, type ListingCardData } from "@/components/listing/listing-card";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopPublishedBusinesses } from "@/lib/seo/data";
import { CityFallbackGrid } from "@/components/seo/pages/city-fallback-grid";

const getFeaturedListings = cache(async function getFeaturedListings() {
  // Wrapped — Supabase JS throws (rejects the await) on actual network
  // failures, not just on PostgREST-level errors. We swallow both so the
  // home page falls through cleanly to the fallback business grid instead
  // of bubbling a TypeError up to React.
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("listings")
      .select(
        `
        id,
        slug,
        title,
        city,
        primary_image_url,
        business:business_id (
          id,
          name,
          rating,
          reviews_count,
          phone,
          whatsapp_phone
        ),
        pricing:listing_pricing (
          tier,
          price_pkr
        )
      `
      )
      .eq("status", "approved")
      .eq("is_live", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      console.error("[FeaturedCarsRow] fetch error:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[FeaturedCarsRow] network error:", err);
    return [];
  }
});

/**
 * Home-page featured cars row. Server component — fetches the latest 8 approved
 * listings directly from Supabase.
 */
export async function FeaturedCarsRow() {
  const data = await getFeaturedListings();
  // Same belt-and-braces try/catch on the fallback so a Supabase outage
  // can't blow up the home page. Worst case both arrays are empty and we
  // render nothing — the rest of the page (hero + how-it-works) survives.
  let fallbackBusinesses: Awaited<ReturnType<typeof getTopPublishedBusinesses>> = [];
  if (data.length === 0) {
    try {
      fallbackBusinesses = await getTopPublishedBusinesses(12);
    } catch (err) {
      console.error("[FeaturedCarsRow] fallback businesses fetch failed:", err);
      fallbackBusinesses = [];
    }
  }

  const listings: ListingCardData[] = data.map(
    (l: any) => {
      const daily = l.pricing?.find((p: any) => p.tier === "daily");
      return {
        id: l.id,
        slug: l.slug,
        title: l.title,
        city: l.city,
        primaryImageUrl: l.primary_image_url ?? null,
        pricePerDayPkr: daily?.price_pkr ?? l.pricing?.[0]?.price_pkr ?? null,
        business: {
          name: l.business?.name ?? "",
          rating: l.business?.rating ?? 0,
          reviewsCount: l.business?.reviews_count ?? 0,
          phone: l.business?.phone ?? null,
          whatsappPhone: l.business?.whatsapp_phone ?? null,
        },
      };
    }
  );

  const isFallback = listings.length === 0;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          title={isFallback ? "Trusted car rental agencies" : "Featured cars"}
          description={
            isFallback
              ? "Top-rated rental businesses across Pakistan — message directly on WhatsApp"
              : "Popular rentals in high demand"
          }
          action={
            !isFallback && (
              <Link
                href="/search"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all →
              </Link>
            )
          }
        />

        {isFallback ? (
          <div className="mt-6">
            <CityFallbackGrid city="Pakistan" businesses={fallbackBusinesses} />
          </div>
        ) : (
          <>
            {/* Mobile: horizontal scroll with ~20% peek of next card */}
            <div
              className="mt-6 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="w-[80%] shrink-0 snap-start last:pr-4 last:-mr-4"
                >
                  <ListingCard listing={listing} source="home_featured" />
                </div>
              ))}
            </div>

            {/* Tablet & desktop: grid */}
            <div className="mt-6 hidden grid-cols-2 gap-4 sm:grid md:gap-5 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  source="home_featured"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Skeleton loader for the featured cars section
 */
export function FeaturedCarsSkeleton() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border p-4">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 flex-1 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
