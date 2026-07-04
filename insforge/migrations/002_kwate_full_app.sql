-- KWATE / InsForge — Full application schema
-- Version: 002
-- Depends on: 001_kwate_core_schema.sql
-- Adds profiles bio, favorites, reports, conversations, messages, entitlements,
-- contact unlocks and secure RPC flows.

begin;

alter table public.profiles
  add column if not exists bio varchar(500) null;

create table if not exists public.saved_posts (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  reason varchar(64) not null,
  details varchar(1000) null,
  status varchar(24) not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_reason_valid check (reason in ('spam','fraud','prohibited','abuse','duplicate','other')),
  constraint reports_status_valid check (status in ('open','reviewing','resolved','rejected')),
  constraint reports_unique_open unique (reporter_id, post_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid null references public.posts(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz null,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body varchar(4000) not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint messages_body_length check (char_length(trim(body)) between 1 and 4000)
);

create table if not exists public.billing_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_key varchar(80) not null,
  status varchar(24) not null default 'active',
  source varchar(40) not null default 'stripe',
  source_reference varchar(255) null,
  valid_from timestamptz not null default now(),
  valid_until timestamptz null,
  usage_limit integer null,
  usage_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_entitlements_status_valid check (status in ('active','expired','revoked','pending')),
  constraint billing_entitlements_usage_valid check (usage_limit is null or (usage_limit > 0 and usage_count between 0 and usage_limit)),
  constraint billing_entitlements_key_format check (entitlement_key ~ '^[a-z0-9_]+$'),
  constraint billing_entitlements_source_reference_unique unique (source, source_reference)
);

create table if not exists public.contact_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  source varchar(40) not null default 'pass',
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint contact_unlocks_unique unique (user_id, post_id)
);

create index if not exists idx_saved_posts_user_created on public.saved_posts(user_id, created_at desc);
create index if not exists idx_reports_status_created on public.reports(status, created_at desc);
create index if not exists idx_conversation_members_user on public.conversation_members(user_id, created_at desc);
create index if not exists idx_conversations_last_message on public.conversations(last_message_at desc nulls last, created_at desc);
create index if not exists idx_messages_conversation_created on public.messages(conversation_id, created_at asc) where deleted_at is null;
create index if not exists idx_entitlements_user_active on public.billing_entitlements(user_id, entitlement_key, valid_until) where status = 'active';
create index if not exists idx_contact_unlocks_user_post on public.contact_unlocks(user_id, post_id, expires_at);

create trigger trg_reports_updated_at
before update on public.reports
for each row execute function public.kwate_set_updated_at();

create trigger trg_conversations_updated_at
before update on public.conversations
for each row execute function public.kwate_set_updated_at();

create trigger trg_billing_entitlements_updated_at
before update on public.billing_entitlements
for each row execute function public.kwate_set_updated_at();

-- Keep conversation ordering in sync with new messages.
create or replace function public.kwate_touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set last_message_at = new.created_at,
      updated_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger trg_messages_touch_conversation
after insert on public.messages
for each row execute function public.kwate_touch_conversation();

-- RLS-safe membership helper. SECURITY DEFINER avoids recursive policies on conversation_members.
create or replace function public.kwate_is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = p_conversation_id and user_id = auth.uid()
  );
$$;

-- Securely start or reuse a two-party conversation for one post.
create or replace function public.kwate_start_conversation(p_post_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_conversation uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select owner_id into v_owner
  from public.posts
  where id = p_post_id and status = 'active' and deleted_at is null;

  if v_owner is null then
    raise exception 'POST_NOT_FOUND';
  end if;

  if v_owner = v_actor then
    raise exception 'CANNOT_MESSAGE_SELF';
  end if;

  select c.id into v_conversation
  from public.conversations c
  where c.post_id = p_post_id
    and exists (select 1 from public.conversation_members m where m.conversation_id = c.id and m.user_id = v_actor)
    and exists (select 1 from public.conversation_members m where m.conversation_id = c.id and m.user_id = v_owner)
  limit 1;

  if v_conversation is null then
    insert into public.conversations (post_id, created_by)
    values (p_post_id, v_actor)
    returning id into v_conversation;

    insert into public.conversation_members (conversation_id, user_id)
    values (v_conversation, v_actor), (v_conversation, v_owner);
  end if;

  return v_conversation;
end;
$$;

-- Return a post owner's contact only after authorization has been evaluated.
create or replace function public.kwate_get_post_contact(p_post_id uuid)
returns table(display_name text, phone text, phone_verified boolean)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor uuid := auth.uid();
  v_owner uuid;
  v_type varchar(16);
  v_allowed boolean := false;
  v_entitlement_id uuid;
  v_unlock_id uuid;
begin
  if v_actor is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select owner_id, type into v_owner, v_type
  from public.posts
  where id = p_post_id and status = 'active' and deleted_at is null;

  if v_owner is null then
    raise exception 'POST_NOT_FOUND';
  end if;

  v_allowed := v_actor = v_owner or v_type = 'echange';

  if not v_allowed then
    select exists (
      select 1 from public.contact_unlocks u
      where u.user_id = v_actor
        and u.post_id = p_post_id
        and (u.expires_at is null or u.expires_at > now())
    ) into v_allowed;
  end if;

  if not v_allowed then
    select e.id into v_entitlement_id
    from public.billing_entitlements e
    where e.user_id = v_actor
      and e.status = 'active'
      and e.entitlement_key in ('contact_pass','kwate_pro')
      and e.valid_from <= now()
      and (e.valid_until is null or e.valid_until > now())
      and (e.usage_limit is null or e.usage_count < e.usage_limit)
    order by e.valid_until nulls last, e.created_at
    limit 1;
    v_allowed := v_entitlement_id is not null;
  end if;

  if not v_allowed then
    raise exception 'CONTACT_LOCKED';
  end if;

  insert into public.contact_unlocks (user_id, post_id, source)
  values (v_actor, p_post_id, case when v_type = 'echange' then 'exchange' when v_actor = v_owner then 'owner' else 'pass' end)
  on conflict (user_id, post_id) do nothing
  returning id into v_unlock_id;

  if v_unlock_id is not null and v_entitlement_id is not null then
    update public.billing_entitlements
    set usage_count = usage_count + 1
    where id = v_entitlement_id and (usage_limit is null or usage_count < usage_limit);
  end if;

  return query
  select p.display_name::text, p.phone::text, p.phone_verified
  from public.profiles p
  where p.user_id = v_owner and p.deleted_at is null and p.is_blocked = false;
end;
$$;

create or replace function public.kwate_mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update public.conversation_members
  set last_read_at = now()
  where conversation_id = p_conversation_id and user_id = auth.uid();

  if not found then
    raise exception 'CONVERSATION_FORBIDDEN';
  end if;
end;
$$;

revoke all on function public.kwate_is_conversation_member(uuid) from public;
grant execute on function public.kwate_is_conversation_member(uuid) to public;
revoke all on function public.kwate_start_conversation(uuid) from public;
revoke all on function public.kwate_get_post_contact(uuid) from public;
revoke all on function public.kwate_mark_conversation_read(uuid) from public;
grant execute on function public.kwate_start_conversation(uuid) to public;
grant execute on function public.kwate_get_post_contact(uuid) to public;
grant execute on function public.kwate_mark_conversation_read(uuid) to public;

commit;
