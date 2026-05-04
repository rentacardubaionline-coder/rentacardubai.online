-- ══════════════════════════════════════════════════════════════════════════════
-- UAE SEO reset
--
-- Wipes the legacy Pakistan seed data (148 PK cities, PK towns, 51 PK routes)
-- and replaces it with UAE-only data: Dubai (active) + 6 emirates (inactive
-- until inventory exists), Dubai's canonical area list as towns under Dubai,
-- and a small set of UAE intercity routes.
--
-- The seo_keywords table is preserved; only label text is rewritten where
-- it referenced Pakistani cities or PKR.
-- ══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Wipe legacy PK seeds ────────────────────────────────────────────────
-- Order matters: routes/towns reference cities via FK ON DELETE SET NULL/CASCADE.
DELETE FROM public.routes;
DELETE FROM public.towns;
DELETE FROM public.cities;

-- ── 2. Seed UAE emirates ────────────────────────────────────────────────────
-- Only Dubai starts active. The other emirates remain inactive until the
-- admin (or a coverage check) confirms inventory is live in those areas.
INSERT INTO public.cities (name, slug, province, is_active) VALUES
  ('Dubai',           'dubai',           'Dubai',           true),
  ('Abu Dhabi',       'abu-dhabi',       'Abu Dhabi',       false),
  ('Sharjah',         'sharjah',         'Sharjah',         false),
  ('Ajman',           'ajman',           'Ajman',           false),
  ('Fujairah',        'fujairah',        'Fujairah',        false),
  ('Ras Al Khaimah',  'ras-al-khaimah',  'Ras Al Khaimah',  false),
  ('Umm Al Quwain',   'umm-al-quwain',   'Umm Al Quwain',   false);

-- ── 3. Seed Dubai areas as towns ────────────────────────────────────────────
DO $$
DECLARE
  dubai_id uuid;
BEGIN
  SELECT id INTO dubai_id FROM public.cities WHERE slug = 'dubai';

  INSERT INTO public.towns (city_id, name, slug, is_active) VALUES
    (dubai_id, 'Dubai Marina',           'dubai-marina',           true),
    (dubai_id, 'Downtown Dubai',         'downtown-dubai',         true),
    (dubai_id, 'Business Bay',           'business-bay',           true),
    (dubai_id, 'Palm Jumeirah',          'palm-jumeirah',          true),
    (dubai_id, 'Jumeirah',               'jumeirah',               true),
    (dubai_id, 'Al Barsha',              'al-barsha',              true),
    (dubai_id, 'Deira',                  'deira',                  true),
    (dubai_id, 'Bur Dubai',              'bur-dubai',              true),
    (dubai_id, 'JLT',                    'jlt',                    true),
    (dubai_id, 'JBR',                    'jbr',                    true),
    (dubai_id, 'Dubai Hills',            'dubai-hills',            true),
    (dubai_id, 'DIFC',                   'difc',                   true),
    (dubai_id, 'Al Quoz',                'al-quoz',                true),
    (dubai_id, 'Silicon Oasis',          'silicon-oasis',          true),
    (dubai_id, 'Dubai Investment Park',  'dubai-investment-park',  true),
    (dubai_id, 'Discovery Gardens',      'discovery-gardens',      true),
    (dubai_id, 'Mirdif',                 'mirdif',                 true),
    (dubai_id, 'Motor City',             'motor-city',             true),
    (dubai_id, 'Sports City',            'sports-city',            true),
    (dubai_id, 'Dubai South',            'dubai-south',            true),
    (dubai_id, 'Al Furjan',              'al-furjan',              true);
END $$;

-- ── 4. Seed UAE intercity / popular routes ──────────────────────────────────
-- Only Dubai is currently active so all routes originate from Dubai. Routes
-- targeting inactive cities are still seeded but they will be hidden by the
-- existence-gated rendering until those destinations gain inventory.
DO $$
DECLARE
  dubai_id uuid;
  abu_dhabi_id uuid;
  sharjah_id uuid;
