"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Vendors pick from these 4 categories when adding a listing. Values map
 * 1:1 to the `listings.tier_code` column (which the billing system already
 * uses) so we don't need a separate `body_type` column.
 */
export type CarType = "economy" | "sedan" | "suv" | "luxury";

/** Internal billing tier — same set, kept as a separate alias for clarity. */
export type TierCode = CarType;

export interface CarTypeOption {
  code: CarType;
  label: string;
  /** Image path under /public. */
  icon: string;
  /** Internal tier this category bills as (always equal to `code` now). */
  tier: TierCode;
  /** One-line description shown under the title. */
  description: string;
  /** Example models — used for tooltips / copy. */
  examples: string[];
  /** Swatch color class used for the selected-state ring + check badge. */
  accent: { ring: string; bg: string; text: string };
}

export const CAR_TYPES: CarTypeOption[] = [
  {
    code: "economy",
    label: "Economy",
    icon: "/icons/economy-cars.svg",
    tier: "economy",
    description: "Compact hatchbacks & entry-level city cars",
    examples: ["Suzuki Alto", "Mehran", "Cultus", "WagonR", "Picanto"],
    accent: { ring: "ring-emerald-400", bg: "bg-emerald-100", text: "text-emerald-700" },
  },
  {
    code: "sedan",
    label: "Sedan",
    icon: "/icons/business.svg",
    tier: "sedan",
    description: "Sedans for daily commute & corporate trips",
    examples: ["Toyota Corolla", "Honda Civic", "Honda City", "Ciaz"],
    accent: { ring: "ring-sky-400", bg: "bg-sky-100", text: "text-sky-700" },
  },
  {
    code: "suv",
    label: "SUV",
    icon: "/icons/suv.svg",
    tier: "suv",
    description: "Full-size SUVs & 4x4s for tours and groups",
    examples: ["Fortuner", "Prado", "Land Cruiser", "Sportage", "Tucson"],
    accent: { ring: "ring-amber-400", bg: "bg-amber-100", text: "text-amber-700" },
  },
  {
    code: "luxury",
    label: "Luxury",
    icon: "/icons/luxury.svg",
    tier: "luxury",
    description: "Premium executive rides for VIP & weddings",
    examples: ["Mercedes S-Class", "BMW 7-Series", "Audi A6", "Range Rover"],
    accent: { ring: "ring-violet-400", bg: "bg-violet-100", text: "text-violet-700" },
  },
];

/** Map a customer-facing category back to its billing tier (identity now). */
export function tierForCarType(code: CarType): TierCode {
  return code;
}

interface CarTypePickerProps {
  value: CarType | "";
  onChange: (value: CarType) => void;
}

export function CarTypePicker({ value, onChange }: CarTypePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CAR_TYPES.map((type) => {
        const selected = value === type.code;
        return (
          <button
            type="button"
            key={type.code}
            onClick={() => onChange(type.code)}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 text-center transition-all sm:p-4",
              selected
                ? `${type.accent.ring} ring-4 ring-offset-0 border-transparent shadow-md`
                : "border-surface-muted hover:border-ink-200 hover:shadow-sm",
            )}
            title={`${type.label} — examples: ${type.examples.slice(0, 3).join(", ")}…`}
          >
            {selected && (
              <span
                className={cn(
                  "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full",
                  type.accent.bg,
                )}
              >
                <Check
                  className={cn("size-3", type.accent.text)}
                  strokeWidth={3}
                />
              </span>
            )}

            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-xl bg-ink-900 transition-shadow sm:size-16",
                selected && "shadow-md ring-2 ring-inset ring-white/20",
              )}
            >
              <Image
                src={type.icon}
                alt={type.label}
                width={48}
                height={48}
                className="size-9 object-contain sm:size-10"
              />
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <p
                className={cn(
                  "text-sm font-extrabold leading-tight",
                  selected ? type.accent.text : "text-ink-900",
                )}
              >
                {type.label}
              </p>
              <p className="line-clamp-2 text-[11px] leading-tight text-ink-500">
                {type.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
