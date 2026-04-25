import Link from "next/link";
import {
  MapPin,
  Car,
  Route,
  Shield,
  MessageCircle,
  BadgeCheck,
  Sparkles,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

/* Brand-accurate social glyphs — Lucide dropped these due to trademarks. */
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.22.41.56.22.96.48 1.38.9s.68.82.9 1.38c.16.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.22-.22.56-.48.96-.9 1.38s-.82.68-1.38.9c-.42.16-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.22-.41a3.74 3.74 0 0 1-1.38-.9 3.74 3.74 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.22C2.2 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.22.22-.56.48-.96.9-1.38s.82-.68 1.38-.9c.42-.16 1.05-.36 2.22-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5.01-4.74.07-1 .05-1.54.21-1.9.35-.48.18-.82.4-1.19.76-.36.37-.58.71-.76 1.19-.14.36-.3.9-.35 1.9C3 8.5 3 8.86 3 12s.01 3.5.07 4.74c.05 1 .21 1.54.35 1.9.18.48.4.82.76 1.19.37.36.71.58 1.19.76.36.14.9.3 1.9.35 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1-.05 1.54-.21 1.9-.35.48-.18.82-.4 1.19-.76.36-.37.58-.71.76-1.19.14-.36.3-.9.35-1.9.06-1.24.07-1.6.07-4.74s-.01-3.5-.07-4.74c-.05-1-.21-1.54-.35-1.9a3.2 3.2 0 0 0-.76-1.19 3.2 3.2 0 0 0-1.19-.76c-.36-.14-.9-.3-1.9-.35C15.5 4 15.14 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2.3a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.9 3H22l-7.5 8.57L23 21h-6.86l-5.35-7.05L4.6 21H1.5l8.04-9.18L1 3h7.06l4.83 6.4L18.9 3Zm-2.4 16.2h1.74L7.68 4.72H5.85L16.5 19.2Z" />
  </svg>
);

/** Major Pakistani cities — slug-form matches the /rent-a-car/{slug} SEO route. */
const POPULAR_CITIES = [
  { name: "Karachi", slug: "karachi" },
  { name: "Lahore", slug: "lahore" },
  { name: "Islamabad", slug: "islamabad" },
  { name: "Rawalpindi", slug: "rawalpindi" },
  { name: "Faisalabad", slug: "faisalabad" },
  { name: "Multan", slug: "multan" },
  { name: "Peshawar", slug: "peshawar" },
  { name: "Quetta", slug: "quetta" },
];

const POPULAR_ROUTES = [
  { from: "Lahore", to: "Islamabad", slug: "lahore-to-islamabad" },
  { from: "Karachi", to: "Hyderabad", slug: "karachi-to-hyderabad" },
  { from: "Islamabad", to: "Murree", slug: "islamabad-to-murree" },
  { from: "Lahore", to: "Karachi", slug: "lahore-to-karachi" },
  { from: "Rawalpindi", to: "Naran", slug: "rawalpindi-to-naran" },
  { from: "Islamabad", to: "Skardu", slug: "islamabad-to-skardu" },
];

const VEHICLE_TYPES = [
  { label: "Sedan rentals", href: "/search?bodyType=sedan" },
  { label: "SUV rentals", href: "/search?bodyType=suv" },
  { label: "Hatchback rentals", href: "/search?bodyType=hatchback" },
  { label: "Luxury cars", href: "/search?bodyType=luxury" },
  { label: "Electric cars", href: "/search?fuel=electric" },
  { label: "With-driver service", href: "/search?mode=with_driver" },
  { label: "Self-drive cars", href: "/search?mode=self_drive" },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, label: "Verified vendors", color: "text-emerald-400" },
  { icon: MessageCircle, label: "Direct WhatsApp booking", color: "text-green-400" },
  { icon: Shield, label: "No hidden charges", color: "text-brand-400" },
  { icon: Sparkles, label: "Instant confirmation", color: "text-amber-400" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-10 overflow-hidden bg-ink-900 text-white">
      {/* Soft gradient orbs for marketplace ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-6 sm:grid-cols-4 sm:px-6">
          {TRUST_ITEMS.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5">
              <t.icon className={`size-5 shrink-0 ${t.color}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main columns ───────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-12">
          {/* Brand block */}
          <div className="col-span-2 lg:col-span-4">
            <Logo size="lg" theme="light" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Pakistan's marketplace for verified car rentals. Compare local agencies, chat directly
              on WhatsApp, and drive away with a small advance — no middlemen, no hidden fees.
            </p>

            {/* CTA button */}
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-ink-900 shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-50"
            >
              <Car className="size-4" />
              List your agency free
            </Link>

            {/* Social
            <div className="mt-6 flex items-center gap-2">
              {[
                { Icon: FacebookIcon, href: "#", label: "Facebook" },
                { Icon: InstagramIcon, href: "#", label: "Instagram" },
                { Icon: TwitterIcon, href: "#", label: "Twitter" },
                { Icon: Mail, href: "/contact", label: "Contact us" },
              ].map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div> */}
          </div>

          {/* Popular cities */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white">
              <MapPin className="size-3.5 text-brand-400" />
              Popular cities
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/60 sm:block sm:space-y-2">
              {POPULAR_CITIES.map(({ name, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/rent-a-car/${slug}`}
                    className="hover:text-brand-300 transition-colors"
                  >
                    Car rental {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular routes */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-white">
              <Route className="size-3.5 text-brand-400" />
              Popular routes
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              {POPULAR_ROUTES.map(({ from, to, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/routes/${slug}`}
                    className="hover:text-brand-300 transition-colors"
                  >
                    {from} <span className="text-white/30">→</span> {to}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform + contact */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>
                <Link href="/search" className="hover:text-brand-300 transition-colors">
                  Browse all cars
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-300 transition-colors">
                  List your agency
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-300 transition-colors">
                  Help &amp; contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-brand-300 transition-colors">
                  About us
                </Link>
              </li>
            </ul>

            <h4 className="mb-3 mt-6 text-xs font-extrabold uppercase tracking-widest text-white">
              Get in touch
            </h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a
                  href="mailto:help@rentnowpk.com"
                  className="inline-flex items-center gap-2 hover:text-brand-300 transition-colors"
                >
                  <Mail className="size-3.5 text-brand-400" />
                  help@rentnowpk.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/923144174625"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-brand-300 transition-colors"
                >
                  <MessageCircle className="size-3.5 text-green-400" />
                  +92 314 4174625
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Vehicle types row — full-width chips ─────────────────────── */}
        <div className="mt-10 border-t border-white/10 pt-8">
          <h4 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/80">
            Browse by category
          </h4>
          <div className="flex flex-wrap gap-2">
            {VEHICLE_TYPES.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/70 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-white/50 sm:flex-row sm:px-6">
          <p>
            © 2026 <span className="font-bold text-white/80">RentNowPk</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-white">
              Privacy policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms of service
            </Link>
            <Link href="#" className="hover:text-white">
              Cookies
            </Link>
          </div>
          <p className="text-white/40">Made with care in Pakistan 🇵🇰</p>
        </div>
      </div>
    </footer>
  );
}
