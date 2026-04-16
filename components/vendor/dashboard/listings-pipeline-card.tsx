import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  PauseCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  stats: {
    total: number;
    approved: number;
    pending: number;
    draft: number;
    rejected: number;
    unavailable: number;
  };
};

type Row = {
  key: "approved" | "pending" | "draft" | "rejected" | "unavailable";
  label: string;
  value: number;
  href: string;
  tone: "emerald" | "amber" | "slate" | "rose" | "ink";
  icon: typeof CheckCircle2;
};

const toneStyle: Record<Row["tone"], { dot: string; bar: string; text: string }> = {
  emerald: { dot: "bg-emerald-500", bar: "bg-emerald-400", text: "text-emerald-700" },
  amber: { dot: "bg-amber-500", bar: "bg-amber-400", text: "text-amber-700" },
  slate: { dot: "bg-ink-300", bar: "bg-ink-300", text: "text-ink-700" },
  rose: { dot: "bg-rose-500", bar: "bg-rose-400", text: "text-rose-700" },
  ink: { dot: "bg-ink-500", bar: "bg-ink-500", text: "text-ink-700" },
};

export function ListingsPipelineCard({ stats }: Props) {
  const rows: Row[] = [
    {
      key: "approved",
      label: "Live",
      value: stats.approved,
      href: "/vendor/listings?status=approved",
      tone: "emerald",
      icon: CheckCircle2,
    },
    {
      key: "pending",
      label: "Pending review",
      value: stats.pending,
      href: "/vendor/listings?status=pending",
      tone: "amber",
      icon: Clock,
    },
    {
      key: "draft",
      label: "Draft",
      value: stats.draft,
      href: "/vendor/listings?status=draft",
      tone: "slate",
      icon: FileEdit,
    },
    {
      key: "rejected",
      label: "Rejected",
      value: stats.rejected,
      href: "/vendor/listings?status=rejected",
      tone: "rose",
      icon: AlertCircle,
    },
    {
      key: "unavailable",
      label: "Unavailable",
      value: stats.unavailable,
      href: "/vendor/listings?status=unavailable",
      tone: "ink",
      icon: PauseCircle,
    },
  ];

  const total = stats.total;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-surface-muted pb-3">
        <div>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-ink-500">
            Listings pipeline
          </CardTitle>
          <p className="mt-1 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
            {total}
            <span className="ml-1 text-sm font-normal text-ink-500">
              listing{total === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-6">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-ink-500">No listings yet.</p>
            <Link
              href="/vendor/listings/new"
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Create your first listing →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows
              .filter((r) => r.value > 0)
              .map((r) => {
                const pct = total === 0 ? 0 : Math.round((r.value / total) * 100);
                const t = toneStyle[r.tone];
                const Icon = r.icon;
                return (
                  <li key={r.key}>
                    <Link
                      href={r.href}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 rounded-md"
                    >
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-ink-700 group-hover:text-ink-900">
                          <Icon className={`h-3.5 w-3.5 ${t.text}`} aria-hidden="true" />
                          {r.label}
                        </span>
                        <span className="font-semibold text-ink-900 tabular-nums">
                          {r.value}{" "}
                          <span className="text-xs font-normal text-ink-500">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={`${t.bar} h-full transition-[width]`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}

        {stats.rejected > 0 && (
          <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50/50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <div className="flex-1 text-xs">
                <p className="font-semibold text-rose-800">
                  {stats.rejected} listing{stats.rejected === 1 ? "" : "s"} rejected
                </p>
                <p className="mt-0.5 text-rose-700">
                  Review feedback and resubmit for approval.
                </p>
                <Link
                  href="/vendor/listings?status=rejected"
                  className="mt-1 inline-block font-semibold text-rose-800 underline-offset-2 hover:underline"
                >
                  Open rejected →
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
