-- Private support tickets and saved-workshop references. No outbound messages are sent.
create table if not exists public.support_tickets (
 id uuid primary key default gen_random_uuid(),
 ticket_code text not null unique,
 user_id uuid not null references public.profiles(id),
 subject text not null,
 category text not null default 'general',
 description text not null,
 status text not null default 'open' check(status in ('open','in_progress','waiting_on_customer','resolved','closed')),
 priority text not null default 'normal' check(priority in ('low','normal','high')),
 admin_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on public.support_tickets(user_id,created_at desc);
create table if not exists public.support_messages (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null references public.support_tickets(id) on delete cascade,
 sender_id uuid not null references public.profiles(id),
 body text not null,
 created_at timestamptz not null default now()
);
create index if not exists support_messages_ticket_idx on public.support_messages(ticket_id,created_at);
create table if not exists public.saved_workshops (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 is_saved boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id,workshop_id)
);
create index if not exists saved_workshops_user_idx on public.saved_workshops(user_id,is_saved);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.saved_workshops enable row level security;
grant select,insert on public.support_tickets to authenticated;
grant select,insert on public.support_messages to authenticated;
grant select,insert,update on public.saved_workshops to authenticated;
grant update on public.support_tickets to authenticated;

drop policy if exists "support tickets owner or admin read" on public.support_tickets;
create policy "support tickets owner or admin read" on public.support_tickets
 for select to authenticated using (user_id=(select auth.uid()) or (select private.is_platform_admin()));
drop policy if exists "support tickets owner create" on public.support_tickets;
create policy "support tickets owner create" on public.support_tickets
 for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "support tickets admin update" on public.support_tickets;
create policy "support tickets admin update" on public.support_tickets
 for update to authenticated using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

drop policy if exists "support messages participants read" on public.support_messages;
create policy "support messages participants read" on public.support_messages
 for select to authenticated using (
  exists(select 1 from public.support_tickets t where t.id=support_messages.ticket_id and (t.user_id=(select auth.uid()) or (select private.is_platform_admin())))
 );
drop policy if exists "support messages participants create" on public.support_messages;
create policy "support messages participants create" on public.support_messages
 for insert to authenticated with check (
  sender_id=(select auth.uid()) and
  exists(select 1 from public.support_tickets t where t.id=support_messages.ticket_id and (t.user_id=(select auth.uid()) or (select private.is_platform_admin())))
 );

drop policy if exists "saved workshops owner read" on public.saved_workshops;
create policy "saved workshops owner read" on public.saved_workshops
 for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "saved workshops owner insert" on public.saved_workshops;
create policy "saved workshops owner insert" on public.saved_workshops
 for insert to authenticated with check (
  user_id=(select auth.uid()) and exists(select 1 from public.workshops w where w.id=saved_workshops.workshop_id)
 );
drop policy if exists "saved workshops owner update" on public.saved_workshops;
create policy "saved workshops owner update" on public.saved_workshops
 for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
