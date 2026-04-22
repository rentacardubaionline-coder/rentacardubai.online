"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { autoProcessScrapedAction } from "@/app/actions/scraper";

interface AutoProcessButtonProps {
  /** Scope the operation to a specific city (current filter value). Empty = all cities. */
  cityName?: string;
  /** Shown to confirm what's about to happen. */
  pendingCount: number;
}

export function AutoProcessButton({ cityName, pendingCount }: AutoProcessButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const res = await autoProcessScrapedAction(5, cityName);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Imported ${res.imported} · Deleted ${res.deleted}${res.failed ? ` · Failed ${res.failed}` : ""}`,
      );
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pendingCount === 0}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" />
        Auto-process (5+ photos)
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ink-900">Confirm auto-process</h3>
            <p className="mt-2 text-sm text-ink-600">
              This will process <strong>{pendingCount}</strong> pending business
              {pendingCount === 1 ? "" : "es"}
              {cityName ? ` in ${cityName}` : ""}:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-ink-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  <strong>Publish</strong> businesses with <strong>5 or more</strong> photos (goes
                  live immediately)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600">✗</span>
                <span>
                  <strong>Delete</strong> businesses with fewer than 5 photos (permanent)
                </span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              This cannot be undone. Deleted rows are removed from the staging table.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-10 rounded-xl border border-border bg-white px-4 text-sm font-medium text-ink-600 hover:bg-surface-muted disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Processing…" : "Run now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
