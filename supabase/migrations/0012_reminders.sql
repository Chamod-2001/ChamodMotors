-- ============================================================
-- Migration 0012: Calendar / Reminders
-- Any active employee can add/see/complete reminders (optionally
-- tagged to a vehicle, customer, or finance officer); only admin
-- can permanently delete one — same shape as vehicles/customers.
-- ============================================================

create type reminder_status as enum ('pending', 'done', 'dismissed');

create table reminders (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  note text,
  due_at timestamptz not null,
  status reminder_status not null default 'pending',
  vehicle_id uuid references vehicles(id) on delete set null,
  customer_id uuid references customers(id) on delete set null,
  finance_officer_id uuid references finance_officers(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_reminders_due_at on reminders(due_at);
create index idx_reminders_vehicle on reminders(vehicle_id);
create index idx_reminders_customer on reminders(customer_id);
create index idx_reminders_finance_officer on reminders(finance_officer_id);

alter table reminders enable row level security;

create policy "reminders_select" on reminders
  for select using (is_active_employee());

create policy "reminders_insert" on reminders
  for insert with check (is_active_employee());

create policy "reminders_update" on reminders
  for update using (is_active_employee());

create policy "reminders_delete_admin_only" on reminders
  for delete using (is_admin());

alter type activity_type add value if not exists 'reminder_created';
