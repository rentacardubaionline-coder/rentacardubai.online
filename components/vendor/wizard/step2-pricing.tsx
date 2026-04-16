"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface Step2Props {
  listingId: string;
  pricing?: Pricing[];
  modes?: Mode[];
}

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

function PkrInput({ id, name, required, defaultValue, placeholder }: {
  id: string; name: string; required?: boolean;
  defaultValue?: number; placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-ink-400">
        Rs.
      </span>
      <Input
        id={id}
        name={name}
        type="number"
        required={required}
        min={1}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}

function PillOption({
  name, value, label, icon: Icon, checked, onChange,
}: {
  name: string; value: string; label: string; icon?: React.ElementType;
  checked: boolean; onChange: (v: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all select-none",
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
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {label}
    </label>
  );
}

export function Step2Pricing({ listingId, pricing = [], modes = [] }: Step2Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const daily = pricing.find((p) => p.tier === "daily")?.price_pkr;
  const weekly = pricing.find((p) => p.tier === "weekly")?.price_pkr;
  const monthly = pricing.find((p) => p.tier === "monthly")?.price_pkr;

  const existingModes = modes.map((m) => m.mode);
  const initialMode =
    existingModes.includes("self_drive") && existingModes.includes("with_driver")
      ? "both"
      : existingModes[0] ?? "self_drive";

  const [rentalMode, setRentalMode] = useState(initialMode);

  const driverSurcharge = modes.find((m) => m.mode === "with_driver")?.surcharge_pkr ?? 0;
  const selfSurcharge = modes.find((m) => m.mode === "self_drive")?.surcharge_pkr ?? 0;

  function onSubmit(formData: FormData) {
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
      <input type="hidden" name="rentalMode" value={rentalMode} />

      {/* ── Rental rates ─────────────────────────────────────────── */}
      <SectionHeader>Rental rates</SectionHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dailyPrice">
          Daily rate <span className="text-rose-500">*</span>
        </Label>
        <PkrInput id="dailyPrice" name="dailyPrice" required defaultValue={daily} placeholder="8,000" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weeklyPrice">
          Weekly rate
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">optional</span>
        </Label>
        <PkrInput id="weeklyPrice" name="weeklyPrice" defaultValue={weekly} placeholder="45,000" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="monthlyPrice">
          Monthly rate
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">optional</span>
        </Label>
        <PkrInput id="monthlyPrice" name="monthlyPrice" defaultValue={monthly} placeholder="160,000" />
      </div>

      <div className="col-span-full rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700">
        Weekly / monthly rates are shown as discounted alternatives. Leave blank to offer daily only.
      </div>

      {/* ── Rental mode ──────────────────────────────────────────── */}
      <SectionHeader>Rental mode</SectionHeader>

      <div className="col-span-full flex flex-col gap-2">
        <p className="text-xs text-ink-400 -mt-1">How customers can rent this vehicle.</p>
        <div className="grid grid-cols-3 gap-2">
          <PillOption
            name="rentalMode_radio" value="self_drive" label="Self-drive"
            icon={UserRound} checked={rentalMode === "self_drive"} onChange={setRentalMode}
          />
          <PillOption
            name="rentalMode_radio" value="with_driver" label="With driver"
            icon={Users} checked={rentalMode === "with_driver"} onChange={setRentalMode}
          />
          <PillOption
            name="rentalMode_radio" value="both" label="Both"
            icon={Users} checked={rentalMode === "both"} onChange={setRentalMode}
          />
        </div>
      </div>

      {/* Surcharges (conditional) */}
      {(rentalMode === "with_driver" || rentalMode === "both") && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="withDriverSurcharge">
            Driver surcharge
            <span className="ml-1.5 text-[11px] font-normal text-ink-400">per day</span>
          </Label>
          <PkrInput id="withDriverSurcharge" name="withDriverSurcharge" defaultValue={driverSurcharge} placeholder="0" />
        </div>
      )}

      {(rentalMode === "self_drive" || rentalMode === "both") && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="selfDriveSurcharge">
            Self-drive surcharge
            <span className="ml-1.5 text-[11px] font-normal text-ink-400">per day</span>
          </Label>
          <PkrInput id="selfDriveSurcharge" name="selfDriveSurcharge" defaultValue={selfSurcharge} placeholder="0" />
        </div>
      )}

      <div className="col-span-full flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=2`)}
        >
          ← Back
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save & Continue →"}
        </Button>
      </div>
    </form>
  );
}
