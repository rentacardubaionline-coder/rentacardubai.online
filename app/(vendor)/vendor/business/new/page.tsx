"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createBusinessAction } from "@/app/actions/businesses";

export default function NewBusinessPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createBusinessAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Business created! Admin will review shortly.");
        router.push("/vendor/business");
      }
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Create your business</h1>
        <p className="mt-1 text-sm text-ink-500">
          Fill in the basic details. Admin will review and approve your listing.
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Business details</CardTitle>
          <CardDescription>
            You can add more info (address, description, photos) after approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="grid gap-4">
            <div>
              <Label htmlFor="name">Business name *</Label>
              <Input id="name" name="name" required maxLength={120} placeholder="Karachi Executive Rentals" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="phone">Phone number *</Label>
              <Input id="phone" name="phone" required placeholder="+923001234567" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="whatsapp_phone">WhatsApp number</Label>
              <Input id="whatsapp_phone" name="whatsapp_phone" placeholder="+923001234567 (optional)" className="mt-1" />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <select
                id="city"
                name="city"
                required
                className="mt-1 block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select city…</option>
                {["Karachi", "Lahore", "Islamabad"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={isPending} className="mt-2 w-full">
              {isPending ? "Creating…" : "Create business"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
