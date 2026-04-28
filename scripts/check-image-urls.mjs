import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) { console.error('Missing env vars'); process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Checking listing_images...');
  const { data: listingImages, error: liError } = await supabase.from('listing_images').select('id, url');
  if (liError) throw liError;

  let fixedImages = 0;
  for (const img of listingImages) {
    if (img.url.includes(' ')) {
      const newUrl = img.url.replace(/ /g, '%20');
      console.log(`Fixing image ${img.id}: ${img.url} -> ${newUrl}`);
      await supabase.from('listing_images').update({ url: newUrl }).eq('id', img.id);
      fixedImages++;
    }
  }

  console.log('Checking businesses table...');
  const { data: businessLogos, error: bLogError } = await supabase.from('businesses').select('id, logo_url');
  if (bLogError) throw bLogError;

  for (const biz of businessLogos) {
    if (biz.logo_url && biz.logo_url.includes(' ')) {
      const newUrl = biz.logo_url.replace(/ /g, '%20');
      console.log(`Fixing business logo ${biz.id}: ${biz.logo_url} -> ${newUrl}`);
      await supabase.from('businesses').update({ logo_url: newUrl }).eq('id', biz.id);
      fixedImages++;
    }
  }

  console.log('Checking business_images table...');
  const { data: businessImages, error: biError } = await supabase.from('business_images').select('id, url');
  if (biError) throw biError;

  for (const img of businessImages) {
    if (img.url.includes(' ')) {
      const newUrl = img.url.replace(/ /g, '%20');
      console.log(`Fixing business image ${img.id}: ${img.url} -> ${newUrl}`);
      await supabase.from('business_images').update({ url: newUrl }).eq('id', img.id);
      fixedImages++;
    }
  }

  console.log(`Fixed ${fixedImages} image URLs with spaces in the database.`);
}

run().catch(console.error);
