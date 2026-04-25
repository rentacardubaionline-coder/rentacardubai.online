import { CheckCircle2, AlertTriangle, Lightbulb, Info, Quote } from "lucide-react";
import type { GuideBlock } from "@/lib/guides/data";

const TONE_STYLES: Record<
  "tip" | "warning" | "note",
  { Icon: typeof Lightbulb; ring: string; bg: string; iconBg: string; iconColor: string; titleColor: string }
> = {
  tip: {
    Icon: Lightbulb,
    ring: "ring-brand-200",
    bg: "bg-gradient-to-br from-brand-50 to-orange-50/40",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
    titleColor: "text-brand-700",
  },
  warning: {
    Icon: AlertTriangle,
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
    titleColor: "text-amber-800",
  },
  note: {
    Icon: Info,
    ring: "ring-slate-200",
    bg: "bg-slate-50",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
    titleColor: "text-slate-800",
  },
};

/**
 * Renders the structured-content blocks that make up a guide article body.
 * Editorial typography: generous spacing, brand callouts, ordered/unordered
 * lists with custom bullets, branded H2 anchors that match the TOC.
 */
export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return (
              <p
                key={i}
                className="text-[17px] leading-[1.7] text-ink-700 md:text-[18px]"
              >
                {block.text}
              </p>
            );

          case "h2":
            return (
              <h2
                key={i}
                id={block.id}
                className="scroll-mt-28 pt-4 text-2xl font-black tracking-tight text-ink-900 md:text-3xl"
              >
                {block.text}
              </h2>
            );

          case "h3":
            return (
              <h3
                key={i}
                className="text-lg font-bold text-ink-900 md:text-xl"
              >
                {block.text}
              </h3>
            );

          case "ul":
            return (
              <ul key={i} className="space-y-2.5">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="relative pl-6 text-[16px] leading-[1.7] text-ink-700 md:text-[17px]"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.85em] inline-block size-1.5 -translate-y-1/2 rounded-full bg-brand-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "ol":
            return (
              <ol key={i} className="space-y-3 counter-reset-[step]">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="relative flex gap-3 text-[16px] leading-[1.7] text-ink-700 md:text-[17px]"
                  >
                    <span
                      aria-hidden
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-brand-500 to-brand-700 text-sm font-black text-white shadow-sm"
                    >
                      {j + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            );

          case "callout": {
            const t = TONE_STYLES[block.tone];
            const { Icon } = t;
            return (
              <aside
                key={i}
                className={`rounded-2xl ${t.bg} p-5 ring-1 ring-inset ${t.ring}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${t.iconBg} ${t.iconColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-extrabold uppercase tracking-wider ${t.titleColor}`}
                    >
                      {block.title}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">
                      {block.body}
                    </p>
                  </div>
                </div>
              </aside>
            );
          }

          case "checklist":
            return (
              <ul key={i} className="grid gap-3 md:grid-cols-2">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-3 rounded-2xl border border-surface-muted bg-white p-4 shadow-card"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink-900">
                        {item.title}
                      </p>
                      {item.detail && (
                        <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <figure
                key={i}
                className="my-2 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-orange-50/30 px-7 py-6"
              >
                <Quote className="h-6 w-6 text-brand-400" />
                <blockquote className="mt-3 text-lg font-semibold leading-relaxed text-ink-800 md:text-xl">
                  {block.text}
                </blockquote>
                {block.cite && (
                  <figcaption className="mt-3 text-xs font-bold uppercase tracking-wider text-brand-700">
                    — {block.cite}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
