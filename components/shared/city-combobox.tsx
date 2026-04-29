"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CityOption = {
  name: string;
  slug: string;
};

type Variant = "hero" | "nav" | "bottom";

interface Props {
  cities: CityOption[];
  /** Optional initial value (e.g. when opened with ?city=lahore in URL). */
  defaultValue?: string;
  /** Visual styling preset. */
  variant?: Variant;
  inputId?: string;
  inputName?: string;
  placeholder?: string;
  /** Override default `/search?city=…` navigation. */
  onPick?: (city: CityOption) => void;
}

/**
 * Reusable city typeahead — used by hero, header desktop search, and the
 * mobile sticky bottom search. Pulls from the full `public.cities` set so
 * users can pick any active Pakistan city (not just ones with listings).
 *
 * - `hero` renders just the input + dropdown so the caller can wrap it in
 *   its own form / submit button (the homepage uses a native form GET).
 * - `nav` / `bottom` render the input + an attached Search button and
 *   navigate internally on submit.
 */
export function CityCombobox({
  cities,
  defaultValue = "",
  variant = "hero",
  inputId = "city",
  inputName = "city",
  placeholder = "Search Dubai areas (Marina, JVC, Business Bay…)",

  onPick,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return cities.slice(0, 12);
    return cities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 50);
  }, [cities, value]);

  function navigate(name: string) {
    const v = name.trim();
    setOpen(false);
    if (onPick) {
      onPick({ name: v, slug: v.toLowerCase() });
      return;
    }
    router.push(
      v ? `/search?city=${encodeURIComponent(v.toLowerCase())}` : "/search",
    );
  }

  function pick(city: CityOption) {
    setValue(city.name);
    navigate(city.name);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(matches.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      // For "hero" variant, defer to the parent form's submit (native GET to /search).
      if (variant === "hero" && !onPick) {
        if (open && matches[activeIndex]) {
          e.preventDefault();
          pick(matches[activeIndex]);
        }
        // else: let the parent <form action="/search"> handle the submit.
        return;
      }
      e.preventDefault();
      if (open && matches[activeIndex]) {
        pick(matches[activeIndex]);
      } else {
        navigate(value);
      }
    }
  }

  useEffect(() => {
    if (!open || !listRef.current) return;
    const items =
      listRef.current.querySelectorAll<HTMLElement>("[data-suggestion]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const showInternalFrame = variant === "nav" || variant === "bottom";

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "relative flex items-center",
          showInternalFrame &&
            variant === "nav" &&
            "h-10 rounded-xl border border-border bg-surface-sunken transition-all focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10",
          showInternalFrame &&
            variant === "bottom" &&
            "h-11 rounded-2xl bg-surface-sunken focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/20",
        )}
      >
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500" />

        {variant === "hero" ? (
          <Input
            id={inputId}
            name={inputName}
            type="text"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="h-11 pl-9 pr-9"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${inputId}-listbox`}
            aria-activedescendant={
              open && matches[activeIndex]
                ? `${inputId}-opt-${activeIndex}`
                : undefined
            }
          />
        ) : (
          <input
            id={inputId}
            name={inputName}
            type="text"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setActiveIndex(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={cn(
              "h-full w-full bg-transparent pl-9 pr-24 text-sm font-medium text-ink-900 placeholder:text-ink-400 outline-none",
            )}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${inputId}-listbox`}
            aria-activedescendant={
              open && matches[activeIndex]
                ? `${inputId}-opt-${activeIndex}`
                : undefined
            }
          />
        )}

        {/* Right affordance */}
        {variant === "hero" ? (
          value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setOpen(true);
              }}
              aria-label="Clear city"
              className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-surface-muted hover:text-ink-700"
            >
              <X className="size-3.5" />
            </button>
          ) : (
            <ChevronDown
              aria-hidden
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400 transition-transform",
                open && "rotate-180",
              )}
            />
          )
        ) : variant === "nav" ? (
          <button
            type="button"
            onClick={() => navigate(value)}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 items-center gap-1 rounded-lg bg-ink-900 px-3 text-xs font-bold text-white hover:bg-black"
          >
            <Search className="size-3.5" />
            Search
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(value)}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-9 items-center justify-center rounded-xl bg-brand-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-brand-700 active:scale-95"
          >
            Search
          </button>
        )}
      </div>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-40 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10",
            variant === "bottom" ? "bottom-full mb-1.5" : "top-full mt-1.5",
          )}
        >
          <ul
            ref={listRef}
            id={`${inputId}-listbox`}
            role="listbox"
            className="max-h-72 overflow-y-auto py-1"
          >
            {matches.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-ink-400">
                No matching cities
              </li>
            ) : (
              matches.map((c, i) => {
                const active = i === activeIndex;
                return (
                  <li key={c.slug} data-suggestion>
                    <button
                      type="button"
                      role="option"
                      id={`${inputId}-opt-${i}`}
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(c);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition-colors",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-800 hover:bg-surface-muted/50",
                      )}
                    >
                      <MapPin className="size-3.5 shrink-0 text-brand-500" />
                      <span>{c.name}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
