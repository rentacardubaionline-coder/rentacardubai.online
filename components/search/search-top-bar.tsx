"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  buildSearchParams,
  formatCity,
  type SearchParams,
} from "@/lib/search/params";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Search,
  MapPin,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

type City = { name: string; slug: string };

interface SearchTopBarProps {
  initialParams: SearchParams;
  cities: City[];
  count: number;
}

export function SearchTopBar({ initialParams, cities, count }: SearchTopBarProps) {
  const router = useRouter();

  const [filters, setFilters] = useState<Partial<SearchParams>>(initialParams);
  const [cityInput, setCityInput] = useState(
    initialParams.city ? formatCity(initialParams.city) : "",
  );
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const [sheetOpen, setSheetOpen] = useState(false); // mobile only

  const debouncedCity = useDebounce(cityInput, 250);
  const debouncedQ = useDebounce(filters.q, 400);
  const debouncedPriceMin = useDebounce(filters.priceMin, 400);
  const debouncedPriceMax = useDebounce(filters.priceMax, 400);

  const push = useCallback(
    (next: Partial<SearchParams>) => {
      const params = buildSearchParams({ ...next, page: 1 });
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    push({
      ...filters,
      city: debouncedCity ? debouncedCity.toLowerCase() : undefined,
      q: debouncedQ,
      priceMin: debouncedPriceMin,
      priceMax: debouncedPriceMax,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCity, debouncedQ, debouncedPriceMin, debouncedPriceMax]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll while mobile sheet is open
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const cityMatches = useMemo(() => {
    const q = cityInput.trim().toLowerCase();
    if (!q) return cities.slice(0, 80);
    return cities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 80);
  }, [cities, cityInput]);

  function applyImmediate(patch: Partial<SearchParams>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    push({
      ...next,
      city: cityInput ? cityInput.toLowerCase() : undefined,
    });
  }

  function clearAll() {
    setFilters({ sort: "relevance" });
    setCityInput("");
    router.push("/search");
  }

  const activeCount =
    (cityInput ? 1 : 0) +
    (filters.q ? 1 : 0) +
    (filters.transmission ? 1 : 0) +
    (filters.fuel ? 1 : 0) +
    (filters.mode ? 1 : 0) +
    (filters.seats ? 1 : 0) +
    (filters.priceMin ? 1 : 0) +
    (filters.priceMax ? 1 : 0);
  const hasAny = activeCount > 0 || (filters.sort && filters.sort !== "relevance");

  /* ── Shared filter fields, rendered inline on desktop and inside the sheet on mobile ── */
  const filterFields = (
    <>
      {/* City */}
      <div className="relative" ref={cityRef}>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500 md:sr-only">
          City
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500" />
          <input
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityOpen(true);
            }}
            onFocus={() => setCityOpen(true)}
            placeholder="Any city — Lahore, Karachi…"
            className="h-11 w-full rounded-xl bg-surface-sunken pl-9 pr-9 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
          {cityInput ? (
            <button
              type="button"
              onClick={() => {
                setCityInput("");
                setCityOpen(false);
              }}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <ChevronDown
              className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400 transition-transform ${
                cityOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
        {cityOpen && (
          <div className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
            <div className="max-h-64 overflow-y-auto py-1">
              {cityMatches.length > 0 ? (
                cityMatches.map((city) => {
                  const isActive = cityInput.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => {
                        setCityInput(city.name);
                        setCityOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-800 hover:bg-surface-muted/50"
                      }`}
                    >
                      {city.name}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-ink-400">
                  No matching cities
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Keyword */}
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-500 md:sr-only">
          Keyword
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={filters.q ?? ""}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Brand or model — Toyota Corolla…"
            className="h-11 w-full rounded-xl bg-surface-sunken pl-9 pr-8 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, q: "" })}
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-white hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  const chipFields = (
    <div className="flex flex-col gap-3">
      <ChipRow
        label="Rental type"
        value={filters.mode}
        onChange={(v) =>
          applyImmediate({ mode: (v ?? undefined) as SearchParams["mode"] })
        }
        options={[
          { value: "self_drive", label: "Self drive" },
          { value: "with_driver", label: "With driver" },
        ]}
      />
      <ChipRow
        label="Transmission"
        value={filters.transmission}
        onChange={(v) =>
          applyImmediate({
            transmission: (v ?? undefined) as SearchParams["transmission"],
          })
        }
        options={[
          { value: "automatic", label: "Automatic" },
          { value: "manual", label: "Manual" },
        ]}
      />
      <ChipRow
        label="Fuel"
        value={filters.fuel}
        onChange={(v) =>
          applyImmediate({ fuel: (v ?? undefined) as SearchParams["fuel"] })
        }
        options={[
          { value: "petrol", label: "Petrol" },
          { value: "diesel", label: "Diesel" },
          { value: "hybrid", label: "Hybrid" },
          { value: "electric", label: "Electric" },
        ]}
      />
      <ChipRow
        label="Seats"
        value={filters.seats ? String(filters.seats) : undefined}
        onChange={(v) =>
          applyImmediate({ seats: v ? Number(v) : undefined })
        }
        options={[
          { value: "2", label: "2+" },
          { value: "4", label: "4+" },
          { value: "5", label: "5+" },
          { value: "7", label: "7+" },
        ]}
      />
    </div>
  );

  const priceFields = (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-ink-500">
        Min price / day
        <input
          type="number"
          min={0}
          placeholder="Any"
          value={filters.priceMin ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              priceMin: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-11 rounded-xl border border-surface-muted bg-white px-3 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-ink-500">
        Max price / day
        <input
          type="number"
          min={0}
          placeholder="Any"
          value={filters.priceMax ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              priceMax: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="h-11 rounded-xl border border-surface-muted bg-white px-3 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400 focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* ── Mobile trigger row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="inline-flex h-11 flex-1 items-center justify-between gap-2 rounded-xl bg-ink-900 px-4 text-sm font-bold text-white shadow-sm hover:bg-black"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-ink-900">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown className="size-4 opacity-70" />
        </button>
      </div>

      {/* ── Desktop inline filter bar ──────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="grid gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 md:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)]">
          {filterFields}
        </div>

        {/* Chips + clear */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ChipRow
            label="Rental type"
            value={filters.mode}
            onChange={(v) =>
              applyImmediate({ mode: (v ?? undefined) as SearchParams["mode"] })
            }
            options={[
              { value: "self_drive", label: "Self drive" },
              { value: "with_driver", label: "With driver" },
            ]}
          />
          <ChipRow
            label="Gear"
            value={filters.transmission}
            onChange={(v) =>
              applyImmediate({
                transmission: (v ?? undefined) as SearchParams["transmission"],
              })
            }
            options={[
              { value: "automatic", label: "Automatic" },
              { value: "manual", label: "Manual" },
            ]}
          />
          {hasAny && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto rounded-full px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="px-1 text-xs text-ink-500">
        <span className="font-extrabold text-ink-900">{count}</span>{" "}
        {count === 1 ? "result" : "results"}
        {cityInput ? ` in ${cityInput}` : ""}
      </p>

      {/* ── Mobile bottom sheet ─────────────────────────────────────────── */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0 flex h-[78vh] flex-col rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Drag handle + header */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-surface-muted px-5 py-4">
              <span
                aria-hidden
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink-200"
              />
              <h2 className="text-base font-extrabold text-ink-900">Filters</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="inline-flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-surface-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 pb-28">
              <div className="space-y-3">{filterFields}</div>

              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink-500">
                  Categories
                </h3>
                {chipFields}
              </div>

              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink-500">
                  Price range (per day)
                </h3>
                {priceFields}
              </div>

            </div>

            {/* Sticky footer actions */}
            <div
              className="flex shrink-0 items-center gap-3 border-t border-surface-muted bg-white/95 px-5 py-4 backdrop-blur"
              style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={() => {
                  clearAll();
                }}
                disabled={!hasAny}
                className="h-11 flex-1 rounded-xl border border-surface-muted bg-white text-sm font-bold text-ink-700 transition-colors hover:bg-surface-muted/50 disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="inline-flex h-11 flex-[2] items-center justify-center rounded-xl bg-ink-900 px-4 text-sm font-bold text-white shadow-sm hover:bg-black"
              >
                Show {count} {count === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable chip row ───────────────────────────────────────────────── */

function ChipRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wider text-ink-500">{label}</span>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isActive ? null : opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              isActive
                ? "bg-ink-900 text-white shadow-sm"
                : "bg-surface-sunken text-ink-700 hover:bg-surface-muted/50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
