"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ScrollText,
  RotateCcw,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePoliciesAction } from "@/app/actions/listings";
import { DEFAULT_POLICIES, type PolicyItem } from "@/lib/policies/defaults";

interface Step4Props {
  listingId: string;
  policies?: PolicyItem[];
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-50 to-orange-50/40 px-4 py-3 ring-1 ring-brand-100/60">
      <div className="flex size-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-brand-100">
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-sm font-extrabold text-ink-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-ink-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Step4Policies({ listingId, policies = [] }: Step4Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Pre-fill with DEFAULT_POLICIES the first time a vendor opens this step —
  // they can edit/delete/add as needed.
  const [items, setItems] = useState<PolicyItem[]>(
    policies.length > 0 ? policies : DEFAULT_POLICIES,
  );

  function updateItem(idx: number, patch: Partial<PolicyItem>) {
    setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  function addItem() {
    setItems((prev) => [...prev, { title: "", content: "" }]);
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }
  function restoreDefaults() {
    if (!confirm("Restore the default policies? Your current edits will be replaced.")) return;
    setItems(DEFAULT_POLICIES);
  }

  function handleSubmit() {
    const cleaned = items
      .map((p) => ({ title: p.title.trim(), content: p.content.trim() }))
      .filter((p) => p.title.length > 0 && p.content.length > 0);

    startTransition(async () => {
      const res = await savePoliciesAction(listingId, cleaned);
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${listingId}/edit?step=5`);
      }
    });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={ScrollText}
        title="Rental policies"
        subtitle="These show on the public car page. Start with the defaults and tweak as you like."
      />

      <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4 text-xs text-ink-700">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-600" />
        <p>
          Every listing starts with the 3 core policies (Delivery, Toll Taxes, Fuel Policy).
          Edit the wording to match your agency, delete anything that doesn't apply, or add
          extra policies (driver overtime, late-return fee, etc).
        </p>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-surface-muted bg-surface-sunken/60 p-6 text-center text-sm text-ink-500">
            No policies. Click "Add policy" below or restore defaults.
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border-2 border-surface-muted bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-extrabold text-brand-700">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  aria-label="Delete policy"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Title
                </Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="e.g. Delivery"
                  maxLength={80}
                  className="h-10 border-2 border-surface-muted bg-white font-bold text-ink-900 focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
                />
              </div>

              <div className="mt-3 flex flex-col gap-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Details
                </Label>
                <Textarea
                  value={item.content}
                  onChange={(e) => updateItem(i, { content: e.target.value })}
                  rows={3}
                  maxLength={2000}
                  placeholder="Explain the policy in plain language — customers will see this on the car page."
                  className="resize-none rounded-xl border-2 border-surface-muted text-sm font-medium focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100"
        >
          <Plus className="size-4" />
          Add policy
        </button>
        <button
          type="button"
          onClick={restoreDefaults}
          className="inline-flex items-center gap-2 rounded-xl border border-surface-muted bg-white px-4 py-2.5 text-sm font-semibold text-ink-600 hover:bg-surface-sunken"
        >
          <RotateCcw className="size-4" />
          Restore defaults
        </button>
      </div>

      <div className="flex justify-between border-t border-surface-muted pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=3`)}
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="gap-1.5"
        >
          {isPending ? (
            "Saving…"
          ) : (
            <>
              Save & Continue <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
