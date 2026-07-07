-- ============================================================
-- Registration/engine/chassis numbers are stored as typed (e.g.
-- "CLI 9545"), so a plain ILIKE search for "CLI9545" (no space)
-- previously found nothing. Add normalized (lowercase, letters/
-- digits only) copies so search matches regardless of spacing or
-- dashes on either side.
-- ============================================================

alter table vehicles add column if not exists registration_number_normalized text
  generated always as (regexp_replace(lower(coalesce(registration_number, '')), '[^a-z0-9]', '', 'g')) stored;

alter table vehicles add column if not exists engine_number_normalized text
  generated always as (regexp_replace(lower(coalesce(engine_number, '')), '[^a-z0-9]', '', 'g')) stored;

alter table vehicles add column if not exists chassis_number_normalized text
  generated always as (regexp_replace(lower(coalesce(chassis_number, '')), '[^a-z0-9]', '', 'g')) stored;

create index if not exists idx_vehicles_reg_normalized on vehicles (registration_number_normalized);
create index if not exists idx_vehicles_engine_normalized on vehicles (engine_number_normalized);
create index if not exists idx_vehicles_chassis_normalized on vehicles (chassis_number_normalized);
