import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "brand" | "emerald" | "amber" | "violet";

const toneMap: Record<Tone, { border: string; iconBg: string; iconText: string }> = {
  brand: {
    border: "before:bg-brand-500",
    iconBg: "bg-brand-50",
    iconText: "text-brand-600",
  },
  emerald: {
    border: "before:bg-emerald-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
  },
  amber: {
    border: "before:bg-amber-500",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
  },
  violet: {
    border: "before:bg-violet-500",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
  },
};

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: number; label: string } | null;
  tone?: Tone;
};

/**
 * Compact KPI tile. Uses a left accent bar via pseudo-element and a tinted icon well.
 * Trend chip is optional — only shows when we have a comparison period.
 */
export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  trend,
  tone = "brand",
}: Props) {
  const t = toneMap[tone];
  const trendDirection =
    trend == null ? null : trend.value > 0 ? "up" : trend.value < 0 ? "down" : "flat";
  const TrendIcon =
    trendDirection === "up" ? ArrowUp : trendDirection === "down" ? ArrowDown : Minus;
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-700 bg-emerald-50"
      : trendDirection === "down"
        ? "text-rose-700 bg-rose-50"
        : "text-ink-500 bg-surface-muted";

  return (
    <Card
      className={`group relative overflow-hidden shadow-card before:absolute before:inset-y-0 before:left-0 before:w-1 ${t.border} transition-shadow hover:shadow-pop/10`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-500">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-ink-900 tabular-nums">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
          </div>
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBg} ${t.iconText}`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendColor}`}
            >
              <TrendIcon className="h-3 w-3" />
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-[11px] text-ink-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
