-- KWATE / InsForge — Read-only schema smoke checks

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'categories', 'posts', 'post_media', 'audit_events')
order by table_name;

select tablename as table_name, rowsecurity as row_security
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'categories', 'posts', 'post_media', 'audit_events')
order by tablename;

select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'categories', 'posts', 'post_media', 'audit_events')
order by tablename, policyname;

select slug, name, enabled, sort_order
from public.categories
order by sort_order;

select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'categories', 'posts', 'post_media', 'audit_events')
order by tablename, indexname;
