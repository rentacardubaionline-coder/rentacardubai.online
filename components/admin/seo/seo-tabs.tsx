"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, MapPin, Building, Route, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/seo/keywords",   label: "Keywords",   Icon: Tag },
  { href: "/admin/seo/cities",     label: "Cities",     Icon: Building },
  { href: "/admin/seo/towns",      label: "Towns",      Icon: MapPin },
  { href: "/admin/seo/routes",     label: "Routes",     Icon: Route },
  { href: "/admin/seo/categories", label: "Categories", Icon: Layers },
] as const;

export function SeoTabs() {
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
