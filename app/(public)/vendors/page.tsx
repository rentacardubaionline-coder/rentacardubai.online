import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { searchBusinesses, getAvailableVendorCities } from "@/lib/vendor/query";
import { VendorCard } from "@/components/vendor/vendor-card";
import { VendorFilterContent } from "@/components/vendor/vendor-filter-content";
import { SearchSkeleton } from "@/components/search/search-skeleton";
import { formatCity } from "@/lib/search/params";
import {
  BadgeCheck,
  MessageCircle,
  Shield,
  Sparkles,
  Store,
  MapPin,
  ArrowRight,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Car Rental Agencies in Dubai — Verified Vendors | RentNow",
  description:
    "Browse verified car rental businesses in Dubai. View fleets, compare ratings, and connect directly on WhatsApp with vendors across the city.",
};

interface VendorsPageProps {
  searchParams: Promise<{
    city?: string;
    q?: string;
    page?: string;
  }>;
}

async function VendorsContent({ searchParams }: VendorsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [{ data: vendors, count, totalPages }, availableCities] =
    await Promise.all([
      searchBusinesses({ city: params.city, q: params.q, page }),
      getAvailableVendorCities(),
    ]);

  const activeCity = params.city ? formatCity(params.city) : null;
  const activeQuery = params.q?.trim() ?? "";
  const hasFilters = Boolean(activeCity || activeQuery);

  // All cities (ranked by count), minus the currently active one — rendered as
  // a horizontal scroll carousel so it stays one line on mobile.
  const cityStrip = [...availableCities]
    .sort((a, b) => b.count - a.count)
    .filter(
      (c) => !activeCity || c.city.toLowerCase() !== activeCity.toLowerCase(),
    );

  const buildPageUrl = (target: number) => {
    const usp = new URLSearchParams();
    if (params.city) usp.set("city", params.city);
    if (params.q) usp.set("q", params.q);
    usp.set("page", String(target));
    return `/vendors?${usp.toString()}`;
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-orange-50 to-amber-50">
        <div className="absolute inset-0 -z-0 opacity-40">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:pb-8 lg:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 ring-1 ring-brand-200/60 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Dubai's rental network
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              {activeCity ? (
                <>
                  Car rental agencies in{" "}
                  <span className="text-brand-600">{activeCity}</span>
                </>
              ) : (
                <>
                  Find a trusted{" "}
                  <span className="bg-gradient-to-r from-brand-600 to-orange-500 bg-clip-text text-transparent">
                    rental agency
                  </span>{" "}
                  near you
                </>
              )}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-ink-600 sm:text-lg">
              <span className="font-extrabold text-ink-900">{count}</span>{" "}
              verified {count === 1 ? "agency" : "agencies"}
              {activeCity ? ` in ${activeCity}` : " across Dubai"} — message
              them directly on WhatsApp, no sign-up needed.
            </p>

            {/* Search / filter bar — prominent, centered in hero */}
            <div className="mt-8">
              <VendorFilterContent availableCities={availableCities} />
            </div>

            {/* Active filter pills */}
            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-ink-500">
                  Active:
                </span>
                {activeCity && (
                  <Link
                    href={`/vendors${activeQuery ? `?q=${encodeURIComponent(activeQuery)}` : ""}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-700 shadow-sm ring-1 ring-surface-muted hover:text-rose-600 hover:ring-rose-200"
                  >
                    <MapPin className="h-3 w-3" />
                    {activeCity}
                    <span className="text-ink-300">·</span>
                    <span className="text-rose-500">×</span>
                  </Link>
                )}
                {activeQuery && (
                  <Link
                    href={`/vendors${activeCity ? `?city=${encodeURIComponent(params.city!)}` : ""}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-700 shadow-sm ring-1 ring-surface-muted hover:text-rose-600 hover:ring-rose-200"
                  >
                    “{activeQuery}”<span className="text-ink-300">·</span>
                    <span className="text-rose-500">×</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All-cities horizontal carousel — one row, scrolls on mobile.
            Bleeds to the viewport edges on mobile so the scroll feels native. */}
        {cityStrip.length > 0 && (
          <div className="relative pb-10">
            <div
              className="flex gap-2 overflow-x-auto px-4 py-1 sm:px-6 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory" }}
            >
              <div className="mx-auto flex min-w-max items-center gap-2">
                {cityStrip.map(({ city, count: cityCount }) => (
                  <Link
                    key={city}
                    href={`/rent-a-car/${city.toLowerCase().replace(/\s+/g, "-")}`}
                    style={{ scrollSnapAlign: "start" }}
                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-ink-700 shadow-sm ring-1 ring-surface-muted backdrop-blur transition-all hover:-translate-y-0.5 hover:text-brand-600 hover:ring-brand-200 sm:text-sm"
                  >
                    <MapPin className="h-3 w-3 text-brand-500" />
                    {formatCity(city)}
                    <span className="rounded-full bg-brand-50 px-1.5 text-[10px] font-extrabold text-brand-600 group-hover:bg-brand-100">
                      {cityCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Edge fades — visible on mobile for the scroll affordance */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-amber-50 to-transparent sm:hidden" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-amber-50 to-transparent sm:hidden" />
          </div>
        )}
      </section>

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        {vendors.length > 0 ? (
          <>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
                {activeCity ? `Agencies in ${activeCity}` : "All agencies"}
                <span className="ml-2 text-sm font-bold text-ink-400">
                  ({count})
                </span>
              </h2>
              <p className="hidden text-xs text-ink-400 sm:block">
                Page {page} of {totalPages}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor: any) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-3"
                aria-label="Pagination"
              >
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="inline-flex h-10 items-center gap-1 rounded-xl border border-surface-muted bg-white px-4 text-sm font-bold text-ink-700 hover:border-brand-300 hover:text-brand-600"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="h-10 w-24" />
                )}

                <div className="rounded-xl bg-surface-muted/40 px-4 py-2 text-xs font-extrabold text-ink-600">
                  {page} / {totalPages}
                </div>

                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="inline-flex h-10 items-center gap-1 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white hover:bg-ink-700"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="h-10 w-24" />
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-surface-muted bg-gradient-to-br from-white to-surface-muted/20 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-extrabold text-ink-900">
              No agencies match your filters
            </h3>
            <p className="mt-2 max-w-sm text-sm text-ink-500">
              Try a different city, clear your search, or explore the top cities
              above.
            </p>
            <Link
              href="/vendors"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-brand-700"
            >
              Browse all agencies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
      <section className="border-y border-surface-muted bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 text-sm sm:grid-cols-4 sm:px-6">
          {[
            {
              icon: BadgeCheck,
              label: "Verified agencies",
              sub: "Hand-checked listings",
              color: "text-emerald-500",
            },
            {
              icon: MessageCircle,
              label: "Direct WhatsApp",
              sub: "No middlemen",
              color: "text-green-500",
            },
            {
              icon: Shield,
              label: "No hidden charges",
              sub: "Transparent pricing",
              color: "text-brand-500",
            },
            {
              icon: Sparkles,
              label: "Instant contact",
              sub: "No sign-up needed",
              color: "text-amber-500",
            },
          ].map((t) => (
            <div key={t.label} className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${t.color}`}>
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink-900">{t.label}</p>
                <p className="text-xs text-ink-500">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLAIM CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-900 to-brand-900 px-6 py-12 text-white sm:px-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200 ring-1 ring-white/20">
                <Building2 className="h-3.5 w-3.5" />
                For vendors
              </span>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                Own a car rental business?
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                Claim your free listing, manage your fleet, and receive direct
                WhatsApp leads from customers across Dubai — no setup fee, no
                monthly charges.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-ink-900 shadow-xl transition-all hover:scale-[1.02] hover:bg-brand-50 active:scale-95"
            >
              List your agency free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function VendorsPage({ searchParams }: VendorsPageProps) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <VendorsContent searchParams={searchParams} />
    </Suspense>
  );
}
