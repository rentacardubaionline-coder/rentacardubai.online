-- Listing body type — the customer-facing category vendors pick on step 1
-- of the add-car wizard (Luxury / Economy / Sports / SUV / Convertible /
-- Business / Electric / Van). Stored alongside the existing tier_code so
-- the billing system (which uses 4 pricing tiers) keeps working — body_type
-- is the granular display value, tier_code is the rolled-up billing value.

alter table public.listings
  add column if not exists body_type text;

-- Search performance: customers can filter by body type on the public catalog.
create index if not exists listings_body_type
  on public.listings (body_type);
