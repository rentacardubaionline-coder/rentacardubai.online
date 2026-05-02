import Link from "next/link";
import { Car, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
      <div className="bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 via-white to-surface-muted px-8 py-12 md:py-16 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-black/5">
            <Car className="h-10 w-10 text-brand-500" />
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-black tracking-tight text-ink-900">
            This car isn&rsquo;t available right now
          </h1>
          <p className="mt-3 max-w-md mx-auto text-sm md:text-base text-ink-600 leading-relaxed">
            It may have been booked, archived by the dealer, or the link is no
            longer valid. Browse hundreds of similar cars across Dubai &mdash; we
            update inventory in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-sm font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition-colors"
            >
              <Search className="size-4" />
              Browse all cars
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-6 text-sm font-bold text-ink-700 hover:bg-surface-muted transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
