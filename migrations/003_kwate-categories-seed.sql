-- KWATE / InsForge — Idempotent MVP category seed
-- Version: 001-seed
-- Execution order: 3/3


insert into public.categories (id, slug, name, description, icon, sort_order, enabled)
values
  ('00000000-0000-4000-8000-000000000001', 'service', 'Service', 'Prestations et savoir-faire proposés localement.', 'Paintbrush', 10, true),
  ('00000000-0000-4000-8000-000000000002', 'echange', 'Échange', 'Échanges de biens ou denrées entre particuliers.', 'Repeat2', 20, true),
  ('00000000-0000-4000-8000-000000000003', 'vente', 'Vente', 'Produits et créations proposés à la vente.', 'ShoppingBasket', 30, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  enabled = excluded.enabled,
  updated_at = now();

