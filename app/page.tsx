import type { Metadata } from "next";
import { MarketplaceShell } from "@/components/layout/marketplace-shell";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedCarsRow, FeaturedCarsSkeleton } from "@/components/home/featured-cars-row";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeFaq } from "@/components/home/home-faq";
import { SuspenseBoundary } from "@/components/shared/suspense-boundary";
import { HeroSearchFallback } from "@/components/home/hero-search-fallback";
import { getCities } from "@/lib/seo/data";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateWebSiteSchema,
  generateOrganizationSchema,
} from "@/lib/seo/structured-data";

const TITLE = "Rent a Car in Dubai — Verified Dealers, AED Pricing | RentNow";
const DESCRIPTION =
  "Compare verified Dubai car rental dealers and book directly on WhatsApp. Daily, weekly and monthly AED rates, free delivery on most rentals, comprehensive insurance and GCC-spec cars.";
const CANONICAL = "https://www.rentacardubai.online/";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: "RentNow",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const revalidate = 300;

export default async function HomePage() {
  const cities = await getCities();
  return (
    <MarketplaceShell cities={cities}>
      <JsonLd data={generateWebSiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />
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
      <HomeFaq />
    </MarketplaceShell>
  );
}
