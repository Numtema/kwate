-- Read-only smoke checks after Step 5 provisioning.
select to_regclass('public.saved_posts') as saved_posts,
       to_regclass('public.reports') as reports,
       to_regclass('public.conversations') as conversations,
       to_regclass('public.conversation_members') as conversation_members,
       to_regclass('public.messages') as messages,
       to_regclass('public.billing_entitlements') as billing_entitlements,
       to_regclass('public.contact_unlocks') as contact_unlocks;

select proname, prosecdef
from pg_proc
where proname in (
  'kwate_start_conversation',
  'kwate_get_post_contact',
  'kwate_mark_conversation_read',
  'kwate_is_conversation_member'
)
order by proname;

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('saved_posts','reports','conversations','conversation_members','messages','billing_entitlements','contact_unlocks')
order by tablename, policyname;
