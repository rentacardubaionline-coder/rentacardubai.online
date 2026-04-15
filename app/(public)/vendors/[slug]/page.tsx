import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBusinessBySlug, getBusinessListings } from "@/lib/vendor/query";
import { VendorHero } from "@/components/vendor/vendor-hero";
import { VendorStats } from "@/components/vendor/vendor-stats";
import { VendorFleet } from "@/components/vendor/vendor-fleet";
import { VendorInfoCard } from "@/components/vendor/vendor-info-card";
import { SimilarBusinesses } from "@/components/vendor/similar-businesses";
import { VendorGallery } from "@/components/vendor/vendor-gallery";
import { VendorReviews } from "@/components/vendor/vendor-reviews";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Fetch listings for count and data
  const listings = await getBusinessListings(business.id);
  const fleetCount = listings.length;

  return (
    <main className="min-h-screen bg-surface-base">
      <VendorHero business={business} fleetCount={fleetCount} />
      
      {/* Container for subsequent sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-20">
            <VendorStats business={business} fleetCount={fleetCount} />
            
            <VendorFleet business={business} />

            <VendorGallery business={business} />

            <VendorReviews business={business} />
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-fit">
            <VendorInfoCard business={business} />
            
            <Suspense fallback={<div className="h-64 bg-slate-50 animate-pulse rounded-2xl" />}>
              <SimilarBusinesses businessId={business.id} city={business.city} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

function FleetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[16/10] bg-slate-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
