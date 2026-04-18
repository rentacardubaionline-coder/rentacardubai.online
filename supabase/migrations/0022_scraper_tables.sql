-- Scraper tables: jobs queue + staged businesses + staged reviews
-- GitHub Actions runs the Python scraper, writes into these tables
-- Admin reviews at /admin/scraper/review, approves → promotes to real businesses/reviews

-- ══════════════════════════════════════════════════
-- SCRAPE JOBS (queue)
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  city_name text NOT NULL,
  city_slug text,
  category text DEFAULT 'Car rental',
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','running','completed','failed','cancelled')),
  progress_current int DEFAULT 0,
  progress_total int DEFAULT 0,
  scraped_count int DEFAULT 0,
  error_message text,
  github_run_id text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read scrape_jobs" ON public.scrape_jobs;
CREATE POLICY "Admin can read scrape_jobs" ON public.scrape_jobs
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can write scrape_jobs" ON public.scrape_jobs;
CREATE POLICY "Admin can write scrape_jobs" ON public.scrape_jobs
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON public.scrape_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_created_at ON public.scrape_jobs(created_at DESC);

-- ══════════════════════════════════════════════════
-- SCRAPED BUSINESSES (staging)
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.scraped_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.scrape_jobs(id) ON DELETE CASCADE,
  google_place_id text UNIQUE,
  name text NOT NULL,
  category text,
  address text,
  city_name text,
  matched_city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  phone text,
  normalised_phone text,
  website text,
  rating numeric(3,2),
  total_ratings int,
  google_maps_url text,
  working_hours jsonb,
  services text[],
  description text,
  image_urls text[],
  review_count int DEFAULT 0,
  lat float8,
  lng float8,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','imported')),
  imported_business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  imported_at timestamptz,
  rejection_reason text,
  scraped_at timestamptz DEFAULT now()
);

ALTER TABLE public.scraped_businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read scraped_businesses" ON public.scraped_businesses;
CREATE POLICY "Admin can read scraped_businesses" ON public.scraped_businesses
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can write scraped_businesses" ON public.scraped_businesses;
CREATE POLICY "Admin can write scraped_businesses" ON public.scraped_businesses
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_scraped_businesses_job_id ON public.scraped_businesses(job_id);
CREATE INDEX IF NOT EXISTS idx_scraped_businesses_status ON public.scraped_businesses(status);
CREATE INDEX IF NOT EXISTS idx_scraped_businesses_place_id ON public.scraped_businesses(google_place_id);
CREATE INDEX IF NOT EXISTS idx_scraped_businesses_city_id ON public.scraped_businesses(matched_city_id);

-- ══════════════════════════════════════════════════
-- SCRAPED REVIEWS (staging)
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.scraped_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scraped_business_id uuid REFERENCES public.scraped_businesses(id) ON DELETE CASCADE,
  reviewer_name text,
  reviewer_avatar_url text,
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,
  review_date text,
  scraped_at timestamptz DEFAULT now()
);

ALTER TABLE public.scraped_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read scraped_reviews" ON public.scraped_reviews;
CREATE POLICY "Admin can read scraped_reviews" ON public.scraped_reviews
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can write scraped_reviews" ON public.scraped_reviews;
CREATE POLICY "Admin can write scraped_reviews" ON public.scraped_reviews
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_scraped_reviews_business_id ON public.scraped_reviews(scraped_business_id);
