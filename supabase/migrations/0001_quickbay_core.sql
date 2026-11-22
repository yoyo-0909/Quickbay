-- QuickBay production foundation: PostgreSQL schema + Row Level Security
create extension if not exists pgcrypto;
create type public.app_role as enum ('super_admin','platform_admin','workshop_owner','workshop_manager','service_advisor','technician','vehicle_owner');
create type public.partner_status as enum ('pending_review','approved','rejected','suspended');
create type public.booking_status as enum ('requested','confirmed','rescheduled','cancelled','completed');
create type public.bay_status as enum ('available','occupied','reserved','maintenance');
create type public.job_stage as enum ('check_in','inspection','estimate_prepared','awaiting_customer_approval','in_bay_service','quality_check','ready_for_delivery','delivered');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 email text,
 phone text,
 role public.app_role not null default 'vehicle_owner',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.workshops (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 slug text unique,
 category text,
 description text,
 phone text,
 email text,
 address text,
 locality text,
 city text,
 district text,
 state text,
 pincode text,
 latitude double precision,
 longitude double precision,
 place_id text,
 listing_source text not null default 'workshop_submitted',
 source_record_id text,
 source_license text,
 source_attribution text,
 claim_status text not null default 'unclaimed' check (claim_status in ('unclaimed','claim_pending','claimed')),
 partner_status public.partner_status not null default 'pending_review',
 is_quickbay_verified boolean not null default false,
 rating numeric(2,1) check (rating between 0 and 5),
 review_count integer check (review_count >= 0),
 operating_hours jsonb not null default '{}'::jsonb,
 supported_brands text[] not null default '{}',
 services text[] not null default '{}',
 created_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(listing_source, source_record_id)
);
create index workshops_geo_idx on public.workshops(state, city, pincode);
create index workshops_search_idx on public.workshops using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(address,'') || ' ' || coalesce(city,'') || ' ' || coalesce(array_to_string(services,' '),'')));
create table public.workshop_members (
 workshop_id uuid references public.workshops(id) on delete cascade,
 user_id uuid references public.profiles(id) on delete cascade,
 role public.app_role not null check (role in ('workshop_owner','workshop_manager','service_advisor','technician')),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 primary key(workshop_id,user_id)
);
create table public.vehicles (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.profiles(id) on delete cascade,
 registration_number text not null,
 manufacturer text not null,
 model text not null,
 variant text,
 manufacturing_year integer,
 fuel_type text,
 transmission text,
 odometer_km integer,
 image_path text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(owner_id, registration_number)
);
create table public.service_categories (
 id uuid primary key default gen_random_uuid(),
 name text not null unique,
 description text,
 active boolean not null default true,
 sort_order integer not null default 0
);
create table public.workshop_services (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 category_id uuid references public.service_categories(id),
 name text not null,
 description text,
 labour_amount numeric(12,2),
 parts_amount numeric(12,2),
 tax_rate numeric(5,2) not null default 0,
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.bookings (
 id uuid primary key default gen_random_uuid(),
 booking_code text not null unique,
 customer_id uuid not null references public.profiles(id),
 vehicle_id uuid not null references public.vehicles(id),
 workshop_id uuid references public.workshops(id),
 service_id uuid references public.workshop_services(id),
 requested_service text not null,
 preferred_at timestamptz,
 slot_start timestamptz,
 slot_end timestamptz,
 status public.booking_status not null default 'requested',
 customer_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (slot_end is null or slot_start is null or slot_end > slot_start)
);
create index bookings_workshop_slot_idx on public.bookings(workshop_id,slot_start,slot_end);
create table public.bays (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 bay_code text not null,
 status public.bay_status not null default 'available',
 created_at timestamptz not null default now(),
 unique(workshop_id,bay_code),
 unique(id,workshop_id)
);
create table public.technicians (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 profile_id uuid references public.profiles(id),
 display_name text not null,
 specialisations text[] not null default '{}',
 active boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.job_cards (
 id uuid primary key default gen_random_uuid(),
 job_code text not null unique,
 workshop_id uuid not null references public.workshops(id),
 booking_id uuid references public.bookings(id),
 vehicle_id uuid not null references public.vehicles(id),
 customer_id uuid not null references public.profiles(id),
 bay_id uuid,
 technician_id uuid references public.technicians(id),
 reported_issue text,
 internal_notes text,
 customer_notes text,
 stage public.job_stage not null default 'check_in',
 checked_in_at timestamptz not null default now(),
 expected_completion timestamptz,
 delivered_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 foreign key(bay_id,workshop_id) references public.bays(id,workshop_id)
);
-- One active job per bay. The partial unique index is the concurrency-safe guard.
create unique index one_active_job_per_bay on public.job_cards(bay_id) where bay_id is not null and stage <> 'delivered';
create table public.job_status_history (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.job_cards(id) on delete cascade,
 previous_stage public.job_stage,
 new_stage public.job_stage not null,
 changed_by uuid references public.profiles(id),
 note text,
 created_at timestamptz not null default now()
);
create table public.estimates (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.job_cards(id) on delete cascade,
 version integer not null default 1,
 status text not null default 'draft' check (status in ('draft','sent','approved','rejected','superseded')),
 subtotal numeric(12,2) not null default 0,
 tax_total numeric(12,2) not null default 0,
 discount numeric(12,2) not null default 0,
 total numeric(12,2) not null default 0,
 customer_response_at timestamptz,
 created_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 unique(job_id,version)
);
create table public.estimate_items (
 id uuid primary key default gen_random_uuid(),
 estimate_id uuid not null references public.estimates(id) on delete cascade,
 item_type text not null check (item_type in ('labour','part','consumable')),
 description text not null,
 quantity numeric(10,2) not null default 1,
 unit_price numeric(12,2) not null,
 tax_rate numeric(5,2) not null default 0
);
create table public.invoices (
 id uuid primary key default gen_random_uuid(),
 invoice_number text not null unique,
 job_id uuid not null unique references public.job_cards(id),
 workshop_id uuid not null references public.workshops(id),
 customer_id uuid not null references public.profiles(id),
 subtotal numeric(12,2) not null,
 tax_total numeric(12,2) not null,
 discount numeric(12,2) not null default 0,
 total numeric(12,2) not null,
 payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','partially_paid','void')),
 gstin text,
 issued_at timestamptz not null default now()
);
create table public.old_parts_returns (
 id uuid primary key default gen_random_uuid(),
 job_id uuid not null references public.job_cards(id) on delete cascade,
 part_name text not null,
 reason text,
 customer_requested boolean not null default false,
 disposition text not null default 'pending' check (disposition in ('pending','returned','retained','disposed')),
 photo_paths text[] not null default '{}',
 tamper_seal_reference text,
 handover_confirmed_at timestamptz,
 created_at timestamptz not null default now()
);
create table public.workshop_applications (
 id uuid primary key default gen_random_uuid(),
 application_code text not null unique,
 applicant_id uuid not null references public.profiles(id),
 workshop_name text not null,
 owner_name text not null,
 phone text not null,
 email text,
 address text not null,
 city text not null,
 state text not null,
 pincode text not null,
 bay_count integer,
 services text[] not null default '{}',
 status public.partner_status not null default 'pending_review',
 admin_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.audit_logs (
 id bigint generated always as identity primary key,
 actor_id uuid references public.profiles(id),
 action text not null,
 entity_type text not null,
 entity_id text,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table public.workshop_import_batches (
 id uuid primary key default gen_random_uuid(),
 source_name text not null,
 source_license text not null,
 source_attribution text not null,
 records_received integer not null default 0,
 records_inserted integer not null default 0,
 records_updated integer not null default 0,
 records_rejected integer not null default 0,
 status text not null default 'pending',
 created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns public.app_role language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select coalesce(public.current_user_role() in ('super_admin','platform_admin'),false) $$;
create or replace function public.is_workshop_member(target_workshop uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.workshop_members m where m.workshop_id=target_workshop and m.user_id=auth.uid() and m.active) $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin
 insert into public.profiles(id,full_name,email,phone,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.email,new.phone,'vehicle_owner')
 on conflict(id) do nothing;
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.workshops enable row level security;
alter table public.workshop_members enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_categories enable row level security;
alter table public.workshop_services enable row level security;
alter table public.bookings enable row level security;
alter table public.bays enable row level security;
alter table public.technicians enable row level security;
alter table public.job_cards enable row level security;
alter table public.job_status_history enable row level security;
alter table public.estimates enable row level security;
alter table public.estimate_items enable row level security;
alter table public.invoices enable row level security;
alter table public.old_parts_returns enable row level security;
alter table public.workshop_applications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.workshop_import_batches enable row level security;

create policy "profiles read self or admins" on public.profiles for select using(id=auth.uid() or public.is_platform_admin());
create policy "profiles update self" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid() and role=public.current_user_role());
create policy "public approved workshops" on public.workshops for select using(partner_status='approved' or created_by=auth.uid() or public.is_workshop_member(id) or public.is_platform_admin());
create policy "workshop applications own or admins" on public.workshop_applications for select using(applicant_id=auth.uid() or public.is_platform_admin());
create policy "create own application" on public.workshop_applications for insert with check(applicant_id=auth.uid());
create policy "admins update applications" on public.workshop_applications for update using(public.is_platform_admin()) with check(public.is_platform_admin());
create policy "members view membership" on public.workshop_members for select using(user_id=auth.uid() or public.is_platform_admin() or public.is_workshop_member(workshop_id));
create policy "vehicle owner access" on public.vehicles for all using(owner_id=auth.uid() or public.is_platform_admin()) with check(owner_id=auth.uid() or public.is_platform_admin());
create policy "service categories public read" on public.service_categories for select using(active or public.is_platform_admin());
create policy "workshop services public read" on public.workshop_services for select using(active or public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "workshop services member manage" on public.workshop_services for all using(public.is_workshop_member(workshop_id) or public.is_platform_admin()) with check(public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "booking customer or workshop" on public.bookings for select using(customer_id=auth.uid() or (workshop_id is not null and public.is_workshop_member(workshop_id)) or public.is_platform_admin());
create policy "customer create booking" on public.bookings for insert with check(customer_id=auth.uid());
create policy "workshop manage booking" on public.bookings for update using((workshop_id is not null and public.is_workshop_member(workshop_id)) or public.is_platform_admin());
create policy "bay member access" on public.bays for all using(public.is_workshop_member(workshop_id) or public.is_platform_admin()) with check(public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "technician member access" on public.technicians for all using(public.is_workshop_member(workshop_id) or public.is_platform_admin()) with check(public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "job customer or workshop access" on public.job_cards for select using(customer_id=auth.uid() or public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "workshop create and update jobs" on public.job_cards for all using(public.is_workshop_member(workshop_id) or public.is_platform_admin()) with check(public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "job history visible to participants" on public.job_status_history for select using(exists(select 1 from public.job_cards j where j.id=job_id and (j.customer_id=auth.uid() or public.is_workshop_member(j.workshop_id))) or public.is_platform_admin());
create policy "job history insert by workshop" on public.job_status_history for insert with check(exists(select 1 from public.job_cards j where j.id=job_id and public.is_workshop_member(j.workshop_id)) or public.is_platform_admin());
create policy "estimates visible to participants" on public.estimates for select using(exists(select 1 from public.job_cards j where j.id=job_id and (j.customer_id=auth.uid() or public.is_workshop_member(j.workshop_id))) or public.is_platform_admin());
create policy "workshop manages estimates" on public.estimates for all using(exists(select 1 from public.job_cards j where j.id=job_id and public.is_workshop_member(j.workshop_id)) or public.is_platform_admin()) with check(exists(select 1 from public.job_cards j where j.id=job_id and public.is_workshop_member(j.workshop_id)) or public.is_platform_admin());
create policy "estimate items participants read" on public.estimate_items for select using(exists(select 1 from public.estimates e join public.job_cards j on j.id=e.job_id where e.id=estimate_id and (j.customer_id=auth.uid() or public.is_workshop_member(j.workshop_id))) or public.is_platform_admin());
create policy "invoice participants read" on public.invoices for select using(customer_id=auth.uid() or public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "workshop manages invoices" on public.invoices for all using(public.is_workshop_member(workshop_id) or public.is_platform_admin()) with check(public.is_workshop_member(workshop_id) or public.is_platform_admin());
create policy "parts returns participants read" on public.old_parts_returns for select using(exists(select 1 from public.job_cards j where j.id=job_id and (j.customer_id=auth.uid() or public.is_workshop_member(j.workshop_id))) or public.is_platform_admin());
create policy "workshop manages parts returns" on public.old_parts_returns for all using(exists(select 1 from public.job_cards j where j.id=job_id and public.is_workshop_member(j.workshop_id)) or public.is_platform_admin()) with check(exists(select 1 from public.job_cards j where j.id=job_id and public.is_workshop_member(j.workshop_id)) or public.is_platform_admin());
create policy "audit logs admins only" on public.audit_logs for select using(public.is_platform_admin());
create policy "audit logs insert authenticated" on public.audit_logs for insert with check(auth.uid() is not null);
create policy "import batches admins only" on public.workshop_import_batches for all using(public.is_platform_admin()) with check(public.is_platform_admin());

insert into public.service_categories(name,description,sort_order) values
('Periodic General Service','Scheduled vehicle maintenance and inspection',1),
('Engine Oil and Filter Replacement','Engine oil and oil filter replacement',2),
('Brake Overhaul','Brake inspection, pads and related repairs',3),
('AC Service','Air conditioning inspection and service',4),
('Wheel Alignment','Wheel alignment and balancing',5),
('Suspension Inspection','Suspension and steering inspection',6),
('Clutch Service','Clutch inspection and replacement',7),
('Battery Replacement','Battery testing and replacement',8),
('Full Vehicle Inspection','Multi-point vehicle health inspection',9),
('Detailing and Cleaning','Interior and exterior detailing',10)
on conflict(name) do nothing;
