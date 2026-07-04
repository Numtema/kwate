-- KWATE V7 media lifecycle rollback.
-- Requires explicit approval. This removes lifecycle guards but preserves user data.
begin;
drop trigger if exists trg_post_media_validate_insert on public.post_media;
drop function if exists public.kwate_validate_post_media_insert();
drop function if exists public.kwate_publish_post(uuid, integer);
drop function if exists public.kwate_abort_post_draft(uuid);
drop function if exists public.kwate_set_post_status(uuid, varchar);
drop function if exists public.kwate_delete_post(uuid);

-- Restore the V6 client-column privileges if the V7 lifecycle is rolled back.
grant insert (status, published_at) on public.posts to public;
grant update (status, published_at, deleted_at) on public.posts to public;
commit;
