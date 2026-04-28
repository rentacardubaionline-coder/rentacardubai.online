import Link from "next/link";
import {
  Car,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RealtimeRefresher } from "@/components/admin/realtime-refresher";
import { ListingReviewActions } from "@/components/admin/listing-review-actions";
import {
  BulkListingsBar,
  BulkSelectCheckbox,
} from "@/components/admin/bulk-listings-bar";
import { ListingDeleteButton } from "@/components/admin/listing-delete-button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string; icon: React.ElementType }
  > = {
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-700 ring-amber-200",
      icon: Clock,
    },
    approved: {
      label: "Live",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: CheckCircle2,
    },
    draft: {
      label: "Draft",
      cls: "bg-surface-muted text-ink-500 ring-border",
      icon: Clock,
    },
    rejected: {
      label: "Rejected",
      cls: "bg-rose-50 text-rose-700 ring-rose-200",
      icon: XCircle,
    },
    unavailable: {
      label: "Unavailable",
      cls: "bg-surface-muted text-ink-500 ring-border",
      icon: XCircle,
    },
  };
  const cfg = map[status] ?? map.draft;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cfg.cls}`}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();

  const {
    q = "",
    status: statusFilter = "pending",
    page: pageStr = "1",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const validStatus = [
    "all",
    "pending",
    "approved",
    "draft",
    "rejected",
    "unavailable",
  ].includes(statusFilter)
    ? statusFilter
    : "pending";

  let query = db
    .from("listings")
    .select(
      "id, title, slug, city, status, transmission, fuel, year, created_at, rejection_reason, is_live, business:business_id(id, name, slug, owner_user_id)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (validStatus !== "all") query = query.eq("status", validStatus as any);
  if (q.trim()) query = query.ilike("title", `%${q}%`);

  const { data: listings, count } = await query;

  // Resolve KYC status for every vendor referenced on this page.
  const vendorIds = Array.from(
    new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (listings as any[] | null)
        ?.map((l) => l.business?.owner_user_id)
        .filter(Boolean) ?? [],
    ),
  );
  let kycApprovedSet = new Set<string>();
  if (vendorIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: kycRows } = await (db as any)
      .from("kyc_documents")
      .select("vendor_user_id, status")
      .in("vendor_user_id", vendorIds)
      .eq("status", "approved");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kycApprovedSet = new Set(
      ((kycRows ?? []) as any[]).map((r) => r.vendor_user_id),
    );
  }

  // Tab counts
  const [
    { count: allCount },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    db.from("listings").select("*", { count: "exact", head: true }),
    db
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    db
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    db
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({
      q,
      status: validStatus,
      page: String(page),
      ...params,
    });
    return `/admin/listings?${sp.toString()}`;
  }

  const TABS = [
    { key: "pending", label: "Pending Review", count: pendingCount ?? 0 },
    { key: "approved", label: "Live", count: approvedCount ?? 0 },
    { key: "rejected", label: "Rejected", count: rejectedCount ?? 0 },
    { key: "all", label: "All", count: allCount ?? 0 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-ink-900">Listings</h1>
            <RealtimeRefresher tables={["listings"]} />
          </div>
          <p className="mt-0.5 text-sm text-ink-500">{count ?? 0} shown</p>
        </div>
      </div>

      {/* Search + tabs */}
      <div className="space-y-3">
        <form method="GET" action="/admin/listings">
          <input type="hidden" name="status" value={validStatus} />
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by listing title…"
              className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </form>

        <div className="flex gap-1 border-b border-surface-muted">
          {TABS.map((tab) => {
            const active = validStatus === tab.key;
            return (
              <Link
                key={tab.key}
                href={buildHref({ status: tab.key, page: "1" })}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  active
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-ink-500 hover:text-ink-900",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active
                      ? "bg-amber-100 text-amber-700"
                      : "bg-surface-muted text-ink-400",
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table — overflow-x-auto so the table scrolls horizontally on phones
          instead of clipping its right-hand actions column. */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
        {!listings || listings.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Car className="h-8 w-8 text-ink-300" />
            <p className="font-medium text-ink-500">No listings found</p>
          </div>
        ) : (
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="w-10 pl-5"></TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(listings as any[]).map((l) => {
                const vendorKycApproved = l.business?.owner_user_id
                  ? kycApprovedSet.has(l.business.owner_user_id)
                  : false;
                const kycHeld = l.status === "approved" && !l.is_live;
                return (
                  <TableRow key={l.id}>
                    {/* Bulk select */}
                    <TableCell className="pl-5">
                      <BulkSelectCheckbox id={l.id} status={l.status} />
                    </TableCell>
                    {/* Listing */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-400">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/listings/${l.id}`}
                            className="truncate text-sm font-semibold text-ink-900 hover:text-amber-700 max-w-[220px] block"
                          >
                            {l.title}
                          </Link>
                          <p className="text-xs text-ink-500">
                            {l.city} · {l.year ?? "—"} · {l.transmission ?? "—"}{" "}
                            · {l.fuel ?? "—"}
                          </p>
                          {l.rejection_reason && (
                            <p className="text-xs text-rose-600 mt-0.5 truncate max-w-[220px]">
                              ↳ {l.rejection_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Business */}
                    <TableCell>
                      {l.business ? (
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/vendors/${l.business.slug}`}
                            target="_blank"
                            className="text-sm text-ink-700 hover:text-amber-700 font-medium"
                          >
                            {l.business.name}
                          </Link>
                          {!vendorKycApproved && (
                            <span
                              className="inline-flex w-fit items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-200"
                              title="This vendor's KYC has not been approved yet. Listings will not go live until KYC is approved."
                            >
                              <ShieldAlert className="h-3 w-3" />
                              KYC pending
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={l.status} />
                        {kycHeld && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-200">
                            <ShieldAlert className="h-3 w-3" />
                            Held — KYC pending
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-ink-500">
                      {new Date(l.created_at).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/listings/${l.id}`}
                          className="text-ink-400 hover:text-ink-700 transition-colors"
                          title="Preview listing"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <ListingDeleteButton id={l.id} title={l.title} />
                        {l.status === "pending" && (
                          <ListingReviewActions
                            id={l.id}
                            title={l.title}
                            vendorKycApproved={vendorKycApproved}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Floating bulk-action bar — only renders when there's a selection */}
      <BulkListingsBar />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of{" "}
            {count ?? 0}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
