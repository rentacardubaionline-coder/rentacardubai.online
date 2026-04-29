"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Wallet,
  Users,
  UserRound,
  Plus,
  Trash2,
  PackagePlus,
  Info,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDraftStep2Action } from "@/app/actions/listings";
import { cn } from "@/lib/utils";

interface Pricing {
  tier: string;
  price_pkr: number;
}

interface Mode {
  mode: string;
  surcharge_pkr: number;
}

interface Addon {
  id?: string;
  title: string;
  description: string | null;
  price_pkr: number;
}

interface Step3Props {
  listingId: string;
  pricing?: Pricing[];
  modes?: Mode[];
  addons?: Addon[];
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

function PkrInput({
  id,
  name,
  required,
  value,
  onChange,
  defaultValue,
  placeholder,
}: {
  id?: string;
  name?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: number | string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-extrabold text-brand-600">
        AED
      </span>

      <Input
        id={id}
        name={name}
        type="number"
        required={required}
        min={0}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-12 border-2 border-surface-muted bg-white pl-10 font-semibold focus-visible:border-brand-500 focus-visible:ring-brand-500/20 sm:h-11"
      />
    </div>
  );
}

export function Step3Pricing({
  listingId,
  pricing = [],
  modes = [],
  addons: initialAddons = [],
}: Step3Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const dailyExisting = pricing.find((p) => p.tier === "daily")?.price_pkr;
  const weeklyExisting = pricing.find((p) => p.tier === "weekly")?.price_pkr;
  const monthlyExisting = pricing.find((p) => p.tier === "monthly")?.price_pkr;
  const selfDriveExisting = pricing.find(
    (p) => p.tier === "self_drive_daily",
  )?.price_pkr;

  const hasSelfDriveMode = modes.some((m) => m.mode === "self_drive");

  const [daily, setDaily] = useState<string>(
    dailyExisting ? String(dailyExisting) : "",
  );
  const [weekly, setWeekly] = useState<string>(
    weeklyExisting ? String(weeklyExisting) : "",
  );
  const [monthly, setMonthly] = useState<string>(
    monthlyExisting ? String(monthlyExisting) : "",
  );
  const [offersSelfDrive, setOffersSelfDrive] = useState<boolean>(
    hasSelfDriveMode || Boolean(selfDriveExisting),
  );
  const [selfDrivePrice, setSelfDrivePrice] = useState<string>(
    selfDriveExisting ? String(selfDriveExisting) : "",
  );

  const [addons, setAddons] = useState<Addon[]>(initialAddons);

  function addAddon() {
    setAddons([...addons, { title: "", description: "", price_pkr: 0 }]);
  }
  function updateAddon(idx: number, patch: Partial<Addon>) {
    setAddons((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    );
  }
  function removeAddon(idx: number) {
    setAddons((prev) => prev.filter((_, i) => i !== idx));
  }

  function onSubmit(formData: FormData) {
    // Strip empty add-ons + validate minimal shape
    const cleanAddons = addons
      .map((a) => ({
        title: (a.title ?? "").trim(),
        description: (a.description ?? "").trim() || null,
        price_pkr: Number(a.price_pkr) || 0,
      }))
      .filter((a) => a.title.length > 0);
    formData.set("addons", JSON.stringify(cleanAddons));
    formData.set("offersSelfDrive", offersSelfDrive ? "true" : "false");

    startTransition(async () => {
      const res = await saveDraftStep2Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${listingId}/edit?step=4`);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="listingId" value={listingId} />

      {/* ── Daily rate (with driver) ──────────────────────────── */}
      <SectionHeader
        icon={Wallet}
        title="With-driver daily rate"
        subtitle="Your standard price — includes a driver for a 12-hour day."
      />

      <div className="col-span-full rounded-xl border-2 border-brand-200 bg-brand-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Users className="size-4" />
          </div>
          <div className="flex-1">
            <Label
              htmlFor="dailyPrice"
              className="text-sm font-extrabold text-ink-900"
            >
              Daily rate (with driver) <span className="text-rose-500">*</span>
            </Label>
            <p className="mt-0.5 text-xs text-ink-600">
              Price per day for a 12-hour shift with your driver. Fuel &amp;
              mileage can be listed as separate add-ons below.
            </p>
            <div className="mt-3 max-w-xs">
              <PkrInput
                id="dailyPrice"
                name="dailyPrice"
                required
                value={daily}
                onChange={setDaily}
                placeholder="800"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="weeklyPrice"
          className="text-sm font-semibold text-ink-700"
        >
          Weekly rate
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">
            optional
          </span>
        </Label>
        <PkrInput
          id="weeklyPrice"
          name="weeklyPrice"
          value={weekly}
          onChange={setWeekly}
          placeholder="4,500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="monthlyPrice"
          className="text-sm font-semibold text-ink-700"
        >
          Monthly rate
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">
            optional
          </span>
        </Label>
        <PkrInput
          id="monthlyPrice"
          name="monthlyPrice"
          value={monthly}
          onChange={setMonthly}
          placeholder="15,000"
        />
      </div>

      {/* ── Self-drive toggle ─────────────────────────────────── */}
      <SectionHeader
        icon={UserRound}
        title="Self-drive"
        subtitle="Optional — turn on only if you let renters drive themselves."
      />

      <div
        className={cn(
          "col-span-full rounded-2xl p-5 transition-all ring-2",
          offersSelfDrive
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 ring-emerald-600 shadow-lg shadow-emerald-500/25"
            : "bg-primary/50 ring-ink-200",
        )}
      >
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                offersSelfDrive
                  ? "bg-white text-emerald-600"
                  : "bg-ink-100 text-ink-500",
              )}
            >
              <UserRound className="size-5" />
            </div>
            <div>
              <p
                className={cn(
                  "text-base font-extrabold transition-colors",
                  offersSelfDrive ? "text-white" : "text-ink-900",
                )}
              >
                Also offer self-drive?
              </p>
              <p
                className={cn(
                  "text-xs transition-colors",
                  offersSelfDrive ? "text-white/90" : "text-ink-500",
                )}
              >
                Renters drive themselves — no driver provided.
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={offersSelfDrive}
            onChange={(e) => setOffersSelfDrive(e.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden
            className={cn(
              "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors ring-2",
              offersSelfDrive
                ? "bg-white ring-white/80"
                : "bg-ink-200 ring-ink-300",
            )}
          >
            <span
              className={cn(
                "inline-block size-6 transform rounded-full shadow-md transition-transform",
                offersSelfDrive
                  ? "translate-x-7 bg-emerald-600"
                  : "translate-x-1 bg-white",
              )}
            />
          </span>
        </label>

        {offersSelfDrive && (
          <div className="mt-5 flex flex-col gap-1.5 rounded-xl bg-white/95 p-4 ring-1 ring-white/50">
            <Label
              htmlFor="selfDrivePrice"
              className="text-sm font-extrabold text-ink-900"
            >
              Self-drive daily rate
            </Label>
            <div className="max-w-xs">
              <PkrInput
                id="selfDrivePrice"
                name="selfDrivePrice"
                value={selfDrivePrice}
                onChange={setSelfDrivePrice}
                placeholder="600"
              />
            </div>
            <p className="text-xs text-ink-600">
              Per day without a driver. Usually lower than the with-driver rate.
            </p>
          </div>
        )}
      </div>

      {/* ── Custom add-ons ────────────────────────────────────── */}
      <SectionHeader
        icon={PackagePlus}
        title="Add-ons"
        subtitle="Extras renters can request — child seat, GPS, airport pickup, etc."
      />

      <div className="col-span-full space-y-3">
        {addons.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border-2 border-dashed border-surface-muted bg-surface-sunken/60 p-4 text-xs text-ink-500">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <p>
              No add-ons yet. Click "Add an add-on" to list optional extras like
              child seat, driver overtime, airport pickup, or extra kilometres.
            </p>
          </div>
        ) : (
          addons.map((ad, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-xl border-2 border-surface-muted bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Title
                </Label>
                <Input
                  value={ad.title}
                  onChange={(e) => updateAddon(i, { title: e.target.value })}
                  placeholder="Child seat"
                  maxLength={80}
                  className="h-10 border-2 border-surface-muted bg-white font-semibold focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-start-1 sm:row-start-2 sm:col-span-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Description{" "}
                  <span className="font-normal normal-case text-ink-400">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  value={ad.description ?? ""}
                  onChange={(e) =>
                    updateAddon(i, { description: e.target.value })
                  }
                  placeholder="Short note for renters…"
                  maxLength={240}
                  rows={2}
                  className="resize-none rounded-xl border-2 border-surface-muted text-sm font-medium focus-visible:border-brand-500 focus-visible:ring-brand-500/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                  Price
                </Label>
                <PkrInput
                  value={String(ad.price_pkr || "")}
                  onChange={(v) =>
                    updateAddon(i, { price_pkr: Number(v) || 0 })
                  }
                  placeholder="50"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAddon(i)}
                aria-label="Remove add-on"
                className="inline-flex size-10 items-center justify-center rounded-lg border-2 border-rose-200 bg-white text-rose-600 hover:bg-rose-50 sm:self-end"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}

        <button
          type="button"
          onClick={addAddon}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100"
        >
          <Plus className="size-4" />
          Add an add-on
        </button>
      </div>

      {/* ── Submit ─────────────────────────────────────────────── */}
      <div className="col-span-full flex justify-between border-t border-surface-muted pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.push(`/vendor/listings/${listingId}/edit?step=2`)
          }
        >
          ← Back
        </Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
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
