-- QuickBay additive workshop inventory, in-app notification and booking/estimate permissions.
-- No existing rows are deleted or rewritten by this migration.

create table if not exists public.inventory_items (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 sku text,
 name text not null,
 category text,
 unit text not null default 'pcs',
 quantity_on_hand numeric(12,2) not null default 0 check (quantity_on_hand >= 0),
 reorder_level numeric(12,2) not null default 0 check (reorder_level >= 0),
 unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(workshop_id, sku)
);

create index if not exists inventory_items_workshop_idx on public.inventory_items(workshop_id, active);
create table if not exists public.inventory_movements (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 item_id uuid not null references public.inventory_items(id) on delete restrict,
 movement_type text not null check (movement_type in ('stock_in','stock_out','adjustment')),
 quantity_delta numeric(12,2) not null check (quantity_delta <> 0),
 reference text,
 notes text,
 created_by uuid references public.profiles(id),
 created_at timestamptz not null default now()
);
create index if not exists inventory_movements_item_idx on public.inventory_movements(item_id, created_at desc);

create table if not exists public.user_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null,
 body text not null default '',
 category text not null default 'system',
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists user_notifications_user_idx on public.user_notifications(user_id, created_at desc);

alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.user_notifications enable row level security;

grant select, insert, update on public.inventory_items to authenticated;
grant select, insert on public.inventory_movements to authenticated;
grant select, update on public.user_notifications to authenticated;

drop policy if exists "inventory items workshop members" on public.inventory_items;
create policy "inventory items workshop members" on public.inventory_items
 for all to authenticated
 using ((select private.is_workshop_member(workshop_id)) or (select private.is_platform_admin()))
 with check ((select private.is_workshop_member(workshop_id)) or (select private.is_platform_admin()));

drop policy if exists "inventory movements workshop members read" on public.inventory_movements;
create policy "inventory movements workshop members read" on public.inventory_movements
 for select to authenticated
 using ((select private.is_workshop_member(workshop_id)) or (select private.is_platform_admin()));

drop policy if exists "inventory movements workshop members insert" on public.inventory_movements;
create policy "inventory movements workshop members insert" on public.inventory_movements
 for insert to authenticated
 with check (
  ((select private.is_workshop_member(workshop_id)) or (select private.is_platform_admin()))
  and (created_by is null or created_by=(select auth.uid()))
 );

drop policy if exists "user notifications read own" on public.user_notifications;
create policy "user notifications read own" on public.user_notifications
 for select to authenticated using (user_id=(select auth.uid()));

drop policy if exists "user notifications update own" on public.user_notifications;
create policy "user notifications update own" on public.user_notifications
 for update to authenticated
 using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()));

-- Customer cancellation is limited to the customer's own uncompleted request.
drop policy if exists "customer cancel own booking" on public.bookings;
create policy "customer cancel own booking" on public.bookings
 for update to authenticated
 using (customer_id=(select auth.uid()) and status in ('requested','rescheduled'))
 with check (customer_id=(select auth.uid()) and status='cancelled');

-- Workshop updates must remain attached to a workshop the caller belongs to.
drop policy if exists "workshop manage booking" on public.bookings;
create policy "workshop manage booking" on public.bookings
 for update to authenticated
 using (
  (workshop_id is not null and (select private.is_workshop_member(workshop_id)))
  or (select private.is_platform_admin())
 )
 with check (
  (workshop_id is not null and (select private.is_workshop_member(workshop_id)))
  or (select private.is_platform_admin())
 );

-- Allow workshop members to manage estimate line items only for their own jobs.
drop policy if exists "workshop manages estimate items" on public.estimate_items;
create policy "workshop manages estimate items" on public.estimate_items
 for all to authenticated
 using (
  exists (
   select 1 from public.estimates e
   join public.job_cards j on j.id=e.job_id
   where e.id=estimate_items.estimate_id
     and ((select private.is_workshop_member(j.workshop_id)) or (select private.is_platform_admin()))
  )
 )
 with check (
  exists (
   select 1 from public.estimates e
   join public.job_cards j on j.id=e.job_id
   where e.id=estimate_items.estimate_id
     and ((select private.is_workshop_member(j.workshop_id)) or (select private.is_platform_admin()))
  )
 );

create or replace function public.record_inventory_movement(
 p_item_id uuid,
 p_movement_type text,
 p_quantity numeric,
 p_reference text default null,
 p_notes text default null
) returns public.inventory_movements
language plpgsql
security invoker
set search_path=public,private,pg_temp
as $$
declare
 v_item public.inventory_items;
 v_delta numeric(12,2);
 v_movement public.inventory_movements;
begin
 if p_movement_type not in ('stock_in','stock_out','adjustment') then
  raise exception 'Unsupported stock movement type';
 end if;
 if p_quantity is null or p_quantity=0 then
  raise exception 'Quantity must be non-zero';
 end if;
 select * into v_item from public.inventory_items where id=p_item_id for update;
 if not found then raise exception 'Inventory item not found'; end if;
 if not private.is_workshop_member(v_item.workshop_id) and not private.is_platform_admin() then
  raise exception 'Not authorised for this workshop';
 end if;
 v_delta := case when p_movement_type='stock_in' then abs(p_quantity)
                 when p_movement_type='stock_out' then -abs(p_quantity)
                 else p_quantity end;
 if v_item.quantity_on_hand + v_delta < 0 then
  raise exception 'Insufficient stock for this movement';
 end if;
 update public.inventory_items
  set quantity_on_hand=quantity_on_hand+v_delta, updated_at=now()
  where id=p_item_id;
 insert into public.inventory_movements(workshop_id,item_id,movement_type,quantity_delta,reference,notes,created_by)
  values(v_item.workshop_id,p_item_id,p_movement_type,v_delta,p_reference,p_notes,auth.uid())
  returning * into v_movement;
 return v_movement;
end
$$;
grant execute on function public.record_inventory_movement(uuid,text,numeric,text,text) to authenticated;
