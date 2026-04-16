import Link from "next/link";
import {
  Users,
  Building2,
  Car,
  FileCheck,
  Star,
  AlertCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { RealtimeRefresher } from "@/components/admin/realtime-refresher";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: React.ElementType;
  href: string;
  accent?: "amber" | "blue" | "emerald" | "rose";
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  };
  const iconClass = accent ? colors[accent] : "bg-surface-muted text-ink-500 ring-surface-muted";

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-ink-200"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${iconClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ArrowRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500" />
      </div>
      <div>
        <p className="text-2xl font-black text-ink-900 tabular-nums">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-sm font-medium text-ink-500">{label}</p>
        {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  await requireRole("admin");
  const db = createAdminClient();

  // Run all count queries in parallel
  const [
    { count: totalUsers },
    { count: totalVendors },
    { count: totalBusinesses },
    { count: claimedBusinesses },
    { count: unclaimedBusinesses },
    { count: totalListings },
    { count: publishedListings },
    { count: draftListings },
    { count: totalReviews },
    { count: pendingClaims },
    { data: recentClaims },
    { data: recentUsers },
    { data: recentListings },
    { count: pendingListings },
    { count: pendingKyc },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("is_vendor", true),
    db.from("businesses").select("*", { count: "exact", head: true }),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("claim_status", "claimed"),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("claim_status", "unclaimed"),
    db.from("listings").select("*", { count: "exact", head: true }),
    db.from("listings").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("listings").select("*", { count: "exact", head: true }).eq("status", "draft"),
    (db as any).from("vendor_reviews").select("*", { count: "exact", head: true }),
    (db as any).from("business_claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // Recent pending claims
    (db as any)
      .from("business_claims")
      .select("id, status, created_at, business:business_id(name, city), claimant:claimant_user_id(email, full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    // Recent sign-ups
    db
      .from("profiles")
      .select("id, email, full_name, role, is_vendor, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    // Recent listings
    db
      .from("listings")
      .select("id, title, status, created_at, city, slug")
      .order("created_at", { ascending: false })
      .limit(5),
    // Pending listings count
    db.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // Pending KYC count
    (db as any).from("kyc_documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = {
    totalUsers: totalUsers ?? 0,
    totalVendors: totalVendors ?? 0,
    totalBusinesses: totalBusinesses ?? 0,
    claimedBusinesses: claimedBusinesses ?? 0,
    unclaimedBusinesses: unclaimedBusinesses ?? 0,
    totalListings: totalListings ?? 0,
    publishedListings: publishedListings ?? 0,
    draftListings: draftListings ?? 0,
    totalReviews: totalReviews ?? 0,
    pendingClaims: pendingClaims ?? 0,
    pendingListings: pendingListings ?? 0,
    pendingKyc: pendingKyc ?? 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Platform overview at a glance.</p>
        </div>
        <RealtimeRefresher
          tables={["businesses", "business_claims", "profiles", "listings", "vendor_reviews"]}
        />
      </div>

      {/* Pending listings alert */}
      {stats.pendingListings > 0 && (
        <Link
          href="/admin/listings"
          className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
          <span>
            <strong>{stats.pendingListings}</strong> listing{stats.pendingListings !== 1 ? "s" : ""} waiting for approval
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-blue-500" />
        </Link>
      )}

      {/* Pending KYC alert */}
      {stats.pendingKyc > 0 && (
        <Link
          href="/admin/kyc"
          className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-100"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
          <span>
            <strong>{stats.pendingKyc}</strong> KYC submission{stats.pendingKyc !== 1 ? "s" : ""} waiting for review
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-violet-500" />
        </Link>
      )}

      {/* Pending claims alert */}
      {stats.pendingClaims > 0 && (
        <Link
          href="/admin/claims"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            <strong>{stats.pendingClaims}</strong> pending claim{stats.pendingClaims !== 1 ? "s" : ""} waiting for review
          </span>
          <ArrowRight className="ml-auto h-4 w-4 text-amber-500" />
        </Link>
      )}

      {/* Stat cards — row 1 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.totalVendors} vendor${stats.totalVendors !== 1 ? "s" : ""}`}
          icon={Users}
          href="/admin/users"
          accent="blue"
        />
        <StatCard
          label="Businesses"
          value={stats.totalBusinesses}
          sub={`${stats.claimedBusinesses} claimed · ${stats.unclaimedBusinesses} unclaimed`}
          icon={Building2}
          href="/admin/businesses"
          accent="emerald"
        />
        <StatCard
          label="Listings"
          value={stats.totalListings}
          sub={`${stats.publishedListings} live · ${stats.draftListings} draft`}
          icon={Car}
          href="/admin/businesses"
          accent="blue"
        />
        <StatCard
          label="Pending Claims"
          value={stats.pendingClaims}
          sub="Awaiting approval"
          icon={FileCheck}
          href="/admin/claims"
          accent={stats.pendingClaims > 0 ? "amber" : undefined}
        />
      </div>

      {/* Stat cards — row 2 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Vendor Reviews"
          value={stats.totalReviews}
          sub="Admin-curated"
          icon={Star}
          href="/admin/reviews"
          accent="amber"
        />
        <StatCard
          label="Published Listings"
          value={stats.publishedListings}
          sub="Live on marketplace"
          icon={TrendingUp}
          href="/admin/businesses"
          accent="emerald"
        />
        <StatCard
          label="Draft Listings"
          value={stats.draftListings}
          sub="Not yet published"
          icon={Car}
          href="/admin/businesses"
        />
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Pending claims */}
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-muted px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Pending Claims</h2>
            <Link
              href="/admin/claims"
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!recentClaims || recentClaims.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              <p className="text-sm font-medium text-ink-500">All caught up</p>
              <p className="text-xs text-ink-400">No pending claims right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-muted">
              {recentClaims.map((claim: any) => (
                <li key={claim.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {claim.business?.name ?? "Unknown business"}
                    </p>
                    <p className="text-xs text-ink-500">
                      {claim.claimant?.email ?? "Unknown claimant"} · {claim.business?.city}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                      <Clock className="h-2.5 w-2.5" />
                      Pending
                    </span>
                    <p className="mt-1 text-[10px] text-ink-400">{formatDate(claim.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent sign-ups */}
        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-muted px-5 py-4">
            <h2 className="text-sm font-bold text-ink-900">Recent Sign-ups</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!recentUsers || recentUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Users className="h-7 w-7 text-ink-300" />
              <p className="text-sm font-medium text-ink-500">No users yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-muted">
              {recentUsers.map((u: any) => {
                const initials = (u.full_name ?? u.email ?? "?")
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {u.full_name ?? <span className="font-normal text-ink-400">No name</span>}
                      </p>
                      <p className="truncate text-xs text-ink-500">{u.email}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                        u.role === "admin"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : u.is_vendor
                          ? "bg-purple-50 text-purple-700 ring-purple-200"
                          : "bg-surface-muted text-ink-500 ring-border"
                      }`}>
                        {u.role === "admin" ? "Admin" : u.is_vendor ? "Vendor" : "Customer"}
                      </span>
                      <p className="mt-1 text-[10px] text-ink-400">{formatDate(u.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

      </div>

      {/* Recent listings */}
      <section className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-surface-muted px-5 py-4">
          <h2 className="text-sm font-bold text-ink-900">Recent Listings</h2>
          <Link
            href="/admin/businesses"
            className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!recentListings || recentListings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Car className="h-7 w-7 text-ink-300" />
            <p className="text-sm font-medium text-ink-500">No listings yet</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-muted">
            {recentListings.map((listing: any) => (
              <div key={listing.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-400">
                  <Car className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{listing.title}</p>
                  <p className="text-xs text-ink-500">{listing.city}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                    listing.status === "published"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : listing.status === "draft"
                      ? "bg-surface-muted text-ink-500 ring-border"
                      : "bg-rose-50 text-rose-700 ring-rose-200"
                  }`}>
                    {listing.status === "published" ? (
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    ) : listing.status === "draft" ? (
                      <Clock className="h-2.5 w-2.5" />
                    ) : (
                      <XCircle className="h-2.5 w-2.5" />
                    )}
                    {listing.status ?? "unknown"}
                  </span>
                  <p className="text-xs text-ink-400">{formatDate(listing.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
