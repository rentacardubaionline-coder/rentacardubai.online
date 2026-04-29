-- ══════════════════════════════════════════════════════════════════════════════
-- Extended fields for OCD scraped data
-- Adds: videos, location, multi-currency pricing, original rates, mileage,
--       engine capacity, payment modes, dealer note, full special offer,
--       requirements to rent, and rental term policies.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── ocd_scraped_listings — new columns ──────────────────────────────────────

ALTER TABLE public.ocd_scraped_listings
  -- Media
  ADD COLUMN IF NOT EXISTS video_urls text[] NOT NULL DEFAULT '{}',

  -- Location shown on the listing (e.g. "Al Quoz, Dubai")
  ADD COLUMN IF NOT EXISTS location text,

  -- Currency as shown on OCD (AED, USD, EUR …)
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AED',

  -- Original (pre-discount) rates in same currency
  ADD COLUMN IF NOT EXISTS daily_rate_original   numeric(10,2),
  ADD COLUMN IF NOT EXISTS weekly_rate_original  numeric(10,2),
  ADD COLUMN IF NOT EXISTS monthly_rate_original numeric(10,2),

  -- Extra-km rate in native currency (extra_km_rate_aed kept for back-compat)
  ADD COLUMN IF NOT EXISTS extra_km_rate     numeric(8,4),
  ADD COLUMN IF NOT EXISTS extra_km_currency text,

  -- Car overview extras
  ADD COLUMN IF NOT EXISTS engine_capacity text,
  ADD COLUMN IF NOT EXISTS payment_modes    text,   -- raw text: "Bitcoin/Crypto, Cash & more"

  -- Dealer note (e.g. "5% VAT applicable. …")
  ADD COLUMN IF NOT EXISTS dealer_note text,

  -- Full special-offer breakdown
  ADD COLUMN IF NOT EXISTS special_offer_heading    text,
  ADD COLUMN IF NOT EXISTS special_offer_body       text,
  ADD COLUMN IF NOT EXISTS special_offer_disclaimer text,

  -- Requirements to rent (full text from collapsible section)
  ADD COLUMN IF NOT EXISTS requirements_to_rent text,

  -- Rental-term policy texts
  ADD COLUMN IF NOT EXISTS mileage_policy text,
  ADD COLUMN IF NOT EXISTS deposit_policy text,
  ADD COLUMN IF NOT EXISTS rental_policy  text,

  -- Miscellaneous additional charges note
  ADD COLUMN IF NOT EXISTS additional_charges text;

-- ─── ocd_scraped_dealers — dealer note ───────────────────────────────────────

ALTER TABLE public.ocd_scraped_dealers
  ADD COLUMN IF NOT EXISTS dealer_note text;
