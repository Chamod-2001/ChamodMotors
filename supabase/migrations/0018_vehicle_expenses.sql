-- ============================================================
-- Migration 0018: Vehicle reconditioning expenses (paint,
-- upholstery, parts, labor, etc.) — itemized so gross profit
-- reflects the full cost of preparing a vehicle for resale, not
-- just the purchase price.
-- ============================================================

create table vehicle_expenses (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  expense_type text not null default 'other',
  amount numeric(12,2) not null,
  description text,
  receipt_photo_path text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_vehicle_expenses_vehicle on vehicle_expenses(vehicle_id);

alter table vehicle_expenses enable row level security;

-- Same access shape as vehicle_images: any active employee can read/log an
-- expense, only admin can delete one. (Adding an expense is deliberately
-- enforced admin-only at the application layer, same as buying_price, since
-- both actions require requireAdmin() — this RLS just matches the existing
-- pattern for this class of table.)
create policy "vehicle_expenses_select" on vehicle_expenses
  for select using (is_active_employee());

create policy "vehicle_expenses_insert" on vehicle_expenses
  for insert with check (is_active_employee());

create policy "vehicle_expenses_delete_admin_only" on vehicle_expenses
  for delete using (is_admin());

-- Keep a running total on the vehicle itself so profit queries don't need
-- to join+sum vehicle_expenses every time — mirrors buying_price as a
-- plain, always-current column, kept in sync by the trigger below.
alter table vehicles add column total_expenses numeric(12,2) not null default 0;

create or replace function public.recalc_vehicle_total_expenses()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  affected_vehicle_id uuid;
begin
  affected_vehicle_id := coalesce(new.vehicle_id, old.vehicle_id);
  update vehicles
  set total_expenses = (
    select coalesce(sum(amount), 0) from vehicle_expenses where vehicle_id = affected_vehicle_id
  )
  where id = affected_vehicle_id;
  return null;
end;
$$;

create trigger trg_vehicle_expenses_recalc
  after insert or update or delete on vehicle_expenses
  for each row execute procedure public.recalc_vehicle_total_expenses();

-- gross_profit now nets out reconditioning costs too. Generated columns
-- can't be ALTERed in place, so drop and recreate with the new formula.
alter table vehicles drop column gross_profit;
alter table vehicles add column gross_profit numeric(12,2) generated always as (selling_price - buying_price - total_expenses) stored;

comment on column vehicles.gross_profit is 'Auto-calculated: selling_price - buying_price - total_expenses';
comment on column vehicles.total_expenses is 'Auto-maintained sum of vehicle_expenses.amount for this vehicle (via trigger)';

alter type activity_type add value if not exists 'vehicle_expense_added';
