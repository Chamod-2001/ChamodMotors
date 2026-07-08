-- ============================================================
-- Migration 0014: Vehicle edit requests (employee edits require
-- admin approval before they take effect)
-- ============================================================

create type edit_request_status as enum ('pending', 'approved', 'rejected');

create table vehicle_edit_requests (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  requested_by uuid references profiles(id) on delete set null,
  status edit_request_status not null default 'pending',
  changes jsonb not null,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_vehicle_edit_requests_vehicle on vehicle_edit_requests(vehicle_id);
create index idx_vehicle_edit_requests_status on vehicle_edit_requests(status);

alter table vehicle_edit_requests enable row level security;

-- Any active employee can submit a request and see the list (so they can
-- tell whether their own request is still pending); only admin reviews
-- (update to approved/rejected) or deletes.
create policy "vehicle_edit_requests_select" on vehicle_edit_requests
  for select using (is_active_employee());

create policy "vehicle_edit_requests_insert" on vehicle_edit_requests
  for insert with check (is_active_employee());

create policy "vehicle_edit_requests_update_admin_only" on vehicle_edit_requests
  for update using (is_admin());

create policy "vehicle_edit_requests_delete_admin_only" on vehicle_edit_requests
  for delete using (is_admin());

alter type activity_type add value if not exists 'vehicle_edit_requested';
alter type activity_type add value if not exists 'vehicle_edit_approved';
alter type activity_type add value if not exists 'vehicle_edit_rejected';
