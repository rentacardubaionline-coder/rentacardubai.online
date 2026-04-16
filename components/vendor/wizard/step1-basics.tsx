"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDraftStep1Action } from "@/app/actions/listings";

interface Step1Props {
  businessId: string;
  listingId?: string;
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
  };
}

export function Step1Basics({ businessId, listingId, defaults = {} }: Step1Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await saveDraftStep1Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${res.listingId}/edit?step=2`);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="businessId" value={businessId} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}

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
        <Label htmlFor="city">City *</Label>
        <select
          id="city"
          name="city"
          required
          defaultValue={defaults.city ?? ""}
          className="mt-1 block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="" disabled>Select city…</option>
          {["Karachi", "Lahore", "Islamabad"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="year">Year *</Label>
        <Input
          id="year"
          name="year"
          type="number"
          required
          min={1970}
          max={new Date().getFullYear() + 1}
          defaultValue={defaults.year}
          placeholder="2023"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <Input id="color" name="color" defaultValue={defaults.color} placeholder="Silver" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="seats">Seats</Label>
        <Input id="seats" name="seats" type="number" min={1} max={20} defaultValue={defaults.seats} placeholder="5" className="mt-1" />
      </div>

      <div>
        <Label>Transmission</Label>
        <div className="mt-2 flex gap-4">
          {["manual", "automatic"].map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="transmission"
                value={t}
                defaultChecked={defaults.transmission === t}
                className="accent-brand-500"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Fuel type</Label>
        <div className="mt-2 flex flex-wrap gap-4">
          {["petrol", "diesel", "hybrid"].map((f) => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
              <input
                type="radio"
                name="fuel"
                value={f}
                defaultChecked={defaults.fuel === f}
                className="accent-brand-500"
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="mileage_km">Current mileage (km)</Label>
        <Input id="mileage_km" name="mileage_km" type="number" min={0} defaultValue={defaults.mileage_km} placeholder="15000" className="mt-1" />
      </div>

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
