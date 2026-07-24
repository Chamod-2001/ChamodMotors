-- ============================================================
-- Migration 0025: Additional shop phone numbers — a business
-- with more than one line (branch, service desk, etc.) can list
-- them all on the public profile, not just the single primary
-- phone_number/whatsapp_number already on shop_profile. Same
-- public-read / admin-write pattern as shop_social_links.
-- ============================================================

create table shop_phone_numbers (
  id uuid primary key default uuid_generate_v4(),
  label text,
  phone_number text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shop_phone_numbers enable row level security;

create policy "shop_phone_numbers_public_read" on shop_phone_numbers
  for select using (true);
create policy "shop_phone_numbers_admin_insert" on shop_phone_numbers
  for insert with check (is_admin());
create policy "shop_phone_numbers_admin_delete" on shop_phone_numbers
  for delete using (is_admin());
