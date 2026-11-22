-- Customer estimate decisions stay in-app; no messages are sent.
create or replace function private.respond_to_estimate(
 p_estimate_id uuid,
 p_response text
) returns public.estimates
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
 v_estimate public.estimates;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_response not in ('approved','changes_requested') then
  raise exception 'Unsupported estimate response';
 end if;
 select e.* into v_estimate
 from public.estimates e
 join public.job_cards j on j.id=e.job_id
 where e.id=p_estimate_id
   and j.customer_id=auth.uid()
   and e.status='sent'
 for update of e;
 if not found then raise exception 'Estimate is not available for this customer response'; end if;
 update public.estimates
  set status=p_response,customer_response_at=now()
  where id=p_estimate_id
  returning * into v_estimate;
 return v_estimate;
end
$$;
revoke execute on function private.respond_to_estimate(uuid,text) from public,anon;
grant execute on function private.respond_to_estimate(uuid,text) to authenticated;

create or replace function public.respond_to_estimate(
 p_estimate_id uuid,
 p_response text
) returns public.estimates
language sql
security invoker
set search_path=public,private,pg_temp
as $$
 select private.respond_to_estimate(p_estimate_id,p_response)
$$;
revoke execute on function public.respond_to_estimate(uuid,text) from public,anon,authenticated;
grant execute on function public.respond_to_estimate(uuid,text) to authenticated;
