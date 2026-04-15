"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addVendorReviewAction } from "@/app/actions/reviews";

interface BusinessOption {
  id: string;
  name: string;
  city: string;
}

export function AddReviewForm({ businesses }: { businesses: BusinessOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState("5");

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addVendorReviewAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Review added");
        (document.getElementById("add-review-form") as HTMLFormElement | null)?.reset();
        setRating("5");
      }
    });
  }

  return (
    <form id="add-review-form" action={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="businessId">Vendor</Label>
        <select
          id="businessId"
          name="businessId"
          required
          className="mt-1 block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Select a vendor…</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} — {b.city}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="authorName">Reviewer name</Label>
        <Input id="authorName" name="authorName" required maxLength={80} />
      </div>

      <div>
        <Label htmlFor="rating">Rating (1–5)</Label>
        <select
          id="rating"
          name="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="mt-1 block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="body">Review (optional)</Label>
        <Textarea id="body" name="body" rows={3} maxLength={1000} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding…" : "Add review"}
        </Button>
      </div>
    </form>
  );
}
