-- Seed data for Dubai Market (Deep SEO Focus)
-- This script populates the database with Dubai-only cities, towns, and sample listings.

-- 1. Cities (Dubai only for initial focus)
INSERT INTO public.cities (id, name, slug, province, is_active) VALUES
  (gen_random_uuid(), 'Dubai', 'dubai', 'Dubai', true)
ON CONFLICT (slug) DO UPDATE SET is_active = true;

-- 2. Towns for Dubai (Comprehensive list for Deep SEO)
DO $$
DECLARE
  dubai_id uuid;
BEGIN
  SELECT id INTO dubai_id FROM public.cities WHERE slug = 'dubai';
  
  IF dubai_id IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id, is_active) VALUES
      ('Dubai Marina', 'dubai-marina', dubai_id, true),
      ('Downtown Dubai', 'downtown-dubai', dubai_id, true),
      ('Business Bay', 'business-bay', dubai_id, true),
      ('Jumeirah Beach Residence (JBR)', 'jbr', dubai_id, true),
      ('Palm Jumeirah', 'palm-jumeirah', dubai_id, true),
      ('Jumeirah Lake Towers (JLT)', 'jlt', dubai_id, true),
      ('Al Barsha', 'al-barsha', dubai_id, true),
      ('Al Barsha Heights (Tecom)', 'tecom', dubai_id, true),
      ('Dubai Silicon Oasis (DSO)', 'silicon-oasis', dubai_id, true),
      ('Jumeirah Village Circle (JVC)', 'jvc', dubai_id, true),
      ('Jumeirah Village Triangle (JVT)', 'jvt', dubai_id, true),
      ('Discovery Gardens', 'discovery-gardens', dubai_id, true),
      ('Al Quoz', 'al-quoz', dubai_id, true),
      ('Deira', 'deira', dubai_id, true),
      ('Bur Dubai', 'bur-dubai', dubai_id, true),
      ('Al Karama', 'karama', dubai_id, true),
      ('Al Satwa', 'satwa', dubai_id, true),
      ('Jumeirah 1', 'jumeirah-1', dubai_id, true),
      ('Jumeirah 2', 'jumeirah-2', dubai_id, true),
      ('Jumeirah 3', 'jumeirah-3', dubai_id, true),
      ('Umm Suqeim', 'umm-suqeim', dubai_id, true),
      ('Al Safa', 'al-safa', dubai_id, true),
      ('Al Wasl', 'al-wasl', dubai_id, true),
      ('City Walk', 'city-walk', dubai_id, true),
      ('Meydan', 'meydan', dubai_id, true),
      ('Nad Al Sheba', 'nad-al-sheba', dubai_id, true),
      ('Mirdif', 'mirdif', dubai_id, true),
      ('Muhaisnah', 'muhaisnah', dubai_id, true),
      ('Al Qusais', 'al-qusais', dubai_id, true),
      ('Dubai International Airport (DXB)', 'dxb-airport', dubai_id, true),
      ('Al Maktoum International Airport (DWC)', 'dwc-airport', dubai_id, true),
      ('Al Furjan', 'al-furjan', dubai_id, true),
      ('Town Square', 'town-square', dubai_id, true),
      ('Arabian Ranches', 'arabian-ranches', dubai_id, true),
      ('Dubai Hills Estate', 'dubai-hills', dubai_id, true),
      ('Damac Hills', 'damac-hills', dubai_id, true),
      ('Damac Hills 2', 'damac-hills-2', dubai_id, true),
      ('Mudon', 'mudon', dubai_id, true),
      ('Remraam', 'remraam', dubai_id, true),
      ('Motor City', 'motor-city', dubai_id, true),
      ('Sports City', 'sports-city', dubai_id, true),
      ('Dubai Production City (IMPZ)', 'impz', dubai_id, true),
      ('Dubai Studio City', 'studio-city', dubai_id, true),
      ('Academic City', 'academic-city', dubai_id, true),
      ('International City', 'international-city', dubai_id, true),
      ('Dubai Festival City', 'festival-city', dubai_id, true),
      ('Al Garhoud', 'al-garhoud', dubai_id, true),
      ('Al Jaddaf', 'al-jaddaf', dubai_id, true),
      ('Dubai Healthcare City', 'healthcare-city', dubai_id, true),
      ('Oud Metha', 'oud-metha', dubai_id, true),
      ('Dubai Design District (d3)', 'd3', dubai_id, true),
      ('Pearl Jumeirah', 'pearl-jumeirah', dubai_id, true),
      ('Bluewaters Island', 'bluewaters', dubai_id, true),
      ('Dubai South', 'dubai-south', dubai_id, true),
      ('Expo City Dubai', 'expo-city', dubai_id, true)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;
