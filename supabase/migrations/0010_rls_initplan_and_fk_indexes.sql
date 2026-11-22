-- Add covering indexes for foreign keys without an existing leading-column index.
do $$
declare
 fk record;
 idx_name text;
begin
 for fk in
  select ns.nspname as schema_name, tbl.relname as table_name,
         string_agg(format('%I',att.attname),', ' order by keycol.ord) as column_list,
         string_agg(att.attname,'_' order by keycol.ord) as column_name_key
  from pg_constraint c
  join pg_class tbl on tbl.oid=c.conrelid
  join pg_namespace ns on ns.oid=tbl.relnamespace
  cross join lateral unnest(c.conkey) with ordinality as keycol(attnum,ord)
  join pg_attribute att on att.attrelid=tbl.oid and att.attnum=keycol.attnum
  where c.contype='f' and ns.nspname='public'
  group by ns.nspname,tbl.relname,c.oid
 loop
  idx_name:=left('idx_'||fk.table_name||'_'||fk.column_name_key||'_fk',63);
  execute format('create index if not exists %I on %I.%I (%s)',idx_name,fk.schema_name,fk.table_name,fk.column_list);
 end loop;
end
$$;

-- Evaluate auth.uid() once per statement instead of once per candidate row.
do $$
declare
 p record;
 v_sql text;
begin
 for p in
  select schemaname,tablename,policyname,qual,with_check
  from pg_policies
  where schemaname='public'
    and (coalesce(qual,'') like '%auth.uid()%' or coalesce(with_check,'') like '%auth.uid()%')
 loop
  v_sql:=format('alter policy %I on %I.%I',p.policyname,p.schemaname,p.tablename);
  if p.qual is not null then
   v_sql:=v_sql||format(' using (%s)',replace(p.qual,'auth.uid()','(select auth.uid())'));
  end if;
  if p.with_check is not null then
   v_sql:=v_sql||format(' with check (%s)',replace(p.with_check,'auth.uid()','(select auth.uid())'));
  end if;
  execute v_sql;
 end loop;
end
$$;
