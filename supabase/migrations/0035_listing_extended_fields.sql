-- ══════════════════════════════════════════════════════════════════════════════
-- Extended listing fields for Dubai / UAE market data
-- Adds: doors, luggage_bags, color_interior, spec_type, source tracking
-- Also extends listing_policies and listing_pricing for AED / Dubai specifics
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── LISTINGS ────────────────────────────────────────────────────────────────
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS doors int,
  ADD COLUMN IF NOT EXISTS luggage_bags int,
  ADD COLUMN IF NOT EXISTS color_interior text,
  ADD COLUMN IF NOT EXISTS spec_type text,           -- GCC, American, European, Japanese
  ADD COLUMN IF NOT EXISTS source_platform text DEFAULT 'direct',  -- direct | oneclickdrive
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_listing_id text;

-- ─── LISTING POLICIES ────────────────────────────────────────────────────────
ALTER TABLE public.listing_policies
  ADD COLUMN IF NOT EXISTS fuel_policy text,
  ADD COLUMN IF NOT EXISTS min_rental_days int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS salik_charges_aed numeric(8,2),   -- Dubai toll per day
  ADD COLUMN IF NOT EXISTS payment_methods text[];           -- cash, card, crypto…

-- ─── LISTING PRICING ─────────────────────────────────────────────────────────
ALTER TABLE public.listing_pricing
  ADD COLUMN IF NOT EXISTS price_aed numeric(10,2),   -- price in AED (UAE listings)
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'PKR'; -- PKR | AED | USD
