# KWATE — Admin Operation Runbook

## Format obligatoire pour une opération admin

```txt
1. Intention
2. Environnement: local/test/live
3. Opération registry
4. Risque: low/medium/high/critical
5. Données touchées
6. Payload ou migration
7. Approval nécessaire ?
8. Rollback
9. Audit event
10. Tests
11. Verdict PASS/BLOCK
```

## Exemple : créer table `posts`

```txt
Intention: persister les annonces KWATE.
Risque: high.
Approval: oui si production.
Données touchées: nouvelle table posts.
Rollback: drop table seulement si vide ou migration inverse approuvée.
Audit: admin.database.table_created.
Docs à mettre à jour: 05_DATABASE_SCHEMA, 06_RLS, ACTION_REGISTRY, TABLE_OWNERSHIP.
```

## BLOCK immédiat si

- Une clé admin est utilisée côté client.
- Une opération hard delete est proposée sans backup.
- Un webhook paiement est traité sans signature.
- Une table privée est créée sans stratégie RLS.
- Une mutation utilisateur contourne les permissions.
