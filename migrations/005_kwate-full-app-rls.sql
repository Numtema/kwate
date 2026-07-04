-- KWATE / InsForge — Full application RLS
-- Version: 002-rls
-- Depends on: migrations/002_kwate_full_app.sql


alter table public.saved_posts enable row level security;
alter table public.reports enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.billing_entitlements enable row level security;
alter table public.contact_unlocks enable row level security;

create policy saved_posts_select_own on public.saved_posts for select using (auth.uid() = user_id);
create policy saved_posts_insert_own on public.saved_posts for insert with check (auth.uid() = user_id);
create policy saved_posts_delete_own on public.saved_posts for delete using (auth.uid() = user_id);

create policy reports_select_own on public.reports for select using (auth.uid() = reporter_id);
create policy reports_insert_own on public.reports for insert with check (auth.uid() = reporter_id);

create policy conversations_select_member on public.conversations
for select using (public.kwate_is_conversation_member(id));

create policy conversation_members_select_member on public.conversation_members
for select using (public.kwate_is_conversation_member(conversation_id));

create policy messages_select_member on public.messages
for select using (public.kwate_is_conversation_member(conversation_id));

create policy messages_insert_member on public.messages
for insert with check (
  auth.uid() = sender_id
  and public.kwate_is_conversation_member(conversation_id)
);

create policy entitlements_select_own on public.billing_entitlements
for select using (auth.uid() = user_id);

create policy contact_unlocks_select_own on public.contact_unlocks
for select using (auth.uid() = user_id);

revoke all on public.saved_posts from public;
grant select, insert, delete on public.saved_posts to public;
revoke all on public.reports from public;
grant select on public.reports to public;
grant insert (reporter_id, post_id, reason, details) on public.reports to public;
revoke all on public.conversations from public;
grant select on public.conversations to public;
revoke all on public.conversation_members from public;
grant select on public.conversation_members to public;
revoke all on public.messages from public;
grant select on public.messages to public;
grant insert (conversation_id, sender_id, body) on public.messages to public;
revoke all on public.billing_entitlements from public;
grant select on public.billing_entitlements to public;
revoke all on public.contact_unlocks from public;
grant select on public.contact_unlocks to public;

-- Profile users may update bio in addition to the previously approved columns.
grant update (display_name, avatar_url, zone, phone, bio) on public.profiles to public;

