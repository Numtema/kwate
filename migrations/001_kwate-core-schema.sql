-- KWATE / InsForge — Core schema
-- Version: 001
-- Risk: high (schema creation)
-- Execution order: 1/3
-- This file creates structures only. Execute RLS and seeds separately.


create extension if not exists pgcrypto;

create or replace function public.kwate_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name varchar(80) not null,
  avatar_url text null,
  zone varchar(120) null,
  phone varchar(32) null,
  phone_verified boolean not null default false,
  rating_average numeric(3,2) null,
  rating_count integer not null default 0,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint profiles_display_name_length check (char_length(trim(display_name)) between 2 and 80),
  constraint profiles_rating_average_range check (rating_average is null or rating_average between 0 and 5),
  constraint profiles_rating_count_nonnegative check (rating_count >= 0)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug varchar(64) not null unique,
  name varchar(80) not null,
  description text null,
  icon varchar(80) null,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint categories_sort_order_nonnegative check (sort_order >= 0)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  type varchar(16) not null,
  title varchar(140) not null,
  description text not null,
  price_label varchar(120) null,
  zone varchar(120) not null,
  status varchar(16) not null default 'draft',
  contact_locked boolean not null default true,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint posts_type_valid check (type in ('service', 'echange', 'vente')),
  constraint posts_status_valid check (status in ('draft', 'active', 'paused', 'sold', 'blocked', 'deleted')),
  constraint posts_title_length check (char_length(trim(title)) between 5 and 140),
  constraint posts_description_length check (char_length(trim(description)) between 20 and 5000),
  constraint posts_zone_length check (char_length(trim(zone)) between 2 and 120),
  constraint posts_exchange_contact_rule check (type <> 'echange' or contact_locked = false),
  constraint posts_deleted_state_consistency check (
    (status = 'deleted' and deleted_at is not null)
    or (status <> 'deleted' and deleted_at is null)
  ),
  constraint posts_published_state_consistency check (
    status <> 'active' or published_at is not null
  )
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  bucket varchar(80) not null default 'public-post-media',
  object_key text not null,
  public_url text null,
  mime_type varchar(120) null,
  size_bytes bigint null,
  width integer null,
  height integer null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint post_media_object_unique unique (bucket, object_key),
  constraint post_media_size_nonnegative check (size_bytes is null or size_bytes >= 0),
  constraint post_media_dimensions_positive check (
    (width is null or width > 0) and (height is null or height > 0)
  ),
  constraint post_media_sort_order_nonnegative check (sort_order >= 0)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null references auth.users(id) on delete set null,
  action varchar(120) not null,
  entity_type varchar(80) null,
  entity_id text null,
  metadata jsonb not null default '{}'::jsonb,
  request_id varchar(120) null,
  ip_hash varchar(128) null,
  user_agent text null,
  created_at timestamptz not null default now(),
  constraint audit_events_action_format check (action ~ '^[a-z0-9_]+(\.[a-z0-9_]+)+$'),
  constraint audit_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_created_at on public.profiles(created_at desc);
create index if not exists idx_profiles_zone on public.profiles(zone) where deleted_at is null;

create index if not exists idx_categories_enabled_sort on public.categories(enabled, sort_order, name);

create index if not exists idx_posts_public_feed on public.posts(published_at desc, created_at desc)
  where status = 'active' and deleted_at is null;
create index if not exists idx_posts_owner_status on public.posts(owner_id, status, created_at desc);
create index if not exists idx_posts_category_status on public.posts(category_id, status, created_at desc);
create index if not exists idx_posts_zone on public.posts(zone) where status = 'active' and deleted_at is null;
create index if not exists idx_posts_search on public.posts using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(zone, ''))
);

create index if not exists idx_post_media_post_sort on public.post_media(post_id, sort_order, created_at);
create index if not exists idx_post_media_owner on public.post_media(owner_id, created_at desc);

create index if not exists idx_audit_events_action_created on public.audit_events(action, created_at desc);
create index if not exists idx_audit_events_actor_created on public.audit_events(actor_user_id, created_at desc);
create index if not exists idx_audit_events_entity on public.audit_events(entity_type, entity_id, created_at desc);
create unique index if not exists uq_audit_events_request_action
  on public.audit_events(request_id, action)
  where request_id is not null;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.kwate_set_updated_at();

create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.kwate_set_updated_at();

create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.kwate_set_updated_at();

-- Public-safe projection: private fields such as phone are deliberately excluded.
create or replace view public.public_profiles
with (security_barrier = true)
as
select
  id,
  user_id,
  display_name,
  avatar_url,
  zone,
  phone_verified,
  rating_average,
  rating_count,
  created_at,
  updated_at
from public.profiles
where deleted_at is null and is_blocked = false;

comment on table public.profiles is 'Private profile source. Public consumers must use public_profiles.';
comment on view public.public_profiles is 'Safe public projection of profiles without phone or moderation fields.';
comment on table public.audit_events is 'Append-only application audit trail. No client RLS policies.';

