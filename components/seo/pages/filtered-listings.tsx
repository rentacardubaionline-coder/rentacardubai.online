"use client";

import { useState, useMemo } from "react";
import { ListingFilterBar } from "./listing-filter-bar";
import { VehicleGrid } from "./vehicle-grid";

interface FilteredListingsProps {
  listings: any[];
  cities: { name: string; slug: string }[];
  /** Pre-select this city in the filter on mount */
  defaultCity?: string;
}

export function FilteredListings({ listings, cities, defaultCity }: FilteredListingsProps) {
  // If a default city is set, show only that city's listings initially
  const initialFiltered = useMemo(() => {
    if (!defaultCity) return listings;
    return listings.filter(
      (l: any) => l.city?.toLowerCase() === defaultCity.toLowerCase(),
    );
  }, [listings, defaultCity]);

  const [filtered, setFiltered] = useState(initialFiltered);

  return (
    <div className="space-y-5">
      <ListingFilterBar
        listings={listings}
        cities={cities}
        defaultCity={defaultCity}
        onFilter={setFiltered}
      />

      {filtered.length > 0 ? (
        <VehicleGrid listings={filtered} />
      ) : (
        <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
          <p className="text-sm font-medium text-ink-500">No cars match your filters.</p>
          <p className="mt-1 text-xs text-ink-400">Try adjusting your filters or browse all cars.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-ink-400 text-center">
          Showing {filtered.length} of {listings.length} available vehicles
        </p>
      )}
    </div>
  );
}
