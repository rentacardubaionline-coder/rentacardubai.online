"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CITIES,
  formatCity,
  buildSearchParams,
  type SearchParams,
} from "@/lib/search/params";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface FilterContentProps {
  initialParams: SearchParams;
  onFilterChange?: () => void;
}

export function FilterContent({ initialParams, onFilterChange }: FilterContentProps) {
  const router = useRouter();
  const isFirstRender = useRef(true);

  // Local state for all filters
  const [filters, setFilters] = useState<Partial<SearchParams>>(initialParams);

  // Use values for debouncing
  const debouncedQ = useDebounce(filters.q, 500);
  const debouncedPriceMin = useDebounce(filters.priceMin, 500);
  const debouncedPriceMax = useDebounce(filters.priceMax, 500);

  const updateUrl = useCallback((newFilters: Partial<SearchParams>) => {
    const params = buildSearchParams({ ...newFilters, page: 1 });
    router.push(`/search?${params.toString()}`, { scroll: false });
    onFilterChange?.();
  }, [router, onFilterChange]);

  // Effect to sync immediate updates (Selects, Radios, Checkboxes)
  const handleImmediateUpdate = (updates: Partial<SearchParams>) => {
    const nextFilters = { ...filters, ...updates };
    setFilters(nextFilters);
    updateUrl(nextFilters);
  };

  // Effect to sync debounced updates
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    updateUrl({
      ...filters,
      q: debouncedQ,
      priceMin: debouncedPriceMin,
      priceMax: debouncedPriceMax,
    });
  }, [debouncedQ, debouncedPriceMin, debouncedPriceMax, updateUrl]);

  const handleClear = () => {
    setFilters({ sort: "relevance" });
    router.push("/search");
    onFilterChange?.();
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== "sort" && key !== "page"
  );

  // City search specific state
  const [citySearch, setCitySearch] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const citySuggestionsRef = useRef<HTMLDivElement>(null);

  // Sync city search text with actual filter value on mount or change
  useEffect(() => {
    if (filters.city) {
      setCitySearch(formatCity(filters.city));
    } else {
      setCitySearch("");
    }
  }, [filters.city]);

  // Click outside listener for city suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCities = citySearch.length > 0 
    ? CITIES.filter(city => 
        formatCity(city).toLowerCase().includes(citySearch.toLowerCase())
      )
    : CITIES;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-muted pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
            <Filter size={18} className="text-brand-600" />
          </div>
          <h3 className="font-normal font-black text-ink-900 text-lg">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="group flex items-center gap-1.5 text-xs font-normal font-black text-brand-600 hover:text-brand-700 transition-colors"
          >
            <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-8 pt-6">
        {/* City Filter - Priority 1 (Searchable) */}
        <div className="relative" ref={citySuggestionsRef}>
          <Label htmlFor="city-search" className="mb-3 block text-[13px] font-normal font-black tracking-[0.2em] text-ink-400">
            Search by City
          </Label>
          <div className="relative group/city">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within/city:text-brand-600 transition-colors" />
            <Input
              id="city-search"
              type="text"
              placeholder="Start typing city name..."
              value={citySearch}
              onFocus={() => setShowCitySuggestions(true)}
              onChange={(e) => {
                setCitySearch(e.target.value);
                setShowCitySuggestions(true);
                if (e.target.value === "") {
                   handleImmediateUpdate({ city: undefined });
                }
              }}
              className="pl-12 h-14 border-surface-muted bg-surface-muted/30 focus:bg-white focus:ring-4 focus:ring-brand-500/5 rounded-2xl transition-all font-medium text-ink-900"
            />
            {citySearch && (
              <button 
                onClick={() => {
                  setCitySearch("");
                  handleImmediateUpdate({ city: undefined });
                  setShowCitySuggestions(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showCitySuggestions && (
            <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-surface-muted bg-white p-2 shadow-pop animate-in fade-in zoom-in-95 duration-200">
              {filteredCities.length > 0 ? (
                <>
                  <button
                    onClick={() => {
                      setCitySearch("");
                      handleImmediateUpdate({ city: undefined });
                      setShowCitySuggestions(false);
                    }}
                    className="flex w-full items-center px-4 py-3 text-sm font-medium text-ink-500 hover:bg-surface-muted/50 rounded-xl transition-colors"
                  >
                    All Cities
                  </button>
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setCitySearch(formatCity(city));
                        handleImmediateUpdate({ city: city as any });
                        setShowCitySuggestions(false);
                      }}
                      className={`flex w-full items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                        filters.city === city 
                          ? "bg-brand-50 text-brand-600" 
                          : "text-ink-900 hover:bg-surface-muted"
                      }`}
                    >
                      {formatCity(city)}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-ink-400 font-medium">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyword Search */}
        <div className="group">
          <Label htmlFor="search-text" className="mb-3 block text-[13px] font-normal font-black tracking-[0.2em] text-ink-400 group-hover:text-brand-600 transition-colors">
            Keyword Search
          </Label>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-600 transition-colors" />
            <Input
              id="search-text"
              type="text"
              placeholder="Model, color, or tags..."
              value={filters.q || ""}
              onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value || "" }))}
              className="pl-12 h-14 border-surface-muted bg-surface-muted/30 focus:bg-white focus:ring-4 focus:ring-brand-500/5 rounded-2xl transition-all font-medium text-ink-900"
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <Label className="block text-[13px] font-normal font-black tracking-[0.2em] text-ink-400">
            Budget Range (PKR)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-normal font-black text-ink-400">PKR</span>
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin ?? ""}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : undefined }))}
                className="h-12 pl-12 text-sm rounded-xl border-surface-muted bg-surface-muted/30 focus:bg-white font-semibold"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-normal font-black text-ink-400">PKR</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax ?? ""}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : undefined }))}
                className="h-12 pl-12 text-sm rounded-xl border-surface-muted bg-surface-muted/30 focus:bg-white font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Capacity Section */}
        <div className="space-y-4">
          <Label className="block text-[13px] font-normal font-black tracking-[0.2em] text-ink-400">
            Passenger Capacity
          </Label>
          <div className="flex gap-3">
            {[5, 6, 7].map((seat) => (
              <button
                key={seat}
                onClick={() => handleImmediateUpdate({ seats: filters.seats === seat ? undefined : seat })}
                className={`flex-1 flex h-14 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  filters.seats === seat
                    ? "border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-500/20 font-normal font-black scale-[1.02]"
                    : "border-surface-muted bg-surface-muted/30 text-ink-600 hover:border-brand-300 font-semibold hover:bg-white"
                }`}
              >
                {seat}+
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
