-- ============================================================
-- MDMS Database Schema — Migration 0002: Row Level Security
-- Role-based access: admin (full access) vs sales (day-to-day ops)
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is the current user an admin?
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- Helper: is the current user any authenticated + active employee?
create or replace function public.is_active_employee()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and is_active = true
  );
$$;

-- ------------------------------------------------------------
-- Enable RLS on all tables
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table finance_companies enable row level security;
alter table finance_officers enable row level security;
alter table finance_communications enable row level security;
alter table documents enable row level security;

-- ------------------------------------------------------------
-- Profiles: everyone can read active profiles; only admin edits
-- ------------------------------------------------------------
create policy "profiles_select_all_employees" on profiles
  for select using (is_active_employee());

create policy "profiles_update_self_or_admin" on profiles
  for update using (auth.uid() = id or is_admin());

create policy "profiles_admin_manage" on profiles
  for insert with check (is_admin());

create policy "profiles_admin_delete" on profiles
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Vehicles: all employees can read & create; admin can do anything,
-- sales can update status/details but not delete
-- ------------------------------------------------------------
create policy "vehicles_select" on vehicles
  for select using (is_active_employee());

create policy "vehicles_insert" on vehicles
  for insert with check (is_active_employee());

create policy "vehicles_update" on vehicles
  for update using (is_active_employee());

create policy "vehicles_delete_admin_only" on vehicles
  for delete using (is_admin());

-- Vehicle images follow the same access as vehicles
create policy "vehicle_images_select" on vehicle_images
  for select using (is_active_employee());

create policy "vehicle_images_insert" on vehicle_images
  for insert with check (is_active_employee());

create policy "vehicle_images_delete" on vehicle_images
  for delete using (is_active_employee());

-- ------------------------------------------------------------
-- Customers: all employees can read & create/update; admin deletes
-- ------------------------------------------------------------
create policy "customers_select" on customers
  for select using (is_active_employee());

create policy "customers_insert" on customers
  for insert with check (is_active_employee());

create policy "customers_update" on customers
  for update using (is_active_employee());

create policy "customers_delete_admin_only" on customers
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Sales: all employees can read & create; only admin edits/deletes
-- ------------------------------------------------------------
create policy "sales_select" on sales
  for select using (is_active_employee());

create policy "sales_insert" on sales
  for insert with check (is_active_employee());

create policy "sales_update_admin_only" on sales
  for update using (is_admin());

create policy "sales_delete_admin_only" on sales
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Finance companies / officers: all employees read; admin manages
-- ------------------------------------------------------------
create policy "finance_companies_select" on finance_companies
  for select using (is_active_employee());

create policy "finance_companies_admin_write" on finance_companies
  for insert with check (is_admin());

create policy "finance_companies_admin_update" on finance_companies
  for update using (is_admin());

create policy "finance_companies_admin_delete" on finance_companies
  for delete using (is_admin());

create policy "finance_officers_select" on finance_officers
  for select using (is_active_employee());

create policy "finance_officers_admin_write" on finance_officers
  for insert with check (is_admin());

create policy "finance_officers_admin_update" on finance_officers
  for update using (is_admin());

create policy "finance_officers_admin_delete" on finance_officers
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Finance communications: all employees can read & log notes
-- ------------------------------------------------------------
create policy "finance_comm_select" on finance_communications
  for select using (is_active_employee());

create policy "finance_comm_insert" on finance_communications
  for insert with check (is_active_employee());

create policy "finance_comm_delete_admin_only" on finance_communications
  for delete using (is_admin());

-- ------------------------------------------------------------
-- Documents: all employees can read & upload; admin deletes
-- ------------------------------------------------------------
create policy "documents_select" on documents
  for select using (is_active_employee());

create policy "documents_insert" on documents
  for insert with check (is_active_employee());

create policy "documents_delete_admin_only" on documents
  for delete using (is_admin());
