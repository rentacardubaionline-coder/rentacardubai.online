import Link from "next/link";
import {
  MapPin, Shield, MessageCircle, ChevronRight,
  Car, CheckCircle2, ArrowRight, Clock, Star,
  Users, Zap, BadgeCheck, Headphones,
} from "lucide-react";
import { FaqAccordion } from "./faq-accordion";
import { FilteredListings } from "./filtered-listings";
import type { FaqItem } from "@/lib/seo/routes-config";

interface KeywordLandingProps {
  h1: string;
  keyword: { slug: string; label: string };
  cities: { id: string; name: string; slug: string }[];
  listings: any[];
  faqs: FaqItem[];
}

const FEATURED_CITY_SLUGS = [
  "lahore", "karachi", "islamabad", "rawalpindi", "faisalabad",
  "multan", "peshawar", "quetta",
];

export function KeywordLanding({ h1, keyword, cities, listings, faqs }: KeywordLandingProps) {
  const featuredCities = cities.filter((c) => FEATURED_CITY_SLUGS.includes(c.slug));
  const otherCities = cities.filter((c) => !FEATURED_CITY_SLUGS.includes(c.slug));
  const totalListings = listings.length;

  return (
    <div className="space-y-12">

      {/* ── Compact Header ──────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-xl md:text-2xl font-bold text-ink-900">
          {h1}
        </h1>
        <p className="mt-1 text-sm text-ink-500 max-w-2xl">
          Compare {totalListings > 0 ? `${totalListings}+` : ""} verified rental vehicles across Pakistan.
          Browse real photos, transparent prices — book via WhatsApp with a small advance.
        </p>
      </header>

      {/* ── Listings with Filters ───────────────────────────────────────────── */}
      <FilteredListings listings={listings} cities={cities} />

      {/* ── Inline Trust Strip ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 py-4 border-y border-surface-muted text-sm text-ink-600">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Verified Vendors Only
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4 text-green-500" />
          Book via WhatsApp
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-brand-500" />
          No Hidden Charges
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-amber-500" />
          Instant Confirmation
        </span>
      </div>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-br from-brand-50/80 to-brand-100/40 border border-brand-100 p-6 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-ink-900">
            How to {keyword.label} in Pakistan
          </h2>
          <p className="mt-1 text-sm text-ink-500">No sign-up needed. No app download. Just WhatsApp and go.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {[
            {
              icon: Car,
              step: "01",
              title: "Pick Your Car",
              desc: "Browse vehicles by city, model, or budget. Every listing has real photos, verified prices, and vendor reviews.",
              color: "bg-brand-600 text-white",
            },
            {
              icon: MessageCircle,
              step: "02",
              title: "WhatsApp the Vendor",
              desc: "Tap WhatsApp to message the vendor directly. Share your travel dates, ask questions, and confirm availability in minutes.",
              color: "bg-emerald-600 text-white",
            },
            {
              icon: Zap,
              step: "03",
              title: "Pay a Small Advance & Go",
              desc: "Lock your booking with a small advance payment. The rest is paid at pickup. No hidden charges — ever.",
              color: "bg-amber-500 text-white",
            },
          ].map((item) => (
            <div key={item.step} className="relative rounded-2xl bg-white p-6 shadow-card">
              <span className="absolute top-4 right-5 text-5xl font-black text-surface-muted/80 select-none leading-none">
                {item.step}
              </span>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color} mb-4 shadow-sm`}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse by City ──────────────────────────────────────────────────── */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ink-900">
            {keyword.label} by City
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Select your city to browse local vendors and available vehicles.
          </p>
        </div>

        {/* Featured cities — card style */}
        {featuredCities.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {featuredCities.map((city) => (
              <Link
                key={city.id}
                href={`/${keyword.slug}/${city.slug}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-b from-brand-50 to-brand-100/50 border border-brand-100 p-5 h-32 transition-all hover:shadow-lg hover:border-brand-300 hover:-translate-y-0.5"
              >
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <MapPin className="h-4 w-4 text-brand-500 mb-2" />
                <h3 className="font-bold text-ink-900 text-lg leading-tight">{city.name}</h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  {keyword.label} in {city.name}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Other cities — compact tags */}
        {otherCities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {otherCities.map((city) => (
              <Link
                key={city.id}
                href={`/${keyword.slug}/${city.slug}`}
                className="rounded-lg border border-surface-muted bg-white px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Browse by Vehicle Type ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Vehicles for Every Need
        </h2>
        <p className="text-sm text-ink-500 mb-6">
          From budget hatchbacks to luxury SUVs — find the right ride for your trip.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Car, label: "Economy Cars", sub: "Alto, Cultus, Mehran", price: "PKR 3,500+/day", href: "/search", color: "bg-emerald-50 text-emerald-600" },
            { icon: Car, label: "Sedans", sub: "Corolla, Civic, City", price: "PKR 5,000+/day", href: "/search", color: "bg-brand-50 text-brand-600" },
            { icon: Car, label: "SUVs & 4x4", sub: "Fortuner, Prado, Tucson", price: "PKR 10,000+/day", href: "/search", color: "bg-amber-50 text-amber-600" },
            { icon: Users, label: "Vans & Coaster", sub: "Hiace, Coaster, Bolan", price: "PKR 8,000+/day", href: "/search", color: "bg-purple-50 text-purple-600" },
            { icon: Users, label: "With Driver", sub: "Professional local drivers", price: "Fuel included", href: "/car-rental-with-driver", color: "bg-sky-50 text-sky-600" },
            { icon: Car, label: "Self Drive", sub: "CNIC + License needed", price: "Budget rates", href: "/self-drive-car-rental", color: "bg-rose-50 text-rose-600" },
            { icon: Car, label: "Airport Transfer", sub: "24/7 pick & drop", price: "Flight tracking", href: "/airport-transfer", color: "bg-indigo-50 text-indigo-600" },
            { icon: Star, label: "Wedding Cars", sub: "Luxury & decorated", price: "Premium service", href: "/wedding-car-rental", color: "bg-pink-50 text-pink-600" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group rounded-2xl border border-surface-muted bg-white p-4 transition-all hover:border-brand-200 hover:shadow-card"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color} mb-3`}>
                <item.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-600 transition-colors">
                {item.label}
              </h3>
              <p className="text-[11px] text-ink-400 mt-0.5">{item.sub}</p>
              <p className="text-xs font-semibold text-brand-600 mt-2">{item.price}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Why Choose RentNowPK ────────────────────────────────────────────── */}
      <section className="rounded-3xl overflow-hidden">
        <div className="bg-ink-900 p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Why Thousands Choose RentNowPK
            </h2>
            <p className="mt-2 text-sm text-ink-400 max-w-lg mx-auto">
              We&apos;re not a rental company — we&apos;re a marketplace connecting you with the best local vendors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: BadgeCheck,
                title: "Verified Vendors",
                desc: "Every vendor submits CNIC and business docs. We verify before they go live on the platform.",
                accent: "from-emerald-500/20 to-emerald-500/5",
                iconBg: "bg-emerald-500/20 text-emerald-400",
              },
              {
                icon: Star,
                title: "Real Customer Reviews",
                desc: "Ratings from real customers who rented. Know exactly what you're getting before you book.",
                accent: "from-amber-500/20 to-amber-500/5",
                iconBg: "bg-amber-500/20 text-amber-400",
              },
              {
                icon: Users,
                title: "Compare Multiple Vendors",
                desc: "Don't settle for one quote. See prices from multiple verified vendors side by side.",
                accent: "from-brand-500/20 to-brand-500/5",
                iconBg: "bg-brand-500/20 text-brand-400",
              },
              {
                icon: Headphones,
                title: "WhatsApp Support",
                desc: "Message vendors directly on WhatsApp. No forms, no apps, no call centers. Confirm in minutes.",
                accent: "from-green-500/20 to-green-500/5",
                iconBg: "bg-green-500/20 text-green-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl bg-gradient-to-b ${item.accent} border border-white/5 p-5`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg} mb-4`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="mt-2 text-xs text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-ink-900 mb-5">
            Frequently Asked Questions
          </h2>
          <FaqAccordion faqs={faqs} />
        </section>
      )}

      {/* ── SEO Footer Text ────────────────────────────────────────────────── */}
      <section className="border-t border-surface-muted pt-8 space-y-4 text-xs text-ink-400 leading-relaxed">
        <h2 className="text-sm font-semibold text-ink-600">
          {keyword.label} in Pakistan — Compare & Book
        </h2>
        <p>
          RentNowPK is Pakistan&apos;s car rental comparison marketplace. We connect travellers with
          verified local rental vendors across {cities.length}+ cities including Lahore, Karachi,
          Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, and Quetta. Whether you need a car
          for a day, a week, or a month — with driver or self-drive — you can compare real prices
          from multiple vendors and book directly via WhatsApp.
        </p>
        <p>
          Every vendor on RentNowPK is identity-verified with CNIC documentation. You&apos;ll see
          real vehicle photos, transparent pricing, and honest customer reviews. Book with a small
          advance payment — no hidden charges, no middlemen. Available vehicles include economy cars
          (Suzuki Alto, Cultus, Mehran), sedans (Toyota Corolla, Honda Civic, Honda City), SUVs
          (Toyota Fortuner, Toyota Prado, Hyundai Tucson), and commercial vehicles (Toyota Hiace,
          Coaster, Bolan) for group travel.
        </p>
        <p>
          Popular services include {keyword.label.toLowerCase()} for city drives, outstation trips,
          airport transfers, wedding car rental, and tour packages to northern Pakistan (Skardu,
          Hunza, Gilgit, Murree, Swat). Compare vendors, check availability, and reserve your ride
          in minutes.
        </p>
      </section>
    </div>
  );
}
