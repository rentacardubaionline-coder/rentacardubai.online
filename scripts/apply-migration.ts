/**
 * Apply pending migrations to Supabase.
 * Run: npx tsx scripts/apply-migration.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const sql = `alter table public.businesses add column if not exists category text;
create index if not exists idx_businesses_category on public.businesses(category);`;

  const { error } = await admin.rpc("exec_sql" as any, { sql }).single();
  if (error) {
    // Try direct query approach
    console.log("RPC not available, trying direct approach...");
    // The migration is applied via Supabase dashboard or CLI
    console.log("Please run this SQL in your Supabase SQL editor:");
    console.log(sql);
  } else {
    console.log("✓ Migration applied.");
  }
}

main();
