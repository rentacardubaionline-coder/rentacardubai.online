import Link from "next/link";
import {
  Search, Building2, Download, Star, Car,
  CheckCircle2, Clock, HelpCircle, FileCheck,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { AddBusinessDialog } from "@/components/admin/add-business-dialog";
import { ImportCSVDialog } from "@/components/admin/import-csv-dialog";
import { DeleteBusinessButton } from "@/components/admin/delete-business-button";
import { ApproveBusinessButton } from "@/components/admin/approve-business-button";
import { RealtimeRefresher } from "@/components/admin/realtime-refresher";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { cn } from "@/lib/utils";

const BASE = "/admin/businesses";
const SECTION_TABS = [
  { href: BASE,               label: "Directory", Icon: Building2, exact: true },
  { href: `${BASE}/claims`,   label: "Claims",    Icon: FileCheck },
  { href: `${BASE}/reviews`,  label: "Reviews",   Icon: Star },
];

const PAGE_SIZE = 20;

function ClaimBadge({ status }: { status: string | null }) {
  if (status === "claimed")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
        <CheckCircle2 className="h-3 w-3" /> Claimed
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-500 ring-1 ring-inset ring-border">
      <HelpCircle className="h-3 w-3" /> Unclaimed
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminBusinessesPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();

  const { q = "", status: statusFilter = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const validStatus = ["all", "unclaimed", "pending", "claimed"].includes(statusFilter)
    ? statusFilter : "all";

  // Main query — cast as any because category isn't in generated types yet
  let query = (db as any)
    .from("businesses")
    .select(
      "id, name, slug, city, category, phone, email, rating, reviews_count, claim_status, logo_url, owner_user_id, created_at, listings(count)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (validStatus !== "all") query = query.eq("claim_status", validStatus);
  if (q.trim()) query = query.ilike("name", `%${q}%`);

  const { data: businesses, count } = await query;

  // Status tab counts
  const [
    { count: allCount },
    { count: unclaimedCount },
    { count: pendingCount },
    { count: claimedCount },
  ] = await Promise.all([
    db.from("businesses").select("*", { count: "exact", head: true }),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("claim_status", "unclaimed"),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("claim_status", "pending"),
    db.from("businesses").select("*", { count: "exact", head: true }).eq("claim_status", "claimed"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({ q, status: validStatus, page: String(page), ...params });
    return `/admin/businesses?${sp.toString()}`;
  }

  const TABS = [
    { key: "all", label: "All", count: allCount ?? 0 },
    { key: "unclaimed", label: "Unclaimed", count: unclaimedCount ?? 0 },
    { key: "pending", label: "Pending", count: pendingCount ?? 0 },
    { key: "claimed", label: "Claimed", count: claimedCount ?? 0 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-ink-900">Businesses</h1>
            <RealtimeRefresher tables={["businesses", "business_claims"]} />
          </div>
          <p className="mt-0.5 text-sm text-ink-500">{count ?? 0} total</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/businesses/template"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 shadow-sm hover:bg-surface-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV Template
          </a>
          <ImportCSVDialog />
          <AddBusinessDialog />
        </div>
      </div>

      {/* Section tabs (Directory / Claims / Reviews) */}
      <AdminTabBar tabs={SECTION_TABS} />

      {/* Search + status tabs */}
      <div className="space-y-3">
        <form method="GET" action="/admin/businesses">
          <input type="hidden" name="status" value={validStatus} />
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by business name…"
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {!businesses || businesses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Building2 className="h-8 w-8 text-ink-300" />
            <p className="font-medium text-ink-500">No businesses found</p>
            {q && <p className="text-sm text-ink-400">No results for &ldquo;<strong>{q}</strong>&rdquo;</p>}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">Business</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(businesses as any[]).map((biz) => {
                const listingCount = (biz.listings as any[])?.[0]?.count ?? 0;
                return (
                  <TableRow key={biz.id}>
                    {/* Business */}
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        {biz.logo_url ? (
                          <img src={biz.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0 ring-1 ring-border" />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 text-xs font-bold ring-1 ring-amber-100">
                            {biz.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/vendors/${biz.slug}`}
                            target="_blank"
                            className="truncate text-sm font-semibold text-ink-900 hover:text-amber-700 max-w-[160px] block"
                          >
                            {biz.name}
                          </Link>
                          <p className="text-xs text-ink-500">{biz.city}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="text-sm text-ink-600">
                      {biz.category ?? <span className="text-ink-300">—</span>}
                    </TableCell>

                    {/* Status */}
                    <TableCell><ClaimBadge status={biz.claim_status} /></TableCell>

                    {/* Listings */}
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-ink-700">
                        <Car className="h-3.5 w-3.5 text-ink-400" />
                        {listingCount}
                      </span>
                    </TableCell>

                    {/* Rating */}
                    <TableCell>
                      {biz.reviews_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm text-ink-700">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {biz.rating?.toFixed(1)}
                          <span className="text-xs text-ink-400">({biz.reviews_count})</span>
                        </span>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </TableCell>

                    {/* Contact */}
                    <TableCell className="text-xs text-ink-500">
                      <div className="space-y-0.5">
                        {biz.phone && <p>{biz.phone}</p>}
                        {biz.email && <p className="truncate max-w-[140px]">{biz.email}</p>}
                        {!biz.phone && !biz.email && <span className="text-ink-300">—</span>}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {biz.claim_status === "pending" && (
                          <ApproveBusinessButton id={biz.id} name={biz.name} />
                        )}
                        <DeleteBusinessButton id={biz.id} name={biz.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

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
