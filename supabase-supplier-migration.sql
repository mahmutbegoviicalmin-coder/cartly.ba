-- Run this in your Supabase SQL Editor

create table if not exists supplier_shipments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  date date not null,
  supplier_name text not null default 'Adnan',
  status text not null default 'pripremljeno',
  notes text,
  photo_url text,
  delivery_cost numeric(10,2) not null default 10.70,
  total_products numeric(10,2) not null default 0,
  total numeric(10,2) generated always as (total_products + delivery_cost) stored
);

create table if not exists supplier_shipment_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references supplier_shipments(id) on delete cascade,
  product_name text not null,
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) generated always as (quantity * unit_price) stored
);

-- Storage bucket for supplier photos
insert into storage.buckets (id, name, public)
values ('supplier-photos', 'supplier-photos', true)
on conflict (id) do nothing;

-- Allow anyone to upload (we'll validate via API)
create policy "Allow supplier uploads" on storage.objects
  for insert with check (bucket_id = 'supplier-photos');

create policy "Allow public read" on storage.objects
  for select using (bucket_id = 'supplier-photos');
