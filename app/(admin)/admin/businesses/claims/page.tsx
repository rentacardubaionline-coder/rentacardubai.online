import Link from "next/link";
import {
  Building2, User, Clock, CheckCircle2, XCircle,
  Search, FileCheck, AlertCircle, Star,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClaimReviewPanel } from "@/components/admin/claim-review-panel";
import { RealtimeRefresher } from "@/components/admin/realtime-refresher";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const BASE = "/admin/businesses";

const TABS = [
  { href: BASE,            label: "Directory", icon: "building", exact: true },
  { href: `${BASE}/claims`,   label: "Claims",    icon: "filecheck" },
  { href: `${BASE}/reviews`,  label: "Reviews",   icon: "star" },
];

interface Claim {
  id: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  business: { id: string; name: string; city: string; slug: string } | null;
  claimant: { id: string; email: string; full_name: string | null; created_at: string | null } | null;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminBusinessClaimsPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();

  const { q = "", status: statusFilter = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const validStatus = ["all", "pending", "approved", "rejected"].includes(statusFilter)
    ? statusFilter : "all";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("business_claims")
    .select(
      `id, status, created_at, reviewed_at, reviewer_notes,
       business:business_id(id, name, city, slug),
       claimant:claimant_user_id(id, email, full_name, created_at)`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (validStatus !== "all") query = query.eq("status", validStatus);

  const { data: rawClaims, count } = await query;
  let claims = (rawClaims ?? []) as Claim[];

  if (q.trim()) {
    const lower = q.toLowerCase();
    claims = claims.filter(
      (c) =>
        c.business?.name?.toLowerCase().includes(lower) ||
        c.claimant?.email?.toLowerCase().includes(lower) ||
        c.claimant?.full_name?.toLowerCase().includes(lower)
    );
  }

  const [
    { count: allCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("business_claims").select("*", { count: "exact", head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("business_claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("business_claims").select("*", { count: "exact", head: true }).eq("status", "approved"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).from("business_claims").select("*", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({ q, status: validStatus, page: String(page), ...params });
    return `${BASE}/claims?${sp.toString()}`;
  }

  const STATUS_TABS = [
    { key: "all",      label: "All",      count: allCount ?? 0 },
    { key: "pending",  label: "Pending",  count: pendingCount ?? 0 },
    { key: "approved", label: "Approved", count: approvedCount ?? 0 },
    { key: "rejected", label: "Rejected", count: rejectedCount ?? 0 },
  ] as const;

  const pendingClaims  = claims.filter((c) => c.status === "pending");
  const resolvedClaims = claims.filter((c) => c.status !== "pending");
  const showPending    = validStatus === "all" || validStatus === "pending";
  const showResolved   = validStatus === "all" || validStatus !== "pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-ink-900">Businesses</h1>
            <RealtimeRefresher tables={["business_claims", "businesses", "profiles"]} />
          </div>
          <p className="mt-0.5 text-sm text-ink-500">
            Vendor requests to own a business listing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-200">
            <Clock className="h-3.5 w-3.5" />
            {pendingCount ?? 0} pending
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {approvedCount ?? 0} approved
          </span>
        </div>
      </div>

      {/* Section tabs (Directory / Claims / Reviews) */}
      <AdminTabBar tabs={TABS} />

      {/* Status filter + search */}
      <div className="space-y-3">
        <form method="GET" action={`${BASE}/claims`}>
          <input type="hidden" name="status" value={validStatus} />
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by business name or claimant email…"
              className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </form>

        <div className="flex gap-1 border-b border-surface-muted">
          {STATUS_TABS.map((tab) => {
            const active = validStatus === tab.key;
            return (
              <Link
                key={tab.key}
                href={buildHref({ status: tab.key, page: "1" })}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  active
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                )}
              >
                {tab.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  active ? "bg-amber-100 text-amber-700" : "bg-surface-muted text-ink-400"
                )}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {claims.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white py-16 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <FileCheck className="h-6 w-6 text-ink-300" />
          </div>
          <div>
            <p className="font-semibold text-ink-700">No claims found</p>
            <p className="mt-0.5 text-sm text-ink-400">
              {q ? `No results for "${q}"` : "Nothing here yet."}
            </p>
          </div>
        </div>
      )}

      {/* Pending claims */}
      {showPending && pendingClaims.length > 0 && (
        <section className="space-y-3">
          {validStatus === "all" && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-ink-900">
                Pending review ({pendingClaims.length})
              </h2>
            </div>
          )}
          <div className="space-y-3">
            {pendingClaims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-xl border border-amber-100 bg-white shadow-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold text-sm ring-1 ring-amber-100">
                      {claim.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/vendors/${claim.business?.slug ?? ""}`}
                            target="_blank"
                            className="font-bold text-ink-900 hover:text-amber-700 transition-colors"
                          >
                            {claim.business?.name ?? "Unknown business"}
                          </Link>
                          <span className="ml-2 text-sm text-ink-500">{claim.business?.city}</span>
                        </div>
                        <StatusBadge status={claim.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-ink-600">
                          <User className="h-3.5 w-3.5 text-ink-400" />
                          <strong>{claim.claimant?.full_name ?? "—"}</strong>
                        </span>
                        <span className="text-ink-500">{claim.claimant?.email}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          <Clock className="h-3 w-3" />
                          Submitted {formatDate(claim.created_at)}
                        </span>
                      </div>
                      <ClaimReviewPanel
                        claimId={claim.id}
                        businessName={claim.business?.name ?? "this business"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resolved claims history */}
      {showResolved && resolvedClaims.length > 0 && (
        <section className="space-y-3">
          {validStatus === "all" && (
            <h2 className="text-sm font-bold text-ink-900">History</h2>
          )}
          <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-surface-muted bg-surface-muted/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-ink-500">Business</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Claimant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Decision</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500">Notes</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-ink-500">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-muted">
                {resolvedClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-xs font-bold text-ink-600">
                          {claim.business?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <Link
                            href={`/vendors/${claim.business?.slug ?? ""}`}
                            target="_blank"
                            className="font-semibold text-ink-900 hover:text-amber-700 transition-colors"
                          >
                            {claim.business?.name ?? "—"}
                          </Link>
                          <p className="text-xs text-ink-500">{claim.business?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink-900">{claim.claimant?.full_name ?? "—"}</p>
                      <p className="text-xs text-ink-500">{claim.claimant?.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={claim.status} />
                      <p className="mt-1 text-[10px] text-ink-400">
                        Applied {formatDate(claim.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      {claim.reviewer_notes ? (
                        <p className="text-xs text-ink-600 line-clamp-2">{claim.reviewer_notes}</p>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs text-ink-500 whitespace-nowrap">
                      {formatDate(claim.reviewed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildHref({ page: String(page - 1) })} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors">
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildHref({ page: String(page + 1) })} className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
