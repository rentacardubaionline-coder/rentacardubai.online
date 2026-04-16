-- KYC documents table for vendor verification
create table if not exists public.kyc_documents (
  id                uuid primary key default gen_random_uuid(),
  vendor_user_id    uuid not null references public.profiles(id) on delete cascade,
  cnic_number       text not null,
  front_url         text not null,
  back_url          text not null,
  selfie_url        text not null,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'rejected')),
  rejection_reason  text,
  reviewed_by       uuid references public.profiles(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Only one active KYC submission per vendor
create unique index if not exists kyc_documents_vendor_unique
  on public.kyc_documents (vendor_user_id)
  where status in ('pending', 'approved');

-- RLS
alter table public.kyc_documents enable row level security;

do $$ begin
  create policy "Vendors can view own KYC"
    on public.kyc_documents for select
    using (vendor_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Vendors can insert own KYC"
    on public.kyc_documents for insert
    with check (vendor_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can view all KYC"
    on public.kyc_documents for select
    using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can update KYC"
    on public.kyc_documents for update
    using (public.is_admin(auth.uid()));
exception when duplicate_object then null; end $$;
