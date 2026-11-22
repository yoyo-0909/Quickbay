-- Support foreign-key lookup indexes and a safe customer reschedule path.
create index if not exists saved_workshops_workshop_fk_idx on public.saved_workshops(workshop_id);
create index if not exists support_messages_sender_fk_idx on public.support_messages(sender_id);

drop policy if exists "customer reschedule own booking" on public.bookings;
create policy "customer reschedule own booking" on public.bookings
 for update to authenticated
 using (customer_id=(select auth.uid()) and status in ('requested','rescheduled','confirmed'))
 with check (customer_id=(select auth.uid()) and status='rescheduled');

-- Only the booking fields needed by customer/workshop workflows can be updated directly.
revoke update on public.bookings from authenticated;
grant update (status,preferred_at,updated_at) on public.bookings to authenticated;
