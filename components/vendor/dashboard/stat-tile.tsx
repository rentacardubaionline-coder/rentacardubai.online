import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "brand" | "emerald" | "amber" | "violet";

const toneMap: Record<
  Tone,
  { accent: string; iconBg: string; iconText: string; badge: string }
> = {
  brand: {
    accent: "before:bg-brand-500",
    iconBg: "bg-brand-500/10",
    iconText: "text-brand-600",
    badge: "bg-brand-50 text-brand-700 border-brand-100",
  },
  emerald: {
    accent: "before:bg-emerald-500",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  amber: {
    accent: "before:bg-amber-500",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  violet: {
    accent: "before:bg-violet-500",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600",
    badge: "bg-violet-50 text-violet-700 border-violet-100",
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
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
        ? TrendingDown
        : Minus;
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-100"
      : trendDirection === "down"
        ? "text-rose-700 bg-rose-50 border-rose-100"
        : "text-ink-500 bg-surface-muted border-surface-muted";

  return (
    <Card
      className={`group relative overflow-hidden shadow-card before:absolute before:inset-y-0 before:left-0 before:w-1 ${t.accent} hover:shadow-md transition-shadow duration-200`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold text-ink-500 leading-none">
              {label}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-ink-900 tabular-nums leading-none pt-1">
              {value}
            </p>
            {hint && (
              <p className="text-xs text-ink-400 pt-0.5">{hint}</p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${t.iconBg} ${t.iconText} mt-0.5`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${trendColor}`}
            >
              <TrendIcon className="h-3 w-3" />
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-[11px] text-ink-400">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
