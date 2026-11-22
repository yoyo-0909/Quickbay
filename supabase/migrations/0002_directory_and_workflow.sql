-- Public listing eligibility, secure bay allocation and job workflow RPCs.
alter table public.workshops add column if not exists public_display_permitted boolean not null default false;
alter table public.workshops add column if not exists website text;
alter table public.workshops add column if not exists phone_source text;
alter table public.workshops add column if not exists rating_source text;
drop policy if exists "public approved workshops" on public.workshops;
create policy "permitted directory listings visible" on public.workshops for select
 using (
  partner_status='approved'
  or (public_display_permitted=true and listing_source <> 'workshop_submitted' and partner_status <> 'suspended')
  or created_by=auth.uid()
  or public.is_workshop_member(id)
  or public.is_platform_admin()
);
create policy "platform admins manage workshops" on public.workshops for all
 using(public.is_platform_admin()) with check(public.is_platform_admin());

create or replace function public.allocate_bay(p_job_id uuid,p_bay_id uuid)
returns public.job_cards language plpgsql security invoker set search_path=public
as $$
declare j public.job_cards; b public.bays;
begin
 select * into j from public.job_cards where id=p_job_id for update;
 if not found then raise exception 'Job card not found'; end if;
 if not public.is_workshop_member(j.workshop_id) and not public.is_platform_admin() then raise exception 'Not authorised'; end if;
 select * into b from public.bays where id=p_bay_id and workshop_id=j.workshop_id for update;
 if not found then raise exception 'Bay does not belong to this workshop'; end if;
 if b.status <> 'available' then raise exception 'Bay is not available'; end if;
 if j.stage='delivered' then raise exception 'Delivered job cannot be allocated'; end if;
 if exists(select 1 from public.job_cards where bay_id=p_bay_id and stage<>'delivered' and id<>p_job_id) then raise exception 'Bay already has an active job'; end if;
 update public.job_cards set bay_id=p_bay_id,updated_at=now() where id=p_job_id returning * into j;
 update public.bays set status='occupied' where id=p_bay_id;
 return j;
end $$;

create or replace function public.advance_job_stage(p_job_id uuid,p_new_stage public.job_stage,p_note text default null)
returns public.job_cards language plpgsql security invoker set search_path=public
as $$
declare j public.job_cards; old_stage public.job_stage;
begin
 select * into j from public.job_cards where id=p_job_id for update;
 if not found then raise exception 'Job card not found'; end if;
 if not public.is_workshop_member(j.workshop_id) and not public.is_platform_admin() then raise exception 'Not authorised'; end if;
 old_stage := j.stage;
 if old_stage='delivered' then raise exception 'Job already delivered'; end if;
 if p_new_stage='check_in' then raise exception 'Cannot move a job back to check-in'; end if;
 update public.job_cards set stage=p_new_stage,updated_at=now(),delivered_at=case when p_new_stage='delivered' then now() else delivered_at end
 where id=p_job_id returning * into j;
 insert into public.job_status_history(job_id,previous_stage,new_stage,changed_by,note)
 values(p_job_id,old_stage,p_new_stage,auth.uid(),p_note);
 if p_new_stage='delivered' and j.bay_id is not null then
  update public.bays set status='available' where id=j.bay_id and workshop_id=j.workshop_id;
  update public.job_cards set bay_id=null where id=p_job_id returning * into j;
 end if;
 return j;
end $$;

create or replace function public.create_booking_request(
 p_vehicle_id uuid,p_requested_service text,p_preferred_at timestamptz default null,
 p_workshop_id uuid default null,p_service_id uuid default null,p_customer_notes text default null
) returns public.bookings language plpgsql security invoker set search_path=public
as $$
declare v public.vehicles; b public.bookings; code text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into v from public.vehicles where id=p_vehicle_id and owner_id=auth.uid();
 if not found then raise exception 'Vehicle not found or not owned by current user'; end if;
 code := 'QB-'||to_char(now(),'YYYY')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
 insert into public.bookings(booking_code,customer_id,vehicle_id,workshop_id,service_id,requested_service,preferred_at,customer_notes)
 values(code,auth.uid(),p_vehicle_id,p_workshop_id,p_service_id,p_requested_service,p_preferred_at,p_customer_notes)
 returning * into b;
 return b;
end $$;
grant execute on function public.allocate_bay(uuid,uuid) to authenticated;
grant execute on function public.advance_job_stage(uuid,public.job_stage,text) to authenticated;
grant execute on function public.create_booking_request(uuid,text,timestamptz,uuid,uuid,text) to authenticated;
