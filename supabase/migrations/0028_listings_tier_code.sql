-- Vendor-selected car type / pricing tier. Matches pricing_tiers.code so
-- per-lead billing can look up the right rate without guessing from the model
-- body type. Nullable so existing listings aren't forced into a tier.

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS tier_code text
    CHECK (tier_code IN ('economy','sedan','suv','luxury'));

CREATE INDEX IF NOT EXISTS idx_listings_tier ON public.listings(tier_code);
