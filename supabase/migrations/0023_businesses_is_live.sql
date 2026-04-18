-- Add is_live flag to control what's visible on the public site.
-- Scraped/imported businesses default to is_live=false (admin must publish).
-- Admin toggles this via /admin/businesses UI.

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT false;

-- Existing businesses: mark them live so nothing disappears from the site right now
UPDATE public.businesses SET is_live = true WHERE is_live IS NULL OR is_live = false;

-- Index for fast filtering on the public site
CREATE INDEX IF NOT EXISTS idx_businesses_is_live ON public.businesses(is_live) WHERE is_live = true;
