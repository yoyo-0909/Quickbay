-- Enforce exclusive workshop appointment slots under concurrent requests.
create extension if not exists btree_gist;
alter table public.bookings
 add constraint bookings_no_overlapping_confirmed_slots
 exclude using gist (
  workshop_id with =,
  tstzrange(slot_start,slot_end,'[)') with &&
 )
 where (workshop_id is not null and slot_start is not null and slot_end is not null and status in ('requested','confirmed'));

-- Audit events are admin-readable and must be written by trusted server-side code.
drop policy if exists "audit logs insert authenticated" on public.audit_logs;
create policy "platform admins insert audit logs" on public.audit_logs for insert
 with check(public.is_platform_admin());
