"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBusinessAction } from "@/app/actions/businesses";

interface Business {
  id: string;
  name: string;
  phone: string | null;
  whatsapp_phone: string | null;
  email: string | null;
  address_line: string | null;
  city: string;
}

export function BusinessProfileForm({ business }: { business: Business }) {
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateBusinessAction(formData);
      if (res.error) toast.error(res.error);
      else toast.success("Business profile updated");
    });
  }

  return (
    <form action={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="businessId" value={business.id} />

      <div className="sm:col-span-2">
        <Label htmlFor="name">Business name</Label>
        <Input id="name" name="name" defaultValue={business.name} required maxLength={120} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="phone">Phone (E.164)</Label>
        <Input id="phone" name="phone" defaultValue={business.phone ?? ""} placeholder="+923001234567" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="whatsapp_phone">WhatsApp number</Label>
        <Input id="whatsapp_phone" name="whatsapp_phone" defaultValue={business.whatsapp_phone ?? ""} placeholder="+923001234567" className="mt-1" />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={business.email ?? ""} className="mt-1" />
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <select
          id="city"
          name="city"
          defaultValue={business.city}
          className="mt-1 block w-full rounded-md border border-surface-muted bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          {["Karachi", "Lahore", "Islamabad"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="address_line">Address</Label>
        <Input id="address_line" name="address_line" defaultValue={business.address_line ?? ""} className="mt-1" />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
