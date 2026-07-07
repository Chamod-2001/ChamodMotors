-- ============================================================
-- MDMS Database Schema — Migration 0003: Storage Buckets
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('vehicle-images', 'vehicle-images', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- Vehicle images: publicly viewable (for fast <img> loading), only
-- authenticated active employees can upload/delete
create policy "vehicle_images_public_read"
  on storage.objects for select
  using (bucket_id = 'vehicle-images');

create policy "vehicle_images_employee_upload"
  on storage.objects for insert
  with check (bucket_id = 'vehicle-images' and is_active_employee());

create policy "vehicle_images_employee_delete"
  on storage.objects for delete
  using (bucket_id = 'vehicle-images' and is_active_employee());

-- Documents: private, only active employees can read/upload; admin deletes
create policy "documents_employee_read"
  on storage.objects for select
  using (bucket_id = 'documents' and is_active_employee());

create policy "documents_employee_upload"
  on storage.objects for insert
  with check (bucket_id = 'documents' and is_active_employee());

create policy "documents_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'documents' and is_admin());
