"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireVendorMode } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, normalizePhone } from "@/lib/utils";
import { sendEmail } from "@/lib/email/send";
import { vendorTermsAgreement } from "@/lib/email/templates";

// ─── Skip onboarding ──────────────────────────────────────────────────────────

export async function skipOnboardingAction(): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      onboarding_skipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", profile.id);

  if (error) return { error: error.message };
  redirect("/vendor");
}

// ─── Create business (full onboarding version with location) ──────────────────

const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters").max(120),
  phone: z.string().min(7, "Phone is required").max(20),
  whatsapp_phone: z.string().min(7, "WhatsApp number is required").max(20),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  website_url: z.string().max(200).optional().or(z.literal("")),
  address_line: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(100),
  lat: z.number().optional(),
  lng: z.number().optional(),
  google_place_id: z.string().optional().or(z.literal("")),
  google_maps_url: z.string().optional().or(z.literal("")),
});

export type BusinessOnboardingInput = z.infer<typeof businessSchema>;

export async function createBusinessOnboardingAction(
  input: BusinessOnboardingInput
): Promise<{ error?: string }> {
  const profile = await requireVendorMode();

  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { data: existing } = await (supabase as any)
    .from("businesses")
    .select("id")
    .eq("owner_user_id", profile.id)
    .single();

  if (existing) return { error: "You already have a business registered" };

  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const slug = `${slugify(parsed.data.name)}-${randomSuffix}`;

  const insertData: Record<string, unknown> = {
    owner_user_id: profile.id,
    slug,
    claim_status: "pending",
    rating: 0,
    reviews_count: 0,
    name: parsed.data.name,
    phone: normalizePhone(parsed.data.phone),
    city: parsed.data.city,
  };

  insertData.whatsapp_phone = normalizePhone(parsed.data.whatsapp_phone);
  if (parsed.data.email) insertData.email = parsed.data.email;
  if (parsed.data.description) insertData.description = parsed.data.description;
  if (parsed.data.website_url) insertData.website_url = parsed.data.website_url;
  if (parsed.data.address_line) insertData.address_line = parsed.data.address_line;
  if (parsed.data.lat != null) insertData.lat = parsed.data.lat;
  if (parsed.data.lng != null) insertData.lng = parsed.data.lng;
  if (parsed.data.google_place_id) insertData.google_place_id = parsed.data.google_place_id;
  if (parsed.data.google_maps_url) insertData.google_maps_url = parsed.data.google_maps_url;

  const { error } = await (supabase as any).from("businesses").insert(insertData);

  if (error) return { error: error.message };
  return {};
}

// ─── Google Places autocomplete (server-side) ─────────────────────────────────

export async function getPlaceSuggestionsAction(
  input: string
): Promise<{
  error?: string;
  suggestions?: Array<{ place_id: string; description: string; main_text: string }>;
}> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) return { error: "Maps not configured" };
  if (!input.trim()) return { suggestions: [] };

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("region", "ae");
    url.searchParams.set("components", "country:ae");


    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return { suggestions: [] };
    }

    return {
      suggestions: (data.predictions ?? []).slice(0, 6).map((p: any) => ({
        place_id: p.place_id,
        description: p.description,
        main_text: p.structured_formatting?.main_text ?? p.description,
      })),
    };
  } catch {
    return { suggestions: [] };
  }
}

export async function getPlaceDetailsAction(placeId: string): Promise<{
  error?: string;
  details?: {
    name: string;
    address_line: string;
    phone?: string;
    website?: string;
    lat: number;
    lng: number;
    maps_url: string;
    city?: string;
    google_place_id: string;
  };
}> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) return { error: "Maps not configured" };

  try {
    const fields =
      "name,formatted_address,formatted_phone_number,website,geometry,url,address_components";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = await res.json();

    if (data.status !== "OK") return { error: "Could not fetch place details" };

    const r = data.result;
    const components: any[] = r.address_components ?? [];

    // Extract city from address components (any city, not restricted)
    const cityComponent = components.find((c: any) =>
      c.types.includes("locality") || c.types.includes("administrative_area_level_2")
    );
    const city = cityComponent?.long_name ?? undefined;

    return {
      details: {
        name: r.name,
        address_line: r.formatted_address,
        phone: r.formatted_phone_number,
        website: r.website,
        lat: r.geometry?.location?.lat ?? 0,
        lng: r.geometry?.location?.lng ?? 0,
        maps_url: r.url,
        city,
        google_place_id: placeId,
      },
    };
  } catch {
    return { error: "Failed to fetch details" };
  }
}

// ─── Search Google Places for GMB import ─────────────────────────────────────

export async function searchGoogleBusinessesAction(query: string): Promise<{
  error?: string;
  results?: Array<{
    place_id: string;
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
  }>;
}> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!apiKey) return { error: "Maps not configured" };
  if (!query.trim()) return { results: [] };

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", `${query} car rental Dubai`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("region", "ae");


    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return { results: [] };
    }

    return {
      results: (data.results ?? []).slice(0, 6).map((p: any) => ({
        place_id: p.place_id,
        name: p.name,
        address: p.formatted_address,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
      })),
    };
  } catch {
    return { results: [] };
  }
}

// ─── Vendor: accept platform terms ───────────────────────────────────────────

export async function acceptTermsAction(): Promise<{ error?: string }> {
  const profile = await requireVendorMode();
  const admin = createAdminClient();
  const agreedAt = new Date().toISOString();

  const { error } = await admin
    .from("profiles")
    .update({
      terms_agreed_at: agreedAt,
      updated_at: agreedAt,
    } as any)
    .eq("id", profile.id);

  if (error) return { error: error.message };

  // Fire-and-forget confirmation email
  const vendorEmail = (profile as any).email as string | undefined;
  if (vendorEmail) {
    void (async () => {
      try {
        const { subject, html } = vendorTermsAgreement(
          profile.full_name ?? "Vendor",
          agreedAt
        );
        await sendEmail(vendorEmail, subject, html);
      } catch (e) {
        console.error("[acceptTermsAction] email error", e);
      }
    })();
  }

  return {};
}
