"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Flame,
  Leaf,
  Zap,
  Settings2,
  Car,
  ArrowRight,
  MapPin,
  Calendar,
  Palette,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { CarTypePicker, type CarType } from "./car-type-picker";
import { saveDraftStep1Action } from "@/app/actions/listings";
import { cn } from "@/lib/utils";

interface Make {
  id: string;
  name: string;
  slug: string;
}

interface Model {
  id: string;
  make_id: string;
  name: string;
  slug: string;
  body_type: string | null;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Step1Props {
  businessId: string;
  listingId?: string;
  makes: Make[];
  models: Model[];
  cities: City[];
  defaultCity?: string;
  defaults?: {
    title?: string;
    city?: string;
    year?: number;
    color?: string;
    transmission?: string;
    fuel?: string;
    seats?: number;
    model_id?: string;
    tier_code?: CarType | null;
  };
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: ComboboxOption[] = Array.from(
  { length: CURRENT_YEAR - 1969 },
  (_, i) => {
    const y = CURRENT_YEAR + 1 - i;
    return { value: String(y), label: String(y) };
  },
);

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
    <div className="col-span-full flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-50 to-orange-50/40 px-4 py-3 ring-1 ring-brand-100/60">
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
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all select-none active:scale-95",
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/20"
          : "border-surface-muted bg-white text-ink-600 hover:border-ink-200 hover:bg-surface-sunken",
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
      {Icon && <Icon className="size-4 shrink-0" />}
      {label}
    </label>
  );
}

