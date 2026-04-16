"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Flame, Leaf, Zap, Settings2, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDraftStep1Action } from "@/app/actions/listings";
import { cn } from "@/lib/utils";

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

const selectCls =
  "h-9 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 pr-8 text-sm transition-colors focus:border-ring focus:ring-3 focus:ring-ring/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-3 pt-1">
      <span className="text-[11px] font-bold uppercase tracking-widest text-ink-400 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 border-t border-border" />
    </div>
  );
}

function PillOption({
  name,
  value,
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  icon?: React.ElementType;
  checked: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all select-none",
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-border bg-white text-ink-500 hover:border-ink-300 hover:bg-surface-muted/50"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      {label}
    </label>
  );
}

export function Step1Basics({ businessId, listingId, makes, models, defaults = {} }: Step1Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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
  const [transmission, setTransmission] = useState(defaults.transmission ?? "automatic");
  const [fuel, setFuel] = useState(defaults.fuel ?? "petrol");

  const filteredModels = models.filter((m) => m.make_id === selectedMakeId);
  const selectedMake = makes.find((m) => m.id === selectedMakeId);
  const selectedModel = models.find((m) => m.id === selectedModelId);

  useEffect(() => {
    if (titleTouched) return;
    if (selectedMake && selectedModel && year) {
      setTitleOverride(`${selectedMake.name} ${selectedModel.name} ${year}`);
    }
  }, [selectedMakeId, selectedModelId, year, titleTouched, selectedMake, selectedModel]);

  function handleMakeChange(makeId: string) {
    setSelectedMakeId(makeId);
    setSelectedModelId("");
  }

  function onSubmit(formData: FormData) {
    formData.set("model_id", selectedModelId);
    formData.set("transmission", transmission);
    formData.set("fuel", fuel);
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
    <form action={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="businessId" value={businessId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}

      {/* ── Vehicle ──────────────────────────────────────────────── */}
      <SectionHeader>Vehicle</SectionHeader>

      {hasMakes ? (
        <>
          {/* Make */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="make">Make <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <select
                id="make"
                required
                value={selectedMakeId}
                onChange={(e) => handleMakeChange(e.target.value)}
                className={cn(selectCls, "pl-9")}
              >
                <option value="" disabled>Select make…</option>
                {makes.map((mk) => (
                  <option key={mk.id} value={mk.id}>{mk.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
                {selectedMake?.logo_url ? (
                  <img src={selectedMake.logo_url} alt="" className="h-4 w-4 object-contain" />
                ) : (
                  <Car className="h-4 w-4 text-ink-300" />
                )}
              </span>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="model">Model <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <select
                id="model"
                required
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                disabled={!selectedMakeId}
                className={selectCls}
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">Year <span className="text-rose-500">*</span></Label>
            <div className="relative">
              <select
                id="year"
                name="year"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled>Select year…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Title */}
          <div className="col-span-full flex flex-col gap-1.5">
            <Label htmlFor="title">
              Listing title <span className="text-rose-500">*</span>
              {!titleTouched && selectedMake && selectedModel && year && (
                <span className="ml-2 text-[11px] font-semibold text-emerald-600">Auto-generated</span>
              )}
            </Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              value={titleOverride}
              onChange={(e) => { setTitleOverride(e.target.value); setTitleTouched(true); }}
              placeholder="Toyota Corolla 2023"
            />
            <p className="text-xs text-ink-400">
              Auto-filled from make / model / year. Optionally add a detail like "— Sunroof".
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Fallback: free-text title + year */}
          <div className="col-span-full flex flex-col gap-1.5">
            <Label htmlFor="title">Listing title <span className="text-rose-500">*</span></Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={120}
              defaultValue={defaults.title}
              placeholder="Toyota Corolla 2023 — Automatic"
            />
            <p className="text-xs text-ink-400">Make, model, year, and a key feature work well.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="year">Year <span className="text-rose-500">*</span></Label>
            <Input
              id="year"
              name="year"
              type="number"
              required
              min={1970}
              max={CURRENT_YEAR + 1}
              defaultValue={defaults.year}
              placeholder="2023"
            />
          </div>
        </>
      )}

      {/* ── Location & Details ────────────────────────────────────── */}
      <SectionHeader>Location &amp; Details</SectionHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City <span className="text-rose-500">*</span></Label>
        <div className="relative">
          <select
            id="city"
            name="city"
            required
            defaultValue={defaults.city ?? ""}
            className={selectCls}
          >
            <option value="" disabled>Select city…</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="color">Color</Label>
        <Input id="color" name="color" defaultValue={defaults.color} placeholder="e.g. Silver, White" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="seats">Seats</Label>
        <Input id="seats" name="seats" type="number" min={1} max={20} defaultValue={defaults.seats} placeholder="5" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mileage_km">Mileage (km)</Label>
        <div className="relative">
          <Input
            id="mileage_km"
            name="mileage_km"
            type="number"
            min={0}
            defaultValue={defaults.mileage_km}
            placeholder="e.g. 15000"
            className="pr-10"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-400">
            km
          </span>
        </div>
      </div>

      {/* ── Drivetrain ────────────────────────────────────────────── */}
      <SectionHeader>Drivetrain</SectionHeader>

      <div className="col-span-full flex flex-col gap-2">
        <Label>Transmission</Label>
        <div className="grid grid-cols-2 gap-2">
          <PillOption name="transmission" value="manual" label="Manual" icon={Settings2} checked={transmission === "manual"} onChange={setTransmission} />
          <PillOption name="transmission" value="automatic" label="Automatic" icon={Car} checked={transmission === "automatic"} onChange={setTransmission} />
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-2">
        <Label>Fuel type</Label>
        <div className="grid grid-cols-3 gap-2">
          <PillOption name="fuel" value="petrol" label="Petrol" icon={Flame} checked={fuel === "petrol"} onChange={setFuel} />
          <PillOption name="fuel" value="diesel" label="Diesel" icon={Zap} checked={fuel === "diesel"} onChange={setFuel} />
          <PillOption name="fuel" value="hybrid" label="Hybrid" icon={Leaf} checked={fuel === "hybrid"} onChange={setFuel} />
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────── */}
      <SectionHeader>Description</SectionHeader>

      <div className="col-span-full flex flex-col gap-1.5">
        <Label htmlFor="description">About this car</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaults.description}
          placeholder="Describe the condition, standout features, and why renters will love it…"
        />
        <p className="text-xs text-ink-400">Optional but helps your listing rank higher in search.</p>
      </div>

      <div className="col-span-full flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save & Continue →"}
        </Button>
      </div>
    </form>
  );
}
