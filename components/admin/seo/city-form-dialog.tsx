"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCityAction, updateCityAction } from "@/app/actions/seo";

export interface CityFormValues {
  id?: string;
  name: string;
  slug?: string;
  province?: string | null;
  is_active?: boolean;
}

export function CityFormDialog({ city, asEditButton }: { city?: CityFormValues; asEditButton?: boolean }) {
  const isEdit = !!city?.id;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(city?.name ?? "");
  const [slug, setSlug] = useState(city?.slug ?? "");
  const [province, setProvince] = useState(city?.province ?? "");
  const [isActive, setIsActive] = useState(city?.is_active ?? true);

  function reset() {
    setName(city?.name ?? "");
    setSlug(city?.slug ?? "");
    setProvince(city?.province ?? "");
    setIsActive(city?.is_active ?? true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        province: province.trim() || null,
        is_active: isActive,
      };
      const res = isEdit ? await updateCityAction(city!.id!, input) : await createCityAction(input);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "City updated" : "City created");
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
          <Plus className="mr-1.5 h-4 w-4" /> Add City
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit City" : "Add City"}</DialogTitle>
            <DialogDescription>Cities appear in URLs like <code>/rent-a-car/lahore</code>.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Lahore" />
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
            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input id="province" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="Punjab" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={pending || !name}>
              {pending ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
