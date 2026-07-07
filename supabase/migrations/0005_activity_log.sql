-- ============================================================
-- Employee activity log — login/logout + key actions, so admins
-- can review who did what and get an unread-count notification.
-- ============================================================

create type activity_type as enum (
  'login',
  'logout',
  'vehicle_created',
  'vehicle_sold',
  'customer_created',
  'finance_contact'
);

create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references profiles(id) on delete set null,
  activity_type activity_type not null,
  description text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index idx_activity_log_created_at on activity_log (created_at desc);
create index idx_activity_log_employee on activity_log (employee_id);
create index idx_activity_log_unread on activity_log (read_at) where read_at is null;

alter table activity_log enable row level security;

-- Only admins can read the log, and the only write they can make is
-- marking rows read. There is deliberately no insert policy for regular
-- sessions — new entries only ever come from the service-role client in
-- server actions, so employees can't edit or erase their own trail.
create policy "activity_log_admin_select" on activity_log
  for select using (is_admin());

create policy "activity_log_admin_mark_read" on activity_log
  for update using (is_admin()) with check (is_admin());