END $$;

-- 3. Sample Businesses for Dubai
INSERT INTO public.businesses (
  id, name, slug, phone, whatsapp_phone, email, address_line, city, lat, lng,
  cover_url, rating, reviews_count, claim_status, created_at, is_live
) VALUES
  ('22222222-2222-2222-2222-222222222221', 'Dubai Luxury Rentals', 'dubai-luxury-rentals', '+971501234567', '+971501234567', 'info@dubailuxury.ae', 'Business Bay, Dubai', 'Dubai', 25.1852, 55.2734, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 4.9, 320, 'claimed', now(), true),
  ('22222222-2222-2222-2222-222222222222', 'Marina Car Hire', 'marina-car-hire', '+971502234567', '+971502234567', 'rent@marinacars.ae', 'Dubai Marina', 'Dubai', 25.0657, 55.1403, 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a5?w=800', 4.7, 150, 'claimed', now(), true),
  ('22222222-2222-2222-2222-222222222223', 'Desert Wheels UAE', 'desert-wheels-uae', '+971503234567', '+971503234567', 'hello@desertwheels.ae', 'Al Quoz, Dubai', 'Dubai', 25.1585, 55.2323, 'https://images.unsplash.com/photo-1533473359331-35acda7d61c0?w=800', 4.5, 85, 'claimed', now(), true),
  ('22222222-2222-2222-2222-222222222224', 'JVC Budget Cars', 'jvc-budget-cars', '+971504234567', '+971504234567', 'info@jvccars.ae', 'Jumeirah Village Circle', 'Dubai', 25.0410, 55.2015, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800', 4.3, 45, 'claimed', now(), true)

ON CONFLICT (slug) DO NOTHING;

-- 4. Sample Listings for Dubai
-- Listing 1: Lamborghini Huracan (Luxury) - Business Bay
INSERT INTO public.listings (
  id, business_id, slug, year, title, description, city, transmission, fuel, seats, color, mileage_km,
  status, primary_image_url, published_at, created_at, is_live
) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'lamborghini-huracan-2023-dubai', 2023, 'Lamborghini Huracan EVO', 'Experience the thrill of V10 power in Dubai. Perfectly maintained, fully loaded Huracan EVO.', 'Dubai', 'automatic', 'petrol', 2, 'Giallo Inti', 5000, 'approved', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', now(), now(), true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.listing_pricing (listing_id, tier, price_pkr, included_km_per_day, extra_km_rate_pkr) VALUES
  ('11111111-1111-1111-1111-111111111111', 'daily', 3500, 250, 15)
ON CONFLICT (listing_id, tier) DO NOTHING;

INSERT INTO public.listing_policies (listing_id, deposit_pkr, min_age, license_required, cancellation_text) VALUES
  ('11111111-1111-1111-1111-111111111111', 5000, 25, true, 'Free cancellation up to 48 hours before pick-up.')

ON CONFLICT (listing_id) DO NOTHING;

-- Listing 2: Nissan Patrol (SUV) - Al Quoz
INSERT INTO public.listings (
  id, business_id, slug, year, title, description, city, transmission, fuel, seats, color, mileage_km,
  status, primary_image_url, published_at, created_at, is_live
) VALUES
  ('11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222223', 'nissan-patrol-titanium-2022', 2022, 'Nissan Patrol Titanium', 'The king of the desert. Perfect for families and long trips. Spacious and powerful.', 'Dubai', 'automatic', 'petrol', 7, 'White', 25000, 'approved', 'https://images.unsplash.com/photo-1533473359331-35acda7d61c0?w=800', now(), now(), true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.listing_pricing (listing_id, tier, price_pkr, included_km_per_day, extra_km_rate_pkr) VALUES
  ('11111111-1111-1111-1111-111111111112', 'daily', 600, 300, 5)
ON CONFLICT (listing_id, tier) DO NOTHING;

INSERT INTO public.listing_policies (listing_id, deposit_pkr, min_age, license_required, cancellation_text) VALUES
  ('11111111-1111-1111-1111-111111111112', 2000, 21, true, 'Free cancellation up to 24 hours before pick-up.')

ON CONFLICT (listing_id) DO NOTHING;
