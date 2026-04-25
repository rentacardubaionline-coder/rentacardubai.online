import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

/**
 * Static fallback hero — rendered by the home-page error boundary when the
 * full `<HeroSearch>` server component fails (typically because Supabase is
 * unreachable and the city-list fetch throws). Identical chrome to the live
 * hero, minus the city autocomplete dropdown — the form still posts to
 * /search so customers can keep browsing.
 */
export function HeroSearchFallback() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-[70vh] bg-gradient-to-r from-brand-50 to-orange-50 px-6 py-16">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-12 text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-900 max-w-4xl mx-auto">
            Rent a car in Pakistan
          </h1>
          <p className="mt-4 text-lg text-ink-600 max-w-2xl mx-auto">
            Find affordable car rentals from trusted vendors across major cities
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-card sm:p-8">
          <form action="/search" method="GET" className="space-y-4">
            <div>
              <Label
                htmlFor="city-fallback"
                className="text-sm font-medium text-ink-700"
              >
                City
              </Label>
              <div className="relative mt-1.5">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500"
                  aria-hidden
                />
                <Input
                  id="city-fallback"
                  name="city"
                  placeholder="Karachi, Lahore, Islamabad…"
                  className="h-12 pl-9"
                  autoComplete="off"
                />
              </div>
            </div>

            <Button type="submit" className="h-12 w-full gap-2 text-base">
              <Search className="size-4" />
              Search cars
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-500">
            Or{" "}
            <Link
              href="/search"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              browse all cars →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
