-- Leads table: records every WhatsApp/Call tap on a listing.
-- Inserted server-side by /api/leads/* route handlers (via service-role client).
-- Vendors read their own leads; admin reads all; public may insert (visitor action).

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  vendor_user_id uuid references public.profiles(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'call')),
  source text,
  created_at timestamp with time zone default now()
);

alter table public.leads enable row level security;

create policy "Vendor can read own leads" on public.leads
  for select using (vendor_user_id = auth.uid());

create policy "Admin can read all leads" on public.leads
  for select using (public.is_admin(auth.uid()));

-- Public insert: visitor tapping WhatsApp/Call (no auth required)
create policy "Anyone can insert a lead" on public.leads
  for insert with check (true);

create index idx_leads_vendor_user_id on public.leads(vendor_user_id);
create index idx_leads_listing_id on public.leads(listing_id);
create index idx_leads_created_at on public.leads(created_at desc);
