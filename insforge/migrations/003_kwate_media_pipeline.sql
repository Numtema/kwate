-- KWATE / InsForge — Production media lifecycle
-- Version: 003
-- Depends on: 001_kwate_core_schema, 001_kwate_core_rls
-- Purpose: enforce media ownership/limits and guard draft -> active publication.

begin;

create or replace function public.kwate_validate_post_media_insert()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_post_owner uuid;
  v_post_status varchar(16);
  v_media_count integer;
begin
  -- Serialize media insertions per post so concurrent uploads cannot exceed five files.
  select owner_id, status
    into v_post_owner, v_post_status
  from public.posts
  where id = new.post_id and deleted_at is null
  for update;

  if v_post_owner is null then
    raise exception 'POST_NOT_FOUND';
  end if;

  if new.owner_id <> v_post_owner then
    raise exception 'MEDIA_OWNER_MISMATCH';
  end if;

  if v_post_status in ('blocked', 'deleted') then
    raise exception 'POST_MEDIA_LOCKED';
  end if;

  select count(*) into v_media_count
  from public.post_media
  where post_id = new.post_id;

  if v_media_count >= 5 then
    raise exception 'POST_MEDIA_LIMIT_REACHED';
  end if;

  if new.bucket <> 'public-post-media' then
    raise exception 'POST_MEDIA_BUCKET_NOT_ALLOWED';
  end if;

  if new.mime_type is null
     or new.mime_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/avif') then
    raise exception 'POST_MEDIA_MIME_NOT_ALLOWED';
  end if;

  if new.size_bytes is null or new.size_bytes <= 0 or new.size_bytes > 10485760 then
    raise exception 'POST_MEDIA_SIZE_INVALID';
  end if;

  if new.public_url is null or length(trim(new.public_url)) = 0 then
    raise exception 'POST_MEDIA_PUBLIC_URL_REQUIRED';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_post_media_validate_insert on public.post_media;
create trigger trg_post_media_validate_insert
before insert on public.post_media
for each row execute function public.kwate_validate_post_media_insert();

create or replace function public.kwate_publish_post(
  p_post_id uuid,
  p_expected_media_count integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_status varchar(16);
  v_deleted_at timestamptz;
  v_total_media_count integer;
  v_valid_media_count integer;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_expected_media_count < 0 or p_expected_media_count > 5 then
    raise exception 'INVALID_MEDIA_COUNT';
  end if;

  select owner_id, status, deleted_at
    into v_owner, v_status, v_deleted_at
  from public.posts
  where id = p_post_id
  for update;

  if v_owner is null then
    raise exception 'POST_NOT_FOUND';
  end if;

  if v_owner <> v_actor then
    raise exception 'POST_FORBIDDEN';
  end if;

  if v_deleted_at is not null or v_status in ('blocked', 'deleted') then
    raise exception 'POST_NOT_PUBLISHABLE';
  end if;

  if v_status not in ('draft', 'paused', 'active') then
    raise exception 'POST_INVALID_PUBLISH_TRANSITION';
  end if;

  select count(*) into v_total_media_count
  from public.post_media
  where post_id = p_post_id;

  select count(*) into v_valid_media_count
  from public.post_media
  where post_id = p_post_id
    and owner_id = v_actor
    and bucket = 'public-post-media'
    and public_url is not null
    and length(trim(public_url)) > 0
    and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')
    and size_bytes > 0
    and size_bytes <= 10485760;

  if v_total_media_count <> p_expected_media_count
     or v_valid_media_count <> p_expected_media_count then
    raise exception 'MEDIA_COUNT_MISMATCH expected %, total %, valid %',
      p_expected_media_count, v_total_media_count, v_valid_media_count;
  end if;

  update public.posts
  set status = 'active',
      published_at = coalesce(published_at, now()),
      deleted_at = null
  where id = p_post_id and owner_id = v_actor;

  return p_post_id;
end;
$$;

create or replace function public.kwate_abort_post_draft(p_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_status varchar(16);
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select status into v_status
  from public.posts
  where id = p_post_id and owner_id = v_actor and deleted_at is null
  for update;

  if v_status is null then
    raise exception 'POST_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_status <> 'draft' then
    raise exception 'ONLY_DRAFT_CAN_BE_ABORTED';
  end if;

  -- Remove metadata so any remaining Storage objects become detectable orphans.
  delete from public.post_media
  where post_id = p_post_id and owner_id = v_actor;

  update public.posts
  set status = 'deleted', deleted_at = now()
  where id = p_post_id and owner_id = v_actor;
end;
$$;

create or replace function public.kwate_set_post_status(
  p_post_id uuid,
  p_target_status varchar(16)
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_current_status varchar(16);
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_target_status not in ('active', 'paused', 'sold') then
    raise exception 'INVALID_TARGET_STATUS';
  end if;

  select status into v_current_status
  from public.posts
  where id = p_post_id and owner_id = v_actor and deleted_at is null
  for update;

  if v_current_status is null then
    raise exception 'POST_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_current_status in ('blocked', 'deleted', 'draft') then
    raise exception 'INVALID_STATUS_TRANSITION';
  end if;

  if v_current_status = 'sold' and p_target_status <> 'sold' then
    raise exception 'SOLD_POST_IS_FINAL';
  end if;

  update public.posts
  set status = p_target_status,
      published_at = case when p_target_status = 'active' then coalesce(published_at, now()) else published_at end
  where id = p_post_id and owner_id = v_actor;

  return p_post_id;
end;
$$;

create or replace function public.kwate_delete_post(p_post_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_status varchar(16);
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select status into v_status
  from public.posts
  where id = p_post_id and owner_id = v_actor and deleted_at is null
  for update;

  if v_status is null then
    raise exception 'POST_NOT_FOUND_OR_FORBIDDEN';
  end if;

  if v_status = 'blocked' then
    raise exception 'BLOCKED_POST_DELETE_REQUIRES_MODERATION';
  end if;

  update public.posts
  set status = 'deleted', deleted_at = now()
  where id = p_post_id and owner_id = v_actor;

  return p_post_id;
end;
$$;

-- Lifecycle columns are server-controlled. Normal clients can still edit content columns.
revoke insert (status, published_at) on public.posts from public;
revoke update (status, published_at, deleted_at) on public.posts from public;

revoke all on function public.kwate_validate_post_media_insert() from public;
revoke all on function public.kwate_publish_post(uuid, integer) from public;
revoke all on function public.kwate_abort_post_draft(uuid) from public;
revoke all on function public.kwate_set_post_status(uuid, varchar) from public;
revoke all on function public.kwate_delete_post(uuid) from public;

grant execute on function public.kwate_publish_post(uuid, integer) to public;
grant execute on function public.kwate_abort_post_draft(uuid) to public;
grant execute on function public.kwate_set_post_status(uuid, varchar) to public;
grant execute on function public.kwate_delete_post(uuid) to public;

comment on function public.kwate_publish_post(uuid, integer) is
  'Owner-only lifecycle gate. Publishes a draft only when all indexed media are valid and their count matches the upload batch.';
comment on function public.kwate_delete_post(uuid) is
  'Owner-only soft delete. Storage cleanup remains an explicit, audited media operation.';

commit;
