import Link from "next/link";
import { Wallet, TrendingUp, ArrowUpRight } from "lucide-react";
import type { PricingTier, TierCode } from "@/lib/pricing/tiers";

export interface BillingBreakdownRow {
  code: TierCode;
  label: string;
  count: number;
  pricePkr: number;
  total: number;
}

interface BillingSummaryCardProps {
  monthLabel: string; // e.g. "April 2026"
  totalLeads: number;
  totalBillPkr: number;
  rows: BillingBreakdownRow[];
  /** Tiers (from DB) used only to render zero-count rows when vendor has no leads yet. */
  tiers: PricingTier[];
}

const TIER_DOT: Record<TierCode, string> = {
  economy: "bg-emerald-400",
  sedan: "bg-sky-400",
  suv: "bg-amber-400",
  luxury: "bg-violet-400",
};

export function BillingSummaryCard({
  monthLabel,
  totalLeads,
  totalBillPkr,
  rows,
  tiers,
}: BillingSummaryCardProps) {
  // Ensure every tier shows, even if the vendor hasn't hit it yet.
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const displayRows: BillingBreakdownRow[] = tiers.map((t) => {
    const found = byCode.get(t.code);
    return (
      found ?? {
        code: t.code,
        label: t.label,
        count: 0,
        pricePkr: t.price_pkr,
        total: 0,
      }
    );
  });

  return (
    <section className="flex h-full flex-col rounded-2xl border border-surface-muted bg-white p-5 shadow-card ring-1 ring-black/5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Wallet className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-ink-900">Billing this month</h2>
            <p className="text-xs text-ink-500">{monthLabel}</p>
          </div>
        </div>
        <Link
          href="/vendor/leads"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-ink-500 hover:bg-surface-muted hover:text-ink-900"
        >
          View leads
          <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      {/* Totals */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-orange-50 p-4 ring-1 ring-brand-100/60">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-700">
            Total leads
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-ink-900">{totalLeads}</span>
            <TrendingUp className="size-4 text-brand-500" />
          </div>
        </div>
        <div className="rounded-xl bg-ink-900 p-4 text-white">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-300">
            Amount owed
          </div>
          <div className="mt-1 text-2xl font-black">
            Rs. {totalBillPkr.toLocaleString("en-PK")}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-5 space-y-2">
        {displayRows.map((r) => (
          <div
            key={r.code}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`inline-block size-2 shrink-0 rounded-full ${TIER_DOT[r.code]}`} />
              <span className="truncate text-sm font-semibold text-ink-800">{r.label}</span>
              <span className="text-xs text-ink-400">@ Rs. {r.pricePkr}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-sm">
              <span className="font-bold text-ink-900">
                {r.count} {r.count === 1 ? "lead" : "leads"}
              </span>
              <span className="min-w-[5rem] text-right font-extrabold text-ink-900">
                Rs. {r.total.toLocaleString("en-PK")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-auto pt-4 text-[11px] text-ink-400">
        Bills settle at end of month. Unanswered leads are still billable — reply quickly.
      </p>
    </section>
  );
}
