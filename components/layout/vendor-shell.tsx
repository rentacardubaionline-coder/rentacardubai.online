"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Building2,
  PhoneCall,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/shared/notification-bell";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/vendor", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/vendor/listings", icon: Car, label: "My Listings" },
  { href: "/vendor/business", icon: Building2, label: "Business" },
  { href: "/vendor/leads", icon: PhoneCall, label: "Leads" },
  { href: "/vendor/kyc", icon: ShieldCheck, label: "Verify ID" },
  { href: "/vendor/profile", icon: UserCircle, label: "Profile" },
  { href: "/vendor/settings", icon: Settings, label: "Settings" },
];

type VendorBusiness = {
  id: string;
  name: string;
  city: string;
  claim_status: string | null;
} | null;

interface VendorShellProps {
  children: React.ReactNode;
  profile: { full_name: string | null; email: string };
  business: VendorBusiness;
  notificationCount: number;
  notificationUserId: string;
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function VendorShell({ children, profile, business, notificationCount, notificationUserId }: VendorShellProps) {
  const pathname = usePathname();

  const hasBusiness = !!business;
  const primaryHref = hasBusiness ? "/vendor/listings/new" : "/vendor/business/new";
  const primaryLabel = hasBusiness ? "New listing" : "Set up business";

  const isVerified = business?.claim_status === "claimed";
  const isPending = business?.claim_status === "pending";

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
        aria-label="Vendor navigation"
        className="hidden w-60 shrink-0 flex-col border-r border-surface-muted bg-white overflow-y-auto lg:flex min-h-0"
      >
        <div className="flex flex-1 flex-col gap-5 p-4 pt-6">
          {/* Header + primary CTA */}
          <div className="space-y-3">
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-ink-500">
              Vendor center
            </p>
            <Button
              render={<Link href={primaryHref} />}
              size="default"
              className="w-full justify-center shadow-pop/30"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {primaryLabel}
            </Button>
          </div>

          {/* Nav */}
          <nav
            aria-label="Vendor sections"
            className="flex flex-col gap-0.5"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-surface-muted hover:text-ink-900",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-500 transition-opacity",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-brand-600"
                        : "text-ink-500 group-hover:text-ink-700",
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: business + user */}
        <div className="space-y-3 border-t border-surface-muted p-4">
          {business && (
            <Link
              href="/vendor/business"
              className="flex items-start gap-2.5 rounded-xl bg-surface-muted/60 p-3 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-inset ring-brand-100"
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-xs font-semibold text-ink-900">
                  {business.name}
                </p>
                <p className="truncate text-[11px] text-ink-500">
                  {business.city}
                </p>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                    <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                    Verified
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                    <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                    Under review
                  </span>
                )}
              </div>
            </Link>
          )}

          <div className="flex items-center gap-3 px-1">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-900">
                {profile.full_name ?? "Vendor"}
              </p>
              <p className="truncate text-[10px] text-ink-500">
                {profile.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex min-h-0 flex-col flex-1 overflow-hidden pb-16 lg:pb-0">
        {/* Thin notification header — always visible, doesn't scroll */}
        <div className="flex h-12 shrink-0 items-center justify-end border-b border-surface-muted bg-white px-4 lg:px-6">
          <NotificationBell initialCount={notificationCount} userId={notificationUserId} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-8">{children}</div>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav
        aria-label="Vendor sections"
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
                active ? "text-brand-600" : "text-ink-500 hover:text-ink-700",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-brand-500 transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  active ? "text-brand-600" : "text-ink-500",
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
