-- KWATE / InsForge — DESTRUCTIVE rollback for step 3
-- CRITICAL: execute only with explicit approval and a verified backup.

begin;

drop view if exists public.public_profiles;
drop table if exists public.audit_events cascade;
drop table if exists public.post_media cascade;
drop table if exists public.posts cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;
drop function if exists public.kwate_set_updated_at() cascade;

commit;
