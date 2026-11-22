-- Customer feedback remains private; nothing is published to the workshop directory.
create table if not exists public.workshop_reviews (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references public.profiles(id),
 workshop_id uuid not null references public.workshops(id),
 booking_id uuid not null unique references public.bookings(id),
 rating smallint not null check(rating between 1 and 5),
 review_text text not null default '',
 status text not null default 'pending_review' check(status in ('pending_review','reviewed','rejected')),
 admin_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists workshop_reviews_workshop_idx on public.workshop_reviews(workshop_id,created_at desc);
create index if not exists workshop_reviews_customer_idx on public.workshop_reviews(customer_id,created_at desc);
alter table public.workshop_reviews enable row level security;
grant select,insert,update on public.workshop_reviews to authenticated;

drop policy if exists "workshop reviews private participants read" on public.workshop_reviews;
create policy "workshop reviews private participants read" on public.workshop_reviews
 for select to authenticated using (
  customer_id=(select auth.uid())
  or (select private.is_platform_admin())
  or (select private.is_workshop_member(workshop_id))
 );
drop policy if exists "customer review after delivered job" on public.workshop_reviews;
create policy "customer review after delivered job" on public.workshop_reviews
 for insert to authenticated with check (
  customer_id=(select auth.uid())
  and status='pending_review'
  and exists(
   select 1 from public.bookings b
   join public.job_cards j on j.booking_id=b.id
   where b.id=workshop_reviews.booking_id
     and b.customer_id=(select auth.uid())
     and b.workshop_id=workshop_reviews.workshop_id
     and j.customer_id=(select auth.uid())
     and j.workshop_id=workshop_reviews.workshop_id
     and j.stage='delivered'
  )
 );
drop policy if exists "platform admins moderate private reviews" on public.workshop_reviews;
create policy "platform admins moderate private reviews" on public.workshop_reviews
 for update to authenticated using ((select private.is_platform_admin()))
 with check ((select private.is_platform_admin()));
