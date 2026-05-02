-- ══════════════════════════════════════════════════════════════════════════════
-- Extended fields for Public UI
-- Adds structured requirements and engine details to main tables
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── LISTINGS ────────────────────────────────────────────────────────────────
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS engine_size text;

-- ─── LISTING POLICIES ────────────────────────────────────────────────────────
ALTER TABLE public.listing_policies
  ADD COLUMN IF NOT EXISTS deposit_refund_days int,
  ADD COLUMN IF NOT EXISTS insurance_included boolean DEFAULT true;
