-- Read-only structural verification for KWATE V7 media lifecycle.
select
  to_regprocedure('public.kwate_publish_post(uuid,integer)') is not null as publish_function_exists,
  to_regprocedure('public.kwate_abort_post_draft(uuid)') is not null as abort_function_exists,
  to_regprocedure('public.kwate_set_post_status(uuid,character varying)') is not null as status_function_exists,
  to_regprocedure('public.kwate_delete_post(uuid)') is not null as delete_function_exists,
  exists (
    select 1 from pg_trigger
    where tgname = 'trg_post_media_validate_insert' and not tgisinternal
  ) as media_validation_trigger_exists,
  not exists (
    select 1 from information_schema.column_privileges
    where grantee = 'PUBLIC' and table_schema = 'public' and table_name = 'posts'
      and column_name = 'status' and privilege_type = 'INSERT'
  ) as direct_status_insert_blocked,
  not exists (
    select 1 from information_schema.column_privileges
    where grantee = 'PUBLIC' and table_schema = 'public' and table_name = 'posts'
      and column_name = 'status' and privilege_type = 'UPDATE'
  ) as direct_status_update_blocked,
  not exists (
    select 1 from information_schema.column_privileges
    where grantee = 'PUBLIC' and table_schema = 'public' and table_name = 'posts'
      and column_name = 'published_at' and privilege_type = 'UPDATE'
  ) as direct_publish_timestamp_update_blocked,
  not exists (
    select 1 from information_schema.column_privileges
    where grantee = 'PUBLIC' and table_schema = 'public' and table_name = 'posts'
      and column_name = 'deleted_at' and privilege_type = 'UPDATE'
  ) as direct_delete_timestamp_update_blocked;
