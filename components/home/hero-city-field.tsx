"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface City {
  city: string;
  count: number;
}

interface Props {
  cities: City[];
  /** Optional initial value (e.g. when opened with ?city=lahore in URL). */
  defaultValue?: string;
  inputId?: string;
  inputName?: string;
  placeholder?: string;
}

/**
 * Typeahead city field for the home hero. Replaces the previous
 * `<datalist>` (which had inconsistent styling across browsers and no
 * keyboard nav) with a proper client-driven dropdown.
 *
 * Behaviour:
 * - Click / focus → dropdown opens with the top 12 cities (most listings first)
 * - Type → suggestions filter in place; up/down arrows navigate, Enter picks
 * - Click a suggestion → navigates immediately to /search?city=<value>
 * - Click outside or Escape → dropdown closes (the input keeps its text so
 *   the form still submits with whatever the user typed)
 */
export function HeroCityField({
  cities,
  defaultValue = "",
  inputId = "city",
  inputName = "city",
  placeholder = "Karachi, Lahore, Islamabad…",
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close on outside click
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
    return cities
      .filter((c) => c.city.toLowerCase().includes(q))
      .slice(0, 12);
  }, [cities, value]);

  // Reset highlight when matches change
  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  function pick(cityName: string) {
    setValue(cityName);
    setOpen(false);
    router.push(`/search?city=${encodeURIComponent(cityName.toLowerCase())}`);
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
    if (e.key === "Enter" && open && matches[activeIndex]) {
      e.preventDefault();
      pick(matches[activeIndex].city);
    }
  }

  // Keep the active suggestion scrolled into view as user navigates
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-suggestion]");
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-600" />
        <Input
          id={inputId}
          name={inputName}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
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
        {value ? (
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
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10">
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
                  <li key={c.city} data-suggestion>
                    <button
                      type="button"
                      role="option"
                      id={`${inputId}-opt-${i}`}
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => pick(c.city)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-semibold transition-colors",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-800 hover:bg-surface-muted/50",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-brand-500" />
                        {c.city}
                      </span>
                      <span className="text-[11px] font-medium text-ink-400">
                        {c.count} car{c.count === 1 ? "" : "s"}
                      </span>
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
