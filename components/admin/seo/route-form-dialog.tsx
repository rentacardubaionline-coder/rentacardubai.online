"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, ChevronDown, ArrowRight } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRouteAction, updateRouteAction } from "@/app/actions/seo";

export interface RouteFormValues {
  id?: string;
  origin_city_id: string;
  destination_city_id: string;
  distance_km?: number | null;
  estimated_time?: string | null;
  is_active?: boolean;
}

interface RouteFormDialogProps {
  route?: RouteFormValues;
  cities: { id: string; name: string }[];
  asEditButton?: boolean;
}

export function RouteFormDialog({ route, cities, asEditButton }: RouteFormDialogProps) {
  const isEdit = !!route?.id;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [originId, setOriginId] = useState(route?.origin_city_id ?? "");
  const [destId, setDestId] = useState(route?.destination_city_id ?? "");
  const [distanceKm, setDistanceKm] = useState<string>(route?.distance_km?.toString() ?? "");
  const [estTime, setEstTime] = useState(route?.estimated_time ?? "");
  const [isActive, setIsActive] = useState(route?.is_active ?? true);

  function reset() {
    setOriginId(route?.origin_city_id ?? "");
    setDestId(route?.destination_city_id ?? "");
    setDistanceKm(route?.distance_km?.toString() ?? "");
    setEstTime(route?.estimated_time ?? "");
    setIsActive(route?.is_active ?? true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const input = {
        origin_city_id: originId,
        destination_city_id: destId,
        distance_km: distanceKm ? Number(distanceKm) : null,
        estimated_time: estTime.trim() || null,
        is_active: isActive,
      };
      const res = isEdit ? await updateRouteAction(route!.id!, input) : await createRouteAction(input);
      if (res.error) toast.error(res.error);
      else {
        toast.success(isEdit ? "Route updated" : "Route created");
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
          <Plus className="mr-1.5 h-4 w-4" /> Add Route
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Route" : "Add Route"}</DialogTitle>
            <DialogDescription>
              Intercity routes appear at <code>/routes/{`{origin}-to-{destination}`}</code>. Slug auto-generated.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div className="space-y-2">
                <Label>From *</Label>
                <div className="relative">
                  <select
                    required
                    value={originId}
                    onChange={(e) => setOriginId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-surface-muted bg-white pl-3 pr-9 text-sm outline-none focus:border-brand-400"
                  >
                    <option value="">Origin...</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              </div>

              <ArrowRight className="h-5 w-5 text-ink-400 mb-3" />

              <div className="space-y-2">
                <Label>To *</Label>
                <div className="relative">
                  <select
                    required
                    value={destId}
                    onChange={(e) => setDestId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-surface-muted bg-white pl-3 pr-9 text-sm outline-none focus:border-brand-400"
                  >
                    <option value="">Destination...</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distance (km)</Label>
                <Input
                  id="distance_km" type="number" min="1"
                  value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="380"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_time">Estimated Time</Label>
                <Input
                  id="est_time" value={estTime} onChange={(e) => setEstTime(e.target.value)}
                  placeholder="4-5 hours"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={pending || !originId || !destId}>
              {pending ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
