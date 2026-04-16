-- Fix: businesses should not default to 4.0 rating when they have no reviews.
-- The recompute_business_rating trigger sets rating=0 when reviews_count=0,
-- so the column default should match.
alter table public.businesses alter column rating set default 0;

-- Back-fill: reset any business whose reviews_count=0 but rating=4.0
-- (these are vendor-created businesses that never had a real review).
update public.businesses
  set rating = 0
  where reviews_count = 0 and rating = 4.0;
