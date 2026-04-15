import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";
import { getAvailableCities } from "@/lib/search/query";

export async function HeroSearch() {
  const cities = await getAvailableCities();

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

        {/* Search card */}
        <div className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 shadow-card sm:p-8">
          <form action="/search" method="GET" className="space-y-4">
            <div className="flex flex-col gap-4 w-full">
              {/* City */}
              <div className="space-y-2 text-left">
                <Label htmlFor="city" className="text-sm font-medium">
                  <MapPin className="mb-1 inline-block mr-2 size-4 text-brand-600" />
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  list="city-suggestions"
                  placeholder="Karachi, Lahore..."
                  className="h-10"
                />
                <datalist id="city-suggestions">
                  {cities.map(({ city }) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-500 hover:bg-brand-600"
            >
              <Search className="mr-2 size-5" />
              Search cars
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
