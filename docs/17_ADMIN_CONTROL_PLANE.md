# KWATE — Admin Control Plane

## Objectif

Centraliser toutes les opérations dangereuses : schéma, tables, users, paiements, storage, moderation.

## Règle absolue

```txt
Aucun endpoint Admin InsForge ne doit être appelé depuis un composant client.
Aucune clé admin ne doit commencer par NEXT_PUBLIC_*.
Aucune suppression critique sans approval explicite.
Aucune modification de schéma sans docs + migration + audit.
```

## Opérations admin KWATE

| Opération | Risque | Approval | Audit |
|---|---:|---:|---:|
| admin.database.tables.list | low | no | optional |
| admin.database.table.create | high | yes | yes |
| admin.database.schema.update | high | yes | yes |
| admin.database.migration.execute | critical | yes | yes |
| admin.storage.bucket.create | high | yes | yes |
| admin.storage.bucket.visibility_change | critical | yes | yes |
| admin.post.block | high | no/yes prod policy | yes |
| admin.user.block | high | yes | yes |
| admin.payment.sync | medium | no | yes |
| admin.secret.create | critical | yes | yes |

## Approval gate

Avant toute opération high/critical :

1. Besoin produit validé.
2. Ressources concernées listées.
3. Impact data compris.
4. Rollback défini.
5. RLS vérifiée.
6. Backup requis si production.
7. Audit log prévu.
8. Docs/registries mis à jour.
