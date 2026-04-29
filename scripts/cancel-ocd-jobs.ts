import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

async function main() {
  const { data, error } = await (db as any)
    .from("ocd_scrape_jobs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .in("status", ["running", "pending"])
    .select("id, source_city, status");

  if (error) { console.error("Error:", error.message); process.exit(1); }
  if (!data || data.length === 0) {
    console.log("No running/pending jobs found.");
  } else {
    console.log(`Cancelled ${data.length} job(s):`);
    for (const j of data) console.log(`  - ${j.id} (${j.source_city})`);
  }
}

main();
