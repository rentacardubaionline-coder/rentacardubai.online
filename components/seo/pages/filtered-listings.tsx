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
  /** Published businesses in defaultCity — shown as fallback when no listings match */
  fallbackBusinesses?: any[];
}

export function FilteredListings({
  listings,
  cities,
  defaultCity,
  fallbackBusinesses = [],
}: FilteredListingsProps) {
  const initialFiltered = useMemo(() => {
    if (!defaultCity) return listings;
    return listings.filter(
      (l: any) => l.city?.toLowerCase() === defaultCity.toLowerCase(),
    );
  }, [listings, defaultCity]);

  const [filtered, setFiltered] = useState(initialFiltered);
  const [activeCity, setActiveCity] = useState(defaultCity ?? "");

  return (
    <div className="space-y-5">
      <ListingFilterBar
        listings={listings}
        cities={cities}
        defaultCity={defaultCity}
        onFilter={setFiltered}
        onCityChange={setActiveCity}
      />

      {filtered.length > 0 ? (
        <>
          <VehicleGrid listings={filtered} />
          <p className="text-xs text-ink-400 text-center">
            Showing {filtered.length} of {listings.length} available vehicles
          </p>
        </>
      ) : activeCity && fallbackBusinesses.length > 0 ? (
        <CityFallbackGrid city={activeCity} businesses={fallbackBusinesses} />
      ) : (
        <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
          <p className="text-sm font-medium text-ink-500">No cars match your filters.</p>
          <p className="mt-1 text-xs text-ink-400">
            Try adjusting your filters or browse all cars.
          </p>
        </div>
      )}
    </div>
  );
}
