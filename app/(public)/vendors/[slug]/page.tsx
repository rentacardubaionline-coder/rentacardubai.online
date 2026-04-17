import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBusinessBySlug, getBusinessListings } from "@/lib/vendor/query";
import { VendorHero } from "@/components/vendor/vendor-hero";
import { VendorStats } from "@/components/vendor/vendor-stats";
import { VendorFleet } from "@/components/vendor/vendor-fleet";
import { VendorInfoCard } from "@/components/vendor/vendor-info-card";
import { SimilarBusinesses } from "@/components/vendor/similar-businesses";
import { VendorGallery } from "@/components/vendor/vendor-gallery";
import { VendorReviews } from "@/components/vendor/vendor-reviews";
import { ClaimBusinessButton } from "@/components/vendor/claim-business-button";
import { JsonLd } from "@/components/seo/json-ld";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/seo/structured-data";
import { createClient } from "@/lib/supabase/server";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Vendor not found – RentNowPk" };

  const biz = business as any;
  const title = `${biz.name} — Car Rental in ${biz.city} | RentNowPK`;
  const description = `Rent cars from ${biz.name} in ${biz.city}. Browse their fleet, check real prices, read reviews, and book via WhatsApp. Verified vendor on RentNowPK.`;
  const canonical = `https://www.rentnowpk.com/vendors/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: biz.logo_url ? [biz.logo_url] : biz.cover_url ? [biz.cover_url] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  // Check if current user is logged in and can claim
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canClaim =
    !!user &&
    (business as { claim_status?: string }).claim_status === "unclaimed" &&
    (business as { owner_user_id?: string }).owner_user_id !== user.id;

  // Fetch listings for count and data
  const listings = await getBusinessListings(business.id);
  const fleetCount = listings.length;

  const biz = business as any;
  const localBusinessSchema = generateLocalBusinessSchema({
    name: biz.name,
    slug: biz.slug,
    city: biz.city,
    phone: biz.whatsapp_phone ?? biz.phone,
    email: biz.email,
    rating: biz.rating,
    reviewsCount: biz.reviews_count,
    logoUrl: biz.logo_url,
  });
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", href: "/" },
    { name: "Vendors", href: "/search" },
    { name: biz.name, href: `/vendors/${biz.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-surface-base">
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={breadcrumbSchema} />
      <VendorHero business={business} fleetCount={fleetCount} />

      {/* Claim banner — only shown when business is unclaimed and user is logged in */}
      {canClaim && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              Is this your business? Claim it to manage listings and receive leads.
            </p>
            <ClaimBusinessButton businessId={business.id} />
          </div>
        </div>
      )}
      
      {/* Container for subsequent sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-20">
            <div className="hidden md:block">
              <VendorStats business={business} fleetCount={fleetCount} />
            </div>
            
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
