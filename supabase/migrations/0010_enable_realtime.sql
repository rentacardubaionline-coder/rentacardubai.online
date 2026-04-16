-- Enable Supabase Realtime on admin-watched tables.
-- Run this in the Supabase SQL editor if not already applied.

alter publication supabase_realtime add table public.businesses;
alter publication supabase_realtime add table public.business_claims;
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.listings;
alter publication supabase_realtime add table public.vendor_reviews;
