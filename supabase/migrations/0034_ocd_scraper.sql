-- ══════════════════════════════════════════════════════════════════════════════
-- OneClickDrive scraper staging tables
-- Three tables: jobs (queue), dealers (companies), listings (cars)
-- Admin reviews at /admin/ocd — activate dealer to create user + import listings
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── OCD SCRAPE JOBS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ocd_scrape_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'oneclickdrive',
  source_city text NOT NULL DEFAULT 'dubai',
  source_url text,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','running','completed','failed','cancelled')),
  total_pages int DEFAULT 0,
  pages_scraped int DEFAULT 0,
  listings_found int DEFAULT 0,
  listings_scraped int DEFAULT 0,
  dealers_found int DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ocd_scrape_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage ocd_scrape_jobs" ON public.ocd_scrape_jobs;
CREATE POLICY "Admin can manage ocd_scrape_jobs" ON public.ocd_scrape_jobs
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ocd_scrape_jobs_status   ON public.ocd_scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ocd_scrape_jobs_created  ON public.ocd_scrape_jobs(created_at DESC);

-- ─── OCD SCRAPED DEALERS ─────────────────────────────────────────────────────
-- One row per rental company found on OCD.
-- status workflow: pending → contacted → agreed → imported (or rejected)
CREATE TABLE IF NOT EXISTS public.ocd_scraped_dealers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.ocd_scrape_jobs(id) ON DELETE SET NULL,

  -- Identity on OCD
  ocd_company_name text NOT NULL,
  ocd_company_slug text,

  -- Contact
  phone text,
  whatsapp text,
  email text,

  -- Location
  area text,          -- e.g. "Al Barsha", "Al Quoz"
  city text DEFAULT 'Dubai',
  country text DEFAULT 'UAE',

  -- Branding
  logo_url text,
  description text,
  working_hours jsonb,

  -- OCD flags
  is_verified boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  listing_count int DEFAULT 0,

  -- CRM / outreach workflow
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','contacted','agreed','rejected','imported')),
  outreach_email text,     -- email admin will use to contact / create account
  outreach_notes text,
  contacted_at timestamptz,
  agreed_at timestamptz,

  -- Import tracking
  imported_business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  imported_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  imported_at timestamptz,

  scraped_at timestamptz DEFAULT now(),

  UNIQUE(ocd_company_name)
);

ALTER TABLE public.ocd_scraped_dealers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage ocd_scraped_dealers" ON public.ocd_scraped_dealers;
CREATE POLICY "Admin can manage ocd_scraped_dealers" ON public.ocd_scraped_dealers
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ocd_dealers_status  ON public.ocd_scraped_dealers(status);
CREATE INDEX IF NOT EXISTS idx_ocd_dealers_job_id  ON public.ocd_scraped_dealers(job_id);
CREATE INDEX IF NOT EXISTS idx_ocd_dealers_name    ON public.ocd_scraped_dealers(ocd_company_name);

-- ─── OCD SCRAPED LISTINGS ────────────────────────────────────────────────────
-- One row per car listing from OCD.  status: pending → imported | skipped
CREATE TABLE IF NOT EXISTS public.ocd_scraped_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.ocd_scrape_jobs(id) ON DELETE SET NULL,
  dealer_id uuid REFERENCES public.ocd_scraped_dealers(id) ON DELETE CASCADE,

  -- OCD identity
  ocd_listing_id text NOT NULL,
  ocd_url text NOT NULL,

  -- ── Car specs ──────────────────────────────────────────────────────────────
  make text,
  model text,
  year int,
  body_type text,
  transmission text,
  fuel_type text,
  seats int,
  doors int,
  luggage_bags int,
  color_exterior text,
  color_interior text,
  spec_type text,          -- GCC / American / European / Japanese

  -- ── Pricing (AED) ─────────────────────────────────────────────────────────
  daily_rate_aed numeric(10,2),
  weekly_rate_aed numeric(10,2),
  monthly_rate_aed numeric(10,2),
  daily_km_included int,
  weekly_km_included int,
  monthly_km_included int,
  extra_km_rate_aed numeric(8,3),
  deposit_aed numeric(10,2),
  salik_charges_aed numeric(8,2),
  vat_percentage numeric(4,2) DEFAULT 5.0,

  -- ── Policies ──────────────────────────────────────────────────────────────
  insurance_included boolean DEFAULT true,
  free_delivery boolean DEFAULT false,
  min_rental_days int DEFAULT 1,
  fuel_policy text,
  payment_methods text[],

  -- ── Features (raw text array, e.g. "Leather seats", "Apple CarPlay") ──────
  features text[],

  -- ── Media ─────────────────────────────────────────────────────────────────
  image_urls text[],
  primary_image_url text,

  -- ── Metadata ──────────────────────────────────────────────────────────────
  special_offer text,
  is_premium boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  ocd_last_updated text,

  -- ── Import tracking ───────────────────────────────────────────────────────
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','imported','skipped')),
  imported_listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  imported_at timestamptz,

  scraped_at timestamptz DEFAULT now(),

  UNIQUE(ocd_listing_id)
);

ALTER TABLE public.ocd_scraped_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage ocd_scraped_listings" ON public.ocd_scraped_listings;
CREATE POLICY "Admin can manage ocd_scraped_listings" ON public.ocd_scraped_listings
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_ocd_listings_dealer_id  ON public.ocd_scraped_listings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_ocd_listings_status     ON public.ocd_scraped_listings(status);
CREATE INDEX IF NOT EXISTS idx_ocd_listings_make_model ON public.ocd_scraped_listings(make, model);
CREATE INDEX IF NOT EXISTS idx_ocd_listings_job_id     ON public.ocd_scraped_listings(job_id);
