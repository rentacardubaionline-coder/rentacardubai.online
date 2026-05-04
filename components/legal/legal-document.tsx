import Link from "next/link";
import { ArrowRight, CalendarCheck, FileText } from "lucide-react";
import { GuideBlocks } from "@/components/guides/guide-blocks";
import { GuideToc } from "@/components/guides/guide-toc";
import { LEGAL_LIST, type LegalDocument } from "@/lib/legal/data";

interface LegalDocumentLayoutProps {
  doc: LegalDocument;
}

/**
 * Shared page wrapper for Privacy / Terms / Cookies. Same TOC + block
 * renderer as the guides marketplace, but with text-first chrome — no
 * photographic hero, more formal typography, prominent "last reviewed" date,
 * lawyer-disclaimer note, and a cross-link strip to the sibling docs.
 */
export function LegalDocumentLayout({ doc }: LegalDocumentLayoutProps) {
  const tocItems = doc.blocks
    .filter((b): b is Extract<typeof b, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  const siblings = LEGAL_LIST.filter((d) => d.slug !== doc.slug);

  const formattedDate = new Date(doc.lastReviewed).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="bg-surface-muted/40 pb-20">
      {/* ── Text hero (no photo — these are documents, not articles) ──── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-white/70">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-medium text-white/80 md:text-base">
            {doc.summary}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/85 ring-1 ring-white/15 backdrop-blur">
            <CalendarCheck className="h-3.5 w-3.5" />
            Last reviewed: {formattedDate}
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sticky TOC — desktop only */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <GuideToc items={tocItems} />
          </aside>

          {/* Document body */}
          <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-10">
            {/* Lawyer-disclaimer note */}
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
              <strong className="font-extrabold">Note:</strong> this document
              describes how DubaiRentACar actually operates today. We aim to keep it
              clear and accurate. It's reviewed periodically by qualified
              counsel — the date above tells you when. If something here
              conflicts with a regulation we've missed, the regulation wins;
              please email us so we can correct it.
            </div>

            <GuideBlocks blocks={doc.blocks} />
          </article>
        </div>

        {/* ── Sibling cross-links ───────────────────────────────────── */}
        <div className="mt-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-600">
            Related documents
          </p>
          <h2 className="mt-1 text-xl font-black text-ink-900 md:text-2xl">
            Other legal pages
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-brand-200"
              >
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-brand-600">
                    {s.slug === "privacy"
                      ? "Privacy"
                      : s.slug === "terms"
                        ? "Terms"
                        : "Cookies"}
                  </p>
                  <h3 className="mt-1 text-base font-black text-ink-900 group-hover:text-brand-700">
                    {s.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-500">
                    {s.summary}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA back to platform */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 px-7 py-10 text-white md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                Ready to find or list a car?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/85 md:text-base">
                Browse the marketplace, or set up a vendor account to start
                listing your fleet.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-brand-700 transition hover:bg-brand-50"
              >
                Browse cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 transition hover:bg-white/15"
              >
                Vendor sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
