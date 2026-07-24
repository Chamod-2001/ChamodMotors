-- ============================================================
-- Migration 0023: Shop profile view analytics — logs each visit to
-- the public /p share page (approximate city/country from Vercel's
-- edge geo headers, plus an optional ?src= tag for share/QR links).
-- ============================================================

create table shop_profile_views (
  id uuid primary key default uuid_generate_v4(),
  viewed_at timestamptz not null default now(),
  country text,
  city text,
  source text
);

create index idx_shop_profile_views_viewed_at on shop_profile_views(viewed_at);

alter table shop_profile_views enable row level security;

-- /p is unauthenticated, so logging a view has to be an anonymous insert.
create policy "shop_profile_views_insert_public" on shop_profile_views
  for insert with check (true);

create policy "shop_profile_views_select_employees" on shop_profile_views
  for select using (is_active_employee());

create policy "shop_profile_views_delete_admin_only" on shop_profile_views
  for delete using (is_admin());
