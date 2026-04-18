"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, ChevronDown } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createKeywordAction, updateKeywordAction, type KeywordInput } from "@/app/actions/seo";
import { cn } from "@/lib/utils";

export interface KeywordFormValues extends KeywordInput {
  id?: string;
}

interface KeywordFormDialogProps {
  keyword?: KeywordFormValues;
  /** Show as edit icon button instead of "Add Keyword" button */
  asEditButton?: boolean;
}

const emptyTpl = { h1: "", title: "", description: "" };

export function KeywordFormDialog({ keyword, asEditButton }: KeywordFormDialogProps) {
  const isEdit = !!keyword?.id;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [slug, setSlug] = useState(keyword?.slug ?? "");
  const [label, setLabel] = useState(keyword?.label ?? "");
  const [isActive, setIsActive] = useState(keyword?.is_active ?? true);
  const [includeTowns, setIncludeTowns] = useState(keyword?.include_in_sitemap_towns ?? false);
  const [sortOrder, setSortOrder] = useState(keyword?.sort_order ?? 0);

  // Template overrides — 3 optional sections
  const [cityTpl, setCityTpl] = useState(keyword?.template_overrides?.city ?? null);
  const [modelTpl, setModelTpl] = useState(keyword?.template_overrides?.model ?? null);
  const [routeTpl, setRouteTpl] = useState(keyword?.template_overrides?.route ?? null);

  function reset() {
    setSlug(keyword?.slug ?? "");
    setLabel(keyword?.label ?? "");
    setIsActive(keyword?.is_active ?? true);
    setIncludeTowns(keyword?.include_in_sitemap_towns ?? false);
    setSortOrder(keyword?.sort_order ?? 0);
    setCityTpl(keyword?.template_overrides?.city ?? null);
    setModelTpl(keyword?.template_overrides?.model ?? null);
    setRouteTpl(keyword?.template_overrides?.route ?? null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const overrides =
      cityTpl || modelTpl || routeTpl
        ? {
            ...(cityTpl ? { city: cityTpl } : {}),
            ...(modelTpl ? { model: modelTpl } : {}),
            ...(routeTpl ? { route: routeTpl } : {}),
          }
        : null;

    const input: KeywordInput = {
      slug: slug.trim(),
      label: label.trim(),
      is_active: isActive,
      include_in_sitemap_towns: includeTowns,
      sort_order: sortOrder,
      template_overrides: overrides,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateKeywordAction(keyword!.id!, input)
        : await createKeywordAction(input);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Keyword updated" : "Keyword created");
        setOpen(false);
        if (!isEdit) reset();
      }
    });
  }

  return (
    <>
      {asEditButton ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-ink-400 hover:text-brand-600"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Keyword
        </Button>
      )}

    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Keyword" : "Add Keyword"}</DialogTitle>
          <DialogDescription>
            Keywords define the URL prefix for SEO landing pages (e.g. <code>/rent-a-car</code>).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto -mx-4 px-4 space-y-5">
          {/* Basic fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug" value={slug} required
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="rent-a-car"
              />
              <p className="text-[11px] text-ink-400">Lowercase letters, numbers, hyphens only.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Display Label *</Label>
              <Input id="label" value={label} required onChange={(e) => setLabel(e.target.value)} placeholder="Rent a Car" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input id="sort_order" type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-6 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={includeTowns} onChange={(e) => setIncludeTowns(e.target.checked)} />
                <span>Include in town sitemap</span>
              </label>
            </div>
          </div>

          {/* Template overrides */}
          <div className="space-y-3 pt-2 border-t border-surface-muted">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Template Overrides (Optional)</h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Override the default SEO template for specific page contexts. Use <code>{`{keyword}`}</code>, <code>{`{city}`}</code>, <code>{`{brand}`}</code>, <code>{`{model}`}</code>, <code>{`{town}`}</code>, <code>{`{from_city}`}</code>, <code>{`{to_city}`}</code> placeholders.
              </p>
            </div>

            <TemplateSection
              label="City pages"
              hint="Used for /{keyword}/{city} URLs"
              value={cityTpl}
              onChange={setCityTpl}
            />
            <TemplateSection
              label="Model pages"
              hint="Used for /{keyword}/{city}/{model} URLs"
              value={modelTpl}
              onChange={setModelTpl}
            />
            <TemplateSection
              label="Route pages"
              hint="Used for /{keyword}/{from_city}-to-{to_city} URLs"
              value={routeTpl}
              onChange={setRouteTpl}
            />
          </div>
        </form>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={pending || !slug || !label}>
            {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Keyword"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

// ── Template section (collapsible) ──────────────────────────────────────────

interface TplValue { h1: string; title: string; description: string }

function TemplateSection({
  label, hint, value, onChange,
}: {
  label: string; hint: string;
  value: TplValue | null;
  onChange: (v: TplValue | null) => void;
}) {
  const [open, setOpen] = useState(!!value);
  const active = !!value;

  function toggleActive(enabled: boolean) {
    if (enabled) {
      onChange({ ...emptyTpl });
      setOpen(true);
    } else {
      onChange(null);
    }
  }

  return (
    <div className={cn("rounded-xl border p-3", active ? "border-brand-200 bg-brand-50/30" : "border-surface-muted bg-white")}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-semibold text-ink-900"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          {label}
        </button>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={active} onChange={(e) => toggleActive(e.target.checked)} />
          Override
        </label>
      </div>
      <p className="text-[11px] text-ink-400 mt-1">{hint}</p>

      {open && active && value && (
        <div className="mt-3 space-y-2.5">
          <div className="space-y-1">
            <Label className="text-xs">H1</Label>
            <Input
              value={value.h1}
              onChange={(e) => onChange({ ...value, h1: e.target.value })}
              placeholder="Rent a Car in {city}"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Title (meta, ≤60 chars recommended)</Label>
            <Input
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="{keyword} in {city} | Best Car Rental Deals"
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description (meta, ≤155 chars)</Label>
            <Textarea
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
              placeholder="Compare verified vendors in {city}..."
              className="text-sm"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}

