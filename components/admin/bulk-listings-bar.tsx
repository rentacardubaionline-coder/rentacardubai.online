"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { bulkApproveListingsAction } from "@/app/actions/admin-listings";
import { cn } from "@/lib/utils";

/**
 * Floating action bar for the admin listings table. Listens for our custom
 * `rnp-listing-selection` event so checkbox rows can communicate without a
 * shared context provider — keeps the table fully server-rendered while the
 * select-all and per-row checkboxes live in tiny client components.
 */
export function BulkListingsBar() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ id: string; checked: boolean }>).detail;
      setSelected((prev) => {
        const next = new Set(prev);
        if (detail.checked) next.add(detail.id);
        else next.delete(detail.id);
        return next;
      });
    }
    function onReset() {
      setSelected(new Set());
    }
    window.addEventListener("rnp-listing-selection", onChange as EventListener);
    window.addEventListener("rnp-listing-reset", onReset);
    return () => {
      window.removeEventListener("rnp-listing-selection", onChange as EventListener);
      window.removeEventListener("rnp-listing-reset", onReset);
    };
  }, []);

  function clearAll() {
    setSelected(new Set());
    window.dispatchEvent(new Event("rnp-listing-reset"));
  }

  function approveAll() {
    if (selected.size === 0) return;
    if (!confirm(`Approve ${selected.size} listing${selected.size === 1 ? "" : "s"}?`)) return;

    startTransition(async () => {
      const ids = Array.from(selected);
      const res = await bulkApproveListingsAction(ids);
      if (res.failed > 0) {
        toast.warning(
          `Approved ${res.approved} of ${ids.length}. ${res.failed} failed.`,
        );
      } else if (res.kycHeld > 0) {
        toast.success(
          `Approved ${res.approved}. ${res.kycHeld} held until vendor KYC clears.`,
        );
      } else {
        toast.success(`Approved ${res.approved} listings`);
      }
      clearAll();
    });
  }

  if (selected.size === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4 lg:left-auto lg:right-6 lg:translate-x-0">
      <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-900 px-4 py-2.5 text-white shadow-2xl">
        <span className="text-sm font-bold tabular-nums">
          {selected.size} selected
        </span>
        <button
          type="button"
          onClick={approveAll}
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600",
            isPending && "opacity-60",
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {isPending ? "Approving…" : "Approve all"}
        </button>
        <button
          type="button"
          onClick={clearAll}
          aria-label="Clear selection"
          className="ml-1 inline-flex size-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Single-row checkbox. Dispatches a window-level event the floating bar listens
 * to. No shared state hook needed — keeps the table render fully RSC-friendly.
 */
export function BulkSelectCheckbox({ id, status }: { id: string; status: string }) {
  const [checked, setChecked] = useState(false);

  // Reset when the bar clears all
  useEffect(() => {
    function onReset() {
      setChecked(false);
    }
    window.addEventListener("rnp-listing-reset", onReset);
    return () => window.removeEventListener("rnp-listing-reset", onReset);
  }, []);

  // Bulk approve only makes sense for pending rows; render a dot for others.
  if (status !== "pending") {
    return (
      <span
        aria-hidden
        className="inline-flex size-4 items-center justify-center rounded text-ink-200"
      >
        ·
      </span>
    );
  }

  function toggle() {
    const next = !checked;
    setChecked(next);
    window.dispatchEvent(
      new CustomEvent("rnp-listing-selection", {
        detail: { id, checked: next },
      }),
    );
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={toggle}
      aria-label="Select listing for bulk action"
      className="size-4 cursor-pointer rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
    />
  );
}
