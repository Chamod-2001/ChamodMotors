-- ============================================================
-- Track meaningful dates per vehicle: when it was actually bought
-- (manually entered, may predate the inventory record), and when
-- it entered its current reserved/sold state.
-- ============================================================

alter table vehicles add column if not exists buying_date date not null default current_date;
alter table vehicles add column if not exists reserved_at timestamptz;
alter table vehicles add column if not exists sold_at timestamptz;
