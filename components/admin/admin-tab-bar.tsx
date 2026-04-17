"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface AdminTab {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Match only the exact href (use for parent routes that have child tabs) */
  exact?: boolean;
}

export function AdminTabBar({ tabs }: { tabs: readonly AdminTab[] }) {
  const pathname = usePathname();

  function isActive(tab: AdminTab) {
    if (tab.exact) return pathname === tab.href;
    return pathname === tab.href || pathname.startsWith(tab.href + "/");
  }

  return (
    <div className="flex border-b border-surface-muted">
      {tabs.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.Icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              active
                ? "border-amber-500 text-amber-700"
                : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
