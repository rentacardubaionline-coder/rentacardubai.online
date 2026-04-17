"use client";

import { useState } from "react";
import { Search, Loader2, Star, MapPin, Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchGoogleBusinessesAction, getPlaceDetailsAction } from "@/app/actions/onboarding";

type SearchResult = {
  place_id: string;
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
};

interface GmbImportDialogProps {
  onImport: (data: {
    name: string;
    phone?: string;
    address_line: string;
    lat: number;
    lng: number;
    city?: string;
    google_place_id: string;
    maps_url: string;
  }) => void;
  onClose: () => void;
}

export function GmbImportDialog({ onImport, onClose }: GmbImportDialogProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(true);
    const res = await searchGoogleBusinessesAction(query);
    setResults(res.results ?? []);
    setSearching(false);
  };

  const handleImport = async (result: SearchResult) => {
    setImporting(result.place_id);
    const res = await getPlaceDetailsAction(result.place_id);
    setImporting(null);

    if (res.details) {
      onImport({
        name: res.details.name,
        phone: res.details.phone,
        address_line: res.details.address_line,
        lat: res.details.lat,
        lng: res.details.lng,
        city: res.details.city,
        google_place_id: res.details.google_place_id,
        maps_url: res.details.maps_url,
      });
      onClose();
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Import className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Find on Google Maps</h2>
              <p className="text-xs text-brand-100">
                Search your business and import its details
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <Input
                placeholder="Your business name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="shrink-0"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Results */}
          {searched && !searching && results.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-500">
              No businesses found. Try a different name or continue manually.
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {results.map((r) => (
                <div
                  key={r.place_id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-surface-muted p-3 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-ink-900 leading-tight">{r.name}</p>
                    <p className="flex items-start gap-1 text-xs text-ink-500 leading-relaxed">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-ink-400" />
                      <span className="line-clamp-2">{r.address}</span>
                    </p>
                    {r.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-ink-700">{r.rating}</span>
                        {r.user_ratings_total && (
                          <span className="text-xs text-ink-400">
                            ({r.user_ratings_total.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleImport(r)}
                    disabled={importing === r.place_id}
                    className="shrink-0 text-xs"
                  >
                    {importing === r.place_id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Import"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
