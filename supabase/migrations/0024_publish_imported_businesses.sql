-- Flip existing admin-approved scraped imports live.
-- Reason: scraped imports were previously inserted with is_live=false, hiding
-- them from the public fallback grid. Since the admin review/approve step in
-- /admin/scraper/review IS the quality gate, imported rows should go live
-- automatically. Admin can unpublish individual bad rows from /admin/businesses.

UPDATE public.businesses
SET is_live = true
WHERE is_live = false
  AND owner_user_id IS NULL     -- scraped/unclaimed rows only (claimed ones already vendor-controlled)
  AND claim_status = 'unclaimed';
