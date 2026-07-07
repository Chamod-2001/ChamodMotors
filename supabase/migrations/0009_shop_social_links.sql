-- ============================================================
-- Shop social media links (Facebook, Instagram, TikTok, etc.),
-- shown on the business profile alongside the map link. Same
-- public-read / admin-write pattern as shop_photos.
-- ============================================================

create table shop_social_links (
  id uuid primary key default uuid_generate_v4(),
  platform text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table shop_social_links enable row level security;

create policy "shop_social_links_public_read" on shop_social_links
  for select using (true);
create policy "shop_social_links_admin_insert" on shop_social_links
  for insert with check (is_admin());
create policy "shop_social_links_admin_delete" on shop_social_links
  for delete using (is_admin());
