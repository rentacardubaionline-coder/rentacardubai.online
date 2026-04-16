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

export function Step3Policies({ listingId, policy = {} }: Step3Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [deliveryAvailable, setDeliveryAvailable] = useState(policy.delivery_available ?? false);

  function onSubmit(formData: FormData) {
    // Manually set boolean fields since unchecked checkboxes aren't included in FormData
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
    <form action={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="listingId" value={listingId} />

      <div>
        <Label htmlFor="deposit_pkr">Security deposit (PKR)</Label>
        <Input
          id="deposit_pkr"
          name="deposit_pkr"
          type="number"
          min={0}
          defaultValue={policy.deposit_pkr ?? ""}
          placeholder="e.g. 20000"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="min_age">Minimum driver age</Label>
        <Input
          id="min_age"
          name="min_age"
          type="number"
          min={18}
          max={99}
          defaultValue={policy.min_age ?? 21}
          className="mt-1"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <input
          id="license_required"
          name="license_required"
          type="checkbox"
          defaultChecked={policy.license_required ?? true}
          className="h-4 w-4 rounded accent-brand-500"
        />
        <Label htmlFor="license_required" className="cursor-pointer">
          Valid driving licence required
        </Label>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="cancellation_text">Cancellation policy</Label>
        <Textarea
          id="cancellation_text"
          name="cancellation_text"
          rows={3}
          maxLength={500}
          defaultValue={policy.cancellation_text ?? ""}
          placeholder="e.g. Free cancellation up to 24 hours before rental."
          className="mt-1"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={deliveryAvailable}
          onClick={() => setDeliveryAvailable((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            deliveryAvailable ? "bg-brand-500" : "bg-surface-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform ${
              deliveryAvailable ? "translate-x-6" : ""
            }`}
          />
        </button>
        <Label className="cursor-pointer" onClick={() => setDeliveryAvailable((v) => !v)}>
          Delivery available
        </Label>
      </div>

      {deliveryAvailable && (
        <div>
          <Label htmlFor="delivery_fee_pkr">Delivery fee (PKR)</Label>
          <Input
            id="delivery_fee_pkr"
            name="delivery_fee_pkr"
            type="number"
            min={0}
            defaultValue={policy.delivery_fee_pkr ?? ""}
            placeholder="e.g. 1500"
            className="mt-1"
          />
        </div>
      )}

      <div className="sm:col-span-2 flex justify-between pt-2">
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
