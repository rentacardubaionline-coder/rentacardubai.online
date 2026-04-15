import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Search } from "lucide-react";

export function HeroSearch() {
  return (
    <div className="relative bg-gradient-to-r from-brand-50 to-orange-50 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink-900">
            Rent a car in Pakistan
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            Find affordable car rentals from trusted vendors across major cities
          </p>
        </div>

        {/* Search card */}
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-card sm:p-8">
          <form action="/search" method="GET" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">
                  <MapPin className="mb-1 inline-block mr-2 size-4 text-brand-600" />
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="Karachi, Lahore..."
                  className="h-10"
                />
              </div>

              {/* From date */}
              <div className="space-y-2">
                <Label htmlFor="from" className="text-sm font-medium">
                  <Calendar className="mb-1 inline-block mr-2 size-4 text-brand-600" />
                  From
                </Label>
                <Input
                  id="from"
                  name="from"
                  type="date"
                  className="h-10"
                />
              </div>

              {/* To date */}
              <div className="space-y-2">
                <Label htmlFor="to" className="text-sm font-medium">
                  <Calendar className="mb-1 inline-block mr-2 size-4 text-brand-600" />
                  To
                </Label>
                <Input
                  id="to"
                  name="to"
                  type="date"
                  className="h-10"
                />
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
