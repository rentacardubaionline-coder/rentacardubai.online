"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCheck, Trash2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrapedBusinessCard, type ScrapedBusinessCardData } from "./scraped-business-card";
import {
  bulkApproveScrapedAction,
  bulkRejectScrapedAction,
} from "@/app/actions/scraper";
import { cn } from "@/lib/utils";

interface ReviewGridProps {
  businesses: ScrapedBusinessCardData[];
}

export function ReviewGrid({ businesses }: ReviewGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(businesses.map((b) => b.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleBulkApprove() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Approve & import ${ids.length} business${ids.length === 1 ? "" : "es"}? Images will be uploaded to Cloudinary.`)) return;

    startTransition(async () => {
      const res = await bulkApproveScrapedAction(ids);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Imported ${res.imported} businesses${res.failed > 0 ? `, ${res.failed} failed` : ""}`);
        setSelected(new Set());
      }
    });
  }

  function handleBulkReject() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const reason = prompt("Reason for rejection (optional):") ?? undefined;
    if (!confirm(`Reject ${ids.length} business${ids.length === 1 ? "" : "es"}?`)) return;

    startTransition(async () => {
      const res = await bulkRejectScrapedAction(ids, reason);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`${ids.length} rejected`);
        setSelected(new Set());
      }
    });
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-muted py-16 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-ink-300 mb-2" />
        <p className="text-sm font-semibold text-ink-600">No businesses pending review</p>
        <p className="mt-1 text-xs text-ink-400">
          Start a scrape job and wait for results to appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Sticky bulk action bar */}
      <div
        className={cn(
          "sticky top-0 z-20 -mx-4 -mt-2 flex items-center justify-between gap-3 border-b bg-white/95 px-4 py-3 backdrop-blur transition-all",
          selected.size > 0 ? "border-amber-200" : "border-transparent",
        )}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={selected.size === businesses.length ? clearSelection : selectAll}
            className="text-xs font-semibold text-ink-700 hover:text-amber-700"
          >
            {selected.size === businesses.length ? "Clear all" : "Select all"}
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-xs text-ink-500">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-ink-400 hover:bg-surface-muted hover:text-ink-700"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            </>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={handleBulkReject}
              className="text-rose-600 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reject {selected.size}
            </Button>
            <Button
              size="sm"
              disabled={pending}
              onClick={handleBulkApprove}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {pending ? "Importing..." : `Approve & Import ${selected.size}`}
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {businesses.map((biz) => (
          <ScrapedBusinessCard
            key={biz.id}
            business={biz}
            selected={selected.has(biz.id)}
            onToggle={() => toggle(biz.id)}
          />
        ))}
      </div>
    </>
  );
}
