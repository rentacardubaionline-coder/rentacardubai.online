import { createAdminClient } from "@/lib/supabase/admin";
import { uploadRemoteImage } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";

/** Slugify a business name for URL */
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

/**
 * Import a scraped business into the real businesses table.
 * Downloads images to Cloudinary, creates reviews, sets claim_status='unclaimed'.
 */
export async function importScrapedBusiness(
  scrapedId: string,
): Promise<{ businessId?: string; error?: string }> {
  const admin = createAdminClient();

  // 1. Fetch scraped row + reviews
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: scraped, error: scrapeErr } = await (admin as any)
    .from("scraped_businesses")
    .select("*")
    .eq("id", scrapedId)
    .single();

  if (scrapeErr || !scraped) return { error: scrapeErr?.message || "Scraped row not found" };
  if (scraped.status === "imported") return { businessId: scraped.imported_business_id };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews } = await (admin as any)
    .from("scraped_reviews")
    .select("*")
    .eq("scraped_business_id", scrapedId)
    .order("scraped_at", { ascending: false })
    .limit(15);

  // 2. Generate unique slug
  const baseSlug = slugify(scraped.name);
  let slug = baseSlug;
  let attempts = 0;
  while (attempts < 5) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (admin as any)
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${randomSuffix()}`;
    attempts++;
  }

  // 3. Resolve city — prefer matched_city_id; else lookup by name
  let cityName = scraped.city_name || "Lahore";
  if (scraped.matched_city_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cityRow } = await (admin as any)
      .from("cities")
      .select("name")
      .eq("id", scraped.matched_city_id)
      .maybeSingle();
    if (cityRow) cityName = cityRow.name;
  }

  // 4. Create business
  const businessInsert = {
    owner_user_id: null,
    name: scraped.name,
    slug,
    phone: scraped.normalised_phone,
    whatsapp_phone: scraped.normalised_phone,
    address_line: scraped.address,
    city: cityName,
    lat: scraped.lat,
    lng: scraped.lng,
    rating: scraped.rating ?? 4.0,
    reviews_count: scraped.total_ratings ?? (reviews?.length ?? 0),
    claim_status: "unclaimed" as const,
    is_live: false, // Unpublished by default — admin decides what goes live
    description: scraped.description,
    website_url: scraped.website,
    working_hours: scraped.working_hours,
    google_place_id: scraped.google_place_id,
    google_maps_url: scraped.google_maps_url,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: business, error: bizErr } = await (admin as any)
    .from("businesses")
    .insert(businessInsert)
    .select("id")
    .single();

  if (bizErr || !business) return { error: bizErr?.message || "Failed to create business" };
  const businessId = business.id as string;

  // 5. Upload images to Cloudinary
  if (scraped.image_urls && Array.isArray(scraped.image_urls) && scraped.image_urls.length > 0) {
    const imageRows: {
      business_id: string;
      cloudinary_public_id: string | null;
      url: string;
      sort_order: number;
      is_primary: boolean;
    }[] = [];

    for (let i = 0; i < scraped.image_urls.length; i++) {
      const srcUrl = scraped.image_urls[i];
      try {
        const secureUrl = await uploadRemoteImage(
          srcUrl,
          `rentnowpk/businesses/${businessId}`,
        );
        imageRows.push({
          business_id: businessId,
          cloudinary_public_id: null,
          url: secureUrl,
          sort_order: i,
          is_primary: i === 0,
        });
      } catch (err) {
        console.error(`Image upload failed for ${srcUrl}:`, err);
      }
    }

    if (imageRows.length > 0) {
      // Set cover_url to first image
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from("businesses")
        .update({ cover_url: imageRows[0].url, logo_url: imageRows[0].url })
        .eq("id", businessId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from("business_images").insert(imageRows);
    }
  }

  // 6. Insert reviews
  if (reviews && reviews.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewRows = (reviews as any[]).map((r) => ({
      business_id: businessId,
      reviewer_name: r.reviewer_name || "Anonymous",
      reviewer_avatar_url: r.reviewer_avatar_url,
      rating: r.rating,
      comment: r.comment,
      created_at: new Date().toISOString(),
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from("business_reviews").insert(reviewRows);
  }

  // 7. Mark scraped row imported
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("scraped_businesses")
    .update({
      status: "imported",
      imported_business_id: businessId,
      imported_at: new Date().toISOString(),
    })
    .eq("id", scrapedId);

  // 8. Revalidate SEO pages
  revalidatePath("/sitemap.xml");
  revalidatePath(`/vendors/${slug}`);

  return { businessId };
}
