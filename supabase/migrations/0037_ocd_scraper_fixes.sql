-- ══════════════════════════════════════════════════════════════════════════════
-- OCD Scraper fixes — structured requirements, per-period extra km, feature groups
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.ocd_scraped_listings
  -- Per-period extra km rates (OCD shows different rates per tab)
  ADD COLUMN IF NOT EXISTS daily_extra_km_rate numeric(8,4),
  ADD COLUMN IF NOT EXISTS daily_extra_km_currency text,
  ADD COLUMN IF NOT EXISTS weekly_extra_km_rate numeric(8,4),
  ADD COLUMN IF NOT EXISTS weekly_extra_km_currency text,
  ADD COLUMN IF NOT EXISTS monthly_extra_km_rate numeric(8,4),
  ADD COLUMN IF NOT EXISTS monthly_extra_km_currency text,

  -- Features grouped by category (Interior, Exterior, Safety, etc.)
  ADD COLUMN IF NOT EXISTS features_by_category jsonb,

  -- Structured requirements to rent
  ADD COLUMN IF NOT EXISTS min_driver_age int,
  ADD COLUMN IF NOT EXISTS security_deposit_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS security_deposit_currency text,
  ADD COLUMN IF NOT EXISTS deposit_refund_period text;
