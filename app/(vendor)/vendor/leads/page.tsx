import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Phone as PhoneIcon } from "lucide-react";

const PAGE_SIZE = 50;

export default async function VendorLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const profile = await requireVendorMode();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  // Total count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count: totalCount } = await (supabase as any)
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("vendor_user_id", profile.id);

  // Paginated leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads, count } = await (supabase as any)
    .from("leads")
    .select(
      "id, channel, source, customer_name, customer_phone, ref_code, created_at, listing:listing_id(title, slug)",
      { count: "exact" },
    )
    .eq("vendor_user_id", profile.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Leads</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verified customer enquiries from your listings.
        </p>
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

      {/* Leads table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lead history</CardTitle>
        </CardHeader>
        <CardContent>
          {!leads || leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">
              No leads yet. Once customers enquire about your listings via WhatsApp, they&apos;ll appear here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Listing</th>
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
                      <a
                        href={`?page=${page - 1}`}
                        className="rounded-lg border border-surface-muted px-3 py-1.5 hover:bg-surface-muted"
                      >
                        ← Prev
                      </a>
                    )}
                    {page < totalPages && (
                      <a
                        href={`?page=${page + 1}`}
                        className="rounded-lg border border-surface-muted px-3 py-1.5 hover:bg-surface-muted"
                      >
                        Next →
                      </a>
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
