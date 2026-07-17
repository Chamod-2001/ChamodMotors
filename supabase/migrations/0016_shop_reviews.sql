-- ============================================================
-- Migration 0016: Public customer reviews (no login required to
-- submit — only to moderate). New reviews start "pending" and only
-- become publicly visible once an admin approves them.
-- ============================================================

create type review_status as enum ('pending', 'approved');

create table shop_reviews (
  id uuid primary key default uuid_generate_v4(),
  reviewer_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  description text not null,
  photo_path text,
  status review_status not null default 'pending',
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_shop_reviews_status on shop_reviews(status);

alter table shop_reviews enable row level security;

-- Public visitors only ever see approved reviews; staff can see everything
-- (needed for the pending-moderation queue). Postgres OR's multiple SELECT
-- policies together, so an active employee matches either policy.
create policy "shop_reviews_select_approved" on shop_reviews
  for select using (status = 'approved');

create policy "shop_reviews_select_staff_all" on shop_reviews
  for select using (is_active_employee());

-- Anyone (including unauthenticated visitors) can submit a review, but only
-- ever as "pending" — the check prevents a crafted request from inserting
-- itself pre-approved.
create policy "shop_reviews_insert_public" on shop_reviews
  for insert with check (status = 'pending');

create policy "shop_reviews_update_admin_only" on shop_reviews
  for update using (is_admin());

create policy "shop_reviews_delete_admin_only" on shop_reviews
  for delete using (is_admin());

-- Storage: review photos are publicly viewable and publicly uploadable (no
-- login to submit a review), but only admin can delete.
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

create policy "review_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'review-photos');

create policy "review_photos_public_upload"
  on storage.objects for insert
  with check (bucket_id = 'review-photos');

create policy "review_photos_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'review-photos' and is_admin());

alter type activity_type add value if not exists 'shop_review_submitted';
alter type activity_type add value if not exists 'shop_review_approved';
alter type activity_type add value if not exists 'shop_review_deleted';
