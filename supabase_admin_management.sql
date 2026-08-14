-- Crochet by Alae — role-based admin management
-- Run after supabase_admin_audit.sql. Passwords are never stored here.

create table if not exists public.admin_users (
  email text primary key,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  is_active boolean not null default true,
  permissions text[] not null default ARRAY['products.view']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists permissions text[];
alter table public.admin_users alter column permissions set default ARRAY['products.view']::text[];
update public.admin_users set permissions = ARRAY['products.view']::text[] where permissions is null;

create index if not exists admin_users_role_active_idx
  on public.admin_users (role, is_active);

alter table public.admin_users enable row level security;

create or replace function public.is_super_admin_user()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'super_admin'
      and is_active = true
  );
end;
$function$;

create or replace function public.is_admin_user()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role in ('admin', 'super_admin')
      and is_active = true
  );
end;
$function$;

create or replace function public.get_current_admin_role()
returns text
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  current_role text;
begin
  select role into current_role from public.admin_users
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and is_active = true
  limit 1;
  return current_role;
end;
$function$;

create or replace function public.get_current_admin_access()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  access_row jsonb;
begin
  select jsonb_build_object(
    'role', role,
    'is_active', is_active,
    'permissions', coalesce(to_jsonb(permissions), '[]'::jsonb)
  ) into access_row
  from public.admin_users
  where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;
  return access_row;
end;
$function$;

create or replace function public.is_admin_permission_allowed(permission_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return public.is_super_admin_user() or exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
      and is_active = true
      and lower(coalesce(permission_name, '')) = any(coalesce(permissions, '{}'::text[]))
  );
end;
$function$;

-- There is exactly one Super Admin. Remove all previous role rows before
-- creating the unique constraint and install the requested owner account.
delete from public.admin_users where role = 'super_admin';
delete from public.admin_users where lower(email) = 'admin.crochetbyalae@gmail.com';

create unique index if not exists admin_users_single_super_admin_idx
  on public.admin_users (role)
  where role = 'super_admin';

insert into public.admin_users (email, role, is_active, permissions)
values (
  'm.amine.amttout@gmail.com',
  'super_admin',
  true,
  ARRAY[
    'products.view', 'products.manage',
    'orders.view', 'orders.manage',
    'custom_requests.view', 'custom_requests.manage',
    'customers.view', 'customers.manage',
    'settings.manage', 'security_log.view', 'admin_users.manage'
  ]::text[]
)
on conflict (email) do update
set role = excluded.role,
    is_active = excluded.is_active,
    permissions = excluded.permissions,
    updated_at = now();

drop policy if exists "Super admins can read admin users" on public.admin_users;
drop policy if exists "Admins with user management can read admin users" on public.admin_users;
drop policy if exists "Only Super Admin can read admin users" on public.admin_users;
create policy "Only Super Admin can read admin users"
  on public.admin_users for select to authenticated
  using (public.is_super_admin_user());

revoke all on public.admin_users from anon;
revoke all on public.admin_users from authenticated;
grant select on public.admin_users to authenticated;
grant execute on function public.is_admin_user() to anon, authenticated;
grant execute on function public.is_super_admin_user() to authenticated;
grant execute on function public.get_current_admin_role() to authenticated;
grant execute on function public.get_current_admin_access() to authenticated;
grant execute on function public.is_admin_permission_allowed(text) to anon, authenticated;

create or replace function public.touch_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_updated_at on public.admin_users;
create trigger admin_users_updated_at
before update on public.admin_users
for each row execute function public.touch_admin_users_updated_at();

-- Replace the old broad authenticated policies with role/permission checks.
drop policy if exists "Authenticated admin full access to products" on public.products;
create policy "Authenticated admin full access to products" on public.products
  for all to authenticated
  using (public.is_admin_permission_allowed('products.manage'))
  with check (public.is_admin_permission_allowed('products.manage'));

drop policy if exists "Authenticated admin full access to orders" on public.orders;
create policy "Authenticated admin full access to orders" on public.orders
  for select to authenticated
  using (public.is_admin_permission_allowed('orders.view'));

drop policy if exists "Authenticated admin can update orders" on public.orders;
create policy "Authenticated admin can update orders" on public.orders
  for update to authenticated
  using (public.is_admin_permission_allowed('orders.manage'))
  with check (public.is_admin_permission_allowed('orders.manage'));

drop policy if exists "Authenticated admin full access to custom_requests" on public.custom_requests;
create policy "Authenticated admin full access to custom_requests" on public.custom_requests
  for select to authenticated
  using (public.is_admin_permission_allowed('custom_requests.view'));

drop policy if exists "Authenticated admin can update custom_requests" on public.custom_requests;
create policy "Authenticated admin can update custom_requests" on public.custom_requests
  for update to authenticated
  using (public.is_admin_permission_allowed('custom_requests.manage'))
  with check (public.is_admin_permission_allowed('custom_requests.manage'));

drop policy if exists "Authenticated admin full access to contact_channels" on public.contact_channels;
create policy "Authenticated admin full access to contact_channels" on public.contact_channels
  for all to authenticated
  using (public.is_admin_permission_allowed('settings.manage'))
  with check (public.is_admin_permission_allowed('settings.manage'));

drop policy if exists "Authenticated admin full access to site_settings" on public.site_settings;
drop policy if exists "Authenticated admin can update site_settings" on public.site_settings;
create policy "Authenticated admin can update site_settings" on public.site_settings
  for update to authenticated
  using (public.is_admin_permission_allowed('settings.manage'))
  with check (public.is_admin_permission_allowed('settings.manage'));

drop policy if exists "Authenticated admin full access to customers" on public.customers;
create policy "Authenticated admin full access to customers" on public.customers
  for all to authenticated
  using (public.is_admin_permission_allowed('customers.manage'))
  with check (public.is_admin_permission_allowed('customers.manage'));

drop policy if exists "Admin can read admin audit log" on public.admin_audit_log;
create policy "Admin can read admin audit log" on public.admin_audit_log
  for select to authenticated
  using (
    public.is_super_admin_user()
    or (
      public.is_admin_permission_allowed('security_log.view')
      and lower(admin_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );
