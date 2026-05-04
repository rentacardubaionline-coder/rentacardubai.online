import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllGuides, getGuidesByCategory } from "@/lib/guides/get";
import { GUIDE_CATEGORIES, type GuideCategory } from "@/lib/guides/data";
import { GuideCard } from "@/components/guides/guide-card";
import { GuideCategoryTabs } from "@/components/guides/guide-category-tabs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Car Rental Guides — Tips for Renters & Vendors | DubaiRentACar",
  description:
    "Practical guides for renting and listing cars in Dubai — pricing, documents, route planning, and how to grow your rental business on DubaiRentACar.",

  alternates: { canonical: "https://www.rentacardubai.online/guides" },
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

function isCategoryKey(s: string | undefined): s is GuideCategory | "all" {
  return (
    s === "for-renters" || s === "for-vendors" || s === "all" || s === undefined
  );
}

export default async function GuidesIndexPage({ searchParams }: PageProps) {
  const { category: rawCategory } = await searchParams;
  const category: GuideCategory | "all" = isCategoryKey(rawCategory)
    ? (rawCategory ?? "all")
    : "all";

  const all = getAllGuides();
  const filtered = getGuidesByCategory(category);

  // Counts for the category tabs
  const counts: Record<GuideCategory | "all", number> = {
    all: all.length,
    "for-renters": all.filter((g) => g.category === "for-renters").length,
    "for-vendors": all.filter((g) => g.category === "for-vendors").length,
  };

  const helper =
    GUIDE_CATEGORIES.find((c) => c.key === category)?.helper ??
    GUIDE_CATEGORIES[0].helper;

  return (
    <main className="bg-surface-muted/40 pb-20">
      {/* ── Branded hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800">
        {/* Decorative orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-300/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/80">
            DubaiRentACar Guides
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            Practical guides for renters and vendors
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-white/85 md:text-lg">
            Honest, no-fluff advice from the team running Dubai's verified
            car-rental marketplace. Pricing, documents, photos, response time —
            the things that actually move the needle.
          </p>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Category tabs */}
        <div className="-mt-6 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/5 md:p-4">
          <GuideCategoryTabs counts={counts} />
          <p className="mt-3 px-1 text-xs font-medium text-ink-500">{helper}</p>
        </div>

        {/* Card grid */}
        <div className="mt-8">
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-surface-muted bg-white px-6 py-16 text-center">
              <p className="text-sm font-bold text-ink-900">
                No guides in this category yet
              </p>
              <p className="mt-1 text-xs text-ink-500">
                We're publishing more soon. Check back next week.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          )}
        </div>

        {/* CTA back to platform */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 px-7 py-10 text-white md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                Ready to find a car?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
                Browse verified rental vendors across Dubai and book in minutes
                via WhatsApp.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-ink-900 transition hover:bg-brand-50"
            >
              Browse cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
