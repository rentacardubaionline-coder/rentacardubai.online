"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Rocket, ChevronDown, Globe, Building } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScrapeJobsAction } from "@/app/actions/scraper";
import { cn } from "@/lib/utils";

interface StartScrapeDialogProps {
  cities: { id: string; name: string; slug: string }[];
}

export function StartScrapeDialog({ cities }: StartScrapeDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "all">("single");
  const [cityId, setCityId] = useState("");
  const [category, setCategory] = useState("Car rental");
  const [pending, startTransition] = useTransition();

  function reset() {
    setMode("single");
    setCityId("");
    setCategory("Car rental");
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault();

    const input =
      mode === "all"
        ? { allCities: true, category }
        : { allCities: false, cityIds: [cityId], category };

    startTransition(async () => {
      const res = await createScrapeJobsAction(input);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Dispatched ${res.createdCount ?? 0} scrape job${res.createdCount === 1 ? "" : "s"}`);
        setOpen(false);
        reset();
      }
    });
  }

  const canSubmit = mode === "all" ? true : !!cityId;

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> Start Scrape
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-amber-500" />
              Start a Scrape Job
            </DialogTitle>
            <DialogDescription>
              GitHub Actions will run the scraper in the cloud. Results appear in
              &quot;Review&quot; tab as they come in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleStart} className="space-y-4">
            {/* Mode selector */}
            <div>
              <Label className="mb-2 block">Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                    mode === "single"
                      ? "border-amber-400 bg-amber-50"
                      : "border-surface-muted bg-white hover:border-ink-300",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-semibold">Single city</span>
                  </div>
                  <p className="text-[11px] text-ink-400">Pick one city to scrape</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("all")}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                    mode === "all"
                      ? "border-amber-400 bg-amber-50"
                      : "border-surface-muted bg-white hover:border-ink-300",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-semibold">All cities</span>
                  </div>
                  <p className="text-[11px] text-ink-400">Queue {cities.length} jobs</p>
                </button>
              </div>
            </div>

            {/* City picker */}
            {mode === "single" && (
              <div className="space-y-2">
                <Label htmlFor="city_id">City *</Label>
                <div className="relative">
                  <select
                    id="city_id"
                    required
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-surface-muted bg-white pl-3 pr-9 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  >
                    <option value="">Select a city...</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category" required
                value={category} onChange={(e) => setCategory(e.target.value)}
                placeholder="Car rental"
              />
              <p className="text-[11px] text-ink-400">
                Search query Google Maps will use (e.g. &quot;Car rental&quot;, &quot;Car hire&quot;).
              </p>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={!canSubmit || pending}>
              {pending ? "Dispatching..." : mode === "all" ? `Queue ${cities.length} Jobs` : "Start Scrape"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
