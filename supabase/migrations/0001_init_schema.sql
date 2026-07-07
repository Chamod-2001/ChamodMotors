-- ============================================================
-- MDMS Database Schema — Migration 0001: Core Schema
-- Motorcycle Dealership Management System
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type user_role as enum ('admin', 'sales');
create type vehicle_status as enum ('available', 'reserved', 'sold');
create type vehicle_type as enum ('motorcycle', 'three_wheeler', 'scooter', 'other');
create type fuel_type as enum ('petrol', 'diesel', 'electric', 'hybrid');
create type document_type as enum ('shop_letter', 'sale_letter', 'nic', 'electricity_bill', 'other');

-- ------------------------------------------------------------
-- Profiles (extends Supabase auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'sales',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'Employee profiles linked 1:1 with Supabase auth users';

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'sales')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- Vehicles
-- ------------------------------------------------------------
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  brand text not null,
  model text not null,
  manufacturing_year smallint,
  vehicle_type vehicle_type not null default 'motorcycle',
  registration_number text unique,
  engine_number text,
  chassis_number text,
  mileage integer,
  fuel_type fuel_type default 'petrol',
  color text,
  buying_price numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  gross_profit numeric(12,2) generated always as (selling_price - buying_price) stored,
  status vehicle_status not null default 'available',
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_vehicles_status on vehicles(status);
create index idx_vehicles_brand_model on vehicles(brand, model);
create index idx_vehicles_reg_number on vehicles(registration_number);

comment on column vehicles.gross_profit is 'Auto-calculated: selling_price - buying_price';

-- Vehicle photos (multiple images per vehicle, stored in Supabase Storage)
create table vehicle_images (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  storage_path text not null,
  is_primary boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index idx_vehicle_images_vehicle on vehicle_images(vehicle_id);

-- ------------------------------------------------------------
-- Customers
-- ------------------------------------------------------------
create table customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  nic_number text not null,
  phone_number text not null,
  address text,
  occupation text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_customers_nic on customers(nic_number);
create index idx_customers_phone on customers(phone_number);
create index idx_customers_name on customers(full_name);

-- ------------------------------------------------------------
-- Sales (links a customer to a purchased vehicle — purchase history)
-- ------------------------------------------------------------
create table sales (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id),
  customer_id uuid not null references customers(id),
  sold_by uuid references profiles(id),
  sale_price numeric(12,2) not null,
  purchase_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index idx_sales_vehicle on sales(vehicle_id);
create index idx_sales_customer on sales(customer_id);
create index idx_sales_date on sales(purchase_date);
create index idx_sales_sold_by on sales(sold_by);

-- ------------------------------------------------------------
-- Finance Companies & Officers
-- ------------------------------------------------------------
create table finance_companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table finance_officers (
  id uuid primary key default uuid_generate_v4(),
  finance_company_id uuid not null references finance_companies(id) on delete cascade,
  officer_name text not null,
  phone_number text,
  whatsapp_number text,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_finance_officers_company on finance_officers(finance_company_id);

-- Communication log (record of what was sent/discussed per customer/vehicle)
create table finance_communications (
  id uuid primary key default uuid_generate_v4(),
  finance_officer_id uuid references finance_officers(id),
  customer_id uuid references customers(id),
  vehicle_id uuid references vehicles(id),
  note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_finance_comm_customer on finance_communications(customer_id);
create index idx_finance_comm_vehicle on finance_communications(vehicle_id);

-- ------------------------------------------------------------
-- Documents (linked to customer / vehicle, files in Supabase Storage)
-- ------------------------------------------------------------
create table documents (
  id uuid primary key default uuid_generate_v4(),
  document_type document_type not null default 'other',
  storage_path text not null,
  customer_id uuid references customers(id),
  vehicle_id uuid references vehicles(id),
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index idx_documents_customer on documents(customer_id);
create index idx_documents_vehicle on documents(vehicle_id);

-- ------------------------------------------------------------
-- updated_at trigger helper (reused across tables)
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute procedure public.set_updated_at();
create trigger trg_vehicles_updated_at before update on vehicles
  for each row execute procedure public.set_updated_at();
create trigger trg_customers_updated_at before update on customers
  for each row execute procedure public.set_updated_at();
