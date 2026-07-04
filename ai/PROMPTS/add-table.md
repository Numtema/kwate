# Prompt — Add InsForge Table

Tu dois ajouter ou modifier une table InsForge pour KWATE.

Avant toute action :

1. Lis `docs/05_DATABASE_SCHEMA.md`.
2. Lis `docs/06_RLS_AND_PERMISSIONS.md`.
3. Lis `ai/TABLE_OWNERSHIP.yml`.
4. Lis `ai/ADMIN_OPERATION_REGISTRY.yml`.
5. Lis `ai/APPROVAL_GATES.yml`.

Table demandée : `{{TABLE_NAME}}`

Contraintes :

- Définir owner.
- Définir risk.
- Définir RLS.
- Préférer migration versionnée.
- Ajouter rollback.
- Ajouter audit si action admin.

Retour attendu :

1. Intention.
2. Schéma.
3. RLS.
4. Migration SQL.
5. Rollback.
6. Docs/registries à mettre à jour.
7. Tests.
8. Verdict PASS/BLOCK.
