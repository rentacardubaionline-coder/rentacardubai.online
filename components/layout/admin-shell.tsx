"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Car,
  Settings,
  Tag,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn, toTitleCase } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin",            icon: LayoutDashboard, label: "Dashboard",  exact: true },
  { href: "/admin/users",      icon: Users,           label: "Users" },
  { href: "/admin/businesses", icon: Building2,       label: "Businesses" },
  { href: "/admin/listings",   icon: Car,             label: "Listings" },
  { href: "/admin/seo",        icon: Tag,             label: "SEO" },
  { href: "/admin/settings",   icon: Settings,        label: "Settings" },
];

interface AdminShellProps {
  children: React.ReactNode;
  profile: { full_name: string | null; email: string };
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AdminShell({ children, profile }: AdminShellProps) {
  const pathname = usePathname();

  const initials = (profile.full_name ?? profile.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* ── Desktop sidebar ───────────────────────────────────────────────── */}
      <aside
        aria-label="Admin navigation"
        className="hidden w-56 min-h-0 shrink-0 flex-col border-r border-surface-muted bg-white overflow-y-auto lg:flex"
      >
        <div className="flex flex-1 flex-col gap-5 p-4 pt-6">
          {/* Logo / home link */}
          <Link href="/" className="flex items-center gap-2 px-1 group">
            <div className="size-7 rounded-md bg-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/20 group-hover:bg-amber-600 transition-colors">
              <span className="text-white font-bold text-xs tracking-tighter">RN</span>
            </div>
            <span className="font-black text-base text-ink-900 tracking-tight group-hover:text-amber-700 transition-colors">RentNow<span className="text-amber-600">Pk</span></span>
          </Link>

          <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-ink-400">
            Admin Center
          </p>

          <nav aria-label="Admin sections" className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
                    active
                      ? "bg-amber-50 text-amber-700"
                      : "text-ink-700 hover:bg-surface-muted hover:text-ink-900"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-amber-500 transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-amber-600"
                        : "text-ink-400 group-hover:text-ink-700"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: user info + logout */}
        <div className="space-y-3 border-t border-surface-muted p-4">
          <div className="flex items-center gap-3 px-1">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700"
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink-900">
                {toTitleCase(profile.full_name) || "Admin"}
              </p>
              <p className="truncate text-[10px] text-ink-500">{profile.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav
        aria-label="Admin sections"
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-surface-muted bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:hidden"
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors focus-visible:outline-none",
                active ? "text-amber-600" : "text-ink-500 hover:text-ink-700"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-amber-500 transition-opacity",
                  active ? "opacity-100" : "opacity-0"
                )}
              />
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-amber-600" : "text-ink-500"
                )}
                aria-hidden="true"
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
