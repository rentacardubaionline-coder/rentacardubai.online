import { Suspense } from "react";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedCarsRow, FeaturedCarsSkeleton } from "@/components/home/featured-cars-row";
import { HowItWorks } from "@/components/home/how-it-works";

export const revalidate = 300;

export default function HomePage() {
  return (
    <MarketplaceShell>
      <HeroSearch />
      <CategoryStrip />
      <Suspense fallback={<FeaturedCarsSkeleton />}>
        <FeaturedCarsRow />
      </Suspense>
      <HowItWorks />
    </MarketplaceShell>
  );
}
