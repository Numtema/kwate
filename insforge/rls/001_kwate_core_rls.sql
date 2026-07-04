-- KWATE / InsForge — Core RLS policies
-- Version: 001-rls
-- Risk: high (authorization)
-- Execution order: 2/3
-- Depends on: migrations/001_kwate_core_schema.sql

begin;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.audit_events enable row level security;

-- PROFILES -------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = user_id and deleted_at is null and is_blocked = false)
with check (auth.uid() = user_id);

-- No client DELETE policy: account/profile deletion must use an approved server flow.

-- CATEGORIES -----------------------------------------------------------------
drop policy if exists categories_select_enabled on public.categories;
create policy categories_select_enabled
on public.categories
for select
using (enabled = true);

-- No client INSERT/UPDATE/DELETE policy: category administration is server-only.

-- POSTS ----------------------------------------------------------------------
drop policy if exists posts_select_public_or_owner on public.posts;
create policy posts_select_public_or_owner
on public.posts
for select
using (
  (status = 'active' and deleted_at is null)
  or auth.uid() = owner_id
);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own
on public.posts
for insert
with check (
  auth.uid() = owner_id
  and status in ('draft', 'active', 'paused')
  and deleted_at is null
  and (type <> 'echange' or contact_locked = false)
);

drop policy if exists posts_update_own on public.posts;
create policy posts_update_own
on public.posts
for update
using (
  auth.uid() = owner_id
  and status <> 'blocked'
  and deleted_at is null
)
with check (
  auth.uid() = owner_id
  and status in ('draft', 'active', 'paused', 'sold', 'deleted')
  and status <> 'blocked'
  and (type <> 'echange' or contact_locked = false)
);

-- No client DELETE policy: product deletion is a soft-delete update.

-- POST MEDIA -----------------------------------------------------------------
drop policy if exists post_media_select_public_or_owner on public.post_media;
create policy post_media_select_public_or_owner
on public.post_media
for select
using (
  auth.uid() = owner_id
  or exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.status = 'active'
      and p.deleted_at is null
  )
);

drop policy if exists post_media_insert_owned_post on public.post_media;
create policy post_media_insert_owned_post
on public.post_media
for insert
with check (
  auth.uid() = owner_id
  and bucket = 'public-post-media'
  and exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.owner_id = auth.uid()
      and p.deleted_at is null
      and p.status <> 'blocked'
  )
);

drop policy if exists post_media_delete_own on public.post_media;
create policy post_media_delete_own
on public.post_media
for delete
using (
  auth.uid() = owner_id
  and exists (
    select 1
    from public.posts p
    where p.id = post_media.post_id
      and p.owner_id = auth.uid()
      and p.status <> 'blocked'
  )
);

-- AUDIT EVENTS ---------------------------------------------------------------
-- Intentionally no client policies. Writes and reads are server/admin only.

-- The view contains public-safe columns only. Keep direct profile reads owner-only.
revoke all on public.profiles from public;
grant select on public.profiles to public;
grant insert (user_id, display_name, avatar_url, zone, phone) on public.profiles to public;
grant update (display_name, avatar_url, zone, phone) on public.profiles to public;
grant select on public.public_profiles to public;
grant select on public.categories to public;
grant select on public.posts to public;
grant insert (owner_id, category_id, type, title, description, price_label, zone, status, contact_locked, published_at) on public.posts to public;
grant update (category_id, type, title, description, price_label, zone, status, contact_locked, published_at, deleted_at) on public.posts to public;
grant select on public.post_media to public;
grant insert (post_id, owner_id, bucket, object_key, public_url, mime_type, size_bytes, width, height, sort_order) on public.post_media to public;
grant delete on public.post_media to public;
revoke all on public.audit_events from public;

commit;
