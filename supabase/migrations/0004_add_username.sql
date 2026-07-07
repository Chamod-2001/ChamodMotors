-- ============================================================
-- Add username-based login. Employees log in with a short
-- username instead of their email; email is kept only for
-- password-reset delivery.
-- ============================================================

alter table profiles add column if not exists username text;

-- Backfill existing profiles from their auth email's local-part
-- so the column can be made required.
update profiles p
set username = split_part(u.email, '@', 1)
from auth.users u
where p.id = u.id and p.username is null;

alter table profiles alter column username set not null;
alter table profiles add constraint profiles_username_key unique (username);

-- Re-provision new users with a username (from signup metadata,
-- falling back to the email local-part if none was supplied).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'sales'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
