-- Require a verified QuickBay partner for customer booking requests.
-- A public map listing is not a connected workshop and cannot receive in-app bookings.
create or replace function public.create_booking_request(
 p_vehicle_id uuid,
 p_requested_service text,
 p_preferred_at timestamptz default null,
 p_workshop_id uuid default null,
 p_service_id uuid default null,
 p_customer_notes text default null
) returns public.bookings
language plpgsql
security invoker
set search_path=public
as $$
declare
 v_vehicle public.vehicles;
 v_workshop public.workshops;
 v_service public.workshop_services;
 v_booking public.bookings;
 v_booking_code text;
 v_service_name text;
begin
 if auth.uid() is null then
  raise exception 'Authentication required';
 end if;

 if p_workshop_id is null then
  raise exception 'Choose a verified QuickBay partner workshop';
 end if;

 if p_preferred_at is null or p_preferred_at <= now() then
  raise exception 'Choose a future appointment date and time';
 end if;

 if p_requested_service is null or length(btrim(p_requested_service))=0 or length(p_requested_service)>120 then
  raise exception 'Enter a valid service request';
 end if;

 select * into v_vehicle
 from public.vehicles
 where id=p_vehicle_id and owner_id=auth.uid();
 if not found then
  raise exception 'Vehicle not found or not owned by current user';
 end if;

 select * into v_workshop
 from public.workshops
 where id=p_workshop_id
  and partner_status='approved'
  and is_quickbay_verified=true
  and public_display_permitted=true;
 if not found then
  raise exception 'This workshop is not an active verified QuickBay booking partner';
 end if;

 v_service_name:=btrim(p_requested_service);
 if p_service_id is not null then
  select * into v_service
  from public.workshop_services
  where id=p_service_id
   and workshop_id=p_workshop_id
   and active=true;
  if not found then
   raise exception 'Selected service is not offered by this workshop';
  end if;
  v_service_name:=v_service.name;
 end if;

 v_booking_code:='QB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));

 insert into public.bookings(
  booking_code,customer_id,vehicle_id,workshop_id,service_id,
  requested_service,preferred_at,customer_notes
 )
 values(
  v_booking_code,auth.uid(),p_vehicle_id,p_workshop_id,p_service_id,
  v_service_name,p_preferred_at,nullif(left(btrim(coalesce(p_customer_notes,'')),1000),'')
 )
 returning * into v_booking;

 return v_booking;
end;
$$;

grant execute on function public.create_booking_request(uuid,text,timestamptz,uuid,uuid,text) to authenticated;
