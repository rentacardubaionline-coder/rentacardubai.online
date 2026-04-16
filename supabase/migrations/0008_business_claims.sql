-- Business claims: allows vendors to claim admin-imported businesses.
-- Also opens up businesses table so vendors can self-create their own business.

-- Allow vendors to insert their own pending business
-- (previously only admins could insert into businesses)
create policy "Vendor can insert own business" on public.businesses
  for insert with check (
    owner_user_id = auth.uid()
    and claim_status = 'pending'
    and public.is_vendor(auth.uid())
  );

-- Allow vendor to update their OWN business
create policy "Vendor can update own business" on public.businesses
  for update using (
    owner_user_id = auth.uid()
    and public.is_vendor(auth.uid())
  )
  with check (
    owner_user_id = auth.uid()
  );

-- Business claims table: tracks requests to claim an unclaimed business
create table public.business_claims (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  claimant_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(business_id, claimant_user_id)
);

alter table public.business_claims enable row level security;

create policy "Claimant can read own claims" on public.business_claims
  for select using (claimant_user_id = auth.uid());

create policy "Claimant can insert claim" on public.business_claims
  for insert with check (claimant_user_id = auth.uid());

create policy "Admin can manage all claims" on public.business_claims
  for all using (public.is_admin(auth.uid()));

create index idx_business_claims_business_id on public.business_claims(business_id);
create index idx_business_claims_claimant on public.business_claims(claimant_user_id);
create index idx_business_claims_status on public.business_claims(status);
