import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, CalendarDays } from "lucide-react";
import {
  getAllGuides,
  getGuideBySlug,
  getRelatedGuides,
} from "@/lib/guides/get";
import { GuideBlocks } from "@/components/guides/guide-blocks";
import { GuideToc } from "@/components/guides/guide-toc";
import { GuideCard } from "@/components/guides/guide-card";
import { GuideHero } from "@/components/guides/guide-hero";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found — RentNowPK" };

  const canonical = `https://www.rentacardubai.online/guides/${guide.slug}`;

  return {
    title: `${guide.title} | RentNowPK Guides`,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      type: "article",
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt ?? guide.publishedAt,
      authors: [guide.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  };
}

const CATEGORY_LABELS = {
  "for-renters": "For Renters",
  "for-vendors": "For Vendors",
} as const;

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const related = getRelatedGuides(slug, 3);

  // TOC entries — every h2 with an id becomes a section anchor
  const tocItems = guide.blocks
    .filter((b): b is Extract<typeof b, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));

  // Article structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    image: guide.heroImage ? [guide.heroImage] : undefined,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    author: { "@type": "Organization", name: "RentNowPK" },
    publisher: {
      "@type": "Organization",
      name: "RentNowPK",
      logo: {
        "@type": "ImageObject",
        url: "https://www.rentacardubai.online/icon",
      },
    },
    mainEntityOfPage: `https://www.rentacardubai.online/guides/${guide.slug}`,
  };

  return (
    <main className="bg-surface-muted/40 pb-20">
      <JsonLd data={articleSchema} />

      {/* ── Hero — branded gradient + topic icon. Replaces the old photo-
          based hero so guide pages never have loading issues. */}
      <section className="relative overflow-hidden">
        <GuideHero topic={guide.topic} size="detail" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/15 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 px-4 pb-7 sm:px-6 md:pb-10">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All guides
            </Link>
            <span className="mt-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur">
              {CATEGORY_LABELS[guide.category]}
            </span>
            <h1 className="mt-3 max-w-3xl text-2xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
              {guide.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/85">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {guide.readMins} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(guide.publishedAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>By {guide.author.name}</span>
            </div>
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

          {/* Article body */}
          <article className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-black/5 md:p-10">
            {/* Lede */}
            <p className="border-l-4 border-brand-500 pl-4 text-lg font-medium leading-relaxed text-ink-700 md:text-xl">
              {guide.description}
            </p>
            <div className="mt-8">
              <GuideBlocks blocks={guide.blocks} />
            </div>
          </article>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-600">
                  Keep reading
                </p>
                <h2 className="mt-1 text-xl font-black text-ink-900 md:text-2xl">
                  More {CATEGORY_LABELS[guide.category].toLowerCase()}
                </h2>
              </div>
              <Link
                href={`/guides?category=${guide.category}`}
                className="hidden items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 sm:inline-flex"
              >
                See all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((g) => (
                <GuideCard key={g.slug} guide={g} />
              ))}
            </div>
          </div>
        )}

        {/* CTA back to platform */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700 px-7 py-10 text-white md:px-12 md:py-14">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-black md:text-3xl">
                Find your next car on RentNowPK
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
                Verified vendors, transparent pricing, instant WhatsApp booking
                — across every major Pakistani city.
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
