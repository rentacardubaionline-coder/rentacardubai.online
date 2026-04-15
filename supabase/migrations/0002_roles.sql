-- Add role, active_mode, is_vendor, lead_rate_pkr columns to profiles (if they don't already exist)
-- Note: These were defined in 0001_init.sql, so this migration just documents their purpose and adds any additional role-related infrastructure.

-- Ensure enums exist
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'vendor', 'admin');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'active_mode') then
    create type public.active_mode as enum ('customer', 'vendor');
  end if;
end $$;

-- Helper function to check if a user is an admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select (select role from public.profiles where id = user_id) = 'admin'::public.user_role;
$$ language sql;

-- Helper function to check if a user is a vendor
create or replace function public.is_vendor(user_id uuid)
returns boolean as $$
  select coalesce((select is_vendor from public.profiles where id = user_id), false);
$$ language sql;

-- RLS: Allow users to update their own active_mode
create policy "Users can update own active_mode" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
