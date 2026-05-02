import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function randomSuffix(len = 4): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function uniqueSlug(table: string, base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${randomSuffix()}`;
  }
  return slug;
}

function deriveTierCode(dailyAed: number | null): string {
  if (!dailyAed) return "economy";
  if (dailyAed < 150) return "economy";
  if (dailyAed < 350) return "sedan";
  if (dailyAed < 700) return "suv";
  return "luxury";
}

async function main() {
  const dealerId = 'ff5f2972-a0f1-4173-9b80-99160ff12959';
  const businessId = '51d7581b-0872-4ef0-9e49-8340397d6b1b';
  
  const { data: dealer } = await admin.from("ocd_scraped_dealers").select("*").eq("id", dealerId).single();

  const { data: pendingListings } = await admin
    .from("ocd_scraped_listings")
    .select("*")
    .eq("dealer_id", dealerId)
    .eq("status", "pending");

  if (!pendingListings || pendingListings.length === 0) {
    console.log("No pending listings found.");
    return;
  }

  console.log(`Found ${pendingListings.length} pending listings. Importing...`);

  let importedCount = 0;

  for (const l of pendingListings) {
    try {
      let makeId: string | null = null;
      if (l.make) {
        const makeSlug = slugify(l.make);
        let { data: makeRow } = await admin
          .from("makes")
          .upsert({ name: l.make, slug: makeSlug }, { onConflict: "slug", ignoreDuplicates: false })
          .select("id")
          .single();
        makeId = makeRow?.id ?? null;
      }

      let modelId: string | null = null;
      if (l.model && makeId) {
        const modelSlug = slugify(`${l.make}-${l.model}`);
        let { data: modelRow } = await admin
          .from("models")
          .upsert(
            { make_id: makeId, name: l.model, slug: modelSlug, body_type: l.body_type ?? null },
            { onConflict: "slug", ignoreDuplicates: false },
          )
          .select("id")
          .single();
        modelId = modelRow?.id ?? null;
      }

      const titleParts = [l.make, l.model, l.year].filter(Boolean);
      const title = titleParts.join(" ") || "Car Rental";
      const listingSlug = await uniqueSlug("listings", `${slugify(title)}-${randomSuffix(4)}`);

      const descParts = [
        l.spec_type ? `Spec: ${l.spec_type}` : null,
        l.color_exterior ? `Colour: ${l.color_exterior}` : null,
        l.color_interior ? `Interior: ${l.color_interior}` : null,
        l.insurance_included ? "Insurance included" : null,
        l.free_delivery ? "Free delivery available" : null,
        l.special_offer || null,
      ].filter(Boolean);

      const { data: listing, error: listErr } = await admin
        .from("listings")
        .insert({
          business_id: businessId,
          model_id: modelId,
          slug: listingSlug,
          title,
          year: l.year,
          description: descParts.join(" · ") || null,
          city: dealer?.city ?? "Dubai",
          transmission: l.transmission,
          fuel: l.fuel_type,
          seats: l.seats,
          color: l.color_exterior,
          color_interior: l.color_interior,
          doors: l.doors,
          luggage_bags: l.luggage_bags,
          spec_type: l.spec_type,
          engine_size: l.engine_size,
          status: "approved",
          is_live: true,
          primary_image_url: l.primary_image_url,
          published_at: new Date().toISOString(),
          source_platform: "oneclickdrive",
          source_url: l.ocd_url,
          source_listing_id: l.ocd_listing_id,
          tier_code: deriveTierCode(l.daily_rate_aed),
        })
        .select("id")
        .single();

      if (listErr || !listing) {
        console.error("Listing insert error:", listErr);
        continue;
      }
      const listingId = listing.id;

      const pricingRows = [];
      if (l.daily_rate_aed) pricingRows.push({ listing_id: listingId, tier: "daily", price_pkr: Math.round((l.daily_rate_aed ?? 0) * 75), price_aed: l.daily_rate_aed, currency: "AED", included_km_per_day: l.daily_km_included ?? null, extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null, min_hours: 24 });
      if (l.weekly_rate_aed) pricingRows.push({ listing_id: listingId, tier: "weekly", price_pkr: Math.round((l.weekly_rate_aed ?? 0) * 75), price_aed: l.weekly_rate_aed, currency: "AED", included_km_per_day: l.weekly_km_included ? Math.round(l.weekly_km_included / 7) : null, extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null, min_hours: 168 });
      if (l.monthly_rate_aed) pricingRows.push({ listing_id: listingId, tier: "monthly", price_pkr: Math.round((l.monthly_rate_aed ?? 0) * 75), price_aed: l.monthly_rate_aed, currency: "AED", included_km_per_day: l.monthly_km_included ? Math.round(l.monthly_km_included / 30) : null, extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null, min_hours: 720 });
      
      if (pricingRows.length > 0) {
        await admin.from("listing_pricing").insert(pricingRows);
      }

      await admin.from("listing_policies").insert({
        listing_id: listingId,
        deposit_pkr: l.deposit_aed ? Math.round(l.deposit_aed * 75) : null,
        delivery_available: l.free_delivery ?? false,
        delivery_fee_pkr: 0,
        cancellation_text: null,
        fuel_policy: l.fuel_policy ?? null,
        min_rental_days: l.min_rental_days ?? 1,
        salik_charges_aed: l.salik_charges_aed ?? null,
        payment_methods: l.payment_methods ?? [],
        deposit_refund_days: l.deposit_refund_days ?? null,
        insurance_included: l.insurance_included ?? true
      });

      if (Array.isArray(l.image_urls) && l.image_urls.length > 0) {
        const imgRows = (l.image_urls as string[]).map((url: string, idx: number) => ({
          listing_id: listingId,
          cloudinary_public_id: null,
          url,
          sort_order: idx,
          is_primary: idx === 0,
        }));
        await admin.from("listing_images").insert(imgRows);
      }

      await admin
        .from("ocd_scraped_listings")
        .update({
          status: "imported",
          imported_listing_id: listingId,
          imported_at: new Date().toISOString(),
        })
        .eq("id", l.id);

      console.log("Successfully imported:", title, "->", listingSlug);
      importedCount++;
    } catch (e) {
      console.error(`Failed to import listing ${l.ocd_listing_id}:`, (e as Error).message);
    }
  }

  console.log(`Imported ${importedCount} listings successfully.`);
}

main();
