"use client";

import { useState, useMemo } from "react";
import { ListingFilterBar } from "./listing-filter-bar";
import { VehicleGrid } from "./vehicle-grid";
import { CityFallbackGrid } from "./city-fallback-grid";

interface FilteredListingsProps {
  listings: any[];
  cities: { name: string; slug: string }[];
  /** Pre-select this city in the filter on mount */
  defaultCity?: string;
  /**
   * All live businesses across every city (ranked). Client filters by active city.
   * Replaces the old city-scoped `fallbackBusinesses` so the business section
   * stays in sync as the user flips the city filter.
   */
  allBusinesses?: any[];
  /** @deprecated use `allBusinesses`. Kept so stale callers don't crash. */
  fallbackBusinesses?: any[];
}

/** Case-insensitive prefix match: "Lahore Cantt", "Lahore DHA" roll up under "Lahore" */
function businessMatchesCity(biz: any, city: string): boolean {
  const c = (biz.city ?? "").trim().toLowerCase();
  const target = city.trim().toLowerCase();
  if (!target) return true;
  return c === target || c.startsWith(target + " ");
}

export function FilteredListings({
  listings,
  cities,
  defaultCity,
  allBusinesses,
  fallbackBusinesses,
}: FilteredListingsProps) {
  const businesses = allBusinesses ?? fallbackBusinesses ?? [];

  const initialFiltered = useMemo(() => {
    if (!defaultCity) return listings;
    return listings.filter(
      (l: any) => l.city?.toLowerCase() === defaultCity.toLowerCase(),
    );
  }, [listings, defaultCity]);

  const [filtered, setFiltered] = useState(initialFiltered);
  const [activeCity, setActiveCity] = useState(defaultCity ?? "");

  const filteredBusinesses = useMemo(() => {
    if (!activeCity) return businesses;
    return businesses.filter((b: any) => businessMatchesCity(b, activeCity));
  }, [businesses, activeCity]);

  const hasCars = filtered.length > 0;
  const hasBusinesses = filteredBusinesses.length > 0;

  return (
    <div className="space-y-8">
      <ListingFilterBar
        listings={listings}
        cities={cities}
        defaultCity={defaultCity}
        onFilter={setFiltered}
        onCityChange={setActiveCity}
      />

      {/* Cars first */}
      {hasCars && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">
            Available vehicles{activeCity && ` in ${activeCity}`}
          </h2>
          <VehicleGrid listings={filtered} />
          <p className="text-xs text-ink-400 text-center">
            Showing {filtered.length} of {listings.length} vehicles
          </p>
        </section>
      )}

      {/* Businesses — always shown when the active city has any, as a complement
          (no banner) when cars also exist, as a true fallback (with banner) when
          no cars are available. */}
      {hasBusinesses && (
        <section className="space-y-3">
          {hasCars && (
            <h2 className="text-lg font-bold text-ink-900">
              Car rental agencies{activeCity && ` in ${activeCity}`}
            </h2>
          )}
          <CityFallbackGrid
            city={activeCity || "Pakistan"}
            businesses={filteredBusinesses}
            showBanner={!hasCars}
          />
        </section>
      )}

      {!hasCars && !hasBusinesses && (
        <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
          <p className="text-sm font-medium text-ink-500">
            Nothing in {activeCity || "this selection"} yet.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Try a different city or clear filters to see everything available.
          </p>
        </div>
      )}
    </div>
  );
}
