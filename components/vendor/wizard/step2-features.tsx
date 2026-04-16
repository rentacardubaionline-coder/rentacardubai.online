"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveFeaturesAction } from "@/app/actions/listings";
import { cn } from "@/lib/utils";

interface Feature {
  id: string;
  name: string;
  slug: string;
  group: string | null;
  icon_url: string | null;
}

interface Step2FeaturesProps {
  listingId: string;
  features: Feature[];          // all available features
  selectedIds?: string[];       // already-saved feature IDs
}

export function Step2Features({ listingId, features, selectedIds = [] }: Step2FeaturesProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Group features by their `group` field
  const groups = features.reduce<Record<string, Feature[]>>((acc, f) => {
    const g = f.group ?? "Other";
    if (!acc[g]) acc[g] = [];
    acc[g].push(f);
    return acc;
  }, {});

  const groupOrder = ["Safety", "Comfort", "Technology", "Entertainment", "Convenience", "Exterior", "Other"];
  const sortedGroups = [
    ...groupOrder.filter((g) => groups[g]),
    ...Object.keys(groups).filter((g) => !groupOrder.includes(g)),
  ];

  function onSubmit() {
    startTransition(async () => {
      const res = await saveFeaturesAction(listingId, Array.from(selected));
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${listingId}/edit?step=3`);
      }
    });
  }

  function skip() {
    router.push(`/vendor/listings/${listingId}/edit?step=3`);
  }

  if (features.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-ink-500">No features available yet. You can skip this step.</p>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=1`)}>
            ← Back
          </Button>
          <Button type="button" onClick={skip}>Skip →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-500">
        Select all features that apply. This helps customers find your vehicle.
        {selected.size > 0 && (
          <span className="ml-2 font-semibold text-brand-600">{selected.size} selected</span>
        )}
      </p>

      {sortedGroups.map((groupName) => (
        <div key={groupName}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-400">{groupName}</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {groups[groupName].map((feature) => {
              const isSelected = selected.has(feature.id);
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => toggle(feature.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-all",
                    isSelected
                      ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/30"
                      : "border-surface-muted bg-white text-ink-700 hover:border-ink-300 hover:bg-surface-muted/50"
                  )}
                >
                  {/* Checkmark or icon */}
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-ink-300 bg-white"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate">{feature.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-between border-t border-surface-muted pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=1`)}
        >
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={skip} disabled={isPending}>
            Skip
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Save & Continue →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
