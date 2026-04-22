"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Loader2, Plus, X } from "lucide-react";
import type { PricingTier } from "@/lib/pricing/tiers";
import { updatePricingTierAction } from "@/app/actions/pricing";

interface PricingEditorProps {
  tiers: PricingTier[];
}

export function PricingEditor({ tiers }: PricingEditorProps) {
  return (
    <div className="space-y-6">
      {tiers.map((tier) => (
        <TierEditor key={tier.id} tier={tier} />
      ))}
    </div>
  );
}

function TierEditor({ tier }: { tier: PricingTier }) {
  const [label, setLabel] = useState(tier.label);
  const [price, setPrice] = useState<string>(String(tier.price_pkr));
  const [description, setDescription] = useState(tier.description ?? "");
  const [examples, setExamples] = useState<string[]>(tier.examples ?? []);
  const [newExample, setNewExample] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const res = await updatePricingTierAction({
        id: tier.id,
        label: label.trim(),
        price_pkr: Number(price) || 0,
        description: description.trim() || null,
        examples,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${label} updated`);
    });
  }

  function addExample() {
    const v = newExample.trim();
    if (!v) return;
    if (examples.includes(v)) return;
    setExamples([...examples, v]);
    setNewExample("");
  }

  return (
    <div className="rounded-2xl border border-surface-muted bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-700">
            {tier.code}
          </span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-bold text-white hover:bg-black disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Label</span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-10 rounded-xl border border-surface-muted bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Price per lead (Rs.)
          </span>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-10 rounded-xl border border-surface-muted bg-white px-3 text-sm font-semibold text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Description</span>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-xl border border-surface-muted bg-white p-3 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
          placeholder="One-line description shown to vendors in the info popover."
        />
      </label>

      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
          Example models
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <span
              key={ex}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-ink-800 ring-1 ring-surface-muted"
            >
              {ex}
              <button
                type="button"
                onClick={() => setExamples(examples.filter((x) => x !== ex))}
                className="text-ink-400 hover:text-rose-600"
                aria-label={`Remove ${ex}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newExample}
            onChange={(e) => setNewExample(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addExample();
              }
            }}
            placeholder="Add model — e.g. Toyota Yaris"
            className="h-9 flex-1 rounded-lg border border-surface-muted bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10"
          />
          <button
            type="button"
            onClick={addExample}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-surface-muted px-3 text-xs font-bold text-ink-700 hover:bg-surface-muted/70"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
