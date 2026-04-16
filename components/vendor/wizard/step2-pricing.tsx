"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveDraftStep2Action } from "@/app/actions/listings";

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

export function Step2Pricing({ listingId, pricing = [], modes = [] }: Step2Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const daily = pricing.find((p) => p.tier === "daily")?.price_pkr;
  const weekly = pricing.find((p) => p.tier === "weekly")?.price_pkr;
  const monthly = pricing.find((p) => p.tier === "monthly")?.price_pkr;

  // Derive initial mode from existing modes
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
    <form action={onSubmit} className="grid gap-6 sm:grid-cols-2">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="rentalMode" value={rentalMode} />

      {/* Pricing tiers */}
      <div className="sm:col-span-2">
        <h3 className="font-semibold text-ink-900">Rental rates</h3>
        <p className="text-xs text-ink-400 mt-0.5">Daily rate is required. Weekly/monthly are optional discounts.</p>
      </div>

      <div>
        <Label htmlFor="dailyPrice">Daily rate (PKR) *</Label>
        <Input id="dailyPrice" name="dailyPrice" type="number" required min={1} defaultValue={daily} placeholder="8000" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="weeklyPrice">Weekly rate (PKR)</Label>
        <Input id="weeklyPrice" name="weeklyPrice" type="number" min={1} defaultValue={weekly} placeholder="optional" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="monthlyPrice">Monthly rate (PKR)</Label>
        <Input id="monthlyPrice" name="monthlyPrice" type="number" min={1} defaultValue={monthly} placeholder="optional" className="mt-1" />
      </div>

      {/* Rental mode */}
      <div className="sm:col-span-2 border-t border-surface-muted pt-6">
        <h3 className="font-semibold text-ink-900">Rental mode</h3>
        <p className="text-xs text-ink-400 mt-0.5">How customers can rent this vehicle.</p>
        <div className="mt-3 flex flex-wrap gap-4">
          {[
            { value: "self_drive", label: "Self-drive only" },
            { value: "with_driver", label: "With driver only" },
            { value: "both", label: "Both options" },
          ].map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="rentalMode_radio"
                value={opt.value}
                checked={rentalMode === opt.value}
                onChange={() => setRentalMode(opt.value)}
                className="accent-brand-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Surcharges (conditional) */}
      {(rentalMode === "with_driver" || rentalMode === "both") && (
        <div>
          <Label htmlFor="withDriverSurcharge">Driver surcharge (PKR/day)</Label>
          <Input
            id="withDriverSurcharge"
            name="withDriverSurcharge"
            type="number"
            min={0}
            defaultValue={driverSurcharge}
            placeholder="0"
            className="mt-1"
          />
        </div>
      )}

      {(rentalMode === "self_drive" || rentalMode === "both") && (
        <div>
          <Label htmlFor="selfDriveSurcharge">Self-drive surcharge (PKR/day)</Label>
          <Input
            id="selfDriveSurcharge"
            name="selfDriveSurcharge"
            type="number"
            min={0}
            defaultValue={selfSurcharge}
            placeholder="0"
            className="mt-1"
          />
        </div>
      )}

      <div className="sm:col-span-2 flex justify-between pt-2">
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
