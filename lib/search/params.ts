import { z } from "zod";

export const CITIES = ["karachi", "lahore", "islamabad"] as const;
export const TRANSMISSIONS = ["manual", "automatic"] as const;
export const FUELS = ["petrol", "diesel", "hybrid"] as const;
export const MODES = ["self_drive", "with_driver"] as const;
export const SORTS = ["relevance", "price_asc", "price_desc", "newest"] as const;

export const searchParamsSchema = z.object({
  city: z.enum(CITIES).optional(),
  make: z.string().max(100).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  seats: z.coerce.number().min(1).max(12).optional(),
  transmission: z.enum(TRANSMISSIONS).optional(),
  fuel: z.enum(FUELS).optional(),
  mode: z.enum(MODES).optional(),
  q: z.string().max(200).optional(), // free text search
  sort: z.enum(SORTS).default("relevance"),
  page: z.coerce.number().min(1).default(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Helper to build URL search params from filter state
export function buildSearchParams(params: Partial<SearchParams>): URLSearchParams {
  const sp = new URLSearchParams();
  const cleaned = searchParamsSchema.parse(params);

  if (cleaned.city) sp.set("city", cleaned.city);
  if (cleaned.make) sp.set("make", cleaned.make);
  if (cleaned.priceMin) sp.set("priceMin", cleaned.priceMin.toString());
  if (cleaned.priceMax) sp.set("priceMax", cleaned.priceMax.toString());
  if (cleaned.seats) sp.set("seats", cleaned.seats.toString());
  if (cleaned.transmission) sp.set("transmission", cleaned.transmission);
  if (cleaned.fuel) sp.set("fuel", cleaned.fuel);
  if (cleaned.mode) sp.set("mode", cleaned.mode);
  if (cleaned.q) sp.set("q", cleaned.q);
  if (cleaned.sort !== "relevance") sp.set("sort", cleaned.sort);
  if (cleaned.page > 1) sp.set("page", cleaned.page.toString());

  return sp;
}

// Format city name for display
export function formatCity(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1);
}

// Format transmission for display
export function formatTransmission(trans: string): string {
  return trans.charAt(0).toUpperCase() + trans.slice(1);
}

// Format fuel for display
export function formatFuel(fuel: string): string {
  const map: Record<string, string> = {
    petrol: "Petrol",
    diesel: "Diesel",
    hybrid: "Hybrid",
  };
  return map[fuel] || fuel;
}

// Format mode for display
export function formatMode(mode: string): string {
  return mode === "self_drive" ? "Self Drive" : "With Driver";
}
