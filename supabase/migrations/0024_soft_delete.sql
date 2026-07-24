-- ============================================================
-- Migration 0024: Soft delete for records with financial/audit
-- weight (vehicles, customers, finance companies, finance officers)
-- — "delete" now hides them from active lists instead of erasing
-- the row, preserving sale/document/communication history intact.
-- Low-stakes tables (catalog entries, expenses, reviews, documents,
-- photos) keep hard delete — nothing downstream depends on those
-- surviving.
-- ============================================================

alter table vehicles add column is_active boolean not null default true;
alter table customers add column is_active boolean not null default true;
alter table finance_companies add column is_active boolean not null default true;
alter table finance_officers add column is_active boolean not null default true;

create index idx_vehicles_is_active on vehicles(is_active);
create index idx_customers_is_active on customers(is_active);
