"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDraftStep1Action } from "@/app/actions/listings";

interface Make {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface Model {
  id: string;
  make_id: string;
  name: string;
  slug: string;
  body_type: string | null;
}

interface Step1Props {
  businessId: string;
  listingId?: string;
  makes: Make[];
  models: Model[];
  defaults?: {
    title?: string;
    city?: string;
    year?: number;
    color?: string;
    transmission?: string;
    fuel?: string;
    seats?: number;
    mileage_km?: number;
    description?: string;
    model_id?: string;
  };
}

const CITIES = ["Karachi", "Lahore", "Islamabad"] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR + 1 - i);

export function Step1Basics({ businessId, listingId, makes, models, defaults = {} }: Step1Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Make / model cascade
  const [selectedMakeId, setSelectedMakeId] = useState<string>(() => {
    if (defaults.model_id) {
      const m = models.find((m) => m.id === defaults.model_id);
      return m?.make_id ?? "";
    }
    return "";
  });
  const [selectedModelId, setSelectedModelId] = useState<string>(defaults.model_id ?? "");
  const [year, setYear] = useState<string>(defaults.year ? String(defaults.year) : "");
  const [titleOverride, setTitleOverride] = useState<string>(defaults.title ?? "");
  const [titleTouched, setTitleTouched] = useState(false);

  const filteredModels = models.filter((m) => m.make_id === selectedMakeId);
  const selectedMake = makes.find((m) => m.id === selectedMakeId);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  // Auto-generate title when make/model/year change (unless user manually edited it)
  useEffect(() => {
    if (titleTouched) return;
    if (selectedMake && selectedModel && year) {
      setTitleOverride(`${selectedMake.name} ${selectedModel.name} ${year}`);
    }
  }, [selectedMakeId, selectedModelId, year, titleTouched, selectedMake, selectedModel]);

  function handleMakeChange(makeId: string) {
    setSelectedMakeId(makeId);
    setSelectedModelId(""); // reset model when make changes
  }

  function onSubmit(formData: FormData) {
    // model_id uses a controlled <select> without a name attribute, so inject it manually
    formData.set("model_id", selectedModelId);
    // When makes are available, title is a controlled input — ensure the current state value
    // is used (the native input value already reflects this, but be explicit).
    // When hasMakes=false, title comes from the uncontrolled native input — don't override it.
    if (hasMakes) {
      formData.set("title", titleOverride);
    }

    startTransition(async () => {
      const res = await saveDraftStep1Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${res.listingId}/edit?step=2`);
      }
    });
  }

  const hasMakes = makes.length > 0;

  return (
    <form action={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="businessId" value={businessId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}

      {/* ── Make / Model / Year ─────────────────────────────────── */}
      {hasMakes ? (
        <>
          {/* Make */}
          <div>
            <Label htmlFor="make">Make *</Label>
            <div className="relative mt-1">
              <select
                id="make"
                required
                value={selectedMakeId}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="block w-full appearance-none rounded-md border border-surface-muted bg-white py-2 pl-10 pr-8 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>Select make…</option>
                {makes.map((mk) => (
                  <option key={mk.id} value={mk.id}>{mk.name}</option>
                ))}
              </select>
              {/* Make logo */}
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                {selectedMake?.logo_url ? (
                  <img src={selectedMake.logo_url} alt="" className="h-5 w-5 object-contain" />
                ) : (
                  <span className="block h-5 w-5 rounded bg-surface-muted" />
                )}
              </span>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Model */}
          <div>
            <Label htmlFor="model">Model *</Label>
            <div className="relative mt-1">
              <select
                id="model"
                required
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={!selectedMakeId}
                className="block w-full appearance-none rounded-md border border-surface-muted bg-white px-3 py-2 pr-8 text-sm focus:border-brand-500 focus:outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  {selectedMakeId ? "Select model…" : "Select make first"}
                </option>
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.body_type ? ` (${m.body_type})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Year */}
          <div>
            <Label htmlFor="year">Year *</Label>
            <div className="relative mt-1">
              <select
                id="year"
                name="year"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="block w-full appearance-none rounded-md border border-surface-muted bg-white px-3 py-2 pr-8 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="" disabled>Select year…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Title (auto-filled, still editable) */}
          <div className="sm:col-span-2">
            <Label htmlFor="title">
              Listing title *
              {!titleTouched && selectedMake && selectedModel && year && (
                <span className="ml-2 text-[11px] font-normal text-emerald-600">Auto-generated</span>
              )}
            </Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              value={titleOverride}
              onChange={(e) => { setTitleOverride(e.target.value); setTitleTouched(true); }}
              placeholder="Toyota Corolla 2023 — Automatic"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-ink-400">
              Auto-filled from make/model/year. Add a key feature if you like (e.g. "— Sunroof").
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Fallback: free-text title + year when no makes in DB */}
          <div className="sm:col-span-2">
            <Label htmlFor="title">Listing title *</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={defaults.title}
              placeholder="Toyota Corolla 2023 — Automatic"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-ink-400">Make, model, year, and a key feature work well.</p>
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              name="year"
              type="number"
              required
              min={1970}
              max={CURRENT_YEAR + 1}
              defaultValue={defaults.year}
              placeholder="2023"
              className="mt-1"
            />
          </div>
        </>
      )}

      {/* ── City ────────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="city">City *</Label>
        <div className="relative mt-1">
          <select
            id="city"
            name="city"
            required
            defaultValue={defaults.city ?? ""}
            className="block w-full appearance-none rounded-md border border-surface-muted bg-white px-3 py-2 pr-8 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="" disabled>Select city…</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      {/* ── Color ───────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" name="color" defaultValue={defaults.color} placeholder="Silver" className="mt-1" />
      </div>

      {/* ── Seats ───────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="seats">Seats</Label>
        <Input id="seats" name="seats" type="number" min={1} max={20} defaultValue={defaults.seats} placeholder="5" className="mt-1" />
      </div>

      {/* ── Mileage ─────────────────────────────────────────────── */}
      <div>
        <Label htmlFor="mileage_km">Current mileage (km)</Label>
        <Input id="mileage_km" name="mileage_km" type="number" min={0} defaultValue={defaults.mileage_km} placeholder="15000" className="mt-1" />
      </div>

      {/* ── Transmission ────────────────────────────────────────── */}
      <div>
        <Label>Transmission</Label>
        <div className="mt-2 flex gap-4">
          {(["manual", "automatic"] as const).map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input type="radio" name="transmission" value={t} defaultChecked={defaults.transmission === t} className="accent-brand-500" />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* ── Fuel ────────────────────────────────────────────────── */}
      <div>
        <Label>Fuel type</Label>
        <div className="mt-2 flex flex-wrap gap-4">
          {(["petrol", "diesel", "hybrid"] as const).map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input type="radio" name="fuel" value={f} defaultChecked={defaults.fuel === f} className="accent-brand-500" />
              {f}
            </label>
          ))}
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────── */}
      <div className="sm:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaults.description}
          placeholder="Describe the vehicle — condition, features, what makes it great for renters…"
          className="mt-1"
        />
      </div>

      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save & Continue →"}
        </Button>
      </div>
    </form>
  );
}
