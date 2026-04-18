"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, Search, X, MapPin } from "lucide-react";

interface FilterBarProps {
  listings: any[];
  cities: { name: string; slug: string }[];
  defaultCity?: string;
  onFilter: (filtered: any[]) => void;
}

export function ListingFilterBar({ listings, cities, defaultCity, onFilter }: FilterBarProps) {
  const [city, setCity] = useState(defaultCity ?? "");
  const [transmission, setTransmission] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [mode, setMode] = useState("");

  // City search state
  const [cityQuery, setCityQuery] = useState(defaultCity ?? "");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build full city list: DB cities first, then any extras from listings
  const allCityNames = useMemo(() => {
    const dbCities = cities.map((c) => c.name);
    const fromListings = listings.map((l: any) => l.city as string).filter(Boolean);
    return Array.from(new Set([...dbCities, ...fromListings])).sort();
  }, [listings, cities]);

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim() || cityQuery === city) return allCityNames;
    const q = cityQuery.toLowerCase();
    return allCityNames.filter((c) => c.toLowerCase().includes(q));
  }, [cityQuery, city, allCityNames]);

  const applyFilters = (c: string, t: string, p: string, m: string) => {
    let result = [...listings];
    if (c) result = result.filter((l: any) => l.city?.toLowerCase() === c.toLowerCase());
    if (t) result = result.filter((l: any) => l.transmission === t);
    if (p) {
      result = result.filter((l: any) => {
        const daily = (l.pricing ?? []).find((pr: any) => pr.tier === "daily");
        if (!daily) return false;
        const price = daily.price_pkr;
        if (p === "under5k") return price <= 5000;
        if (p === "5k-10k") return price > 5000 && price <= 10000;
        if (p === "10k-20k") return price > 10000 && price <= 20000;
        if (p === "20k+") return price > 20000;
        return true;
      });
    }
    if (m) {
      result = result.filter((l: any) => {
        const modes = (l.mode ?? []).map((md: any) => md.mode);
        return modes.includes(m);
      });
    }
    onFilter(result);
  };

  const selectCity = (name: string) => {
    setCity(name);
    setCityQuery(name);
    setCityOpen(false);
    applyFilters(name, transmission, priceRange, mode);
  };

  const clearCity = () => {
    setCity("");
    setCityQuery("");
    applyFilters("", transmission, priceRange, mode);
  };

  const hasFilters = city || transmission || priceRange || mode;

  const clearAll = () => {
    setCity(""); setCityQuery(""); setTransmission(""); setPriceRange(""); setMode("");
    onFilter(listings);
  };

  return (
    <div className="rounded-xl border border-surface-muted bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">

        {/* City search input */}
        <div ref={cityRef} className="relative">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 h-4 w-4 text-brand-500 pointer-events-none" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => { setCityQuery(e.target.value); setCityOpen(true); }}
              onFocus={() => setCityOpen(true)}
              placeholder="Search city..."
              className="h-10 w-56 sm:w-64 rounded-lg border border-surface-muted bg-surface-muted/30 pl-9 pr-8 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all"
            />
            {city ? (
              <button type="button" onClick={clearCity} className="absolute right-2 text-ink-400 hover:text-ink-600">
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
            )}
          </div>

          {/* City dropdown */}
          {cityOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-56 max-h-60 overflow-y-auto rounded-xl border border-surface-muted bg-white shadow-lg">
              {filteredCities.length === 0 ? (
                <p className="px-4 py-3 text-sm text-ink-400">No cities found</p>
              ) : (
                filteredCities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => selectCity(c)}
                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors hover:bg-brand-50 ${
                      city === c ? "bg-brand-50 text-brand-700 font-medium" : "text-ink-700"
                    }`}
                  >
                    <MapPin className="h-3 w-3 text-ink-400 shrink-0" />
                    {c}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Transmission */}
        <div className="relative">
          <select
            value={transmission}
            onChange={(e) => { setTransmission(e.target.value); applyFilters(city, e.target.value, priceRange, mode); }}
            className="h-10 appearance-none rounded-lg border border-surface-muted bg-surface-muted/30 pl-3 pr-8 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all cursor-pointer"
          >
            <option value="">Transmission</option>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
        </div>

        {/* Price */}
        <div className="relative">
          <select
            value={priceRange}
            onChange={(e) => { setPriceRange(e.target.value); applyFilters(city, transmission, e.target.value, mode); }}
            className="h-10 appearance-none rounded-lg border border-surface-muted bg-surface-muted/30 pl-3 pr-8 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all cursor-pointer"
          >
            <option value="">Price Range</option>
            <option value="under5k">Under PKR 5,000/day</option>
            <option value="5k-10k">PKR 5,000 – 10,000</option>
            <option value="10k-20k">PKR 10,000 – 20,000</option>
            <option value="20k+">PKR 20,000+</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
        </div>

        {/* Driver option */}
        <div className="relative">
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value); applyFilters(city, transmission, priceRange, e.target.value); }}
            className="h-10 appearance-none rounded-lg border border-surface-muted bg-surface-muted/30 pl-3 pr-8 text-sm text-ink-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 transition-all cursor-pointer"
          >
            <option value="">Driver Option</option>
            <option value="with_driver">With Driver</option>
            <option value="self_drive">Self Drive</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-lg border border-surface-muted px-3 h-10 text-xs font-medium text-ink-500 hover:text-ink-900 hover:bg-surface-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
