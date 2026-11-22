-- Admin-maintained catalogues; no vehicle or workshop records are imported by this migration.
grant select,insert,update on public.service_categories to authenticated;
drop policy if exists "platform admins manage service categories" on public.service_categories;
create policy "platform admins manage service categories" on public.service_categories
 for all to authenticated using ((select private.is_platform_admin()))
 with check ((select private.is_platform_admin()));

create table if not exists public.vehicle_catalogue (
 id uuid primary key default gen_random_uuid(),
 make text not null,
 model text not null,
 variant text,
 fuel_types text[] not null default '{}',
 body_type text,
 year_from integer,
 year_to integer,
 active boolean not null default true,
 sort_order integer not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(make,model,variant)
);
create index if not exists vehicle_catalogue_make_model_idx on public.vehicle_catalogue(make,model);
alter table public.vehicle_catalogue enable row level security;
grant select on public.vehicle_catalogue to anon,authenticated;
grant insert,update on public.vehicle_catalogue to authenticated;
drop policy if exists "active vehicle catalogue public read" on public.vehicle_catalogue;
create policy "active vehicle catalogue public read" on public.vehicle_catalogue
 for select to public using (active or (select private.is_platform_admin()));
drop policy if exists "platform admins manage vehicle catalogue" on public.vehicle_catalogue;
create policy "platform admins manage vehicle catalogue" on public.vehicle_catalogue
 for all to authenticated using ((select private.is_platform_admin()))
 with check ((select private.is_platform_admin()));
