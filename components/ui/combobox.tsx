"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Free-text secondary line (e.g. body type). */
  sublabel?: string;
}

interface ComboboxProps {
  value: string;
  /** Display value shown in the trigger when no matching option's label is preferred. */
  displayValue?: string;
  onChange: (value: string, label: string, isCustom: boolean) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  /** Allow the user to add a new entry that isn't in options. */
  allowCustom?: boolean;
  /** Label shown on the "Add … as new" item (e.g. "Add as new city"). */
  addNewLabel?: string;
  /** Optional extra className on the trigger button. */
  className?: string;
  /** Required field — adds a subtle asterisk indicator handled by the caller. */
  required?: boolean;
  name?: string;
}

/**
 * A keyboard-friendly typeahead combobox. Opens a panel with a search input
 * and a scrollable option list. Supports free-text "add as new" entries when
 * `allowCustom` is true — the added entry is returned via `onChange` with
 * `isCustom=true` so callers can persist it appropriately.
 */
export function Combobox({
  value,
  displayValue,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  allowCustom = false,
  addNewLabel = "Add new",
  className,
  required,
  name,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Autofocus search when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  const hasExact = filtered.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());
  const showAddNew = allowCustom && query.trim().length >= 2 && !hasExact;

  const currentLabel =
    displayValue ??
    options.find((o) => o.value === value)?.label ??
    "";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-xl border-2 px-3.5 text-left text-sm font-semibold transition-colors sm:h-11",
          "border-surface-muted bg-white hover:border-ink-200 disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-brand-400 ring-2 ring-brand-500/20",
        )}
      >
        <span className={cn("truncate", currentLabel ? "text-ink-900" : "text-ink-400")}>
          {currentLabel || placeholder}
        </span>
        {currentLabel ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("", "", false);
            }}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-ink-400 hover:bg-surface-muted hover:text-ink-700"
          >
            <X className="size-3.5" />
          </span>
        ) : (
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-ink-400 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </button>

      {name && <input type="hidden" name={name} value={value} required={required} />}

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-surface-muted bg-white shadow-xl">
          <div className="relative border-b border-surface-muted bg-surface-sunken">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-11 w-full bg-transparent pl-9 pr-3 text-sm font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((opt) => {
                const isActive = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value, opt.label, false);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-800 hover:bg-surface-sunken",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold">{opt.label}</div>
                      {opt.sublabel && (
                        <div className="mt-0.5 text-xs text-ink-500">{opt.sublabel}</div>
                      )}
                    </div>
                    {isActive && <Check className="size-4 text-brand-600" />}
                  </button>
                );
              })
            ) : !showAddNew ? (
              <div className="px-3 py-6 text-center text-sm text-ink-400">
                No matches{allowCustom ? " — type at least 2 chars to add new" : ""}
              </div>
            ) : null}

            {showAddNew && (
              <button
                type="button"
                onClick={() => {
                  const label = query.trim();
                  onChange(`__custom__:${label}`, label, true);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 border-t border-surface-muted bg-brand-50/40 px-3 py-3 text-left text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                <Plus className="size-4" />
                {addNewLabel}: <span className="font-extrabold">“{query.trim()}”</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
