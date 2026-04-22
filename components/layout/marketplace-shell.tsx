"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Home, Store, MessageCircle, MapPin } from "lucide-react";
import { UserNav } from "./user-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteFooter } from "./site-footer";

type Props = {
  children: React.ReactNode;
};

export function MarketplaceShell({ children }: Props) {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCity, setMobileCity] = useState("");
  const [desktopCity, setDesktopCity] = useState("");

  function goToSearch(value: string) {
    const v = value.trim();
    router.push(v ? `/search?city=${encodeURIComponent(v.toLowerCase())}` : "/search");
  }

  function handleMobileSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    goToSearch(mobileCity);
  }

  function handleDesktopSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    goToSearch(desktopCity);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 shadow-md shadow-brand-600/20">
              <span className="text-sm font-bold tracking-tighter text-white">RN</span>
            </div>
            <span className="font-black text-xl tracking-tight text-ink-900">
              RentNow<span className="text-brand-600">Pk</span>
            </span>
          </Link>

          {/* Desktop inline search — hidden on mobile (mobile uses sticky bottom bar) */}
          <form
            onSubmit={handleDesktopSearch}
            className="relative hidden flex-1 items-center rounded-xl border border-border bg-surface-sunken transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 md:flex md:max-w-2xl"
          >
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-brand-500" />
            <input
              type="text"
              value={desktopCity}
              onChange={(e) => setDesktopCity(e.target.value)}
              placeholder="Search by city — Lahore, Karachi, Islamabad…"
              autoComplete="off"
              className="h-10 w-full bg-transparent pl-10 pr-24 text-sm text-ink-900 placeholder:text-ink-400 outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 inline-flex h-8 items-center rounded-lg bg-ink-900 px-3 text-xs font-bold text-white hover:bg-black"
            >
              Search
            </button>
          </form>

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
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600">
                  <span className="text-sm font-bold tracking-tighter text-white">RN</span>
                </div>
                <span className="font-black text-lg text-ink-900">
                  RentNow<span className="text-brand-600">Pk</span>
                </span>
              </Link>
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
      {/* Bottom padding on mobile so sticky search doesn't cover content */}
      <main className="flex-1 pb-24 md:pb-0">{children}</main>

      <SiteFooter />

      {/* ── Mobile sticky bottom city-search ─────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)] backdrop-blur md:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <form
          onSubmit={handleMobileSearch}
          className="flex items-center rounded-2xl bg-surface-sunken pl-3 pr-1 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20"
        >
          <MapPin className="size-4 shrink-0 text-brand-500" />
          <input
            type="text"
            value={mobileCity}
            onChange={(e) => setMobileCity(e.target.value)}
            placeholder="Type a city — Lahore, Karachi…"
            autoComplete="off"
            className="h-11 flex-1 bg-transparent px-2.5 text-sm font-medium text-ink-900 placeholder:text-ink-400 outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95"
          >
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
