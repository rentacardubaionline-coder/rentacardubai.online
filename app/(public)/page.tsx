import type { Metadata } from "next";
import { HeroSearch } from "@/components/home/hero-search";
import { CategoryStrip } from "@/components/home/category-strip";
import { FeaturedCarsRow } from "@/components/home/featured-cars-row";
import { HowItWorks } from "@/components/home/how-it-works";
import { HomeFaq } from "@/components/home/home-faq";
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

export default function HomePage() {
  return (
    <div className="space-y-0">
      <JsonLd data={generateWebSiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />
      <HeroSearch />
      <CategoryStrip />
      <FeaturedCarsRow />
      <HowItWorks />
      <HomeFaq />
    </div>
  );
}
