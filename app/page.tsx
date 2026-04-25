import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedCarsRow, FeaturedCarsSkeleton } from "@/components/home/featured-cars-row";
import { HowItWorks } from "@/components/home/how-it-works";
import { SuspenseBoundary } from "@/components/shared/suspense-boundary";
import { HeroSearchFallback } from "@/components/home/hero-search-fallback";

export const revalidate = 300;

export default function HomePage() {
  return (
    <MarketplaceShell>
      {/* Hero fetches available cities from Supabase. Boundary swaps to a
          static fallback hero if the fetch throws (network outage, paused
          Supabase project) so the whole home page never goes down. */}
      <SuspenseBoundary fallback={null} errorFallback={<HeroSearchFallback />}>
        <HeroSearch />
      </SuspenseBoundary>

      <CategoryStrip />

      <SuspenseBoundary
        fallback={<FeaturedCarsSkeleton />}
        errorFallback={null}
      >
        <FeaturedCarsRow />
      </SuspenseBoundary>

      <HowItWorks />
    </MarketplaceShell>
  );
}
