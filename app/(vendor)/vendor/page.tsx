import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { Car, CheckCircle2, MessageSquare, Star } from "lucide-react";

import { Reveal } from "@/components/vendor/dashboard/reveal";
import { WelcomeBanner } from "@/components/vendor/dashboard/welcome-banner";
import { StatTile } from "@/components/vendor/dashboard/stat-tile";
import { LeadsTrendCard } from "@/components/vendor/dashboard/leads-trend-card";
import { ListingsPipelineCard } from "@/components/vendor/dashboard/listings-pipeline-card";
import {
  TopListingsCard,
  type TopListingRow,
} from "@/components/vendor/dashboard/top-listings-card";
import { ProfileCompletenessCard } from "@/components/vendor/dashboard/profile-completeness-card";
import {
  RecentLeadsCard,
  type RecentLead,
} from "@/components/vendor/dashboard/recent-leads-card";
import { ReviewsCard, type ReviewRow } from "@/components/vendor/dashboard/reviews-card";
import { NoBusinessState } from "@/components/vendor/dashboard/no-business-state";
import { PricingAgreementCard } from "@/components/vendor/dashboard/pricing-agreement-card";
import {
  BillingSummaryCard,
  type BillingBreakdownRow,
} from "@/components/vendor/dashboard/billing-summary-card";
import {
  getPricingTiers,
  resolveTierForListing,
  type TierCode,
} from "@/lib/pricing/tiers";

type ListingRow = Pick<
  Database["public"]["Tables"]["listings"]["Row"],
  "id" | "slug" | "title" | "city" | "status" | "primary_image_url"
>;

// `leads` / `vendor_reviews` aren't in the generated types — declared locally.
type LeadRow = {
  id: string;
  channel: string;
  customer_name: string | null;
  customer_phone: string | null;
  listing_id: string | null;
  created_at: string | null;
  tier_code?: string | null;
  billed_amount_pkr?: number | null;
};

