import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCities() {
  console.log("Fetching scraped cities...");
  
  // Get distinct cities from scraped_businesses
  const { data: businesses, error: bErr } = await supabase
    .from('scraped_businesses')
    .select('city_name');
    
  if (bErr) {
    console.error("Error fetching businesses:", bErr.message);
    return;
  }
  
  const uniqueCities = new Set(businesses.map(b => b.city_name).filter(Boolean));
  console.log(`\nFound ${uniqueCities.size} unique cities in scraped_businesses:`);
  Array.from(uniqueCities).forEach(city => console.log(`- ${city}`));
  
  // Also check completed scrape_jobs
  const { data: jobs, error: jErr } = await supabase
    .from('scrape_jobs')
    .select('city_name, status')
    .eq('status', 'completed');
    
  if (jErr) {
    console.error("Error fetching jobs:", jErr.message);
    return;
  }
  
  const completedCities = new Set(jobs.map(j => j.city_name).filter(Boolean));
  console.log(`\nFound ${completedCities.size} cities with 'completed' scrape_jobs:`);
  Array.from(completedCities).forEach(city => console.log(`- ${city}`));
  
}

checkCities();
