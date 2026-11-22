-- Move the relocatable btree_gist extension out of the exposed public schema.
create schema if not exists extensions;
alter extension btree_gist set schema extensions;
