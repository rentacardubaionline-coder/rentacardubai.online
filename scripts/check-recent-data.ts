import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: recentBusinesses } = await db
    .from("businesses")
    .select("id, name, email")
    .order("created_at", { ascending: false })
    .limit(1);

  const businessId = recentBusinesses![0].id;
  console.log("Checking for Business:", recentBusinesses![0]);

  // Check dealers linked to this business
  const { data: scrapedDealers, error: dealerErr } = await db
    .from("ocd_scraped_dealers")
    .select("id, ocd_company_name, imported_business_id")
    .eq("imported_business_id", businessId);

  if (dealerErr) console.error("Dealer Err:", dealerErr);
  console.log("Dealers mapped to this business:", scrapedDealers);

  if (scrapedDealers && scrapedDealers.length > 0) {
    const dealerId = scrapedDealers[0].id;
    const { data: scrapedListings, error: scrapErr } = await db
      .from("ocd_scraped_listings")
      .select("id, ocd_listing_id, dealer_id, status, imported_listing_id")
      .eq("dealer_id", dealerId);
    
    if (scrapErr) console.error("Scrape err:", scrapErr);
    console.log("Raw scraped listings for this dealer:", scrapedListings);
    
    // Check what went wrong during import by checking if the listings are in the main table
    if (scrapedListings && scrapedListings.length > 0) {
      const ocdIds = scrapedListings.map(l => l.ocd_listing_id);
      const { data: mainListings } = await db
        .from("listings")
        .select("id, slug, status, source_listing_id")
        .in("source_listing_id", ocdIds);
      console.log("Main listings mapped:", mainListings);
    }
  } else {
    // Maybe they haven't been mapped at all? Let's search by name
    const { data: rawDealers } = await db
      .from("ocd_scraped_dealers")
      .select("id, ocd_company_name, imported_business_id")
      .ilike("ocd_company_name", "%Fleet Master%");
    console.log("Dealers matching Fleet Master name:", rawDealers);

    if (rawDealers && rawDealers.length > 0) {
      const dealerId = rawDealers[0].id;
      const { data: rawListings } = await db
        .from("ocd_scraped_listings")
        .select("id, status")
        .eq("dealer_id", dealerId);
      console.log(`That dealer has ${rawListings?.length} raw listings.`);
    }
  }
}

main();
