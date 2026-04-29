import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await db
    .from("ocd_scraped_listings")
    .select("ocd_listing_id, body_type, transmission, doors, seats, daily_km_included, scraped_at")
    .order('scraped_at', { ascending: false })
    .limit(5);
  
  if (error) console.error(error);
  else console.log(data);
}

main();
