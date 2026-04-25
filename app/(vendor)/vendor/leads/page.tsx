import Link from "next/link";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadStatusControl } from "@/components/vendor/lead-status-control";
import { VendorRealtimeRefresher } from "@/components/vendor/vendor-realtime-refresher";
import { MessageCircle, User, Phone as PhoneIcon } from "lucide-react";
import type { LeadStatus } from "@/app/actions/leads";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
] as const;

type StatusFilterKey = (typeof STATUS_FILTERS)[number]["key"];

function isStatusFilter(s: string | undefined): s is StatusFilterKey {
  return !!s && STATUS_FILTERS.some((f) => f.key === s);
}

export default async function VendorLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const profile = await requireVendorMode();
  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const activeStatus: StatusFilterKey = isStatusFilter(statusParam) ? statusParam : "all";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Total count (all statuses) for the summary card
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalCount } = await (supabase as any)
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("vendor_user_id", profile.id);

  // Per-status counts in parallel — used to badge the filter tabs
  const statusKeys = ["new", "contacted", "won", "lost"] as const;
  const statusCountResults = await Promise.all(
    statusKeys.map((s) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("vendor_user_id", profile.id)
        .eq("status", s),
    ),
  );
  const counts = Object.fromEntries(
    statusKeys.map((s, i) => [s, statusCountResults[i].count ?? 0]),
  ) as Record<LeadStatus, number>;

  // Paginated leads, filtered by selected status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("leads")
    .select(
      "id, channel, source, customer_name, customer_phone, ref_code, status, created_at, listing:listing_id(title, slug)",
      { count: "exact" },
    )
    .eq("vendor_user_id", profile.id);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: leads, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  function buildHref(patch: { status?: StatusFilterKey; page?: number }): string {
    const sp = new URLSearchParams();
    const next = { status: patch.status ?? activeStatus, page: patch.page ?? 1 };
    if (next.status !== "all") sp.set("status", next.status);
    if (next.page > 1) sp.set("page", String(next.page));
    const qs = sp.toString();
    return qs ? `/vendor/leads?${qs}` : "/vendor/leads";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Leads</h1>
          <p className="mt-1 text-sm text-ink-500">
            Verified customer enquiries from your listings.
          </p>
        </div>
        <VendorRealtimeRefresher
          channelKey={`leads-${profile.id}`}
          subscriptions={[
            {
              table: "leads",
              filter: `vendor_user_id=eq.${profile.id}`,
            },
          ]}
        />
      </div>

      {/* Summary */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-ink-500">
            <MessageCircle className="h-4 w-4 text-green-500" /> Total Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-ink-900">{totalCount ?? 0}</p>
        </CardContent>
      </Card>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-surface-muted">
        {STATUS_FILTERS.map((f) => {
          const isActive = activeStatus === f.key;
          const tabCount =
            f.key === "all"
              ? totalCount ?? 0
              : counts[f.key as LeadStatus] ?? 0;
          return (
            <Link
              key={f.key}
              href={buildHref({ status: f.key as StatusFilterKey, page: 1 })}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                isActive
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface-muted text-ink-400",
                )}
              >
                {tabCount}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Leads table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lead history</CardTitle>
        </CardHeader>
        <CardContent>
          {!leads || leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">
              {activeStatus === "all"
                ? "No leads yet. Once customers enquire about your listings via WhatsApp, they'll appear here."
                : `No leads in "${activeStatus}" right now.`}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Listing</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Ref</th>
                      <th className="pb-3 pr-4">Source</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-muted">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(leads as any[]).map((lead) => (
                      <tr key={lead.id}>
                        {/* Customer */}
                        <td className="py-3 pr-4">
                          {lead.customer_name ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-ink-400" />
                                <span className="font-medium text-ink-900">
                                  {lead.customer_name}
                                </span>
                              </div>
                              {lead.customer_phone && (
                                <div className="flex items-center gap-1.5">
                                  <PhoneIcon className="h-3 w-3 text-ink-300" />
                                  <a
                                    href={`https://wa.me/${lead.customer_phone.replace(/[^\d]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-green-600 hover:underline"
                                  >
                                    {lead.customer_phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-400 italic">
                              No contact info
                            </span>
                          )}
                        </td>

                        {/* Listing */}
                        <td className="py-3 pr-4 text-ink-900 max-w-[200px] truncate">
                          {lead.listing?.title ?? "—"}
                        </td>

                        {/* Status — clickable pill that cycles through new → contacted → won → lost */}
                        <td className="py-3 pr-4">
                          <LeadStatusControl
                            leadId={lead.id}
                            current={(lead.status ?? "new") as LeadStatus}
                          />
                        </td>

                        {/* Ref code */}
                        <td className="py-3 pr-4">
                          {lead.ref_code ? (
                            <span className="font-mono text-xs text-ink-500 bg-surface-muted px-1.5 py-0.5 rounded">
                              {lead.ref_code}
                            </span>
                          ) : (
                            <span className="text-ink-300">—</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="py-3 pr-4 text-xs text-ink-400">
                          {lead.source ?? "—"}
                        </td>

                        {/* Date */}
                        <td className="py-3 text-ink-500 whitespace-nowrap text-xs">
                          {new Date(lead.created_at).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm text-ink-500">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    {page > 1 && (
                      <Link
                        href={buildHref({ page: page - 1 })}
                        className="rounded-lg border border-surface-muted px-3 py-1.5 hover:bg-surface-muted"
                      >
                        ← Prev
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link
                        href={buildHref({ page: page + 1 })}
                        className="rounded-lg border border-surface-muted px-3 py-1.5 hover:bg-surface-muted"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
