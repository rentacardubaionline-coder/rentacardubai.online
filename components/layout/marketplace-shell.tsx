"use client";

import Link from "next/link";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Search, LogIn, Menu } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export function MarketplaceShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="size-8 rounded bg-brand-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">RN</span>
            </div>
            <span className="hidden sm:inline font-bold text-ink-900">RentNowPk</span>
          </Link>

          {/* Search trigger (mobile optimized) */}
          <Link
            href="/search"
            className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-ink-500 transition-colors hover:border-brand-300 hover:bg-surface"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Search cars...</span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink-600 hover:text-brand-600">
              <LogIn className="size-4" />
              Sign in
            </Link>
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="size-4" />
            </Button>
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