BEGIN
  SELECT id INTO dubai_id     FROM public.cities WHERE slug = 'dubai';
  SELECT id INTO abu_dhabi_id FROM public.cities WHERE slug = 'abu-dhabi';
  SELECT id INTO sharjah_id   FROM public.cities WHERE slug = 'sharjah';

  -- Self-routes within Dubai (popular pickup → drop-off pairs scraped by
  -- visitors searching `dubai-airport-to-downtown` etc.).
  INSERT INTO public.routes (slug, origin_city_id, destination_city_id, distance_km, estimated_time, is_active) VALUES
    ('dubai-airport-to-downtown',     dubai_id, dubai_id, 14,  '20 min',  true),
    ('dubai-airport-to-dubai-marina', dubai_id, dubai_id, 30,  '30 min',  true),
    ('downtown-to-dubai-marina',      dubai_id, dubai_id, 25,  '25 min',  true),
    ('dubai-marina-to-palm-jumeirah', dubai_id, dubai_id, 8,   '10 min',  true),
    ('business-bay-to-jlt',           dubai_id, dubai_id, 12,  '15 min',  true);

  -- Inter-emirate routes — destination cities start inactive, so these
  -- routes stay inactive until those cities are activated. Seeded here so
  -- the data exists once inventory expands.
  INSERT INTO public.routes (slug, origin_city_id, destination_city_id, distance_km, estimated_time, is_active) VALUES
    ('dubai-to-abu-dhabi', dubai_id, abu_dhabi_id, 145, '1 h 30 min', false),
    ('dubai-to-sharjah',   dubai_id, sharjah_id,   30,  '30 min',     false),
    ('dubai-to-hatta',     dubai_id, dubai_id,     130, '1 h 40 min', true);
END $$;

-- ── 5. Refresh keyword labels for the UAE market ────────────────────────────
-- The seo_keywords table is kept (admins may have customised it). We just
-- replace any obviously-PK label phrasing with UAE phrasing. Slugs are
-- preserved so existing links and sitemap entries remain valid.
UPDATE public.seo_keywords SET label = 'Rent a Car in Dubai'             WHERE slug = 'rent-a-car';
UPDATE public.seo_keywords SET label = 'Car Rental Dubai'                WHERE slug = 'car-rental';
UPDATE public.seo_keywords SET label = 'Monthly Car Rental UAE'          WHERE slug = 'monthly-rental';
UPDATE public.seo_keywords SET label = 'Daily Car Rental Dubai'          WHERE slug = 'daily-rental';
UPDATE public.seo_keywords SET label = 'Weekly Car Rental Dubai'         WHERE slug = 'weekly-rental';
UPDATE public.seo_keywords SET label = 'Luxury Car Rental Dubai'         WHERE slug = 'luxury-cars';
UPDATE public.seo_keywords SET label = 'Sports Car Rental Dubai'         WHERE slug = 'sports-cars';
UPDATE public.seo_keywords SET label = 'Self Drive Cars Dubai'           WHERE slug = 'self-drive';
UPDATE public.seo_keywords SET label = 'Car With Driver Dubai'           WHERE slug = 'with-driver';
UPDATE public.seo_keywords SET label = 'Cheap Car Rental Dubai'          WHERE slug = 'cheap-rental';
UPDATE public.seo_keywords SET label = 'Electric Car Rental Dubai'       WHERE slug = 'electric-cars';
UPDATE public.seo_keywords SET label = 'SUV Rental Dubai'                WHERE slug = 'suv-rental';
UPDATE public.seo_keywords SET label = 'Sedan Rental Dubai'              WHERE slug = 'sedan-rental';
UPDATE public.seo_keywords SET label = 'Airport Pickup Dubai'            WHERE slug = 'airport-pickup';
UPDATE public.seo_keywords SET label = 'Wedding Car Rental Dubai'        WHERE slug = 'wedding-rental';
UPDATE public.seo_keywords SET label = 'Long Term Car Rental Dubai'      WHERE slug = 'long-term-rental';
UPDATE public.seo_keywords SET label = 'Hire a Car in Dubai'             WHERE slug = 'hire-a-car';

-- Make sure the canonical "rent-a-car" keyword is active and town-indexed.
UPDATE public.seo_keywords
SET is_active = true,
    include_in_sitemap_towns = true
WHERE slug IN ('rent-a-car', 'car-rental', 'luxury-cars', 'monthly-rental', 'self-drive');

COMMIT;
