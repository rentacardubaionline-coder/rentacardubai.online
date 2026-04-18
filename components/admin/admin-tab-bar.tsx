"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2, FileCheck, Star, Users, ShieldCheck, Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon registry — client component maps string names to icon components.
 * Server components pass icon names (strings), not function components,
 * since functions can't be serialized across the server/client boundary.
 */
const ICONS: Record<string, LucideIcon> = {
  building: Building2,
  filecheck: FileCheck,
  star: Star,
  users: Users,
  shield: ShieldCheck,
  tag: Tag,
};

export interface AdminTab {
  href: string;
  label: string;
  icon: keyof typeof ICONS | string;
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
        const Icon = ICONS[tab.icon] ?? Tag;
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
