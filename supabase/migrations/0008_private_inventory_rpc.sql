-- Keep the privileged stock-ledger implementation in the private schema.
-- The public PostgREST RPC remains SECURITY INVOKER and delegates to a private function.
create or replace function private.record_inventory_movement(
 p_item_id uuid,
 p_movement_type text,
 p_quantity numeric,
 p_reference text default null,
 p_notes text default null
) returns public.inventory_movements
language plpgsql
security definer
set search_path=public,private,pg_temp
as $$
declare
 v_item public.inventory_items;
 v_delta numeric(12,2);
 v_movement public.inventory_movements;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_movement_type not in ('stock_in','stock_out','adjustment') then
  raise exception 'Unsupported stock movement type';
 end if;
 if p_quantity is null or p_quantity=0 then raise exception 'Quantity must be non-zero'; end if;
 select * into v_item from public.inventory_items where id=p_item_id for update;
 if not found then raise exception 'Inventory item not found'; end if;
 if not private.is_workshop_member(v_item.workshop_id) and not private.is_platform_admin() then
  raise exception 'Not authorised for this workshop';
 end if;
 v_delta := case when p_movement_type='stock_in' then abs(p_quantity)
                 when p_movement_type='stock_out' then -abs(p_quantity)
                 else p_quantity end;
 if v_item.quantity_on_hand + v_delta < 0 then raise exception 'Insufficient stock for this movement'; end if;
 update public.inventory_items set quantity_on_hand=quantity_on_hand+v_delta,updated_at=now() where id=p_item_id;
 insert into public.inventory_movements(workshop_id,item_id,movement_type,quantity_delta,reference,notes,created_by)
 values(v_item.workshop_id,p_item_id,p_movement_type,v_delta,p_reference,p_notes,auth.uid())
 returning * into v_movement;
 return v_movement;
end
$$;
revoke execute on function private.record_inventory_movement(uuid,text,numeric,text,text) from public, anon;
grant execute on function private.record_inventory_movement(uuid,text,numeric,text,text) to authenticated;

create or replace function public.record_inventory_movement(
 p_item_id uuid,
 p_movement_type text,
 p_quantity numeric,
 p_reference text default null,
 p_notes text default null
) returns public.inventory_movements
language sql
security invoker
set search_path=public,private,pg_temp
as $$
 select private.record_inventory_movement(p_item_id,p_movement_type,p_quantity,p_reference,p_notes)
$$;
revoke execute on function public.record_inventory_movement(uuid,text,numeric,text,text) from public, anon, authenticated;
grant execute on function public.record_inventory_movement(uuid,text,numeric,text,text) to authenticated;
