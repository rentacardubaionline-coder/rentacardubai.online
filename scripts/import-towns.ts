/**
 * Reads data/towns-export.csv and generates a SQL file to import into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-towns.ts
 *
 * Output: data/import-towns.sql  (run this in Supabase SQL Editor)
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const csvPath = join(__dirname, "..", "data", "towns-export.csv");
const outPath = join(__dirname, "..", "data", "import-towns.sql");

const raw = readFileSync(csvPath, "utf-8");
const lines = raw.split("\n").filter((l) => l.trim());

// Skip header
const rows = lines.slice(1);

// Parse CSV (handles quoted fields)
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// Group towns by city
const byCitySlug = new Map<string, { name: string; slug: string }[]>();

for (const line of rows) {
  const [name, slug, citySlug] = parseCsvLine(line);
  if (!name || !slug || !citySlug) continue;
  if (!byCitySlug.has(citySlug)) byCitySlug.set(citySlug, []);
  byCitySlug.get(citySlug)!.push({ name, slug });
}

// Generate SQL
const sqlParts: string[] = [
  "-- Auto-generated: import all towns from old project",
  "-- Run this in Supabase SQL Editor",
  "",
  "DO $$",
  "DECLARE",
  "  cid uuid;",
  "BEGIN",
];

for (const [citySlug, towns] of byCitySlug) {
  const escapedSlug = citySlug.replace(/'/g, "''");
  sqlParts.push("");
  sqlParts.push(`  -- ${citySlug} (${towns.length} towns)`);
  sqlParts.push(`  SELECT id INTO cid FROM public.cities WHERE slug = '${escapedSlug}';`);
  sqlParts.push(`  IF cid IS NOT NULL THEN`);
  sqlParts.push(`    INSERT INTO public.towns (name, slug, city_id) VALUES`);

  const valueLines = towns.map((t, i) => {
    const eName = t.name.replace(/'/g, "''");
    const eSlug = t.slug.replace(/'/g, "''");
    const comma = i < towns.length - 1 ? "," : "";
    return `      ('${eName}', '${eSlug}', cid)${comma}`;
  });
  sqlParts.push(...valueLines);
  sqlParts.push(`    ON CONFLICT (slug, city_id) DO NOTHING;`);
  sqlParts.push(`  END IF;`);
}

sqlParts.push("");
sqlParts.push("END $$;");

const sql = sqlParts.join("\n");
writeFileSync(outPath, sql, "utf-8");

console.log(`Generated ${outPath}`);
console.log(`Cities: ${byCitySlug.size}`);
console.log(`Total towns: ${rows.length}`);
console.log(`\nNext: Run data/import-towns.sql in Supabase SQL Editor`);
