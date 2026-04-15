-- Enable RLS by default
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Create enums FIRST (before tables that use them)
create type public.user_role as enum ('customer', 'vendor', 'admin');
create type public.active_mode as enum ('customer', 'vendor');

-- Profiles table (synced with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  active_mode public.active_mode,
  is_vendor boolean not null default false,
  lead_rate_pkr integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS: users can read/update their own row; admins can read/update all
create policy "Users can read own profile" on public.profiles
  for select
  using (auth.uid() = id or (select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Users can update own profile" on public.profiles
  for update
  using (auth.uid() = id);

create policy "Admins can update any profile" on public.profiles
  for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Handle new user signup: insert profile row
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, active_mode, is_vendor)
  values (new.id, new.email, 'customer'::public.user_role, 'customer'::public.active_mode, false);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
