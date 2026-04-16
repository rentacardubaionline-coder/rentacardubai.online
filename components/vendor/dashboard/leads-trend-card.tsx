import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone, TrendingUp } from "lucide-react";

type Props = {
  /** Daily lead counts for the last 30 days, oldest → newest */
  daily: Array<{ date: string; whatsapp: number; call: number }>;
  totalWhatsapp: number;
  totalCall: number;
};

/**
 * 30-day leads trend as a pure inline SVG. No charts dependency.
 * Area shape for whatsapp, line for call, hover tooltips via native <title>.
 */
export function LeadsTrendCard({ daily, totalWhatsapp, totalCall }: Props) {
  const width = 560;
  const height = 140;
  const padX = 4;
  const padY = 8;

  const totals = daily.map((d) => d.whatsapp + d.call);
  const max = Math.max(1, ...totals);
  const count = daily.length || 1;
  const stepX = (width - padX * 2) / Math.max(1, count - 1);

  const y = (v: number) => {
    const range = height - padY * 2;
    return height - padY - (v / max) * range;
  };
  const x = (i: number) => padX + i * stepX;

  const areaPath = daily.length
    ? `M ${x(0)} ${height - padY} ` +
      daily.map((d, i) => `L ${x(i)} ${y(d.whatsapp + d.call)}`).join(" ") +
      ` L ${x(daily.length - 1)} ${height - padY} Z`
    : "";

  const linePath = daily.length
    ? daily
        .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.whatsapp + d.call)}`)
        .join(" ")
    : "";

  const total = totalWhatsapp + totalCall;
  const whatsappPct = total > 0 ? Math.round((totalWhatsapp / total) * 100) : 0;
  const callPct = 100 - whatsappPct;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-surface-muted pb-3">
        <div>
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Leads — last 30 days
          </CardTitle>
          <p className="mt-1 text-2xl font-bold tracking-tight text-ink-900 tabular-nums">
            {total}
            <span className="ml-1 text-sm font-normal text-ink-500">
              total contact{total === 1 ? "" : "s"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3 text-emerald-600" aria-hidden="true" />
            <span className="font-semibold text-ink-700 tabular-nums">{totalWhatsapp}</span>
            <span className="text-ink-500">WhatsApp</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-brand-600" aria-hidden="true" />
            <span className="font-semibold text-ink-700 tabular-nums">{totalCall}</span>
            <span className="text-ink-500">Call</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-[140px] w-full"
          role="img"
          aria-label={`Daily leads for the last 30 days. Total ${total}.`}
        >
          <defs>
            <linearGradient id="leadsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Baseline grid */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={height - padY - ratio * (height - padY * 2)}
              y2={height - padY - ratio * (height - padY * 2)}
              stroke="var(--color-surface-muted)"
              strokeWidth="1"
            />
          ))}

          {areaPath && <path d={areaPath} fill="url(#leadsAreaFill)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-brand-500)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Data points */}
          {daily.map((d, i) => {
            const v = d.whatsapp + d.call;
            if (v === 0) return null;
            return (
              <g key={d.date}>
                <circle
                  cx={x(i)}
                  cy={y(v)}
                  r="2.5"
                  fill="var(--color-brand-500)"
                  stroke="white"
                  strokeWidth="1.5"
                >
                  <title>
                    {new Date(d.date).toLocaleDateString("en-PK", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    — {v} lead{v === 1 ? "" : "s"}
                  </title>
                </circle>
              </g>
            );
          })}
        </svg>

        {total > 0 && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="flex h-full">
              <div
                className="bg-emerald-500"
                style={{ width: `${whatsappPct}%` }}
                aria-label={`WhatsApp: ${whatsappPct}%`}
              />
              <div
                className="bg-brand-500"
                style={{ width: `${callPct}%` }}
                aria-label={`Call: ${callPct}%`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
