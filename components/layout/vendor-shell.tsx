"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Building2, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/vendor", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/vendor/listings", icon: Car, label: "My Listings", exact: false },
  { href: "/vendor/business", icon: Building2, label: "Business", exact: false },
  { href: "/vendor/leads", icon: PhoneCall, label: "Leads", exact: false },
];

interface VendorShellProps {
  children: React.ReactNode;
  profile: { full_name: string | null; email: string };
}

export function VendorShell({ children, profile }: VendorShellProps) {
  const pathname = usePathname();

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 border-r border-surface-muted bg-white lg:flex lg:flex-col">
        <nav className="flex flex-1 flex-col gap-1 p-3 pt-6">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-600"
                    : "text-ink-600 hover:bg-surface-muted hover:text-ink-900"
                )}
              >
                <item.icon
                  className={cn("h-4 w-4 shrink-0", active ? "text-brand-500" : "text-ink-400")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User avatar */}
        <div className="border-t border-surface-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-900">
                {profile.full_name ?? "Vendor"}
              </p>
              <p className="truncate text-[10px] text-ink-400">{profile.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 pb-24 lg:pb-8">
        <div className="p-4 lg:p-8">{children}</div>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-surface-muted bg-white lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
                active ? "text-brand-600" : "text-ink-400"
              )}
            >
              <item.icon className={cn("h-5 w-5", active ? "text-brand-500" : "text-ink-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
