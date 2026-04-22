"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Flame, Leaf, Zap, Settings2, Car, ArrowRight } from "lucide-react";
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
  defaultCity?: string;
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
  "h-12 w-full appearance-none rounded-xl border border-input bg-white px-3.5 pr-8 text-sm font-medium transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:rounded-lg";

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-3 py-1">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-400 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 border-t border-surface-muted" />
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
        "flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition-all select-none active:scale-95 sm:rounded-xl sm:py-2.5",
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/20"
          : "border-surface-muted bg-white text-ink-500 hover:border-ink-200 hover:bg-surface-muted/50"
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
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {label}
    </label>
  );
}

export function Step1Basics({
  businessId,
  listingId,
  makes,
  models,
  defaultCity,
  defaults = {},
}: Step1Props) {
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
    if (hasMakes) formData.set("title", titleOverride);

    startTransition(async () => {
      const res = await saveDraftStep1Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        // If this was a new listing, replace the "/new" history entry with step 1
        // so clicking the browser's Back button from step 2 doesn't load a blank form.
        if (!listingId) {
          window.history.replaceState(null, "", `/vendor/listings/${res.listingId}/edit?step=1`);
        }
        router.push(`/vendor/listings/${res.listingId}/edit?step=2`);
      }
    });
  }

  const hasMakes = makes.length > 0;
  const cityDefault = defaults.city ?? defaultCity ?? "";

  return (
    <form action={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="businessId" value={businessId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}

      {/* ── Vehicle ──────────────────────────────────────────────── */}
      <SectionDivider>Vehicle</SectionDivider>

      {hasMakes ? (
        <>
          {/* Make */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Make <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <select
                required
                value={selectedMakeId}
                onChange={(e) => handleMakeChange(e.target.value)}
                className={cn(selectCls, "pl-10")}
              >
                <option value="" disabled>Select make…</option>
                {makes.map((mk) => (
                  <option key={mk.id} value={mk.id}>{mk.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                {selectedMake?.logo_url ? (
                  <img src={selectedMake.logo_url} alt="" className="h-4 w-4 object-contain" />
                ) : (
                  <Car className="h-4 w-4 text-ink-300" />
                )}
              </span>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Model */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Model <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <select
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Year <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <select
                name="year"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled>Year…</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            </div>
          </div>

          {/* Title */}
          <div className="col-span-full flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Listing title <span className="text-rose-500">*</span>
              {!titleTouched && selectedMake && selectedModel && year && (
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  Auto-generated
                </span>
              )}
            </Label>
            <Input
              name="title"
              required
              maxLength={120}
              value={titleOverride}
              onChange={(e) => { setTitleOverride(e.target.value); setTitleTouched(true); }}
              placeholder="Toyota Corolla 2023"
              className="h-12 sm:h-10"
            />
            <p className="text-xs text-ink-400">
              Auto-filled from make/model/year. You can add a detail like "— Sunroof".
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="col-span-full flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Listing title <span className="text-rose-500">*</span>
            </Label>
            <Input
              name="title"
              required
              maxLength={120}
              defaultValue={defaults.title}
              placeholder="Toyota Corolla 2023 — Automatic"
              className="h-12 sm:h-10"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-ink-700">
              Year <span className="text-rose-500">*</span>
            </Label>
            <Input
              name="year"
              type="number"
              required
              min={1970}
              max={CURRENT_YEAR + 1}
              defaultValue={defaults.year}
              placeholder="2023"
              className="h-12 sm:h-10"
            />
          </div>
        </>
      )}

      {/* ── Location & Details ────────────────────────────────────── */}
      <SectionDivider>Location &amp; Details</SectionDivider>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-ink-700">
          City <span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <select
            name="city"
            required
            defaultValue={cityDefault}
            className={selectCls}
          >
            <option value="" disabled>City…</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-ink-700">Color</Label>
        <Input
          name="color"
          defaultValue={defaults.color}
          placeholder="Silver, White…"
          className="h-12 sm:h-10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-ink-700">Seats</Label>
        <Input
          name="seats"
          type="number"
          min={1}
          max={20}
          defaultValue={defaults.seats}
          placeholder="5"
          className="h-12 sm:h-10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold text-ink-700">Mileage</Label>
        <div className="relative">
          <Input
            name="mileage_km"
            type="number"
            min={0}
            defaultValue={defaults.mileage_km}
            placeholder="15,000"
            className="h-12 pr-10 sm:h-10"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400">
            km
          </span>
        </div>
      </div>

      {/* ── Drivetrain ────────────────────────────────────────────── */}
      <SectionDivider>Drivetrain</SectionDivider>

      <div className="col-span-full flex flex-col gap-2.5">
        <Label className="text-sm font-semibold text-ink-700">Transmission</Label>
        <div className="grid grid-cols-2 gap-2.5">
          <PillOption name="transmission" value="manual" label="Manual" icon={Settings2} checked={transmission === "manual"} onChange={setTransmission} />
          <PillOption name="transmission" value="automatic" label="Automatic" icon={Car} checked={transmission === "automatic"} onChange={setTransmission} />
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-2.5">
        <Label className="text-sm font-semibold text-ink-700">Fuel type</Label>
        <div className="grid grid-cols-3 gap-2.5">
          <PillOption name="fuel" value="petrol" label="Petrol" icon={Flame} checked={fuel === "petrol"} onChange={setFuel} />
          <PillOption name="fuel" value="diesel" label="Diesel" icon={Zap} checked={fuel === "diesel"} onChange={setFuel} />
          <PillOption name="fuel" value="hybrid" label="Hybrid" icon={Leaf} checked={fuel === "hybrid"} onChange={setFuel} />
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────── */}
      <SectionDivider>Description</SectionDivider>

      <div className="col-span-full flex flex-col gap-2">
        <Label className="text-sm font-semibold text-ink-700">About this car</Label>
        <Textarea
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={defaults.description}
          placeholder="Condition, standout features, why renters will love it…"
          className="resize-none rounded-xl text-sm sm:rounded-lg"
        />
        <p className="text-xs text-ink-400">
          Optional but improves visibility in search results.
        </p>
      </div>

      {/* ── Sticky bottom action bar ───────────────────────────────── */}
      <div className="col-span-full">
        {/* Mobile: full-width sticky bar */}
        <div className="fixed inset-x-0 bottom-16 z-20 border-t border-surface-muted bg-white/95 p-4 backdrop-blur sm:hidden">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-13 rounded-2xl text-base font-bold shadow-lg shadow-brand-500/25 gap-2"
          >
            {isPending ? "Saving…" : <>Save & Continue <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>

        {/* Desktop: inline right-aligned */}
        <div className="hidden sm:flex justify-end pt-2 border-t border-surface-muted mt-2">
          <Button type="submit" disabled={isPending} className="gap-1.5">
            {isPending ? "Saving…" : <>Save & Continue <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </form>
  );
}
