"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Search, LogIn, Menu } from "lucide-react";
import { UserNav } from "./user-nav";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  children: React.ReactNode;
};

export function MarketplaceShell({ children }: Props) {
  const { user, profile, loading } = useUser();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="size-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/20">
              <span className="text-white font-bold text-sm tracking-tighter">RN</span>
            </div>
            <span className="hidden md:inline font-black text-xl text-ink-900 tracking-tight">RentNow<span className="text-brand-600">Pk</span></span>
          </Link>

          {/* Quick Search - Centered & Expanded on larger screens */}
          <div className="flex-1 max-w-2xl px-2">
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-sunken px-4 py-2 text-sm text-ink-500 transition-all hover:border-brand-300 hover:bg-white hover:ring-2 hover:ring-brand-500/10 group"
            >
              <Search className="size-4 group-hover:text-brand-600" />
              <span className="truncate">Search for brand, model, or city...</span>
            </Link>
          </div>

          {/* Right section: Auth & CTAs */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {loading ? (
              <Skeleton className="h-10 w-24 rounded-full" />
            ) : user ? (
              <div className="flex items-center gap-4">
                {/* Mode-specific CTA */}
                {profile?.active_mode === 'customer' && (
                  <Button render={<Link href="/login" />} variant="ghost" size="sm" className="hidden lg:flex font-bold text-ink-600 hover:text-brand-600">
                    List your car
                  </Button>
                )}
                <UserNav user={user} profile={profile} />
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3">
                <Button render={<Link href="/login" />} variant="ghost" size="sm" className="hidden sm:flex font-bold text-ink-600">
                  Log in
                </Button>
                <Button render={<Link href="/login" />} className="rounded-xl font-bold bg-ink-900 hover:bg-black shadow-lg shadow-black/10 transition-all active:scale-95">
                  List your car
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-sunken">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:grid-cols-5">
            {/* Column 1 */}
            <div>
              <h4 className="font-semibold text-ink-900 mb-3">Cities</h4>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <Link href="/search?city=karachi" className="hover:text-brand-600">
                    Karachi
                  </Link>
                </li>
                <li>
                  <Link href="/search?city=lahore" className="hover:text-brand-600">
                    Lahore
                  </Link>
                </li>
                <li>
                  <Link href="/search?city=islamabad" className="hover:text-brand-600">
                    Islamabad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h4 className="font-semibold text-ink-900 mb-3">Car Types</h4>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <Link href="/search?type=suv" className="hover:text-brand-600">
                    SUVs
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=sedan" className="hover:text-brand-600">
                    Sedans
                  </Link>
                </li>
                <li>
                  <Link href="/search?type=hatchback" className="hover:text-brand-600">
                    Hatchbacks
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h4 className="font-semibold text-ink-900 mb-3">Vendor</h4>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <Link href="/login" className="hover:text-brand-600">
                    List a car
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-600">
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h4 className="font-semibold text-ink-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <Link href="/contact" className="hover:text-brand-600">
                    Help center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 5 */}
            <div>
              <h4 className="font-semibold text-ink-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-ink-600">
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-600">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-ink-600">
            <p>&copy; 2026 RentNowPk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
