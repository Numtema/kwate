-- KWATE / InsForge — Fix anonymous read grants for public feed
-- Version: 007
-- Problem: anon role cannot read posts/categories, breaking the public feed for unauthenticated visitors.

-- Grant read access to the anonymous role for public data
grant select on public.posts to anon;
grant select on public.categories to anon;
grant select on public.post_media to anon;
grant select on public.public_profiles to anon;

-- Ensure the authenticated role also has the necessary grants (defensive)
grant select on public.posts to authenticated;
grant select on public.categories to authenticated;
grant select on public.post_media to authenticated;
grant select on public.public_profiles to authenticated;
grant select on public.profiles to authenticated;
