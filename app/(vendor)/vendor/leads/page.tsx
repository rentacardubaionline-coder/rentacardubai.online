import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone } from "lucide-react";

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

  // Summary counts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allLeads } = await (supabase as any)
    .from("leads")
    .select("channel")
    .eq("vendor_user_id", profile.id);

  const waCount = (allLeads ?? []).filter((l: { channel: string }) => l.channel === "whatsapp").length;
  const callCount = (allLeads ?? []).filter((l: { channel: string }) => l.channel === "call").length;

  // Paginated leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads, count } = await (supabase as any)
    .from("leads")
    .select(
      "id, channel, source, created_at, listing:listing_id(title, slug)",
      { count: "exact" }
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
          Every WhatsApp tap and call on your listings.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-ink-500">
              <MessageCircle className="h-4 w-4 text-green-500" /> WhatsApp leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-ink-900">{waCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-ink-500">
              <Phone className="h-4 w-4 text-brand-500" /> Call leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-ink-900">{callCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Lead history</CardTitle>
        </CardHeader>
        <CardContent>
          {!leads || leads.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">
              No leads yet. Once customers tap WhatsApp or Call on your listings, they&apos;ll appear here.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-ink-400">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Listing</th>
                      <th className="pb-3 pr-4">Channel</th>
                      <th className="pb-3">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-muted">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(leads as any[]).map((lead) => (
                      <tr key={lead.id}>
                        <td className="py-3 pr-4 text-ink-500 whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-ink-900 max-w-[200px] truncate">
                          {lead.listing?.title ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {lead.channel === "whatsapp" ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              <MessageCircle className="mr-1 h-3 w-3" /> WhatsApp
                            </Badge>
                          ) : (
                            <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-100">
                              <Phone className="mr-1 h-3 w-3" /> Call
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 text-xs text-ink-400">{lead.source ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple pagination */}
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
