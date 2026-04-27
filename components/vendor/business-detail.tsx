import { Suspense } from "react";
import { VendorHero } from "@/components/vendor/vendor-hero";
import { VendorStats } from "@/components/vendor/vendor-stats";
import { VendorFleet } from "@/components/vendor/vendor-fleet";
import { VendorGallery } from "@/components/vendor/vendor-gallery";
import { VendorReviews } from "@/components/vendor/vendor-reviews";
import { VendorInfoCard } from "@/components/vendor/vendor-info-card";
import { SimilarBusinesses } from "@/components/vendor/similar-businesses";
import { ClaimBusinessButton } from "@/components/vendor/claim-business-button";
import { BusinessMobileCta } from "@/components/shared/business-mobile-cta";
import { JsonLd } from "@/components/seo/json-ld";
import {
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/structured-data";
import { vendorUrl } from "@/lib/vendor/url";
import { getBusinessListings } from "@/lib/vendor/query";
import { createClient } from "@/lib/supabase/server";

interface BusinessDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  business: any;
}

export async function BusinessDetail({ business: biz }: BusinessDetailProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const canClaim =
    !!user && biz.claim_status === "unclaimed" && biz.owner_user_id !== user.id;

  const listings = await getBusinessListings(biz.id);
  const fleetCount = listings.length;

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
    { name: biz.city, href: `/search?city=${encodeURIComponent(biz.city)}` },
    { name: biz.name, href: vendorUrl(biz) },
  ]);

  const isHidden = !(biz.is_live ?? false);

  return (
    <main className="min-h-screen bg-surface-base">
      {!isHidden && <JsonLd data={localBusinessSchema} />}
      {!isHidden && <JsonLd data={breadcrumbSchema} />}

      <VendorHero business={biz} fleetCount={fleetCount} />

      {isHidden && (
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
          <div className="mx-auto max-w-7xl text-sm text-slate-700">
            <strong>Pending publication</strong> — this listing was imported from Google Maps and
            is not yet public.
          </div>
        </div>
      )}

      {canClaim && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              Is this your business? Claim it to manage listings and receive leads.
            </p>
            <ClaimBusinessButton businessId={biz.id} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 md:pb-20">
        <div className="grid grid-cols-1 gap-8 pt-8 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            <div className="hidden md:block">
              <VendorStats business={biz} fleetCount={fleetCount} />
            </div>
            <VendorFleet business={biz} />
            <VendorGallery business={biz} />
            <VendorReviews business={biz} />
          </div>

          <div className="space-y-8 lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <VendorInfoCard business={biz} />
            <Suspense
              fallback={<div className="h-64 animate-pulse rounded-2xl bg-slate-50" />}
            >
              <SimilarBusinesses businessId={biz.id} city={biz.city} />
            </Suspense>
          </div>
        </div>
      </div>

      <BusinessMobileCta business={biz} source="vendor_profile" />
    </main>
  );
}
