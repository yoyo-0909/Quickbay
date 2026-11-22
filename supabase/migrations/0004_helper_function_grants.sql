-- Helper functions are referenced by RLS policies; allow the API roles to invoke them.
-- Their SECURITY DEFINER bodies only inspect the current caller's role/membership.
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.is_platform_admin() to anon, authenticated;
grant execute on function public.is_workshop_member(uuid) to anon, authenticated;
-- The auth trigger is internal and must not be callable as an RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
