-- ============================================================
-- Multiple shop locations/branches (city label + address + map
-- link), replacing the single address/map_url on shop_profile.
-- Same public-read / admin-write pattern as shop_photos.
-- ============================================================

create table shop_locations (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  address text,
  map_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shop_locations enable row level security;

create policy "shop_locations_public_read" on shop_locations
  for select using (true);
create policy "shop_locations_admin_insert" on shop_locations
  for insert with check (is_admin());
create policy "shop_locations_admin_update" on shop_locations
  for update using (is_admin()) with check (is_admin());
create policy "shop_locations_admin_delete" on shop_locations
  for delete using (is_admin());

-- Carry over the existing single address/map_url (if any was set) as
-- the first location, so nothing disappears for shops already configured.
insert into shop_locations (label, address, map_url, sort_order)
select coalesce(nullif(address, ''), 'Main Branch'), address, map_url, 0
from shop_profile
where (address is not null and address <> '') or (map_url is not null and map_url <> '');
