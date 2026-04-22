import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBusinessByCityAndSlug, getBusinessListings } from "@/lib/vendor/query";
import { vendorUrl } from "@/lib/vendor/url";
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
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { city, slug } = await params;
  const business = await getBusinessByCityAndSlug(city, slug);
  if (!business) return { title: "Vendor not found – RentNowPk" };

  const biz = business as any;
  const title = `${biz.name} — Car Rental in ${biz.city} | RentNowPK`;
  const description = `Rent cars from ${biz.name} in ${biz.city}. Browse their fleet, check real prices, read reviews, and book via WhatsApp. Verified vendor on RentNowPK.`;
  const canonical = `https://www.rentnowpk.com${vendorUrl(biz)}`;

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

export default async function VendorCityPage({ params }: VendorPageProps) {
  const { city, slug } = await params;
  const business = await getBusinessByCityAndSlug(city, slug);

  if (!business) notFound();

  // If the URL's city segment doesn't match the canonical slug, 301 to canonical
  const canonicalPath = vendorUrl(business as any);
  const requestedPath = `/vendors/${city}/${slug}`;
  if (canonicalPath !== requestedPath) {
    redirect(canonicalPath);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const canClaim =
    !!user &&
    (business as { claim_status?: string }).claim_status === "unclaimed" &&
    (business as { owner_user_id?: string }).owner_user_id !== user.id;

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
    { name: biz.city, href: `/search?city=${encodeURIComponent(biz.city)}` },
    { name: biz.name, href: vendorUrl(biz) },
  ]);

  const isHidden = !(biz.is_live ?? false);

  return (
    <main className="min-h-screen bg-surface-base">
      {!isHidden && <JsonLd data={localBusinessSchema} />}
      {!isHidden && <JsonLd data={breadcrumbSchema} />}
      <VendorHero business={business} fleetCount={fleetCount} />

      {isHidden && (
        <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="text-sm text-slate-700">
              <strong>Pending publication</strong> — this listing was imported from Google Maps and
              is not yet public. Claim it below to get it published and take full control.
            </p>
          </div>
        </div>
      )}

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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          <div className="lg:col-span-8 space-y-20">
            <div className="hidden md:block">
              <VendorStats business={business} fleetCount={fleetCount} />
            </div>
            <VendorFleet business={business} />
            <VendorGallery business={business} />
            <VendorReviews business={business} />
          </div>
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
