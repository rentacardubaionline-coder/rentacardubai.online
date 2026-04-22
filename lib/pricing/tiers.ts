import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export type TierCode = "economy" | "sedan" | "suv" | "luxury";

export interface PricingTier {
  id: string;
  code: TierCode;
  label: string;
  price_pkr: number;
  description: string | null;
  examples: string[];
  sort_order: number;
}

/** Hardcoded fallback — used if the DB query fails (migration not run yet, etc.). */
export const DEFAULT_TIERS: PricingTier[] = [
  {
    id: "default-economy",
    code: "economy",
    label: "Economy Cars",
    price_pkr: 120,
    description: "Compact hatchbacks and entry-level sedans — the everyday city-runner class.",
    examples: ["Suzuki Alto", "Suzuki Mehran", "Suzuki Cultus", "Suzuki WagonR", "Daihatsu Mira", "Kia Picanto", "United Bravo"],
    sort_order: 1,
  },
  {
    id: "default-sedan",
    code: "sedan",
    label: "Sedan",
    price_pkr: 200,
    description: "Mid-size 4-door sedans — the typical airport / intercity choice.",
    examples: ["Toyota Corolla", "Honda Civic", "Honda City", "Suzuki Ciaz", "Hyundai Elantra", "Changan Alsvin"],
    sort_order: 2,
  },
  {
    id: "default-suv",
    code: "suv",
    label: "SUV",
    price_pkr: 350,
    description: "Full-size SUVs and off-roaders — for tours, mountains, and family road-trips.",
    examples: ["Toyota Fortuner", "Toyota Prado", "Toyota Land Cruiser", "Kia Sportage", "Hyundai Tucson", "Honda BR-V", "MG HS"],
    sort_order: 3,
  },
  {
    id: "default-luxury",
    code: "luxury",
    label: "Luxury Cars",
    price_pkr: 500,
    description: "High-end executive and premium rides — weddings, VIP transfers, events.",
    examples: ["Mercedes-Benz S-Class", "Mercedes-Benz E-Class", "BMW 5-Series", "BMW 7-Series", "Audi A6", "Lexus LX", "Range Rover"],
    sort_order: 4,
  },
];

/** Fetch tiers from DB (cached per request). Falls back to DEFAULT_TIERS on error. */
export const getPricingTiers = cache(async (): Promise<PricingTier[]> => {
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (admin as any)
      .from("pricing_tiers")
      .select("id, code, label, price_pkr, description, examples, sort_order")
      .order("sort_order");
    if (error || !data || data.length === 0) return DEFAULT_TIERS;
    return data as PricingTier[];
  } catch {
    return DEFAULT_TIERS;
  }
});

/** Map a listing body_type (or keyword) to a tier code. */
export function resolveTierForListing(listing: {
  model?: { body_type?: string | null } | null;
  title?: string | null;
}): TierCode {
  const title = (listing.title ?? "").toLowerCase();
  const body = (listing.model?.body_type ?? "").toLowerCase();

  // Luxury: heuristic keyword match on the title
  if (/(mercedes|bmw|audi|lexus|range rover|porsche|bentley|maserati)/.test(title)) {
    return "luxury";
  }

  if (body.includes("suv") || /(fortuner|prado|land\s*cruiser|sportage|tucson|br-?v|mg hs)/.test(title)) {
    return "suv";
  }

  if (body.includes("sedan") || /(corolla|civic|city\b|ciaz|elantra|alsvin|grande)/.test(title)) {
    return "sedan";
  }

  // Hatchback / economy default
  return "economy";
}
