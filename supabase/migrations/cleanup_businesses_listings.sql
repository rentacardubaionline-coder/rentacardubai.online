-- ═════════════════════════════════════════════════════════════════
--   RESET BUSINESSES + LISTINGS + SCRAPED STAGING
--   Run this in Supabase SQL Editor to wipe all business/vehicle
--   data and start fresh.
--
--   PRESERVED (NOT touched):
--     • cities, towns, routes, vehicle_categories     (SEO reference)
--     • makes, models, vehicle_features               (car reference)
--     • seo_keywords                                  (keyword config)
--     • profiles, auth.users                          (user accounts)
--
--   DELETED:
--     • businesses, business_images, business_reviews, business_claims
--     • listings, listing_images, listing_features,
--       listing_pricing, listing_modes, listing_policies
--     • leads
--     • scrape_jobs, scraped_businesses, scraped_reviews (staging)
-- ═════════════════════════════════════════════════════════════════

-- Staging tables first (no FK issues)
TRUNCATE TABLE public.scraped_reviews CASCADE;
TRUNCATE TABLE public.scraped_businesses CASCADE;
TRUNCATE TABLE public.scrape_jobs CASCADE;

-- Leads (reference listings + businesses — clear first)
TRUNCATE TABLE public.leads CASCADE;

-- Listings and their child tables (CASCADE will clean children automatically,
-- but we TRUNCATE explicitly in order for clarity)
TRUNCATE TABLE public.listing_pricing CASCADE;
TRUNCATE TABLE public.listing_modes CASCADE;
TRUNCATE TABLE public.listing_policies CASCADE;
TRUNCATE TABLE public.listing_features CASCADE;
TRUNCATE TABLE public.listing_images CASCADE;
TRUNCATE TABLE public.listings CASCADE;

-- Business child tables
TRUNCATE TABLE public.business_claims CASCADE;
TRUNCATE TABLE public.business_reviews CASCADE;
TRUNCATE TABLE public.business_images CASCADE;
TRUNCATE TABLE public.vendor_reviews CASCADE;

-- Finally the businesses themselves
TRUNCATE TABLE public.businesses CASCADE;

-- Verify — should all return 0
SELECT
  (SELECT COUNT(*) FROM public.businesses) AS businesses,
  (SELECT COUNT(*) FROM public.listings) AS listings,
  (SELECT COUNT(*) FROM public.business_images) AS business_images,
  (SELECT COUNT(*) FROM public.business_reviews) AS business_reviews,
  (SELECT COUNT(*) FROM public.scraped_businesses) AS scraped_businesses,
  (SELECT COUNT(*) FROM public.scraped_reviews) AS scraped_reviews,
  (SELECT COUNT(*) FROM public.scrape_jobs) AS scrape_jobs,
  (SELECT COUNT(*) FROM public.leads) AS leads;
