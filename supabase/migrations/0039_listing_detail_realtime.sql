-- ══════════════════════════════════════════════════════════════════════════════
-- Single car detail page — public read on imported OCD rows + realtime channels
--
-- The /cars/[slug] page now reads the rich OCD scraped record directly so the
-- page can display every field the scraper captures. We also subscribe to
-- realtime changes on the listing's related rows so the page refreshes the
-- moment the DB changes.
-- ══════════════════════════════════════════════════════════════════════════════

-- Public read for OCD rows that have been imported into a real listing.
-- Admin-write policy already exists from migration 0034 — this is purely SELECT.
DROP POLICY IF EXISTS "Public can read imported ocd listings"
  ON public.ocd_scraped_listings;
CREATE POLICY "Public can read imported ocd listings"
  ON public.ocd_scraped_listings
  FOR SELECT
  USING (status = 'imported' AND imported_listing_id IS NOT NULL);

-- Add the listing-detail tables to the realtime publication.
-- ALTER PUBLICATION ... ADD TABLE is idempotent in newer Postgres but errors if
-- the table is already a member, so we DO each one inside an exception block.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_pricing;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_policies;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_features;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_images;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.ocd_scraped_listings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
