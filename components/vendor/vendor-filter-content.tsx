"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCity } from "@/lib/search/params";
import { X, Search, MapPin, ChevronDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface VendorFilterContentProps {
  availableCities: { city: string; count: number }[];
  onFilterChange?: () => void;
}

export function VendorFilterContent({ availableCities, onFilterChange }: VendorFilterContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const [citySearch, setCitySearch] = useState(
    searchParams.get("city") ? formatCity(searchParams.get("city")!) : "",
  );
  const [qSearch, setQSearch] = useState(searchParams.get("q") || "");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const debouncedCity = useDebounce(citySearch, 300);
  const debouncedQ = useDebounce(qSearch, 500);

  const updateUrl = useCallback(
    (city: string, q: string) => {
      const usp = new URLSearchParams();
      if (city) usp.set("city", city.toLowerCase());
      if (q) usp.set("q", q);
      router.push(`/vendors?${usp.toString()}`, { scroll: false });
      onFilterChange?.();
    },
    [router, onFilterChange],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateUrl(debouncedCity, debouncedQ);
  }, [debouncedCity, debouncedQ, updateUrl]);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCityOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dbCities = availableCities.map((c) => c.city);
  const filteredCities =
    citySearch.length > 0
      ? dbCities.filter((c) => formatCity(c).toLowerCase().includes(citySearch.toLowerCase()))
      : dbCities;

  return (
    <div className="flex flex-col items-stretch gap-2 rounded-2xl bg-white p-2 shadow-md ring-1 ring-black/5 sm:flex-row sm:items-center">
      {/* City selector */}
      <div className="relative min-w-0 flex-1" ref={cityRef}>
        <button
          type="button"
          onClick={() => setCityOpen((o) => !o)}
          className="flex h-10 w-full items-center gap-2 rounded-xl bg-surface-muted/30 px-3 text-sm text-left font-semibold text-ink-900 transition-colors hover:bg-surface-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
        >
          <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
          <span className={`flex-1 truncate ${citySearch ? "text-ink-900" : "text-ink-400 font-medium"}`}>
            {citySearch || "Any city"}
          </span>
          {citySearch ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setCitySearch("");
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : (
            <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
          )}
        </button>

        {cityOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="relative border-b border-surface-muted">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search city…"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="h-9 w-full bg-transparent pl-9 pr-3 text-sm font-medium text-ink-900 outline-none placeholder:text-ink-400"
              />
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => {
                  const isActive = citySearch.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setCitySearch(formatCity(city));
                        setCityOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold transition-colors ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-surface-muted/50"
                      }`}
                    >
                      {formatCity(city)}
                      {isActive && <span className="text-xs font-bold text-brand-500">Selected</span>}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-ink-400">No matching cities</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vertical divider on desktop only */}
      <div className="hidden h-6 w-px bg-surface-muted sm:block" />

      {/* Keyword search */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          placeholder="Search agency name…"
          value={qSearch}
          onChange={(e) => setQSearch(e.target.value)}
          className="h-10 w-full rounded-xl bg-surface-muted/30 pl-9 pr-8 text-sm font-semibold text-ink-900 outline-none transition-colors placeholder:font-medium placeholder:text-ink-400 hover:bg-surface-muted/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
        />
        {qSearch && (
          <button
            type="button"
            onClick={() => setQSearch("")}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
