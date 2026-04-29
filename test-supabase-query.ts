import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

// You need to replace these with your actual env vars from .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testQuery() {
  const { data, error } = await supabase
    .from("ocd_scraped_dealers")
    .select("id, ocd_company_name, phone, whatsapp, area, city, logo_url, listing_count, status, outreach_email, is_verified, is_premium, imported_at, scraped_at", { count: "exact" })
    .order("listing_count", { ascending: false })
    .range(0, 29);
    
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}

testQuery();
