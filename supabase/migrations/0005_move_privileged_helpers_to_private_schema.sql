-- Keep privileged helpers outside the exposed public API schema.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.current_user_role()
returns public.app_role language sql stable security definer
set search_path=public,pg_temp
as $$ select role from public.profiles where id=auth.uid() $$;

create or replace function private.is_platform_admin()
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $$ select coalesce(private.current_user_role() in ('super_admin','platform_admin'),false) $$;

create or replace function private.is_workshop_member(target_workshop uuid)
returns boolean language sql stable security definer
set search_path=public,private,pg_temp
as $$ select exists(select 1 from public.workshop_members m where m.workshop_id=target_workshop and m.user_id=auth.uid() and m.active) $$;

grant execute on function private.current_user_role() to anon, authenticated;
grant execute on function private.is_platform_admin() to anon, authenticated;
grant execute on function private.is_workshop_member(uuid) to anon, authenticated;

create or replace function public.current_user_role()
returns public.app_role language sql stable security invoker
set search_path=public,private,pg_temp
as $$ select private.current_user_role() $$;
create or replace function public.is_platform_admin()
returns boolean language sql stable security invoker
set search_path=public,private,pg_temp
as $$ select private.is_platform_admin() $$;
create or replace function public.is_workshop_member(target_workshop uuid)
returns boolean language sql stable security invoker
set search_path=public,private,pg_temp
as $$ select private.is_workshop_member(target_workshop) $$;

revoke execute on function public.current_user_role() from public;
revoke execute on function public.is_platform_admin() from public;
revoke execute on function public.is_workshop_member(uuid) from public;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_platform_admin() to anon, authenticated;
grant execute on function public.is_workshop_member(uuid) to anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer
set search_path=public,pg_temp
as $$
begin
 insert into public.profiles(id,full_name,email,phone,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.phone,'vehicle_owner')
 on conflict(id) do nothing;
 return new;
end
$$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
 for each row execute procedure private.handle_new_user();
