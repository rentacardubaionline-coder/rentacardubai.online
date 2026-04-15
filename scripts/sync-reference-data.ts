/**
 * Sync vehicle makes, models, and features from external API to Supabase.
 * Run via: npm run db:sync
 *
 * This script:
 * 1. Fetches makes/models/features from your API (requires CAR_API_KEY in .env)
 * 2. For each make, uploads the logo to Cloudinary
 * 3. Upserts all data into Supabase
 * 4. Is idempotent (safe to run multiple times)
 */

import { createClient } from "@supabase/supabase-js";
import { uploadRemoteImage } from "../lib/cloudinary";
import { slugify } from "../lib/utils";

// Mock API response structure — adjust to match your actual API
interface ApiMake {
  id: string;
  name: string;
  logo?: string;
}

interface ApiModel {
  id: string;
  makeId: string;
  name: string;
  bodyType?: string;
}

interface ApiFeature {
  id: string;
  name: string;
  icon?: string;
  group?: string;
}

async function syncReferenceData() {
  console.log("🚀 Starting reference data sync...\n");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

  const apiKey = process.env.CAR_API_KEY;

  if (!apiKey) {
    throw new Error("CAR_API_KEY not set in .env");
  }

  try {
    // Fetch from external API
    console.log("📥 Fetching makes from external API...");
    const makesResponse = await fetch("https://api.example.com/makes", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!makesResponse.ok) {
      throw new Error(`API error: ${makesResponse.status}`);
    }

    const { makes = [], models = [], features = [] } = await makesResponse.json();

    console.log(`✓ Got ${makes.length} makes, ${models.length} models, ${features.length} features\n`);

    // Sync makes (with Cloudinary logo uploads)
    console.log("📤 Syncing makes...");
    for (const make of makes as ApiMake[]) {
      let logoUrl = null;

      if (make.logo) {
        console.log(`  Uploading logo for ${make.name}...`);
        logoUrl = await uploadRemoteImage(
          make.logo,
          "rentnowpk/makes",
          `make-${slugify(make.name)}`,
        );
      }

      const { error } = await (supabase as any)
        .from("makes")
        .upsert({
          external_id: make.id,
          name: make.name,
          slug: slugify(make.name),
          logo_url: logoUrl,
        });

      if (error) {
        console.error(`  ❌ Failed to sync ${make.name}:`, error.message);
      } else {
        console.log(`  ✓ ${make.name}`);
      }
    }

    console.log();

    // Sync models
    console.log("📤 Syncing models...");
    for (const model of models as ApiModel[]) {
      // Get the make's UUID from external_id
      const { data: make } = await (supabase as any)
        .from("makes")
        .select("id")
        .eq("external_id", model.makeId)
        .single();

      if (!make) {
        console.warn(`  ⚠ Make ${model.makeId} not found, skipping model ${model.name}`);
        continue;
      }

      const { error } = await (supabase as any)
        .from("models")
        .upsert({
          external_id: model.id,
          make_id: make.id,
          name: model.name,
          slug: slugify(model.name),
          body_type: model.bodyType || null,
        });

      if (error) {
        console.error(`  ❌ Failed to sync ${model.name}:`, error.message);
      } else {
        console.log(`  ✓ ${model.name}`);
      }
    }

    console.log();

    // Sync features
    console.log("📤 Syncing features...");
    for (const feature of features as ApiFeature[]) {
      let iconUrl = null;

      if (feature.icon) {
        console.log(`  Uploading icon for ${feature.name}...`);
        iconUrl = await uploadRemoteImage(
          feature.icon,
          "rentnowpk/features",
          `feature-${slugify(feature.name)}`,
        );
      }

      const { error } = await (supabase as any)
        .from("vehicle_features")
        .upsert({
          external_id: feature.id,
          name: feature.name,
          slug: slugify(feature.name),
          icon_url: iconUrl,
          group: feature.group || null,
        });

      if (error) {
        console.error(`  ❌ Failed to sync ${feature.name}:`, error.message);
      } else {
        console.log(`  ✓ ${feature.name}`);
      }
    }

    console.log("\n✅ Reference data sync complete!");
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  syncReferenceData();
}

export { syncReferenceData };
