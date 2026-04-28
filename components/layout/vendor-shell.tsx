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
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn, toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/shared/notification-bell";
import { OnboardingBanner } from "@/components/vendor/onboarding-banner";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { logoutAction } from "@/lib/auth/actions";

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  mobileLabel?: string;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/vendor",
    icon: LayoutDashboard,
    label: "Dashboard",
    mobileLabel: "Home",
    exact: true,
  },
  {
    href: "/vendor/listings",
    icon: Car,
    label: "My Listings",
    mobileLabel: "Cars",
  },
  { href: "/vendor/business", icon: Building2, label: "Business" },
  { href: "/vendor/leads", icon: PhoneCall, label: "Leads" },
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
  hasBusiness: boolean;
  hasKyc: boolean;
  kycStatus?: "approved" | "pending" | "rejected" | null;
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function VendorShell({
  children,
  profile,
  business,
  notificationCount,
  notificationUserId,
  hasBusiness,
  hasKyc,
  kycStatus = null,
}: VendorShellProps) {
  const pathname = usePathname();

  const primaryHref = hasBusiness
    ? "/vendor/listings/new"
    : "/vendor/business/new";
  const primaryLabel = hasBusiness ? "New listing" : "Set up business";

  const isVerified = business?.claim_status === "claimed";
  const isPending = business?.claim_status === "pending";

  return (
    <div className="flex flex-1">
      {/* ── Desktop sidebar — sticky to viewport so it stays visible while
          the page scrolls naturally with the browser scrollbar. */}
      <aside
        aria-label="Vendor navigation"
        className="hidden w-60 shrink-0 flex-col border-r border-surface-muted bg-white lg:flex sticky top-0 self-start h-dvh overflow-y-auto"
      >
        <div className="flex flex-1 flex-col gap-5 p-4 pt-6">
          {/* Logo / home link */}
          <Logo size="sm" className="px-1" />

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
          <nav aria-label="Vendor sections" className="flex flex-col gap-0.5">
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

        {/* Footer: single card — company name, email, status. Drops the
            duplicate "Vendor" + city lines per the simplified spec. */}
        <div className="border-t border-surface-muted p-4 mt-auto space-y-2">
          <Link
            href={business ? "/vendor/business" : "/vendor/business/new"}
            className="flex flex-col gap-1 rounded-xl bg-surface-muted/60 p-3 transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate text-xs font-semibold text-ink-900">
                {business ? toTitleCase(business.name) : "Set up business"}
              </p>
              <p className="truncate text-[11px] text-ink-500">
                {profile.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
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
            </div>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-surface-muted bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content — scrolls with the document, no inner scroll container. */}
      <main className="flex min-w-0 flex-col flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Onboarding reminder banner */}
        <OnboardingBanner
          hasBusiness={hasBusiness}
          hasKyc={hasKyc}
          kycStatus={kycStatus}
        />

        {/* Top header — logo (mobile) + notification bell + log out */}
        <div className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-surface-muted bg-white px-4 lg:px-6">
          {/* Logo — visible on mobile only (desktop has sidebar logo) */}
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          {/* Spacer on desktop so the right-side controls stay right-aligned */}
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <NotificationBell
              initialCount={notificationCount}
              userId={notificationUserId}
            />
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-700 transition-colors hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <nav
        aria-label="Vendor sections"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-muted bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_-4px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/85 lg:hidden"
      >
        <div className="mx-auto flex max-w-xl items-stretch px-1 pt-1.5 pb-1">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            const label = item.mobileLabel ?? item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-8 w-16 items-center justify-center rounded-full transition-all duration-200",
                    active
                      ? "bg-brand-100/90 scale-100"
                      : "scale-95 group-active:bg-surface-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      active
                        ? "text-brand-700"
                        : "text-ink-500 group-hover:text-ink-800",
                    )}
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold leading-none tracking-tight transition-colors",
                    active
                      ? "text-brand-700"
                      : "text-ink-500 group-hover:text-ink-800",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PWA install banner — only shown inside the vendor shell */}
      <InstallPrompt />
    </div>
  );
}
