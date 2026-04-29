-- =============================================================================
-- DUBAI POST-MIGRATION FIX
-- Neutralizes Pakistani data and sets up Dubai-specific pricing tiers.
-- Run this AFTER migrations 0001-0033.
-- =============================================================================

-- 1. Clear Pakistani SEO Data (in case 0019/0021 were accidentally run)
TRUNCATE public.cities CASCADE;
TRUNCATE public.seo_keywords CASCADE;

-- 2. Update Pricing Tiers for Dubai Market (AED Values + Local Car Examples)
-- Economy
UPDATE public.pricing_tiers 
SET 
  price_pkr = 10,  -- 10 AED per lead
  description = 'Compact hatchbacks and entry-level sedans — the everyday Dubai city-runner.',
  examples = ARRAY['Nissan Sunny', 'Mitsubishi Attrage', 'Kia Rio', 'Hyundai Accent', 'Toyota Yaris']
WHERE code = 'economy';

-- Sedan
UPDATE public.pricing_tiers 
SET 
  price_pkr = 15, -- 15 AED per lead
  description = 'Mid-size 4-door sedans — the typical executive or family choice.',
  examples = ARRAY['Toyota Camry', 'Honda Accord', 'Nissan Altima', 'Mazda 6', 'Hyundai Sonata']
WHERE code = 'sedan';

-- SUV
UPDATE public.pricing_tiers 
SET 
  price_pkr = 25, -- 25 AED per lead
  description = 'Versatile SUVs and Crossovers — for families and city exploration.',
  examples = ARRAY['Kia Sportage', 'Hyundai Tucson', 'Mitsubishi Pajero', 'Toyota Fortuner', 'Nissan X-Trail']
WHERE code = 'suv';

-- Luxury
UPDATE public.pricing_tiers 
SET 
  price_pkr = 50, -- 50 AED per lead
  description = 'High-end premium and exotic rides — for a statement on the Sheikh Zayed Road.',
  examples = ARRAY['Mercedes S-Class', 'BMW 7 Series', 'Range Rover', 'Nissan Patrol Nismo', 'Audi A8', 'Rolls Royce']
WHERE code = 'luxury';

-- 3. Confirm Column Cleanliness
-- Note: We keep the '_pkr' column names to avoid breaking the frontend application logic,
-- but the stored values now represent AED for the Dubai market.