export function Step1Basics({
  businessId,
  listingId,
  makes,
  models,
  cities,
  defaultCity,
  defaults = {},
}: Step1Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  /* ── Make / Model (with "add new" support) ──────────────────────── */
  // When editing a listing whose model_id is null (vendor typed custom values),
  // recover the make + model labels from the saved title so the fields don't
  // appear empty. Title is auto-built as "<Make> <Model> <Year>", so we drop
  // a trailing year token and split: first word → make, remainder → model.
  const recoveredFromTitle = (() => {
    if (defaults.model_id || !defaults.title) return null;
    const parts = defaults.title.trim().split(/\s+/);
    if (parts.length < 2) return null;
    // Drop trailing year token if present.
    const last = parts[parts.length - 1];
    const tail = /^(19|20)\d{2}$/.test(last) ? parts.slice(0, -1) : parts;
    if (tail.length < 2) return null;
    return { make: tail[0], model: tail.slice(1).join(" ") };
  })();

  const [makeId, setMakeId] = useState<string>(() => {
    if (defaults.model_id) {
      return models.find((m) => m.id === defaults.model_id)?.make_id ?? "";
    }
    if (recoveredFromTitle) {
      // Match a known make by name (case-insensitive); leave empty otherwise
      // so the recovered label drives `customMakeLabel` instead.
      const known = makes.find(
        (m) => m.name.toLowerCase() === recoveredFromTitle.make.toLowerCase(),
      );
      return known?.id ?? "";
    }
    return "";
  });
  const [customMakeLabel, setCustomMakeLabel] = useState<string>(() => {
    if (defaults.model_id) return "";
    if (!recoveredFromTitle) return "";
    const known = makes.find(
      (m) => m.name.toLowerCase() === recoveredFromTitle.make.toLowerCase(),
    );
    return known ? "" : recoveredFromTitle.make;
  });
  const [modelId, setModelId] = useState<string>(defaults.model_id ?? "");
  const [customModelLabel, setCustomModelLabel] = useState<string>(() => {
    if (defaults.model_id) return "";
    return recoveredFromTitle?.model ?? "";
  });

  const selectedMake = makes.find((m) => m.id === makeId);
  const selectedModel = models.find((m) => m.id === modelId);
  const makeDisplay = selectedMake?.name ?? customMakeLabel;
  const modelDisplay = selectedModel?.name ?? customModelLabel;

  const makeOptions: ComboboxOption[] = makes.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  // Filter models by selected make only when it's a known make.
  // If a custom make is in play, we show an empty options list and the user can "Add new".
  const modelOptions: ComboboxOption[] = selectedMake
    ? models
        .filter((m) => m.make_id === selectedMake.id)
        .map((m) => ({
          value: m.id,
          label: m.name,
          sublabel: m.body_type ?? undefined,
        }))
    : [];

  /* ── Year ──────────────────────────────────────────────────────── */
  const [year, setYear] = useState<string>(
    defaults.year ? String(defaults.year) : "",
  );

  /* ── City ──────────────────────────────────────────────────────── */
  const [city, setCity] = useState<string>(defaults.city ?? defaultCity ?? "");
  const cityOptions: ComboboxOption[] = cities.map((c) => ({
    value: c.name,
    label: c.name,
  }));

  /* ── Title + other ─────────────────────────────────────────────── */
  const [title, setTitle] = useState<string>(defaults.title ?? "");
  const [titleTouched, setTitleTouched] = useState(false);
  const [transmission, setTransmission] = useState(
    defaults.transmission ?? "automatic",
  );
  const [fuel, setFuel] = useState(defaults.fuel ?? "petrol");
  const [tierCode, setTierCode] = useState<CarType | "">(
    (defaults.tier_code as CarType) ?? "",
  );

  useEffect(() => {
    if (titleTouched) return;
    if (makeDisplay && modelDisplay && year) {
      setTitle(`${makeDisplay} ${modelDisplay} ${year}`);
    }
  }, [makeDisplay, modelDisplay, year, titleTouched]);

  function onSubmit(formData: FormData) {
    // Only send model_id if it's a real DB id (not a custom entry). Server will
    // fall back to the free-text title + year when model_id is absent.
    formData.set("model_id", selectedModel ? selectedModel.id : "");
    formData.set("transmission", transmission);
    formData.set("fuel", fuel);
    formData.set("title", title);
    formData.set("city", city);
    formData.set("year", year);
    formData.set("tier_code", tierCode);

    startTransition(async () => {
      const res = await saveDraftStep1Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        if (!listingId) {
          window.history.replaceState(
            null,
            "",
            `/vendor/listings/${res.listingId}/edit?step=1`,
          );
        }
        router.push(`/vendor/listings/${res.listingId}/edit?step=2`);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="businessId" value={businessId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}

      {/* ── Car type ───────────────────────────────────────────── */}
      <SectionHeader
        icon={Car}
        title="Car type"
        subtitle="Choose the category that best fits this vehicle — it sets the per-lead rate."
      />

      <div className="col-span-full">
        <CarTypePicker value={tierCode} onChange={setTierCode} />
        {!tierCode && (
          <p className="mt-2 text-xs text-ink-400">
            <span className="font-semibold text-rose-500">*</span> Pick the
            category that matches your car.
          </p>
        )}
      </div>

      {/* ── Vehicle ─────────────────────────────────────────────── */}
      <SectionHeader
        icon={Car}
        title="Make, model & year"
        subtitle="Not in the list? Type it and add as new."
      />

      {/* Make */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-ink-700">
          Make <span className="text-rose-500">*</span>
        </Label>
        <Combobox
          value={
            makeId || (customMakeLabel ? `__custom__:${customMakeLabel}` : "")
          }
          displayValue={makeDisplay}
          onChange={(value, label, isCustom) => {
            if (isCustom) {
              setMakeId("");
              setCustomMakeLabel(label);
            } else {
              setMakeId(value);
              setCustomMakeLabel("");
            }
            setModelId("");
            setCustomModelLabel("");
          }}
          options={makeOptions}
          allowCustom
          addNewLabel="Add as new make"
          placeholder="Select make…"
        />
      </div>

      {/* Model */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-ink-700">
          Model <span className="text-rose-500">*</span>
        </Label>
        <Combobox
          value={
            modelId ||
            (customModelLabel ? `__custom__:${customModelLabel}` : "")
          }
          displayValue={modelDisplay}
          onChange={(value, label, isCustom) => {
            if (isCustom) {
              setModelId("");
              setCustomModelLabel(label);
            } else {
              setModelId(value);
              setCustomModelLabel("");
            }
          }}
          options={modelOptions}
          allowCustom
          addNewLabel="Add as new model"
          placeholder={
            selectedMake
              ? "Select model…"
              : customMakeLabel
                ? "Add any model"
                : "Pick a make first"
          }
          disabled={!makeId && !customMakeLabel}
        />
      </div>

      {/* Year */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-ink-700">
          Year <span className="text-rose-500">*</span>
        </Label>
        <Combobox
          value={year}
          onChange={(_, label) => setYear(label)}
          options={YEARS}
          placeholder="Year…"
          allowCustom
          addNewLabel="Use year"
        />
      </div>

      {/* Title */}
      <div className="col-span-full flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-ink-700">
          Listing title <span className="text-rose-500">*</span>
          {!titleTouched && makeDisplay && modelDisplay && year && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Auto-generated
            </span>
          )}
        </Label>
        <Input
          required
          maxLength={120}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setTitleTouched(true);
          }}
          placeholder="Toyota Corolla 2023"
          className="h-12 border-2 border-surface-muted bg-white font-medium focus-visible:border-brand-500 focus-visible:ring-brand-500/20 sm:h-11"
        />
        <p className="text-xs text-ink-500">
          Auto-built from make/model/year. Tweak it to add a hook — e.g. "—
          Sunroof, Leather".
        </p>
      </div>

      {/* ── Location & Details ────────────────────────────────── */}
      <SectionHeader
        icon={MapPin}
        title="Location & specs"
        subtitle="Where is the car, and the basics renters will want to know."
      />

      {/* City */}
      <div className="col-span-full flex flex-col gap-1.5">
        <Label className="text-sm font-semibold text-ink-700">
          City <span className="text-rose-500">*</span>
        </Label>
        <Combobox
          value={city}
          displayValue={city}
          onChange={(_, label) => setCity(label)}
          options={cityOptions}
          allowCustom
          addNewLabel="Add as new city"
          placeholder="Any Dubai area — Marina, JBR, Business Bay…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
          <Palette className="size-3.5 text-brand-500" />
          Color
        </Label>
        <Input
          name="color"
          defaultValue={defaults.color}
          placeholder="Silver, White…"
          className="h-12 border-2 border-surface-muted bg-white font-medium focus-visible:border-brand-500 focus-visible:ring-brand-500/20 sm:h-11"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="flex items-center gap-1.5 text-sm font-semibold text-ink-700">
          <Users className="size-3.5 text-brand-500" />
          Seats
        </Label>
        <Input
          name="seats"
          type="number"
          min={1}
          max={20}
          defaultValue={defaults.seats}
          placeholder="5"
          className="h-12 border-2 border-surface-muted bg-white font-medium focus-visible:border-brand-500 focus-visible:ring-brand-500/20 sm:h-11"
        />
      </div>

      {/* ── Drivetrain ─────────────────────────────────────────── */}
      <SectionHeader
        icon={Settings2}
        title="Drivetrain"
        subtitle="Transmission and fuel type."
      />

      <div className="col-span-full flex flex-col gap-2.5">
        <Label className="text-sm font-semibold text-ink-700">
          Transmission
        </Label>
        <div className="grid grid-cols-2 gap-2.5">
          <PillOption
            name="transmission"
            value="manual"
            label="Manual"
            icon={Settings2}
            checked={transmission === "manual"}
            onChange={setTransmission}
          />
          <PillOption
            name="transmission"
            value="automatic"
            label="Automatic"
            icon={Car}
            checked={transmission === "automatic"}
            onChange={setTransmission}
          />
        </div>
      </div>

      <div className="col-span-full flex flex-col gap-2.5">
        <Label className="text-sm font-semibold text-ink-700">Fuel type</Label>
        <div className="grid grid-cols-3 gap-2.5">
          <PillOption
            name="fuel"
            value="petrol"
            label="Petrol"
            icon={Flame}
            checked={fuel === "petrol"}
            onChange={setFuel}
          />
          <PillOption
            name="fuel"
            value="diesel"
            label="Diesel"
            icon={Zap}
            checked={fuel === "diesel"}
            onChange={setFuel}
          />
          <PillOption
            name="fuel"
            value="hybrid"
            label="Hybrid"
            icon={Leaf}
            checked={fuel === "hybrid"}
            onChange={setFuel}
          />
        </div>
      </div>

      {/* Description is auto-generated server-side from the basics + pricing
          + features the vendor enters in later steps — no manual writing
          needed. See lib/listings/description.ts. */}

      {/* ── Submit — inline on every breakpoint to avoid the previous fixed
          bottom bar that caused the double-scroll + white-space issue when
          interacting with the mobile bottom nav. */}
      <div className="col-span-full mt-2 flex justify-end border-t border-surface-muted pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full gap-2 rounded-2xl text-base font-bold shadow-lg shadow-brand-500/25 sm:h-10 sm:w-auto sm:rounded-xl sm:text-sm"
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
    </form>
  );
}
