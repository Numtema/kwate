# KWATE — Database Schema MVP

> État : **préparé dans les migrations, non encore exécuté sur une instance distante**.

## Sources exécutables

```txt
insforge/migrations/001_kwate_core_schema.sql
insforge/rls/001_kwate_core_rls.sql
insforge/seeds/001_kwate_categories.sql
```

## `profiles`

Source privée d’un profil utilisateur.

| Colonne | Type | Règle |
|---|---|---|
| id | uuid | PK, généré |
| user_id | uuid | unique, FK `auth.users(id)` |
| display_name | varchar(80) | 2 à 80 caractères |
| avatar_url | text nullable | média public |
| zone | varchar(120) nullable | localisation publique |
| phone | varchar(32) nullable | privé |
| phone_verified | boolean | système |
| rating_average | numeric(3,2) nullable | 0 à 5, système |
| rating_count | integer | >= 0, système |
| is_blocked | boolean | modération, système |
| created_at / updated_at | timestamptz | timestamps |
| deleted_at | timestamptz nullable | soft delete |

La lecture publique doit passer par la vue `public_profiles`, qui exclut `phone`, `is_blocked` et `deleted_at`.

## `categories`

Catalogue administré côté serveur.

| Colonne | Type | Règle |
|---|---|---|
| id | uuid | PK |
| slug | varchar(64) | unique, slug normalisé |
| name | varchar(80) | libellé |
| description | text nullable |  |
| icon | varchar(80) nullable | clé d’icône |
| sort_order | integer | >= 0 |
| enabled | boolean | lecture publique si true |
| created_at / updated_at | timestamptz | timestamps |

Seed MVP : `service`, `echange`, `vente`.

## `posts`

Annonce de marketplace.

| Colonne | Type | Règle |
|---|---|---|
| id | uuid | PK |
| owner_id | uuid | FK `auth.users(id)` |
| category_id | uuid | FK `categories(id)` |
| type | varchar(16) | `service`, `echange`, `vente` |
| title | varchar(140) | 5 à 140 caractères |
| description | text | 20 à 5000 caractères |
| price_label | varchar(120) nullable | affichage libre |
| zone | varchar(120) | localisation |
| status | varchar(16) | draft/active/paused/sold/blocked/deleted |
| contact_locked | boolean | false obligatoire pour échange |
| published_at | timestamptz nullable | date de publication |
| created_at / updated_at | timestamptz | timestamps |
| deleted_at | timestamptz nullable | soft delete |

Une suppression produit se fait avec `status = 'deleted'` et `deleted_at`, jamais avec un hard delete client.

## `post_media`

Métadonnées des fichiers stockés dans InsForge Storage.

| Colonne | Type | Règle |
|---|---|---|
| id | uuid | PK |
| post_id | uuid | FK `posts(id)` cascade |
| owner_id | uuid | FK `auth.users(id)` |
| bucket | varchar(80) | `public-post-media` par défaut |
| object_key | text | unique avec bucket |
| public_url | text nullable | URL publique/CDN |
| mime_type | varchar(120) nullable | type validé côté upload |
| size_bytes | bigint nullable | >= 0 |
| width / height | integer nullable | dimensions positives |
| sort_order | integer | >= 0 |
| created_at | timestamptz | timestamp |

Les binaires ne sont jamais stockés dans PostgreSQL.

## `audit_events`

Journal applicatif append-only.

| Colonne | Type | Règle |
|---|---|---|
| id | uuid | PK |
| actor_user_id | uuid nullable | null pour système/webhook |
| action | varchar(120) | format `domaine.action` |
| entity_type | varchar(80) nullable | type d’objet |
| entity_id | text nullable | identifiant externe ou UUID |
| metadata | jsonb | objet JSON, jamais de secret |
| request_id | varchar(120) nullable | idempotence/trace |
| ip_hash | varchar(128) nullable | IP hashée uniquement |
| user_agent | text nullable | contexte client |
| created_at | timestamptz | timestamp |

Aucune policy client n’est créée sur cette table.

## Index principaux

- feed public par `published_at` ;
- recherche GIN titre + description + zone ;
- annonces par propriétaire, catégorie et statut ;
- médias par annonce et ordre ;
- audit par action, acteur et entité ;
- unicité audit `(request_id, action)` quand `request_id` existe.

## Tables futures, hors étape 3

`saved_posts`, `contact_unlocks`, `conversations`, `messages`, `passes`, `payment_sessions`, `reports`, `analytics_events` restent documentées mais ne sont pas créées dans cette migration MVP.
