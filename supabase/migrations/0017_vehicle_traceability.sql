-- ============================================================
-- Migration 0017: Brand/model catalog (smart suggestions) +
-- buy/sell traceability (who we bought a vehicle from, seller
-- documents, and a "photo" document type for buyer/seller photos)
-- ============================================================

-- ------------------------------------------------------------
-- Brand/model catalog: a self-growing reference list so the Add
-- Vehicle form can suggest brands/models instead of relying on
-- free text. Seeded from whatever brand/model/type combos already
-- exist, then grows automatically as new vehicles are added.
-- ------------------------------------------------------------
create table vehicle_catalog (
  id uuid primary key default uuid_generate_v4(),
  vehicle_type vehicle_type not null,
  brand text not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (vehicle_type, brand, model)
);

create index idx_vehicle_catalog_type on vehicle_catalog(vehicle_type);

insert into vehicle_catalog (vehicle_type, brand, model)
select distinct vehicle_type, brand, model from vehicles
on conflict do nothing;

alter table vehicle_catalog enable row level security;

create policy "vehicle_catalog_select" on vehicle_catalog
  for select using (is_active_employee());

create policy "vehicle_catalog_insert" on vehicle_catalog
  for insert with check (is_active_employee());

create policy "vehicle_catalog_delete_admin_only" on vehicle_catalog
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Seller details on the vehicle (who we bought it from) — captured
-- at intake, alongside the existing buying_price/buying_date.
-- ------------------------------------------------------------
alter table vehicles add column seller_name text;
alter table vehicles add column seller_nic_number text;
alter table vehicles add column seller_phone_number text;

-- ------------------------------------------------------------
-- Documents: tag which party (seller or buyer) a document belongs
-- to, and add a "photo" type for plain person photos (NIC scans
-- already used 'nic'; there was no type for a face photo before).
-- ------------------------------------------------------------
alter type document_type add value if not exists 'photo';
create type party_role as enum ('seller', 'buyer');
alter table documents add column party_role party_role;
