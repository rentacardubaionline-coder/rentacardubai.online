"use client";

import { useState, useMemo } from "react";
import { ListingFilterBar } from "./listing-filter-bar";
import { VehicleGrid } from "./vehicle-grid";

interface FilteredListingsProps {
  listings: any[];
  cities: { name: string; slug: string }[];
  /** Pre-select this city in the filter on mount */
  defaultCity?: string;
  /**
   * @deprecated Vendors / agencies are no longer shown in template-page
   * results; only car listings render. Props are kept so existing callers
   * don't crash, but the values are ignored.
   */
  allBusinesses?: any[];
  /** @deprecated see `allBusinesses`. */
  fallbackBusinesses?: any[];
}

export function FilteredListings({
  listings,
  cities,
  defaultCity,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allBusinesses: _allBusinesses,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallbackBusinesses: _fallbackBusinesses,
}: FilteredListingsProps) {
  const initialFiltered = useMemo(() => {
    if (!defaultCity) return listings;
    return listings.filter(
      (l: any) => l.city?.toLowerCase() === defaultCity.toLowerCase(),
    );
  }, [listings, defaultCity]);

  const [filtered, setFiltered] = useState(initialFiltered);
  const [activeCity, setActiveCity] = useState(defaultCity ?? "");

  const hasCars = filtered.length > 0;

  return (
    <div className="space-y-8">
      <ListingFilterBar
        listings={listings}
        cities={cities}
        defaultCity={defaultCity}
        onFilter={setFiltered}
        onCityChange={setActiveCity}
      />

      {hasCars ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink-900">
            Available vehicles{activeCity && ` in ${activeCity}`}
          </h2>
          <VehicleGrid listings={filtered} />
          <p className="text-xs text-ink-400 text-center">
            Showing {filtered.length} of {listings.length} vehicles
          </p>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
          <p className="text-sm font-medium text-ink-500">
            No cars in {activeCity || "this selection"} yet.
          </p>
          <p className="mt-1 text-xs text-ink-400">
            Try a different city or clear filters to see everything available.
          </p>
        </div>
      )}
    </div>
  );
}
