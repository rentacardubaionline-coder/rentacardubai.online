/**
 * One-time script to create the admin user.
 * Run via: npx tsx scripts/create-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = "admin@rentnowpk.com";
  const password = "Wasif*1016";

  console.log(`Creating admin user: ${email}`);

  // Create auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      console.log("User already exists — updating role to admin...");

      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (!existing) {
        console.error("Could not find profile for existing user.");
        process.exit(1);
      }

      const { error: updateError } = await admin
        .from("profiles")
        .update({ role: "admin", updated_at: new Date().toISOString() })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Failed to update role:", updateError.message);
        process.exit(1);
      }

      console.log("✓ Role updated to admin.");
      return;
    }

    console.error("Failed to create user:", authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`✓ Auth user created: ${userId}`);

  // Set role to admin in profiles table
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "admin", full_name: "Admin", updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to set admin role:", profileError.message);
    process.exit(1);
  }

  console.log("✓ Profile role set to admin.");
  console.log("\nAdmin credentials:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  URL:      /admin`);
}

main();
