import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/types/database";

type Business = Database["public"]["Tables"]["businesses"]["Row"];

type Props = {
  business: Business;
  hasCoverImage: boolean;
  hasLogo: boolean;
};

type Check = { key: string; label: string; done: boolean };

export function ProfileCompletenessCard({ business, hasCoverImage, hasLogo }: Props) {
  const checks: Check[] = [
    { key: "contact", label: "Phone + WhatsApp set", done: !!(business.phone && business.whatsapp_phone) },
    { key: "description", label: "Description written", done: !!(business.description && business.description.length >= 60) },
    { key: "logo", label: "Logo uploaded", done: hasLogo },
    { key: "cover", label: "Cover image uploaded", done: hasCoverImage },
    { key: "address", label: "Address + map location", done: !!(business.address_line && business.lat && business.lng) },
    { key: "hours", label: "Working hours added", done: !!business.working_hours },
  ];

  const done = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <Card className="shadow-card">
      <CardHeader className="border-b border-surface-muted pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Profile health
          </CardTitle>
          <span
            className="text-xl font-bold tabular-nums text-ink-900"
            aria-label={`${pct}% complete`}
          >
            {pct}%
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-4 sm:p-6">
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li
              key={c.key}
              className="flex items-center gap-2.5 text-sm"
            >
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  c.done
                    ? "bg-emerald-500 text-white"
                    : "border border-dashed border-ink-300 bg-white"
                }`}
              >
                {c.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
              </span>
              <span className={c.done ? "text-ink-500 line-through" : "text-ink-700"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>

        {pct < 100 && (
          <Link
            href="/vendor/business"
            className="mt-4 flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50/70 px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            Complete your profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
