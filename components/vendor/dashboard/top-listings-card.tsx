import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TopListingRow = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  primary_image_url: string | null;
  status: string | null;
  lead_count: number;
};

type Props = {
  rows: TopListingRow[];
};

const rank = ["01", "02", "03", "04", "05"];

export function TopListingsCard({ rows }: Props) {
  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-surface-muted pb-3">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-500">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          Top performing — 30 days
        </CardTitle>
        <Link
          href="/vendor/listings"
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
        >
          All listings
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <p className="text-sm text-ink-500">
              No listing has received leads in the last 30 days.
            </p>
            <p className="text-xs text-ink-500">
              Share your listing URLs on social to drive inquiries.
            </p>
          </div>
        ) : (
          <ol className="divide-y divide-surface-muted">
            {rows.map((row, idx) => (
              <li key={row.id}>
                <Link
                  href={`/vendor/listings/${row.id}/edit`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:bg-surface-muted/60"
                >
                  <span
                    className="w-7 shrink-0 text-center text-xs font-bold tabular-nums text-ink-300"
                    aria-hidden="true"
                  >
                    {rank[idx] ?? `${idx + 1}`}
                  </span>

                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                    {row.primary_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.primary_image_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {row.title}
                    </p>
                    {row.city && (
                      <p className="truncate text-xs text-ink-500">{row.city}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold tabular-nums text-ink-900">
                      {row.lead_count}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-ink-500">
                      lead{row.lead_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
