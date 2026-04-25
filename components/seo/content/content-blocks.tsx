import { CheckCircle2, FileText, MapPin, Clock, Car, Route as RouteIcon, Wallet } from "lucide-react";
import { formatPkr } from "@/lib/utils";
import type { RENTER_DOCUMENTS, ROUTE_CONTENT } from "@/lib/seo/content-data";

/* ── Section heading ─────────────────────────────────────────────────────── */

interface ContentSectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function ContentSectionHeading({
  eyebrow,
  title,
  subtitle,
}: ContentSectionHeadingProps) {
  return (
    <header className="space-y-1.5">
      {eyebrow && (
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-black tracking-tight text-ink-900 md:text-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-3xl text-sm leading-relaxed text-ink-500">
          {subtitle}
        </p>
      )}
    </header>
  );
}

/* ── Long-form prose paragraph(s) ─────────────────────────────────────────── */

export function ProseBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-ink-700 md:text-base">
      {children}
    </div>
  );
}

/* ── Highlight callout (tips, notes, special cases) ───────────────────────── */

export function HighlightCallout({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-orange-50/40 p-5">
      <p className="text-xs font-extrabold uppercase tracking-wider text-brand-700">
        💡 {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{body}</p>
    </div>
  );
}

/* ── Typical-prices table ─────────────────────────────────────────────────── */

interface PriceTableProps {
  cityName: string;
  rows: { label: string; examples: string; pricePkr: number }[];
}

export function PriceTable({ cityName, rows }: PriceTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-card">
      <div className="flex items-center gap-3 border-b border-surface-muted bg-surface-muted/40 px-5 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Wallet className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink-900">
            Typical daily rates in {cityName}
          </p>
          <p className="text-[11px] text-ink-400">
            Indicative only — final price depends on car, season, and trip length
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-ink-400">
              <th className="px-5 py-3">Vehicle type</th>
              <th className="px-4 py-3">Common models</th>
              <th className="px-5 py-3 text-right">Typical / day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-muted">
            {rows.map((r) => (
              <tr key={r.label} className="hover:bg-surface-muted/30">
                <td className="px-5 py-3.5 font-semibold text-ink-900">
                  {r.label}
                </td>
                <td className="px-4 py-3.5 text-ink-600">{r.examples}</td>
                <td className="px-5 py-3.5 text-right font-bold text-brand-700">
                  {formatPkr(r.pricePkr)}+
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Document checklist ───────────────────────────────────────────────────── */

interface DocumentChecklistProps {
  items: typeof RENTER_DOCUMENTS;
}

export function DocumentChecklist({ items }: DocumentChecklistProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((doc) => (
        <div
          key={doc.title}
          className="flex gap-3 rounded-2xl border border-surface-muted bg-white p-4 shadow-card"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">{doc.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
              {doc.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Route facts card ─────────────────────────────────────────────────────── */

type RouteFacts = (typeof ROUTE_CONTENT)[keyof typeof ROUTE_CONTENT];

interface RouteFactsCardProps {
  origin: string;
  destination: string;
  facts: RouteFacts;
}

export function RouteFactsCard({
  origin,
  destination,
  facts,
}: RouteFactsCardProps) {
  const items: { icon: typeof RouteIcon; label: string; value: string }[] = [
    {
      icon: RouteIcon,
      label: "Distance",
      value: `≈ ${facts.distanceKm.toLocaleString("en-PK")} km`,
    },
    {
      icon: Clock,
      label: "Drive time",
      value: `≈ ${facts.driveHours} hours`,
    },
    {
      icon: MapPin,
      label: "Main route",
      value: facts.motorway ?? "Mixed roads",
    },
    {
      icon: Car,
      label: "Best vehicle",
      value: facts.bestVehicle,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-surface-muted bg-white shadow-card">
      <div className="border-b border-surface-muted bg-gradient-to-r from-brand-50 to-orange-50/30 px-5 py-3">
        <p className="text-sm font-bold text-ink-900">
          {origin}{" "}
          <span className="text-brand-500">→</span>{" "}
          {destination}: at a glance
        </p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-surface-muted md:grid-cols-4 md:divide-y-0">
        {items.map((it) => (
          <div key={it.label} className="flex items-start gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <it.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                {it.label}
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink-900">{it.value}</p>
            </div>
          </div>
        ))}
      </div>
      {facts.highlights && facts.highlights.length > 0 && (
        <div className="border-t border-surface-muted px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            What to know
          </p>
          <ul className="mt-2 space-y-1.5">
            {facts.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-2 text-sm leading-relaxed text-ink-700"
              >
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
