# KWATE — Étape 3 : migrations MVP InsForge

## Périmètre livré

Cette étape prépare les cinq ressources MVP :

- `profiles` ;
- `categories` ;
- `posts` ;
- `post_media` ;
- `audit_events`.

Elle ajoute aussi la vue publique sûre `public_profiles`, qui exclut le téléphone et les champs de modération.

## Ordre d’exécution

```txt
1. insforge/migrations/001_kwate_core_schema.sql
2. insforge/rls/001_kwate_core_rls.sql
3. insforge/seeds/001_kwate_categories.sql
4. insforge/checks/001_kwate_core_smoke.sql (lecture seule)
```

Chaque fichier doit être envoyé comme migration distincte à l’Admin API InsForge. Ne pas concaténer ou rejouer un fichier déjà enregistré sous la même version.

## Sécurité

- Les tables métier ont RLS activée.
- `auth.uid()` est la source d’identité des policies utilisateur.
- Les profils publics passent par `public_profiles`.
- Les annonces sont supprimées par `status = deleted` + `deleted_at`, pas par `DELETE`.
- `audit_events` n’a aucune policy client : lecture admin et écriture serveur uniquement.
- Le rollback est destructif et reste bloqué sans backup + approbation explicite.

## Seed

Trois catégories stables et idempotentes sont créées :

```txt
service
echange
vente
```

Les slugs techniques restent `service`, `echange`, `vente` afin de correspondre au frontend actuel.

## Vérifications attendues

Le smoke test vérifie :

- présence des cinq tables ;
- activation RLS ;
- liste des policies ;
- présence des catégories ;
- création des index.

## Limite volontaire

Les migrations sont préparées mais **pas exécutées** dans une instance distante depuis ce livrable. L’exécution nécessite les identifiants serveur InsForge et une approbation explicite de l’opération admin.

## Génération du payload Admin API

```bash
npm run migration:payload -- <sql-file> <version> <name>
```

Le script imprime le JSON à transmettre à `POST /api/database/migrations`. Il n’effectue aucune requête réseau et ne lit aucune clé secrète.
