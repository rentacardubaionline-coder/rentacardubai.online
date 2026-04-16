-- Fix listing_modes primary key to allow multiple modes per listing.
-- The original schema used listing_id as the sole PK, which only allowed
-- one mode per listing. The "both" (self_drive + with_driver) option requires
-- two rows. Change to a composite PK (listing_id, mode).

alter table public.listing_modes drop constraint listing_modes_pkey;
alter table public.listing_modes add primary key (listing_id, mode);