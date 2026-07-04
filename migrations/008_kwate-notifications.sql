-- KWATE / InsForge — Notifications table + realtime triggers
-- Version: 008
-- Creates in-app notification system with PG triggers for new posts and new messages.

-- ─── TABLE ───────────────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type varchar(40) not null,
  title text not null,
  body text not null,
  link text null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_type_valid check (
    type in ('new_post', 'new_message', 'post_saved')
  )
);

create index if not exists idx_notifications_user_unread
  on public.notifications(user_id, read, created_at desc);

create index if not exists idx_notifications_user_created
  on public.notifications(user_id, created_at desc);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.notifications from public;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

-- ─── TRIGGER: new_post ───────────────────────────────────────────────────────
-- When a post becomes active, notify all OTHER users who have a profile.

create or replace function public.kwate_notify_new_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_name text;
  v_post_type text;
  v_type_label text;
begin
  -- Only trigger when status becomes 'active'
  if NEW.status <> 'active' then
    return NEW;
  end if;
  if OLD.status = 'active' then
    return NEW;
  end if;

  -- Get author display name
  select display_name into v_author_name
    from public.profiles
   where user_id = NEW.owner_id
   limit 1;

  v_author_name := coalesce(v_author_name, 'Quelqu''un');

  -- Human-readable type label
  v_type_label := case NEW.type
    when 'service' then 'Service'
    when 'echange' then 'Échange'
    when 'vente'   then 'Vente'
    else NEW.type
  end;

  -- Insert notification for every authenticated user except the author
  insert into public.notifications (user_id, type, title, body, link)
  select
    p.user_id,
    'new_post',
    v_type_label || ' : ' || left(NEW.title, 60),
    v_author_name || ' vient de publier une nouvelle annonce.',
    '/post/' || NEW.id
  from public.profiles p
  where p.user_id <> NEW.owner_id
    and p.deleted_at is null
    and p.is_blocked = false;

  return NEW;
end;
$$;

drop trigger if exists trg_notify_new_post on public.posts;
create trigger trg_notify_new_post
  after insert or update of status
  on public.posts
  for each row
  execute function public.kwate_notify_new_post();

-- ─── TRIGGER: new_message ────────────────────────────────────────────────────
-- When a message is inserted, notify the OTHER members of the conversation.

create or replace function public.kwate_notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender_name text;
  v_preview text;
begin
  -- Get sender display name
  select display_name into v_sender_name
    from public.profiles
   where user_id = NEW.sender_id
   limit 1;

  v_sender_name := coalesce(v_sender_name, 'Quelqu''un');
  v_preview := left(NEW.body, 80);

  -- Insert notification for all conversation members except the sender
  insert into public.notifications (user_id, type, title, body, link)
  select
    cm.user_id,
    'new_message',
    'Message de ' || v_sender_name,
    v_preview,
    '/messages'
  from public.conversation_members cm
  where cm.conversation_id = NEW.conversation_id
    and cm.user_id <> NEW.sender_id;

  return NEW;
end;
$$;

drop trigger if exists trg_notify_new_message on public.messages;
create trigger trg_notify_new_message
  after insert
  on public.messages
  for each row
  execute function public.kwate_notify_new_message();

-- ─── CLEANUP: auto-delete old notifications (keep last 200 per user) ──────────

create or replace function public.kwate_prune_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.notifications
  where user_id = NEW.user_id
    and id not in (
      select id from public.notifications
       where user_id = NEW.user_id
       order by created_at desc
       limit 200
    );
  return NEW;
end;
$$;

drop trigger if exists trg_prune_notifications on public.notifications;
create trigger trg_prune_notifications
  after insert on public.notifications
  for each row
  execute function public.kwate_prune_notifications();
