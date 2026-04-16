"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDraftStep3Action } from "@/app/actions/listings";

interface Policy {
  deposit_pkr?: number | null;
  min_age?: number | null;
  license_required?: boolean | null;
  cancellation_text?: string | null;
  delivery_available?: boolean | null;
  delivery_fee_pkr?: number | null;
}

interface Step3Props {
  listingId: string;
  policy?: Policy;
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

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        checked ? "bg-brand-500" : "bg-surface-muted border border-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function CheckboxField({
  id,
  name,
  label,
  hint,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className="col-span-full flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white p-4 hover:bg-surface-muted/30 transition-colors"
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-500"
      />
      <div>
        <p className="text-sm font-semibold text-ink-900">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-400">{hint}</p>}
      </div>
    </label>
  );
}

export function Step3Policies({ listingId, policy = {} }: Step3Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [deliveryAvailable, setDeliveryAvailable] = useState(policy.delivery_available ?? false);

  function onSubmit(formData: FormData) {
    formData.set("license_required", (formData.get("license_required") !== null).toString());
    formData.set("delivery_available", deliveryAvailable.toString());

    startTransition(async () => {
      const res = await saveDraftStep3Action(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        router.push(`/vendor/listings/${listingId}/edit?step=5`);
      }
    });
  }

  return (
    <form action={onSubmit} className="grid grid-cols-2 gap-x-4 gap-y-5">
      <input type="hidden" name="listingId" value={listingId} />

      {/* ── Requirements ─────────────────────────────────────────── */}
      <SectionHeader>Requirements</SectionHeader>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deposit_pkr">
          Security deposit
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">optional</span>
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-ink-400">
            Rs.
          </span>
          <Input
            id="deposit_pkr"
            name="deposit_pkr"
            type="number"
            min={0}
            defaultValue={policy.deposit_pkr ?? ""}
            placeholder="e.g. 20,000"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-ink-400">Collected at handover, returned on safe return.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="min_age">Minimum driver age</Label>
        <div className="relative">
          <Input
            id="min_age"
            name="min_age"
            type="number"
            min={18}
            max={99}
            defaultValue={policy.min_age ?? 21}
          />
          <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-xs font-medium text-ink-400">
            yrs
          </span>
        </div>
      </div>

      <CheckboxField
        id="license_required"
        name="license_required"
        label="Valid driving licence required"
        hint="Renter must present a valid CNIC + driving licence at pickup."
        defaultChecked={policy.license_required ?? true}
      />

      {/* ── Cancellation ─────────────────────────────────────────── */}
      <SectionHeader>Cancellation</SectionHeader>

      <div className="col-span-full flex flex-col gap-1.5">
        <Label htmlFor="cancellation_text">
          Cancellation policy
          <span className="ml-1.5 text-[11px] font-normal text-ink-400">optional</span>
        </Label>
        <Textarea
          id="cancellation_text"
          name="cancellation_text"
          rows={3}
          maxLength={500}
          defaultValue={policy.cancellation_text ?? ""}
          placeholder="e.g. Free cancellation up to 24 hours before rental. No refund within 24 hours."
        />
      </div>

      {/* ── Delivery ─────────────────────────────────────────────── */}
      <SectionHeader>Delivery</SectionHeader>

      <div className="col-span-full flex items-center justify-between rounded-xl border border-border bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-ink-900">Offer delivery</p>
          <p className="mt-0.5 text-xs text-ink-400">Deliver the car to the renter's location for a fee.</p>
        </div>
        <Toggle checked={deliveryAvailable} onChange={setDeliveryAvailable} />
      </div>

      {deliveryAvailable && (
        <div className="col-span-full flex flex-col gap-1.5">
          <Label htmlFor="delivery_fee_pkr">Delivery fee</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-ink-400">
              Rs.
            </span>
            <Input
              id="delivery_fee_pkr"
              name="delivery_fee_pkr"
              type="number"
              min={0}
              defaultValue={policy.delivery_fee_pkr ?? ""}
              placeholder="e.g. 1,500"
              className="pl-9"
            />
          </div>
        </div>
      )}

      <div className="col-span-full flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/vendor/listings/${listingId}/edit?step=3`)}
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
