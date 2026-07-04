# KWATE — RLS et permissions MVP

## Source exécutable

```txt
insforge/rls/001_kwate_core_rls.sql
```

L’identité utilisateur est résolue avec `auth.uid()`.

## Matrice appliquée

| Ressource | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| public_profiles | public, colonnes sûres | non | non | non |
| profiles | propriétaire | propriétaire | propriétaire non bloqué | non |
| categories | lignes `enabled = true` | admin | admin | admin |
| posts | active publique ou propriétaire | propriétaire | propriétaire, non bloqué | non, soft delete |
| post_media | média d’annonce active ou propriétaire | propriétaire de l’annonce | non | propriétaire de l’annonce |
| audit_events | admin | serveur | interdit | interdit |

## Policies nommées

```txt
profiles_select_own
profiles_insert_own
profiles_update_own
categories_select_enabled
posts_select_public_or_owner
posts_insert_own
posts_update_own
post_media_select_public_or_owner
post_media_insert_owned_post
post_media_delete_own
```

## Protection des colonnes

Les grants client sont limités par colonnes :

- un utilisateur ne peut pas écrire `phone_verified`, `rating_average`, `rating_count` ou `is_blocked` ;
- un utilisateur ne peut pas changer `owner_id` lors d’une mise à jour d’annonce ;
- le statut `blocked` ne peut pas être défini par la policy propriétaire ;
- aucune permission client n’est accordée à `audit_events`.

## Profil public

La table `profiles` contient du privé. Les pages publiques doivent requêter uniquement :

```txt
public_profiles
```

Cette vue ne retourne pas le numéro de téléphone.

## Soft delete des annonces

```txt
status = deleted
+ deleted_at = timestamp
```

Aucune policy `DELETE` n’est créée sur `posts`.

## Gates critiques

- Une migration de schéma ou RLS est `high risk` et demande approbation.
- Le rollback est destructif et demande backup + approbation explicite.
- La clé admin ne doit jamais être utilisée pour une action utilisateur normale.
- Les tests de non-propriétaire sont obligatoires avant production.