function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? "there";
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function VendorDashboardPage() {
  const profile = await requireVendorMode();
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", profile.id)
    .single();

  if (!business) {
    return <NoBusinessState firstName={firstName(profile.full_name)} />;
  }

  const now = new Date();
  const startThisMonth = startOfMonth(now);
  const startLastMonth = startOfMonth(
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  );
  const start30Days = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
  const fetchSince = startLastMonth < start30Days ? startLastMonth : start30Days;

  // `leads` and `vendor_reviews` aren't in the generated types yet — cast narrowly.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const untyped = supabase as any;

  const [listingsRes, leadsRes, imagesRes, reviewsRes, pricingTiers] = await Promise.all([
    supabase
      .from("listings")
      .select("id, slug, title, city, status, primary_image_url, model:model_id (body_type)")
      .eq("business_id", business.id),
    untyped
      .from("leads")
      .select("id, channel, customer_name, customer_phone, listing_id, created_at, tier_code, billed_amount_pkr")
      .eq("vendor_user_id", profile.id)
      .gte("created_at", fetchSince.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("business_images")
      .select("id, is_primary")
      .eq("business_id", business.id),
    untyped
      .from("vendor_reviews")
      .select("id, author_name, rating, body, created_at")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(3),
    getPricingTiers(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingsRaw = (listingsRes.data ?? []) as any[];
  const listings: ListingRow[] = listingsRaw;
  const leads: LeadRow[] = leadsRes.data ?? [];
  const images = imagesRes.data ?? [];
  const reviews: ReviewRow[] = reviewsRes.data ?? [];

  // ── Billing breakdown for THIS MONTH ──────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listingsByIdForTier = new Map<string, any>(listingsRaw.map((l) => [l.id, l]));
  const tierByCode = new Map(pricingTiers.map((t) => [t.code, t]));
  const billingByCode = new Map<TierCode, { count: number; total: number }>();
  let totalBillPkr = 0;
  let billingLeadsCount = 0;

  for (const lead of leads) {
    if (!lead.created_at) continue;
    if (new Date(lead.created_at) < startThisMonth) continue;

    let code: TierCode;
    if (lead.tier_code && tierByCode.has(lead.tier_code as TierCode)) {
      code = lead.tier_code as TierCode;
    } else if (lead.listing_id) {
      const listing = listingsByIdForTier.get(lead.listing_id);
      code = resolveTierForListing({
        model: listing?.model ?? null,
        title: listing?.title ?? null,
      });
    } else {
      code = "sedan"; // Default for business-level leads (no listing tied)
    }

    const tier = tierByCode.get(code);
    const amount = lead.billed_amount_pkr ?? tier?.price_pkr ?? 0;
    const agg = billingByCode.get(code) ?? { count: 0, total: 0 };
    agg.count += 1;
    agg.total += amount;
    billingByCode.set(code, agg);
    totalBillPkr += amount;
    billingLeadsCount += 1;
  }

  const billingRows: BillingBreakdownRow[] = pricingTiers.map((t) => {
    const agg = billingByCode.get(t.code) ?? { count: 0, total: 0 };
    return {
      code: t.code,
      label: t.label,
      pricePkr: t.price_pkr,
      count: agg.count,
      total: agg.total,
    };
  });

  const monthLabel = now.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const listingStats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    draft: listings.filter((l) => l.status === "draft").length,
    rejected: listings.filter((l) => l.status === "rejected").length,
    unavailable: listings.filter((l) => l.status === "unavailable").length,
  };

  const thisMonthLeads = leads.filter(
    (l) => l.created_at && new Date(l.created_at) >= startThisMonth,
  );
  const lastMonthLeads = leads.filter((l) => {
    if (!l.created_at) return false;
    const d = new Date(l.created_at);
    return d >= startLastMonth && d < startThisMonth;
  });
  const trendPct = percentChange(thisMonthLeads.length, lastMonthLeads.length);

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30Days);
    d.setDate(d.getDate() + i);
    dailyMap.set(dateKey(d), 0);
  }
  let totalLeads30d = 0;
  for (const l of leads) {
    if (!l.created_at) continue;
    const d = new Date(l.created_at);
    if (d < start30Days) continue;
    const key = dateKey(d);
    if (dailyMap.has(key)) {
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
      totalLeads30d++;
    }
  }
  const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  const leadCountByListing = new Map<string, number>();
  for (const l of leads) {
    if (!l.listing_id || !l.created_at) continue;
    if (new Date(l.created_at) < start30Days) continue;
    leadCountByListing.set(l.listing_id, (leadCountByListing.get(l.listing_id) ?? 0) + 1);
  }
  const topListings: TopListingRow[] = listings
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      city: l.city,
      primary_image_url: l.primary_image_url,
      status: l.status,
      lead_count: leadCountByListing.get(l.id) ?? 0,
    }))
    .filter((l) => l.lead_count > 0)
    .sort((a, b) => b.lead_count - a.lead_count)
    .slice(0, 5);

  const listingsById = new Map(listings.map((l) => [l.id, l]));
  const recentLeads: RecentLead[] = leads.slice(0, 5).map((l) => {
    const listing = l.listing_id ? listingsById.get(l.listing_id) : undefined;
    return {
      id: l.id,
      channel: l.channel,
      customer_name: l.customer_name ?? null,
      customer_phone: l.customer_phone ?? null,
      created_at: l.created_at ?? new Date().toISOString(),
      listing: listing ? { id: listing.id, title: listing.title } : null,
    };
  });

  const hasCoverImage = !!business.cover_url;
  const hasLogo = !!business.logo_url || images.some((i) => i.is_primary);

  const avgRating = business.rating ?? 0;

  return (
    <div className="space-y-6">
      <Reveal>
        <WelcomeBanner
          firstName={firstName(profile.full_name)}
          businessName={business.name}
          city={business.city}
          claimStatus={business.claim_status}
        />
      </Reveal>

      <Reveal delay={0.05}>
        <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={Car}
            label="Live Listings"
            value={listingStats.approved}
            hint={
              listingStats.total > 0
                ? `of ${listingStats.total} total`
                : "None yet"
            }
            tone="emerald"
          />
          <StatTile
            icon={MessageSquare}
            label="Leads This Month"
            value={thisMonthLeads.length}
            hint={
              lastMonthLeads.length > 0
                ? `${lastMonthLeads.length} last month`
                : "First tracked month"
            }
            trend={
              trendPct === null
                ? null
                : { value: trendPct, label: "vs. last month" }
            }
            tone="brand"
          />
          <StatTile
            icon={CheckCircle2}
            label="Awaiting Review"
            value={listingStats.pending}
            hint={
              listingStats.pending === 0
                ? "All reviewed"
                : "Typically within 24h"
            }
            tone="amber"
          />
          <StatTile
            icon={Star}
            label="Rating"
            value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
            hint={
              (business.reviews_count ?? 0) > 0
                ? `${business.reviews_count} review${business.reviews_count === 1 ? "" : "s"}`
                : "No reviews yet"
            }
            tone="violet"
          />
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section
          aria-label="Billing and agreement"
          className="grid gap-6 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <PricingAgreementCard tiers={pricingTiers} />
          </div>
          <div className="lg:col-span-2">
            <BillingSummaryCard
              monthLabel={monthLabel}
              totalLeads={billingLeadsCount}
              totalBillPkr={totalBillPkr}
              rows={billingRows}
              tiers={pricingTiers}
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section
          aria-label="Leads and listings overview"
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <LeadsTrendCard
              daily={daily}
              total={totalLeads30d}
            />
          </div>
          <ListingsPipelineCard stats={listingStats} />
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <section
          aria-label="Performance and profile"
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <TopListingsCard rows={topListings} />
          </div>
          <ProfileCompletenessCard
            business={business}
            hasCoverImage={hasCoverImage}
            hasLogo={hasLogo}
          />
        </section>
      </Reveal>

      <Reveal delay={0.2}>
        <section
          aria-label="Activity"
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <RecentLeadsCard
              leads={recentLeads}
              hasListings={listings.length > 0}
            />
          </div>
          <ReviewsCard
            rating={business.rating}
            reviewsCount={business.reviews_count}
            reviews={reviews}
          />
        </section>
      </Reveal>
    </div>
  );
}
