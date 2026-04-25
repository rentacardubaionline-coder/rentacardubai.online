-- Drop the restrictive city CHECK constraint on listings so vendors can list
-- cars in any Pakistani city (not just Karachi / Lahore / Islamabad).
-- The actual list of valid cities is sourced from the `cities` table used
-- elsewhere on the site; free-text is accepted here because vendors may add
-- new cities that aren't in the curated list yet.

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.listings'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%city%Karachi%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.listings DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Custom per-listing add-ons (child-seat, GPS, extra driver, etc.). Vendors
-- can add as many rows as they like; each has a title, optional description,
-- and price in PKR.
CREATE TABLE IF NOT EXISTS public.listing_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price_pkr int NOT NULL CHECK (price_pkr >= 0),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_addons_listing
  ON public.listing_addons(listing_id, sort_order);

-- RLS: everyone can read (public listings); only the owning vendor can write.
ALTER TABLE public.listing_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_addons_read_all" ON public.listing_addons;
CREATE POLICY "listing_addons_read_all" ON public.listing_addons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listing_addons_owner_write" ON public.listing_addons;
CREATE POLICY "listing_addons_owner_write" ON public.listing_addons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.businesses b ON b.id = l.business_id
      WHERE l.id = listing_addons.listing_id
        AND b.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.businesses b ON b.id = l.business_id
      WHERE l.id = listing_addons.listing_id
        AND b.owner_user_id = auth.uid()
    )
  );
