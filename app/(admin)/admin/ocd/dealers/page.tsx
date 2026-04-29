import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Building2,
  Car,
  Phone,
  MapPin,
  BadgeCheck,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "contacted", label: "Contacted" },
  { key: "agreed",    label: "Agreed" },
  { key: "imported",  label: "Imported" },
  { key: "rejected",  label: "Rejected" },
] as const;

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function OCDDealersPage({ searchParams }: PageProps) {
  await requireRole("admin");
  const db = createAdminClient();

  const {
    q = "",
    status: statusFilter = "all",
    page: pageStr = "1",
  } = await searchParams;

  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const validStatus = STATUS_TABS.map((t) => t.key).includes(statusFilter as any)
    ? statusFilter
    : "all";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (db as any)
    .from("ocd_scraped_dealers")
    .select("id, ocd_company_name, phone, whatsapp, area, city, logo_url, listing_count, status, outreach_email, is_verified, is_premium, imported_at, scraped_at", { count: "exact" })
    .order("listing_count", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (validStatus !== "all") query = query.eq("status", validStatus);
  if (q.trim()) query = query.ilike("ocd_company_name", `%${q}%`);

  const { data: dealers, count } = await query;

  // Tab counts
  const tabCounts = await Promise.all(
    STATUS_TABS.map(async (tab) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q2 = (db as any).from("ocd_scraped_dealers").select("*", { count: "exact", head: true });
      const { count: c } = tab.key === "all" ? await q2 : await q2.eq("status", tab.key);
      return { key: tab.key, count: c ?? 0 };
    }),
  );
  const countMap = Object.fromEntries(tabCounts.map((t) => [t.key, t.count]));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({ q, status: validStatus, page: String(page), ...params });
    return `/admin/ocd/dealers?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-ink-900">OCD Dealers</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {count ?? 0} rental companies scraped from OneClickDrive
        </p>
      </div>

      {/* Search + tabs */}
      <div className="space-y-3">
        <form method="GET" action="/admin/ocd/dealers">
          <input type="hidden" name="status" value={validStatus} />
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by company name…"
              className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </form>

        <div className="flex gap-1 border-b border-surface-muted overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const active = validStatus === tab.key;
            return (
              <Link
                key={tab.key}
                href={buildHref({ status: tab.key, page: "1" })}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  active
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-ink-500 hover:text-ink-900",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? "bg-amber-100 text-amber-700" : "bg-surface-muted text-ink-400",
                  )}
                >
                  {countMap[tab.key] ?? 0}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dealers grid */}
      {!dealers || dealers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white py-16 text-center">
          <Building2 className="h-8 w-8 text-ink-300" />
          <p className="font-medium text-ink-500">No dealers found</p>
          <p className="text-xs text-ink-400">Run the OCD scraper to populate this list</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(dealers as any[]).map((dealer) => (
            <Link
              key={dealer.id}
              href={`/admin/ocd/dealers/${dealer.id}`}
              className="group relative flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm hover:border-amber-300 hover:shadow-md transition-all"
            >
              {/* Status badge */}
              <div className="absolute right-3 top-3">
                <DealerStatusBadge status={dealer.status} />
              </div>

              {/* Logo + name */}
              <div className="flex items-start gap-3 pr-20">
                {dealer.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dealer.logo_url}
                    alt={dealer.ocd_company_name}
                    className="h-10 w-10 rounded-lg border border-border object-contain bg-white flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-ink-900 truncate group-hover:text-amber-700 transition-colors">
                    {dealer.ocd_company_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {dealer.is_verified && (
                      <BadgeCheck className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    )}
                    {dealer.is_premium && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded px-1">
                        PREMIUM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-3 space-y-1.5">
                {dealer.area && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{dealer.area}, {dealer.city}</span>
                  </div>
                )}
                {dealer.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-500">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{dealer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Car className="h-3 w-3 shrink-0" />
                  <span>{dealer.listing_count ?? 0} listings</span>
                </div>
              </div>

              {dealer.outreach_email && (
                <p className="mt-2 text-[11px] text-ink-400 truncate">
                  ✉ {dealer.outreach_email}
                </p>
              )}

              <div className="mt-3 flex items-center justify-end text-xs text-amber-600 font-medium group-hover:gap-1 gap-0 transition-all">
                View
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0}
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

function DealerStatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending:   { cls: "bg-ink-100 text-ink-600",        label: "Pending" },
    contacted: { cls: "bg-amber-100 text-amber-700",    label: "Contacted" },
    agreed:    { cls: "bg-sky-100 text-sky-700",         label: "Agreed" },
    imported:  { cls: "bg-emerald-100 text-emerald-700", label: "Imported" },
    rejected:  { cls: "bg-rose-100 text-rose-700",       label: "Rejected" },
  };
  const cfg = map[status] ?? map.pending;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
