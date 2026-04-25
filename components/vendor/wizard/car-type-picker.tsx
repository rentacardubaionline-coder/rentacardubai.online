"use client";

import Image from "next/image";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type CarType = "economy" | "sedan" | "suv" | "luxury";

export interface CarTypeOption {
  code: CarType;
  label: string;
  /** Image path under /public. */
  icon: string;
  /** Price per lead — displayed as a small badge on the card. */
  pricePerLead: number;
  /** One-line description shown under the title. */
  description: string;
  /** Example models shown in a tooltip / info popup. */
  examples: string[];
  /** Swatch color class used for the selected-state ring + price badge. */
  accent: { ring: string; bg: string; text: string };
}

export const CAR_TYPES: CarTypeOption[] = [
  {
    code: "economy",
    label: "Economy",
    icon: "/icons/economy-cars.svg",
    pricePerLead: 120,
    description: "Compact hatchbacks & entry-level city cars",
    examples: ["Suzuki Alto", "Mehran", "Cultus", "WagonR", "Picanto"],
    accent: {
      ring: "ring-emerald-400",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
    },
  },
  {
    code: "sedan",
    label: "Sedan",
    icon: "/icons/business.svg",
    pricePerLead: 200,
    description: "4-door sedans — the everyday intercity pick",
    examples: ["Toyota Corolla", "Honda Civic", "Honda City", "Ciaz", "Elantra"],
    accent: {
      ring: "ring-sky-400",
      bg: "bg-sky-100",
      text: "text-sky-700",
    },
  },
  {
    code: "suv",
    label: "SUV",
    icon: "/icons/suv.svg",
    pricePerLead: 350,
    description: "Full-size SUVs & off-roaders for tours",
    examples: ["Fortuner", "Prado", "Land Cruiser", "Sportage", "Tucson"],
    accent: {
      ring: "ring-amber-400",
      bg: "bg-amber-100",
      text: "text-amber-700",
    },
  },
  {
    code: "luxury",
    label: "Luxury",
    icon: "/icons/luxury.svg",
    pricePerLead: 500,
    description: "Premium rides — weddings, VIP, events",
    examples: ["Mercedes S-Class", "BMW 7-Series", "Audi A6", "Range Rover"],
    accent: {
      ring: "ring-violet-400",
      bg: "bg-violet-100",
      text: "text-violet-700",
    },
  },
];

interface CarTypePickerProps {
  value: CarType | "";
  onChange: (value: CarType) => void;
  /** Optional — when set, shows the per-lead fee under each card. */
  showPricing?: boolean;
}

export function CarTypePicker({
  value,
  onChange,
  showPricing = true,
}: CarTypePickerProps) {
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
              "group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-4 text-center transition-all",
              selected
                ? `${type.accent.ring} ring-4 ring-offset-0 border-transparent shadow-md`
                : "border-surface-muted hover:border-ink-200 hover:shadow-sm",
            )}
            title={`${type.label} — includes: ${type.examples.slice(0, 3).join(", ")}…`}
          >
            {/* Selected check */}
            {selected && (
              <span
                className={cn(
                  "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full",
                  type.accent.bg,
                )}
              >
                <Check className={cn("size-3", type.accent.text)} strokeWidth={3} />
              </span>
            )}

            {/* Icon tile */}
            <div
              className={cn(
                "flex size-16 items-center justify-center rounded-xl transition-colors sm:size-20",
                selected ? type.accent.bg : "bg-surface-sunken",
              )}
            >
              <Image
                src={type.icon}
                alt={type.label}
                width={48}
                height={48}
                className="size-10 object-contain sm:size-12"
              />
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <p
                className={cn(
                  "text-sm font-extrabold",
                  selected ? type.accent.text : "text-ink-900",
                )}
              >
                {type.label}
              </p>
              <p className="line-clamp-2 text-[11px] leading-tight text-ink-500">
                {type.description}
              </p>
            </div>

            {showPricing && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                  selected
                    ? `${type.accent.bg} ${type.accent.text}`
                    : "bg-surface-sunken text-ink-500",
                )}
              >
                Rs. {type.pricePerLead}/lead
              </span>
            )}

            {/* Examples tooltip (tap on mobile doesn't fire since it's inside button) */}
            <span className="absolute bottom-1.5 right-1.5 hidden size-4 items-center justify-center rounded-full text-ink-300 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
              <Info className="size-3" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
