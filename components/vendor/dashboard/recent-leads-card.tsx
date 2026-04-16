import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type RecentLead = {
  id: string;
  channel: string;
  created_at: string;
  listing: { id: string; title: string } | null;
};

type Props = {
  leads: RecentLead[];
  hasListings: boolean;
};

function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-PK", { month: "short", day: "numeric" });
}

export function RecentLeadsCard({ leads, hasListings }: Props) {
  return (
    <Card className="overflow-hidden shadow-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-surface-muted pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-500">
          Recent leads
        </CardTitle>
        <Link
          href="/vendor/leads"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
        >
          View all
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted"
            >
              <MessageCircle className="h-5 w-5 text-ink-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-700">No leads yet</p>
              <p className="mt-0.5 text-xs text-ink-500">
                When customers tap WhatsApp or Call on your listings, they&apos;ll appear here.
              </p>
            </div>
            {!hasListings && (
              <Button
                render={<Link href="/vendor/listings/new" />}
                size="sm"
                variant="outline"
                className="mt-1"
              >
                Add your first listing
              </Button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted/50">
                <th
                  scope="col"
                  className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-500"
                >
                  Listing
                </th>
                <th
                  scope="col"
                  className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-ink-500"
                >
                  Channel
                </th>
                <th
                  scope="col"
                  className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-ink-500"
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-muted">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="transition-colors hover:bg-surface-muted/40"
                >
                  <td className="px-5 py-3.5">
                    <span className="line-clamp-1 font-medium text-ink-900">
                      {lead.listing?.title ?? (
                        <span className="italic text-ink-500">Deleted listing</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    {lead.channel === "whatsapp" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                        <MessageCircle className="h-3 w-3" aria-hidden="true" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/10">
                        <Phone className="h-3 w-3" aria-hidden="true" />
                        Call
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs tabular-nums text-ink-500">
                    <time dateTime={lead.created_at}>{timeAgo(lead.created_at)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
