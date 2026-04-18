"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, ClipboardCheck, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/scraper/jobs",     label: "Jobs",      Icon: Rocket },
  { href: "/admin/scraper/review",   label: "Review",    Icon: ClipboardCheck },
  { href: "/admin/scraper/imported", label: "Imported",  Icon: Archive },
] as const;

export function ScraperTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-0 border-b border-surface-muted overflow-x-auto">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              active
                ? "border-amber-500 text-amber-700"
                : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
