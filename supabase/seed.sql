-- ============================================================
-- MDMS — Seed Data (for local development only)
-- ============================================================

insert into finance_companies (name) values
  ('LB Finance'),
  ('Commercial Credit'),
  ('People''s Leasing'),
  ('Senkadagala Finance')
on conflict do nothing;

-- Note: Admin/employee profiles are created automatically via the
-- handle_new_user() trigger when a user signs up through Supabase Auth.
-- Create your first admin by signing up, then run:
--   update profiles set role = 'admin' where id = '<your-user-id>';
