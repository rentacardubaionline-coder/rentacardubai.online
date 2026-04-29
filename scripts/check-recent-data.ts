import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkData() {
  const { data: listings, error } = await db
    .from("ocd_scraped_listings")
    .select("*, dealer:dealer_id(*)")
    .order("scraped_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("DB Error:", error);
    return;
  }

  console.log("Recent Listings:");
  listings.forEach(l => {
    console.log(`- ID: ${l.ocd_listing_id}, Make: ${l.make}, Dealer: ${l.dealer?.ocd_company_name}, Logo: ${l.dealer?.logo_url}`);
  });
}

checkData();
