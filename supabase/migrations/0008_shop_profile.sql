-- ============================================================
-- Shop business profile — a shareable "digital business card" for
-- the dealership (WhatsApp, call, location, photos, description).
-- Viewable by everyone (including the public, unauthenticated share
-- page); editable by admin only.
-- ============================================================

create table shop_profile (
  id boolean primary key default true,
  constraint shop_profile_singleton check (id),
  business_name text not null default 'Chamod Motors',
  description text,
  phone_number text,
  whatsapp_number text,
  address text,
  map_url text,
  cover_photo_path text,
  updated_at timestamptz not null default now()
);

insert into shop_profile (id, business_name) values (true, 'Chamod Motors')
on conflict (id) do nothing;

create trigger trg_shop_profile_updated_at before update on shop_profile
  for each row execute procedure public.set_updated_at();

create table shop_photos (
  id uuid primary key default uuid_generate_v4(),
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shop_profile enable row level security;
alter table shop_photos enable row level security;

-- Public read (the /p share page has no login) + admin-only writes.
create policy "shop_profile_public_read" on shop_profile
  for select using (true);
create policy "shop_profile_admin_update" on shop_profile
  for update using (is_admin()) with check (is_admin());

create policy "shop_photos_public_read" on shop_photos
  for select using (true);
create policy "shop_photos_admin_insert" on shop_photos
  for insert with check (is_admin());
create policy "shop_photos_admin_delete" on shop_photos
  for delete using (is_admin());

insert into storage.buckets (id, name, public)
values ('shop-photos', 'shop-photos', true)
on conflict (id) do nothing;

create policy "shop_photos_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'shop-photos');

create policy "shop_photos_bucket_admin_upload"
  on storage.objects for insert
  with check (bucket_id = 'shop-photos' and is_admin());

create policy "shop_photos_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'shop-photos' and is_admin());
