-- ============================================================
-- Migration 0019: Customer photo (single profile-style photo per
-- customer, captured optionally when a customer is created/edited)
-- ============================================================

alter table customers add column photo_path text;

insert into storage.buckets (id, name, public)
values ('customer-photos', 'customer-photos', true)
on conflict (id) do nothing;

-- Public read (fast <img> loading, same as vehicle-images), only
-- authenticated active employees can upload/delete.
create policy "customer_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'customer-photos');

create policy "customer_photos_employee_upload"
  on storage.objects for insert
  with check (bucket_id = 'customer-photos' and is_active_employee());

create policy "customer_photos_employee_delete"
  on storage.objects for delete
  using (bucket_id = 'customer-photos' and is_active_employee());
