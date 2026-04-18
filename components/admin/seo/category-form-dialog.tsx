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
import { createCategoryAction, updateCategoryAction } from "@/app/actions/seo";

export interface CategoryFormValues {
  id?: string;
  name: string;
  slug?: string;
}

export function CategoryFormDialog({ category, asEditButton }: { category?: CategoryFormValues; asEditButton?: boolean }) {
  const isEdit = !!category?.id;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");

  function reset() {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = { name: name.trim(), slug: slug.trim() || undefined };
      const res = isEdit ? await updateCategoryAction(category!.id!, input) : await createCategoryAction(input);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Category updated" : "Category created");
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
          <Plus className="mr-1.5 h-4 w-4" /> Add Category
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>Vehicle categories power URLs like <code>/vehicles/sedan</code>.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat_name">Name *</Label>
              <Input id="cat_name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="SUV" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat_slug">Slug</Label>
              <Input
                id="cat_slug" value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="Auto from name"
              />
            </div>
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
