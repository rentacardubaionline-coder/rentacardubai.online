"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, Loader2, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getPlaceSuggestionsAction, getPlaceDetailsAction } from "@/app/actions/onboarding";

export type LocationResult = {
  address_line: string;
  lat: number;
  lng: number;
  city?: string;
  google_place_id: string;
  maps_url: string;
};

interface LocationPickerProps {
  value: LocationResult | null;
  onChange: (location: LocationResult | null) => void;
  onPreFill?: (details: {
    name?: string;
    phone?: string;
    address_line?: string;
    lat?: number;
    lng?: number;
    city?: string;
    google_place_id?: string;
    maps_url?: string;
  }) => void;
}

export function LocationPicker({ value, onChange, onPreFill }: LocationPickerProps) {
  const [query, setQuery] = useState(value?.address_line ?? "");
  const [suggestions, setSuggestions] = useState<
    Array<{ place_id: string; description: string; main_text: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    const res = await getPlaceSuggestionsAction(q);
    setSuggestions(res.suggestions ?? []);
    setLoading(false);
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(null);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = async (placeId: string, description: string) => {
    setQuery(description);
    setOpen(false);
    setSuggestions([]);
    setLoading(true);

    const res = await getPlaceDetailsAction(placeId);
    setLoading(false);

    if (res.details) {
      const d = res.details;
      onChange({
        address_line: d.address_line,
        lat: d.lat,
        lng: d.lng,
        city: d.city,
        google_place_id: d.google_place_id,
        maps_url: d.maps_url,
      });

      if (onPreFill) {
        onPreFill({
          address_line: d.address_line,
          lat: d.lat,
          lng: d.lng,
          city: d.city,
          google_place_id: d.google_place_id,
          maps_url: d.maps_url,
        });
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setSuggestions([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const showMap = value && mapsKey;

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Search your business address…"
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 3 && setOpen(true)}
          className="pl-10 pr-8"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-surface-muted bg-white shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelect(s.place_id, s.description)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none border-b border-surface-muted last:border-b-0"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink-900">
                    {s.main_text}
                  </span>
                  <span className="block truncate text-xs text-ink-500">
                    {s.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map preview */}
      {showMap && (
        <div className="relative overflow-hidden rounded-xl border border-surface-muted bg-surface-muted">
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${value.lat},${value.lng}&zoom=15&size=600x180&scale=2&markers=color:0x2563eb%7C${value.lat},${value.lng}&style=feature:poi|visibility:off&key=${mapsKey}`}
            alt="Location map"
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-xs font-medium text-white">
              {value.address_line}
            </span>
          </div>
        </div>
      )}

      {value && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Location confirmed
          {value.city && (
            <span className="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              {value.city}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
