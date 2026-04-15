"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CITIES,
  TRANSMISSIONS,
  FUELS,
  MODES,
  formatCity,
  formatTransmission,
  formatFuel,
  formatMode,
  buildSearchParams,
  type SearchParams,
} from "@/lib/search/params";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SectionHeading } from "@/components/ui/section-heading";
import { X } from "lucide-react";

interface FiltersSidebarProps {
  initialParams: SearchParams;
  makes: Array<{ id: string; slug: string; name: string }>;
}

export function FiltersSidebar({ initialParams, makes }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Partial<SearchParams>>({
    city: initialParams.city,
    make: initialParams.make,
    priceMin: initialParams.priceMin,
    priceMax: initialParams.priceMax,
    seats: initialParams.seats,
    transmission: initialParams.transmission,
    fuel: initialParams.fuel,
    mode: initialParams.mode,
    q: initialParams.q,
    sort: initialParams.sort,
  });

  const handleApply = () => {
    const params = buildSearchParams({ ...filters, page: 1 });
    router.push(`/search?${params.toString()}`);
  };

  const handleClear = () => {
    setFilters({
      sort: "relevance",
    });
    router.push("/search");
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && key !== "sort"
  );

  return (
    <div className="space-y-6 rounded-lg border border-surface-muted bg-white p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium">
          City
        </Label>
        <Select value={filters.city || ""} onValueChange={(v) => setFilters({ ...filters, city: v as any })}>
          <SelectTrigger id="city">
            <SelectValue placeholder="Any city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any city</SelectItem>
            {CITIES.map((city) => (
              <SelectItem key={city} value={city}>
                {formatCity(city)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Make */}
      <div className="space-y-2">
        <Label htmlFor="make" className="text-sm font-medium">
          Make
        </Label>
        <Select value={filters.make || ""} onValueChange={(v) => setFilters({ ...filters, make: v || undefined })}>
          <SelectTrigger id="make">
            <SelectValue placeholder="Any make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any make</SelectItem>
            {makes.map((make) => (
              <SelectItem key={make.id} value={make.slug}>
                {make.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range (PKR/day)</Label>
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Min price"
            value={filters.priceMin || ""}
            onChange={(e) =>
              setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Max price"
            value={filters.priceMax || ""}
            onChange={(e) =>
              setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="text-sm"
          />
        </div>
      </div>

      {/* Seats */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Seats</Label>
        <div className="space-y-2">
          {[5, 6, 7].map((seat) => (
            <div key={seat} className="flex items-center gap-2">
              <Checkbox
                id={`seats-${seat}`}
                checked={filters.seats === seat}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, seats: checked ? seat : undefined })
                }
              />
              <label
                htmlFor={`seats-${seat}`}
                className="text-sm cursor-pointer hover:text-ink-900"
              >
                {seat} Seats
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Transmission</Label>
        <RadioGroup value={filters.transmission || ""} onValueChange={(v) => setFilters({ ...filters, transmission: v as any })}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="" id="trans-any" />
            <label htmlFor="trans-any" className="text-sm cursor-pointer">
              Any
            </label>
          </div>
          {TRANSMISSIONS.map((trans) => (
            <div key={trans} className="flex items-center gap-2">
              <RadioGroupItem value={trans} id={`trans-${trans}`} />
              <label
                htmlFor={`trans-${trans}`}
                className="text-sm cursor-pointer hover:text-ink-900"
              >
                {formatTransmission(trans)}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Fuel */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Fuel Type</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="fuel-any"
              checked={!filters.fuel}
              onCheckedChange={() => setFilters({ ...filters, fuel: undefined })}
            />
            <label htmlFor="fuel-any" className="text-sm cursor-pointer">
              Any fuel
            </label>
          </div>
          {FUELS.map((fuel) => (
            <div key={fuel} className="flex items-center gap-2">
              <Checkbox
                id={`fuel-${fuel}`}
                checked={filters.fuel === fuel}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, fuel: checked ? (fuel as any) : undefined })
                }
              />
              <label
                htmlFor={`fuel-${fuel}`}
                className="text-sm cursor-pointer hover:text-ink-900"
              >
                {formatFuel(fuel)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Rental Mode */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Rental Mode</Label>
        <RadioGroup value={filters.mode || ""} onValueChange={(v) => setFilters({ ...filters, mode: v as any })}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="" id="mode-any" />
            <label htmlFor="mode-any" className="text-sm cursor-pointer">
              Any mode
            </label>
          </div>
          {MODES.map((mode) => (
            <div key={mode} className="flex items-center gap-2">
              <RadioGroupItem value={mode} id={`mode-${mode}`} />
              <label
                htmlFor={`mode-${mode}`}
                className="text-sm cursor-pointer hover:text-ink-900"
              >
                {formatMode(mode)}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Search Text */}
      <div className="space-y-2">
        <Label htmlFor="search-text" className="text-sm font-medium">
          Search
        </Label>
        <Input
          id="search-text"
          type="text"
          placeholder="Car model, color, etc."
          value={filters.q || ""}
          onChange={(e) => setFilters({ ...filters, q: e.target.value || undefined })}
          className="text-sm"
        />
      </div>

      {/* Apply Button */}
      <Button onClick={handleApply} className="w-full bg-brand-600 hover:bg-brand-700">
        Apply Filters
      </Button>
    </div>
  );
}
