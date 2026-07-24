-- ============================================================
-- Migration 0020: Finance company logo + officer photo (helps
-- staff tell officers/companies apart at a glance, especially
-- when names repeat or look similar)
-- ============================================================

alter table finance_companies add column logo_path text;
alter table finance_officers add column photo_path text;

insert into storage.buckets (id, name, public)
values ('finance-photos', 'finance-photos', true)
on conflict (id) do nothing;

create policy "finance_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'finance-photos');

create policy "finance_photos_employee_upload"
  on storage.objects for insert
  with check (bucket_id = 'finance-photos' and is_active_employee());

create policy "finance_photos_employee_delete"
  on storage.objects for delete
  using (bucket_id = 'finance-photos' and is_active_employee());
