"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Home, Store, MessageCircle } from "lucide-react";
import { UserNav } from "./user-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteFooter } from "./site-footer";
import { Logo } from "@/components/brand/logo";
import { CityCombobox, type CityOption } from "@/components/shared/city-combobox";
import { cn } from "@/lib/utils";

type ShellCity = {
  id: string;
  name: string;
  slug: string;
  province: string | null;
};

type Props = {
  children: React.ReactNode;
  cities: ShellCity[];
};

export function MarketplaceShell({ children, cities }: Props) {
  const { user, profile, loading } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const cityOptions: CityOption[] = cities.map((c) => ({ name: c.name, slug: c.slug }));
  // Routes that render their own mobile sticky CTA (Call + WhatsApp). Hide the
  // global city search there so two bars don't stack at the bottom.
  const hidesGlobalMobileSearch =
    pathname?.startsWith("/cars/") ||
    /^\/vendors\/[^/]+\/[^/]+/.test(pathname ?? "");
  const isCarDetail = hidesGlobalMobileSearch;

  // Esc closes the mobile drawer + locks body scroll while it's open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">
          {/* Logo */}
          <Logo size="lg" className="shrink-0" />

          {/* Desktop city typeahead — hidden on mobile (mobile uses sticky bottom bar) */}
          <div className="hidden flex-1 md:flex md:max-w-2xl">
            <div className="w-full">
              <CityCombobox
                cities={cityOptions}
                variant="nav"
                inputId="header-city"
                inputName="city"
                placeholder="Search by city — Lahore, Karachi, Islamabad…"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {loading ? (
              <Skeleton className="h-10 w-24 rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {profile?.active_mode === "customer" && (
                  <Button
                    render={<Link href="/login" />}
                    variant="ghost"
                    size="sm"
                    className="hidden lg:flex font-bold text-ink-600 hover:text-brand-600"
                  >
                    List your car
                  </Button>
                )}
                <UserNav user={user} profile={profile} />
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex size-10 items-center justify-center rounded-xl text-ink-700 hover:bg-surface-muted md:hidden"
                >
                  <Menu className="size-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  render={<Link href="/login" />}
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex font-bold text-ink-600"
                >
                  Log in
                </Button>
                <Button
                  render={<Link href="/login" />}
                  className="hidden rounded-xl font-bold bg-ink-900 hover:bg-black sm:flex"
                >
                  List your car
                </Button>
                <button
                  type="button"
                  aria-label="Open menu"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex size-10 items-center justify-center rounded-xl text-ink-700 hover:bg-surface-muted md:hidden"
                >
                  <Menu className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-in menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span onClick={() => setMenuOpen(false)}>
                <Logo size="md" />
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-surface-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4 text-sm font-semibold text-ink-800">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
              >
                <Home className="size-4 text-brand-500" /> Home
              </Link>
              <Link
                href="/search"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
              >
                <Search className="size-4 text-brand-500" /> Browse cars
              </Link>
              <Link
                href="/car-rental-agencies"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
              >
                <Store className="size-4 text-brand-500" /> Rental agencies
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-muted"
              >
                <MessageCircle className="size-4 text-brand-500" /> Contact
              </Link>

              <div className="my-3 h-px bg-border" />

              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-center font-bold text-ink-700 ring-1 ring-border hover:bg-surface-muted"
                  >
                    My account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-center font-bold text-ink-700 ring-1 ring-border hover:bg-surface-muted"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 rounded-xl bg-ink-900 px-3 py-3 text-center font-bold text-white hover:bg-black"
                  >
                    List your car
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      {/*
        Bottom padding on mobile so the global sticky search doesn't cover content.
        On car-detail pages the global search is hidden — the listing renders its
        own pricing+WhatsApp sticky CTA, so we still keep some padding for that.
      */}
      <main
        className={cn(
          "flex-1 md:pb-0",
          isCarDetail ? "pb-20" : "pb-24",
        )}
      >
        {children}
      </main>

      <SiteFooter />

      {/* ── Mobile sticky bottom city-search (hidden on car detail) ─────── */}
      {!isCarDetail && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur md:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <CityCombobox
            cities={cityOptions}
            variant="bottom"
            inputId="mobile-city"
            inputName="city"
            placeholder="Type a city — Lahore, Karachi…"
          />
        </div>
      )}
    </div>
  );
}
