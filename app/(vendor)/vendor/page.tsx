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

type ListingRow = Pick<
  Database["public"]["Tables"]["listings"]["Row"],
  "id" | "slug" | "title" | "city" | "status" | "primary_image_url"
>;

// `leads` / `vendor_reviews` aren't in the generated types — declared locally.
type LeadRow = {
  id: string;
  channel: string;
  listing_id: string | null;
  created_at: string | null;
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

  const [listingsRes, leadsRes, imagesRes, reviewsRes] = await Promise.all([
    supabase
      .from("listings")
      .select("id, slug, title, city, status, primary_image_url")
      .eq("business_id", business.id),
    untyped
      .from("leads")
      .select("id, channel, customer_name, customer_phone, listing_id, created_at")
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
  ]);

  const listings: ListingRow[] = listingsRes.data ?? [];
  const leads: LeadRow[] = leadsRes.data ?? [];
  const images = imagesRes.data ?? [];
  const reviews: ReviewRow[] = reviewsRes.data ?? [];

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

  const dailyMap = new Map<string, { whatsapp: number; call: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30Days);
    d.setDate(d.getDate() + i);
    dailyMap.set(dateKey(d), { whatsapp: 0, call: 0 });
  }
  let totalWhatsapp = 0;
  let totalCall = 0;
  for (const l of leads) {
    if (!l.created_at) continue;
    const d = new Date(l.created_at);
    if (d < start30Days) continue;
    const key = dateKey(d);
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    if (l.channel === "whatsapp") {
      bucket.whatsapp++;
      totalWhatsapp++;
    } else {
      bucket.call++;
      totalCall++;
    }
  }
  const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    whatsapp: v.whatsapp,
    call: v.call,
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

      <Reveal delay={0.1}>
        <section
          aria-label="Leads and listings overview"
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2">
            <LeadsTrendCard
              daily={daily}
              totalWhatsapp={totalWhatsapp}
              totalCall={totalCall}
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
