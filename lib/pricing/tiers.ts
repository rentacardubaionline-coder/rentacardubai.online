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
    price_pkr: 50,
    description: "Compact hatchbacks and entry-level sedans — the everyday city-runner class.",
    examples: ["Mitsubishi Attrage", "Nissan Sunny", "Toyota Yaris", "Kia Picanto", "Hyundai Accent", "Renault Symbol"],
    sort_order: 1,
  },
  {
    id: "default-sedan",
    code: "sedan",
    label: "Sedan",
    price_pkr: 80,
    description: "Mid-size 4-door sedans — the typical airport / intercity choice.",
    examples: ["Toyota Camry", "Honda Accord", "Nissan Altima", "Mazda 6", "Hyundai Sonata", "Volkswagen Passat"],
    sort_order: 2,
  },
  {
    id: "default-suv",
    code: "suv",
    label: "SUV",
    price_pkr: 120,
    description: "Full-size SUVs and off-roaders — for desert safaris and family road-trips.",
    examples: ["Nissan Patrol", "Toyota Land Cruiser", "Toyota Prado", "Ford Explorer", "Mitsubishi Pajero", "Kia Sportage"],
    sort_order: 3,
  },
  {
    id: "default-luxury",
    code: "luxury",
    label: "Luxury Cars",
    price_pkr: 250,
    description: "High-end executive and premium rides — VIP transfers, weddings, and events.",
    examples: ["Mercedes-Benz S-Class", "BMW 7-Series", "Audi A8", "Range Rover Vogue", "Bentley Bentayga", "Rolls-Royce Ghost", "Lamborghini Huracan"],
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

/** Map a listing to a tier code — honours vendor's explicit choice first. */
export function resolveTierForListing(listing: {
  tier_code?: string | null;
  model?: { body_type?: string | null } | null;
  title?: string | null;
}): TierCode {
  // Vendor's explicit pick always wins.
  if (
    listing.tier_code === "economy" ||
    listing.tier_code === "sedan" ||
    listing.tier_code === "suv" ||
    listing.tier_code === "luxury"
  ) {
    return listing.tier_code;
  }

  const title = (listing.title ?? "").toLowerCase();
  const body = (listing.model?.body_type ?? "").toLowerCase();

  // Luxury: heuristic keyword match on the title
  if (/(mercedes|bmw|audi|lexus|range rover|porsche|bentley|maserati|lamborghini|ferrari|rolls-royce|mclaren|bugatti)/.test(title)) {
    return "luxury";
  }

  if (body.includes("suv") || /(patrol|land\s*cruiser|prado|pajero|explorer|safari|sportage|tucson|sorento)/.test(title)) {
    return "suv";
  }

  if (body.includes("sedan") || /(camry|accord|altima|sunny|yaris|attrage|sonata|accent|civic|corolla)/.test(title)) {
    return "sedan";
  }

  // Hatchback / economy default
  return "economy";
}
