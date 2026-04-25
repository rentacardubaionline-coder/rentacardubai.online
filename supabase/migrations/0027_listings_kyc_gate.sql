-- Gate listings behind vendor KYC approval.
-- `status='approved'` means admin OK'd the content; `is_live=true` means it
-- shows on the public site. A listing only goes live once BOTH are true.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_live boolean NOT NULL DEFAULT false;

-- Backfill: any currently-approved listing whose vendor has an approved KYC
-- doc should be flipped live so we don't silently hide existing public cars.
UPDATE public.listings l
SET is_live = true
WHERE l.status = 'approved'
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    JOIN public.kyc_documents k ON k.vendor_user_id = b.owner_user_id
    WHERE b.id = l.business_id
      AND k.status = 'approved'
  );

CREATE INDEX IF NOT EXISTS idx_listings_live
  ON public.listings(is_live) WHERE is_live = true;
