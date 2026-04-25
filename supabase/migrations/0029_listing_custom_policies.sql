-- Per-listing rental policies (Delivery / Toll Taxes / Fuel Policy / custom).
-- Vendors CRUD rows here; the car detail page reads from this table instead
-- of the old hardcoded list.

CREATE TABLE IF NOT EXISTS public.listing_custom_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_custom_policies_listing
  ON public.listing_custom_policies(listing_id, sort_order);

-- RLS: public read (policies show on the public car page); only the owning
-- vendor can write.
ALTER TABLE public.listing_custom_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_custom_policies_read_all"
  ON public.listing_custom_policies;
CREATE POLICY "listing_custom_policies_read_all"
  ON public.listing_custom_policies
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "listing_custom_policies_owner_write"
  ON public.listing_custom_policies;
CREATE POLICY "listing_custom_policies_owner_write"
  ON public.listing_custom_policies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.businesses b ON b.id = l.business_id
      WHERE l.id = listing_custom_policies.listing_id
        AND b.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.businesses b ON b.id = l.business_id
      WHERE l.id = listing_custom_policies.listing_id
        AND b.owner_user_id = auth.uid()
    )
  );
