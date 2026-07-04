# Manuel opératoire IA

## Sources de vérité

1. `AGENTS.md` pour connecter InsForge et Vercel.
2. `docs/04_DOMAIN_MODEL.md` et `docs/05_DATABASE_SCHEMA.md`.
3. `docs/06_RLS_AND_PERMISSIONS.md`.
4. `ai/*REGISTRY.yml`.
5. `insforge/migrations` et `insforge/rls`.

## Règles

- Ne jamais ajouter de données métier fictives ou de provider mock.
- Toute mutation doit être validée et protégée par RLS.
- Toute suppression d'annonce est un soft-delete.
- Les clés admin et Stripe sont server-only.
- Le paiement n'accorde des droits qu'après webhook vérifié.
- Mettre à jour docs, registres et tests à chaque changement.
