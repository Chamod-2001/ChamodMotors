-- ============================================================
-- Migration 0022: Employee profile photo (admin-managed, from the
-- Employees page — there's no self-service account page yet).
-- ============================================================

alter table profiles add column photo_path text;

insert into storage.buckets (id, name, public)
values ('employee-photos', 'employee-photos', true)
on conflict (id) do nothing;

create policy "employee_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'employee-photos');

create policy "employee_photos_admin_upload"
  on storage.objects for insert
  with check (bucket_id = 'employee-photos' and is_admin());

create policy "employee_photos_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'employee-photos' and is_admin());
