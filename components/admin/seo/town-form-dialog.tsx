"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, ChevronDown } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTownAction, updateTownAction } from "@/app/actions/seo";

export interface TownFormValues {
  id?: string;
  name: string;
  slug?: string;
  city_id: string;
  is_active?: boolean;
}

interface TownFormDialogProps {
  town?: TownFormValues;
  cities: { id: string; name: string }[];
  asEditButton?: boolean;
}

export function TownFormDialog({ town, cities, asEditButton }: TownFormDialogProps) {
  const isEdit = !!town?.id;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(town?.name ?? "");
  const [slug, setSlug] = useState(town?.slug ?? "");
  const [cityId, setCityId] = useState(town?.city_id ?? "");
  const [isActive, setIsActive] = useState(town?.is_active ?? true);

  function reset() {
    setName(town?.name ?? "");
    setSlug(town?.slug ?? "");
    setCityId(town?.city_id ?? "");
    setIsActive(town?.is_active ?? true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        city_id: cityId,
        is_active: isActive,
      };
      const res = isEdit ? await updateTownAction(town!.id!, input) : await createTownAction(input);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Town updated" : "Town created");
        setOpen(false);
        if (!isEdit) reset();
      }
    });
  }

  return (
    <>
      {asEditButton ? (
        <Button variant="ghost" size="icon-sm" className="text-ink-400 hover:text-brand-600" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Town
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Town" : "Add Town"}</DialogTitle>
            <DialogDescription>Towns appear in URLs like <code>/rent-a-car/lahore/clifton</code>.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city_id">City *</Label>
              <div className="relative">
                <select
                  id="city_id"
                  required
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-surface-muted bg-white pl-3 pr-9 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                >
                  <option value="">Select a city...</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Town Name *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Clifton" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug" value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="Auto from name"
              />
              <p className="text-[11px] text-ink-400">Leave empty to auto-generate from name.</p>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={pending || !name || !cityId}>
              {pending ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
