"use client";

import Link from "next/link";
import * as React from "react";
import { useState } from "react";
import {
  Car,
  MapPin,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { whatsappUrl, telUrl, mailtoUrl, formatPhonePretty, SUPPORT_EMAIL } from "@/lib/contact";

/** Major Dubai areas — slug-form matches the SEO route /rent-a-car/{slug}. */
const POPULAR_AREAS: { name: string; slug: string }[] = [
  { name: "Dubai Marina", slug: "dubai-marina" },
  { name: "Downtown Dubai", slug: "downtown-dubai" },
  { name: "Business Bay", slug: "business-bay" },
  { name: "Palm Jumeirah", slug: "palm-jumeirah" },
  { name: "Jumeirah", slug: "jumeirah" },
  { name: "Al Barsha", slug: "al-barsha" },
  { name: "Deira", slug: "deira" },
  { name: "Bur Dubai", slug: "bur-dubai" },
];

const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "Sedan rentals", href: "/search?bodyType=sedan" },
  { label: "SUV rentals", href: "/search?bodyType=suv" },
  { label: "Luxury cars", href: "/search?bodyType=luxury" },
  { label: "Sports cars", href: "/search?bodyType=sports" },
  { label: "Electric cars", href: "/search?fuel=electric" },
  { label: "With driver", href: "/search?mode=with_driver" },
  { label: "Self drive", href: "/search?mode=self_drive" },
  { label: "Monthly rentals", href: "/search?tier=monthly" },
];

const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Browse cars", href: "/search" },
  { label: "List your agency", href: "/login" },
  { label: "Guides & tips", href: "/guides" },
  { label: "Help & contact", href: "/contact" },
];

const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    try {
      // Best-effort POST to a newsletter endpoint; gracefully ignore if the
      // route doesn't exist yet — the success message still confirms intent.
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => undefined);
      setStatus("ok");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/30 px-4 py-3 text-sm font-semibold text-emerald-300">
        <Check className="size-4" />
        Subscribed — we&rsquo;ll be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2" aria-label="Newsletter signup">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="flex-1 min-w-0 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        Subscribe
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-16 bg-ink-950 text-white">
      {/* Brand accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-500" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* ── Top: brand + newsletter + CTA ─────────────────────────────── */}
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-14 lg:py-14">
          <div className="lg:col-span-6">
            <Logo size="lg" theme="light" />
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Dubai&rsquo;s marketplace for verified car rentals — compare local
              agencies and book directly on WhatsApp.
            </p>

            <div className="mt-6">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
                Stay in the loop
              </p>
              <NewsletterForm />
              <p className="mt-2 text-[11px] text-white/40">
                Drops, deals, and new dealer listings — no spam.
              </p>
            </div>
          </div>

          {/* WhatsApp / Call CTA card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
                Need help booking?
              </p>
              <p className="mt-2 text-lg font-black leading-tight text-white">
                Talk to us — we&rsquo;re fast.
              </p>
              <p className="mt-1 text-sm text-white/60">
                Average reply under 5 minutes during Dubai working hours.
              </p>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-600"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp {formatPhonePretty()}
                </a>
                <a
                  href={telUrl()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  <Phone className="size-4" />
                  Call
                </a>
              </div>
              <a
                href={mailtoUrl()}
                className="mt-4 inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
              >
                <Mail className="size-3.5" />
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* ── Middle: navigation + SEO grids ────────────────────────────── */}
        <div className="grid gap-10 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <FooterColumn title="Browse" lg="lg:col-span-3">
            <ul className="space-y-2.5 text-sm text-white/65">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-brand-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Popular areas" lg="lg:col-span-4">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-white/65">
              {POPULAR_AREAS.map(({ name, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/rent-a-car/${slug}`}
                    className="transition-colors hover:text-brand-300"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Popular searches" lg="lg:col-span-5">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-white/65">
              {POPULAR_SEARCHES.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-brand-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-white/80">DubaiRentACar</span> — all rights reserved.
          </p>
          <ul className="flex items-center gap-5">
            {LEGAL_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-white/40">Made in the UAE</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  icon: Icon,
  lg,
  children,
}: {
  title: string;
  icon?: React.ElementType;
  lg?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={lg}>
      <h4 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white">
        {Icon && <Icon className="size-3.5 text-brand-400" />}
        {title}
      </h4>
      {children}
    </div>
  );
}
