"use client";

import { useState } from "react";
import {
  Info,
  Car,
  Gauge,
  Mountain,
  Crown,
  ReceiptText,
  X,
} from "lucide-react";
import { formatAed } from "@/lib/utils";
import type { PricingTier, TierCode } from "@/lib/pricing/tiers";

interface PricingAgreementCardProps {
  tiers: PricingTier[];
}

const TIER_STYLE: Record<
  TierCode,
  {
    icon: React.ComponentType<{ className?: string }>;
    ring: string;
    text: string;
    bg: string;
  }
> = {
  economy: {
    icon: Car,
    ring: "ring-emerald-100",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  sedan: {
    icon: Gauge,
    ring: "ring-sky-100",
    text: "text-sky-600",
    bg: "bg-sky-50",
  },
  suv: {
    icon: Mountain,
    ring: "ring-amber-100",
    text: "text-amber-600",
    bg: "bg-amber-50",
  },
  luxury: {
    icon: Crown,
    ring: "ring-violet-100",
    text: "text-violet-600",
    bg: "bg-violet-50",
  },
};

export function PricingAgreementCard({ tiers }: PricingAgreementCardProps) {
  const [info, setInfo] = useState<PricingTier | null>(null);

  return (
    <>
      <section className="rounded-2xl border border-surface-muted bg-white p-5 shadow-card ring-1 ring-black/5 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-ink-900">
                Pay-per-lead pricing
              </h2>
              <p className="text-xs text-ink-500">
                You only pay when we send you a qualified lead. Rates by car
                category.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
            Agreement
          </span>
        </header>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {tiers.map((tier) => {
            const style = TIER_STYLE[tier.code];
            const Icon = style.icon;
            return (
              <div
                key={tier.id}
                className={`group relative flex items-center justify-between gap-3 rounded-xl border border-surface-muted bg-white p-4 transition-all hover:shadow-md hover:${style.ring}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${style.bg} ${style.text}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-ink-900">
                        {tier.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setInfo(tier)}
                        aria-label={`What counts as ${tier.label}`}
                        className="inline-flex size-5 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-muted hover:text-ink-700"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                      {tier.examples.slice(0, 3).join(" · ")}
                      {tier.examples.length > 3 ? "…" : ""}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {formatAed(tier.price_pkr)}

                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    / lead
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 rounded-lg bg-surface-sunken px-3 py-2 text-[11px] leading-relaxed text-ink-500">
          <strong className="text-ink-700">How billing works:</strong> each
          WhatsApp click-to-chat lead sent to you is billed at the rate for that
          car's category. Invoices are generated at the end of each month.
          Unanswered leads are still billable — treat each one promptly.
        </p>
      </section>

      {/* Info popover */}
      {info && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={info.label}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setInfo(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const style = TIER_STYLE[info.code];
                  const Icon = style.icon;
                  return (
                    <div
                      className={`flex size-11 items-center justify-center rounded-xl ${style.bg} ${style.text}`}
                    >
                      <Icon className="size-5" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-lg font-extrabold text-ink-900">
                    {info.label}
                  </h3>
                  {formatAed(info.price_pkr)} per lead
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInfo(null)}
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-surface-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {info.description && (
              <p className="mt-4 text-sm text-ink-600 leading-relaxed">
                {info.description}
              </p>
            )}

            <div className="mt-4">
              <h4 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-ink-500">
                Example models
              </h4>
              <div className="flex flex-wrap gap-2">
                {info.examples.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-ink-700 ring-1 ring-surface-muted"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInfo(null)}
              className="mt-6 w-full rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-black"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
