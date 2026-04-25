"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { GUIDE_CATEGORIES, type GuideCategory } from "@/lib/guides/data";

export function GuideCategoryTabs({
  counts,
}: {
  counts: Record<GuideCategory | "all", number>;
}) {
  const params = useSearchParams();
  const active = (params?.get("category") ?? "all") as GuideCategory | "all";

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-surface-muted">
      {GUIDE_CATEGORIES.map((cat) => {
        const isActive = cat.key === active;
        const href =
          cat.key === "all" ? "/guides" : `/guides?category=${cat.key}`;
        return (
          <Link
            key={cat.key}
            href={href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            {cat.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                isActive
                  ? "bg-brand-100 text-brand-700"
                  : "bg-surface-muted text-ink-400",
              )}
            >
              {counts[cat.key] ?? 0}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
