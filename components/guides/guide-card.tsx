import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Guide } from "@/lib/guides/data";

const CATEGORY_LABELS: Record<Guide["category"], string> = {
  "for-renters": "For Renters",
  "for-vendors": "For Vendors",
};

const CATEGORY_STYLES: Record<Guide["category"], string> = {
  "for-renters": "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "for-vendors": "bg-brand-100 text-brand-800 ring-brand-200",
};

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-15px_rgba(196,82,27,0.25)] hover:ring-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      {/* Hero image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
        <Image
          src={guide.heroImage}
          alt={guide.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-ink-900/30 via-transparent to-transparent"
        />
        <span
          className={cn(
            "absolute left-4 top-4 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset",
            CATEGORY_STYLES[guide.category],
          )}
        >
          {CATEGORY_LABELS[guide.category]}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-black leading-tight text-ink-900 transition-colors group-hover:text-brand-700">
          {guide.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-500">
          {guide.excerpt}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <Clock className="h-3.5 w-3.5 text-brand-500" />
            {guide.readMins} min read
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 transition-transform group-hover:translate-x-0.5">
            Read article
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
