-- Crochet by Alae — Supabase schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- after creating your free Supabase project.

-- 1. PRODUCTS -----------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  price numeric,
  show_price boolean not null default false, -- admin toggle: show price to customer?
  colors text[] default '{}',
  sizes text[] default '{}',
  images text[] default '{}', -- Supabase Storage URLs, uploaded from the admin panel
  status text not null default 'available', -- available | out_of_stock | custom_only
  created_at timestamptz not null default now()
);

-- 2. ORDERS ---------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  product_name text,
  color text,
  size text,
  notes text,
  customer_name text not null,
  phone text not null,
  email text, -- optional; used as reply-to on the order-notification email
  commune text not null, -- delivery area and commune (Blida or Algiers province)
  address text not null,
  total numeric,
  status text not null default 'new', -- new | preparing | shipped | delivered
  channel text, -- whatsapp | instagram | phone
  created_at timestamptz not null default now()
);

-- 3. CUSTOM DESIGN REQUESTS ------------------------------------------------
create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  reference_image_url text,
  preferred_colors text,
  customer_name text not null,
  phone text not null,
  status text not null default 'new', -- new | reviewing | contacted | accepted | rejected
  created_at timestamptz not null default now()
);

-- 4. CONTACT CHANNELS (admin-managed) --------------------------------------
create table if not exists contact_channels (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- whatsapp | instagram | phone | tiktok
  value text not null, -- wa number / ig DM link / phone number / tiktok url
  enabled boolean not null default true,
  sort_order int not null default 0
);

-- 5. SITE SETTINGS (single row) --------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  show_delivery_notice boolean not null default true,
  default_language text not null default 'ar',
  default_theme text not null default 'light',
  show_price_default boolean not null default false,
  logo_url text,
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- 6. CUSTOMERS (simple, built from orders) ---------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  commune text,
  created_at timestamptz not null default now()
);

-- ROW LEVEL SECURITY --------------------------------------------------------
-- Public (anon) visitors may read products and the public site settings,
-- and may INSERT orders/custom requests — but never read other customers'
-- orders, and never write to products/settings/channels (admin-only,
-- done via the authenticated Supabase dashboard/admin panel role).

alter table products enable row level security;
alter table orders enable row level security;
alter table custom_requests enable row level security;
alter table contact_channels enable row level security;
alter table site_settings enable row level security;
alter table customers enable row level security;

create policy "Public can read products" on products for select using (true);
create policy "Public can read enabled contact channels" on contact_channels for select using (enabled = true);
create policy "Public can read site settings" on site_settings for select using (true);

create policy "Public can create orders" on orders for insert with check (true);
create policy "Public can create custom requests" on custom_requests for insert with check (true);
create policy "Public can upsert customers (insert)" on customers for insert with check (true);
create policy "Public can upsert customers (update)" on customers for update using (true);

-- Admin (authenticated) full access — tighten further with a real
-- "is_admin" check once you invite additional Supabase Auth users.
create policy "Authenticated admin full access to products" on products for all using (auth.role() = 'authenticated');
create policy "Authenticated admin full access to orders" on orders for select using (auth.role() = 'authenticated');
create policy "Authenticated admin can update orders" on orders for update using (auth.role() = 'authenticated');
create policy "Authenticated admin full access to custom_requests" on custom_requests for select using (auth.role() = 'authenticated');
create policy "Authenticated admin can update custom_requests" on custom_requests for update using (auth.role() = 'authenticated');
create policy "Authenticated admin full access to contact_channels" on contact_channels for all using (auth.role() = 'authenticated');
create policy "Authenticated admin full access to site_settings" on site_settings for update using (auth.role() = 'authenticated');
create policy "Authenticated admin full access to customers" on customers for all using (auth.role() = 'authenticated');

-- STORAGE ------------------------------------------------------------------
-- Run this AFTER creating a bucket named "product-images" (Storage -> New
-- bucket -> name it exactly "product-images" -> toggle "Public"). This lets
-- anyone read images (needed to display products), and lets both the admin
-- (product/logo photos) and anonymous visitors (custom design request
-- reference photos) upload into it.
create policy "Public read access on product-images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Public can upload to product-images"
on storage.objects for insert
with check (bucket_id = 'product-images');
