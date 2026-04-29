import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BASE_URL = "https://www.oneclickdrive.com";

async function scrapeOne(ocdId: string) {
  const url = `${BASE_URL}/details/index/search-car-rentals-dubai/?id=${ocdId}`;
  console.log("Scraping:", url);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  // My new robust dealer logic
  let companyName = "";
  let logoSrc: string | null = null;

  // Pattern 1: WhatsApp
  $("a[href*='api.whatsapp.com/send']").each((_, el) => {
    const href = $(el).attr("href") || "";
    const m = href.match(/listed\s+by\s+([^.%+&]+)/i);
    if (m && !companyName) companyName = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
  });

  // Pattern 2: Tooltip
  $("img[src*='/img/company/']").each((_, el) => {
    const mouseover = $(el).attr("onmouseover") || "";
    const m = mouseover.match(/Listed\s+by\s+([^'<]+)/i);
    if (m && !companyName) companyName = m[1].trim();
    const src = $(el).attr("src") || "";
    if (src && !logoSrc) logoSrc = src.startsWith("http") ? src : `${BASE_URL}${src}`;
  });

  console.log("Found Dealer:", companyName);
  console.log("Found Logo:", logoSrc);

  if (companyName) {
    // Update Dealer
    const { data: dealerData } = await db
      .from("ocd_scraped_dealers")
      .upsert({ ocd_company_name: companyName, logo_url: logoSrc, city: "Dubai" }, { onConflict: "ocd_company_name" })
      .select("id")
      .single();

    if (dealerData) {
      await db
        .from("ocd_scraped_listings")
        .update({ dealer_id: dealerData.id })
        .eq("ocd_listing_id", ocdId);
      console.log("Updated DB successfully!");
    }
  }
}

scrapeOne("42758");
