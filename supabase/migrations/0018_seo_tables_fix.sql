-- Fix script: add RLS policies and indexes that may have been missed if 0018 partially failed
-- Safe to run multiple times (all use IF NOT EXISTS or DROP IF EXISTS patterns)

-- ══════════════════════════════════════════════════
-- CITIES RLS + indexes
-- ══════════════════════════════════════════════════
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read cities" ON public.cities;
CREATE POLICY "Public can read cities" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can write cities" ON public.cities;
CREATE POLICY "Admin can write cities" ON public.cities FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update cities" ON public.cities;
CREATE POLICY "Admin can update cities" ON public.cities FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_active ON public.cities(is_active) WHERE is_active = true;

-- ══════════════════════════════════════════════════
-- TOWNS RLS + indexes
-- ══════════════════════════════════════════════════
ALTER TABLE public.towns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read towns" ON public.towns;
CREATE POLICY "Public can read towns" ON public.towns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can write towns" ON public.towns;
CREATE POLICY "Admin can write towns" ON public.towns FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update towns" ON public.towns;
CREATE POLICY "Admin can update towns" ON public.towns FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_towns_city_id ON public.towns(city_id);
CREATE INDEX IF NOT EXISTS idx_towns_slug ON public.towns(slug);

-- ══════════════════════════════════════════════════
-- ROUTES RLS + indexes
-- ══════════════════════════════════════════════════
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read routes" ON public.routes;
CREATE POLICY "Public can read routes" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can write routes" ON public.routes;
CREATE POLICY "Admin can write routes" ON public.routes FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update routes" ON public.routes;
CREATE POLICY "Admin can update routes" ON public.routes FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_routes_slug ON public.routes(slug);
CREATE INDEX IF NOT EXISTS idx_routes_origin ON public.routes(origin_city_id);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON public.routes(destination_city_id);

-- ══════════════════════════════════════════════════
-- VEHICLE CATEGORIES RLS + indexes
-- ══════════════════════════════════════════════════
ALTER TABLE public.vehicle_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read vehicle_categories" ON public.vehicle_categories;
CREATE POLICY "Public can read vehicle_categories" ON public.vehicle_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can write vehicle_categories" ON public.vehicle_categories;
CREATE POLICY "Admin can write vehicle_categories" ON public.vehicle_categories FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_slug ON public.vehicle_categories(slug);

-- ══════════════════════════════════════════════════
-- Relax listings city constraint
-- ══════════════════════════════════════════════════
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_city_check;
