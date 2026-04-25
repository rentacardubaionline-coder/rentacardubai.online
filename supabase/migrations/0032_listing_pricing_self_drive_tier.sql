-- Allow `self_drive_daily` as a fourth pricing tier on listing_pricing.
--
-- The existing check constraint (from 0004_listings.sql) only permits
-- (daily, weekly, monthly). When a vendor enables the "Also offer self-drive?"
-- toggle in step 3 of the listing wizard, saveDraftStep2Action tries to upsert
-- a row with tier='self_drive_daily', which fails the check and causes the
-- whole pricing save to error with:
--   new row for relation "listing_pricing" violates check constraint
--   "listing_pricing_tier_check"
--
-- This migration drops the old constraint and re-creates it with the new tier.

alter table public.listing_pricing
  drop constraint if exists listing_pricing_tier_check;

alter table public.listing_pricing
  add constraint listing_pricing_tier_check
  check (tier in ('daily', 'weekly', 'monthly', 'self_drive_daily'));
