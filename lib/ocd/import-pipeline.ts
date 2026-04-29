/**
 * OCD import pipeline
 *
 * activateOCDDealer(dealerId, outreachEmail) - one click to:
 *   1. Create Supabase auth user with a temp password
 *   2. Create business row from scraped dealer data
 *   3. Upsert make + model rows for every listing
 *   4. Create listing + listing_pricing + listing_policies + listing_images
 *   5. Mark dealer + all its listings as imported
 *   6. Send welcome email with login credentials
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/send";
import { revalidatePath } from "next/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

function generatePassword(len = 12): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function uniqueSlug(
  db: ReturnType<typeof createAdminClient>,
  table: string,
  base: string,
): Promise<string> {
  let slug = base;
  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (db as any).from(table).select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${randomSuffix()}`;
  }
  return slug;
}

// ---------------------------------------------------------------------------
// Main export: activate a scraped dealer
// ---------------------------------------------------------------------------

export async function activateOCDDealer(
  dealerId: string,
  outreachEmail: string,
): Promise<{ businessId?: string; userId?: string; error?: string }> {
  const admin = createAdminClient();

  // 1. Load dealer + all pending listings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dealer, error: dErr } = await (admin as any)
    .from("ocd_scraped_dealers")
    .select("*")
    .eq("id", dealerId)
    .single();

  if (dErr || !dealer) return { error: dErr?.message ?? "Dealer not found" };
  if (dealer.status === "imported") {
    return { businessId: dealer.imported_business_id, userId: dealer.imported_user_id };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listings } = await (admin as any)
    .from("ocd_scraped_listings")
    .select("*")
    .eq("dealer_id", dealerId)
    .eq("status", "pending");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingListings: any[] = listings ?? [];

  // 2. Create Supabase auth user
  const tempPassword = generatePassword();
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: outreachEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: dealer.ocd_company_name },
  });

  if (authErr || !authData.user) return { error: authErr?.message ?? "Failed to create user" };
  const userId = authData.user.id;

  // 3. Ensure profile row exists with vendor role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from("profiles").upsert({
    id: userId,
    email: outreachEmail,
    full_name: dealer.ocd_company_name,
    role: "vendor",
    is_vendor: true,
  });

  // 4. Create business
  const baseSlug = slugify(dealer.ocd_company_name);
  const bizSlug = await uniqueSlug(admin, "businesses", baseSlug);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: biz, error: bizErr } = await (admin as any)
    .from("businesses")
    .insert({
      owner_user_id: userId,
      name: dealer.ocd_company_name,
      slug: bizSlug,
      phone: dealer.phone,
      whatsapp_phone: dealer.whatsapp ?? dealer.phone,
      email: outreachEmail,
      address_line: dealer.area ? `${dealer.area}, ${dealer.city}` : dealer.city,
      city: dealer.city ?? "Dubai",
      logo_url: dealer.logo_url,
      cover_url: dealer.logo_url,
      description: dealer.description,
      working_hours: dealer.working_hours,
      claim_status: "claimed",
      is_live: true,
      total_fleet_count: pendingListings.length,
      rating: 4.0,
      reviews_count: 0,
    })
    .select("id")
    .single();

  if (bizErr || !biz) return { error: bizErr?.message ?? "Failed to create business" };
  const businessId = biz.id as string;

  // 5. Import each listing
  let importedCount = 0;

  for (const l of pendingListings) {
    try {
      // 5a. Upsert make
      let makeId: string | null = null;
      if (l.make) {
        const makeSlug = slugify(l.make);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { data: makeRow } = await (admin as any)
          .from("makes")
          .upsert({ name: l.make, slug: makeSlug }, { onConflict: "slug", ignoreDuplicates: false })
          .select("id")
          .single();
        makeId = makeRow?.id ?? null;

        if (!makeId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existing } = await (admin as any)
            .from("makes")
            .select("id")
            .eq("slug", makeSlug)
            .maybeSingle();
          makeId = existing?.id ?? null;
        }
      }

      // 5b. Upsert model
      let modelId: string | null = null;
      if (l.model && makeId) {
        const modelSlug = slugify(`${l.make}-${l.model}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { data: modelRow } = await (admin as any)
          .from("models")
          .upsert(
            { make_id: makeId, name: l.model, slug: modelSlug, body_type: l.body_type ?? null },
            { onConflict: "slug", ignoreDuplicates: false },
          )
          .select("id")
          .single();
        modelId = modelRow?.id ?? null;

        if (!modelId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: existing } = await (admin as any)
            .from("models")
            .select("id")
            .eq("slug", modelSlug)
            .maybeSingle();
          modelId = existing?.id ?? null;
        }
      }

      // 5c. Build listing title
      const titleParts = [l.make, l.model, l.year].filter(Boolean);
      const title = titleParts.join(" ") || "Car Rental";
      const listingSlug = await uniqueSlug(
        admin,
        "listings",
        `${slugify(title)}-${randomSuffix(4)}`,
      );

      // 5d. Build description from scraped data
      const descParts = [
        l.spec_type ? `Spec: ${l.spec_type}` : null,
        l.color_exterior ? `Colour: ${l.color_exterior}` : null,
        l.color_interior ? `Interior: ${l.color_interior}` : null,
        l.insurance_included ? "Insurance included" : null,
        l.free_delivery ? "Free delivery available" : null,
        l.special_offer || null,
      ].filter(Boolean);

      // 5e. Create listing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: listing, error: listErr } = await (admin as any)
        .from("listings")
        .insert({
          business_id: businessId,
          model_id: modelId,
          slug: listingSlug,
          title,
          year: l.year,
          description: descParts.join(" · ") || null,
          city: dealer.city ?? "Dubai",
          transmission: l.transmission,
          fuel: l.fuel_type,
          seats: l.seats,
          color: l.color_exterior,
          color_interior: l.color_interior,
          body_type: l.body_type,
          doors: l.doors,
          luggage_bags: l.luggage_bags,
          spec_type: l.spec_type,
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

      if (listErr || !listing) continue;
      const listingId = listing.id as string;

      // 5f. Listing pricing rows (AED stored directly)
      const pricingRows = [];
      if (l.daily_rate_aed) {
        pricingRows.push({
          listing_id: listingId,
          tier: "daily",
          price_pkr: Math.round((l.daily_rate_aed ?? 0) * 75),
          price_aed: l.daily_rate_aed,
          currency: "AED",
          included_km_per_day: l.daily_km_included ?? null,
          extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null,
          min_hours: 24,
        });
      }
      if (l.weekly_rate_aed) {
        pricingRows.push({
          listing_id: listingId,
          tier: "weekly",
          price_pkr: Math.round((l.weekly_rate_aed ?? 0) * 75),
          price_aed: l.weekly_rate_aed,
          currency: "AED",
          included_km_per_day: l.weekly_km_included
            ? Math.round(l.weekly_km_included / 7)
            : null,
          extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null,
          min_hours: 168,
        });
      }
      if (l.monthly_rate_aed) {
        pricingRows.push({
          listing_id: listingId,
          tier: "monthly",
          price_pkr: Math.round((l.monthly_rate_aed ?? 0) * 75),
          price_aed: l.monthly_rate_aed,
          currency: "AED",
          included_km_per_day: l.monthly_km_included
            ? Math.round(l.monthly_km_included / 30)
            : null,
          extra_km_rate_pkr: l.extra_km_rate_aed ? Math.round(l.extra_km_rate_aed * 75) : null,
          min_hours: 720,
        });
      }
      if (pricingRows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).from("listing_pricing").insert(pricingRows);
      }

      // 5g. Listing policies
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from("listing_policies").insert({
        listing_id: listingId,
        deposit_pkr: l.deposit_aed ? Math.round(l.deposit_aed * 75) : null,
        delivery_available: l.free_delivery ?? false,
        delivery_fee_pkr: 0,
        cancellation_text: null,
        fuel_policy: l.fuel_policy ?? null,
        min_rental_days: l.min_rental_days ?? 1,
        salik_charges_aed: l.salik_charges_aed ?? null,
        payment_methods: l.payment_methods ?? [],
      });

      // 5h. Listing images
      if (Array.isArray(l.image_urls) && l.image_urls.length > 0) {
        const imgRows = (l.image_urls as string[]).map((url: string, idx: number) => ({
          listing_id: listingId,
          cloudinary_public_id: null,
          url,
          sort_order: idx,
          is_primary: idx === 0,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin as any).from("listing_images").insert(imgRows);
      }

      // 5i. Mark this listing as imported
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from("ocd_scraped_listings")
        .update({
          status: "imported",
          imported_listing_id: listingId,
          imported_at: new Date().toISOString(),
        })
        .eq("id", l.id);

      importedCount++;
    } catch (e) {
      console.error(`Failed to import listing ${l.ocd_listing_id}:`, (e as Error).message);
    }
  }

  // 6. Mark dealer as imported
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("ocd_scraped_dealers")
    .update({
      status: "imported",
      imported_business_id: businessId,
      imported_user_id: userId,
      imported_at: new Date().toISOString(),
      outreach_email: outreachEmail,
    })
    .eq("id", dealerId);

  // 7. Send welcome email with credentials
  await sendWelcomeEmail(outreachEmail, dealer.ocd_company_name, tempPassword, importedCount);

  // 8. Revalidate public pages
  revalidatePath("/sitemap.xml");
  revalidatePath(`/vendors/${bizSlug}`);

  return { businessId, userId };
}

// ---------------------------------------------------------------------------
// Tier derivation from daily AED rate
// ---------------------------------------------------------------------------

function deriveTierCode(dailyAed: number | null): string {
  if (!dailyAed) return "economy";
  if (dailyAed < 150) return "economy";
  if (dailyAed < 350) return "sedan";
  if (dailyAed < 700) return "suv";
  return "luxury";
}

// ---------------------------------------------------------------------------
// CRM status update
// ---------------------------------------------------------------------------

export async function updateDealerStatus(
  dealerId: string,
  status: "contacted" | "agreed" | "rejected",
  notes?: string,
) {
  const admin = createAdminClient();
  const updates: Record<string, unknown> = { status };
  if (notes) updates.outreach_notes = notes;
  if (status === "contacted") updates.contacted_at = new Date().toISOString();
  if (status === "agreed") updates.agreed_at = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from("ocd_scraped_dealers")
    .update(updates)
    .eq("id", dealerId);

  return { error: error?.message };
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(
  email: string,
  companyName: string,
  password: string,
  listingCount: number,
) {
  const html = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">
      Welcome to RentNow, ${companyName}!
    </h2>
    <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
      We have imported your <strong>${listingCount} car listings</strong> from OneClickDrive
      to RentNow - exactly as they appear on OCD. Your first month is completely free.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#64748b;">Your login credentials:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#0f172a;">
        <strong>Email:</strong> ${email}
      </p>
      <p style="margin:0;font-size:13px;color:#0f172a;">
        <strong>Password:</strong> ${password}
      </p>
    </div>
    <a href="${SITE_URL}/vendor"
       style="display:inline-block;background:#f59e0b;color:#fff;font-weight:700;
              font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
      Go to Vendor Dashboard
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">
      Please change your password after first login. Your listings are live immediately -
      you can update pricing, photos, and policies from your dashboard.
    </p>
  `;

  await sendEmail(
    email,
    `Welcome to RentNow - Your ${listingCount} listings are live!`,
    html,
  );
}
