# KWATE — Scalability Plan

## MVP

- Pagination partout.
- Index sur `posts.status`, `posts.type`, `posts.category_id`, `posts.zone`, `posts.created_at`.
- Index sur `messages.conversation_id`, `messages.created_at`.
- Pas de select `*` sur gros flux publics.
- Soft delete par défaut.

## Recherche

Phase 1 : filtres simples SQL.

Phase 2 : index full-text sur title/description/zone.

Phase 3 : moteur spécialisé seulement si usage réel.

## Médias

- Storage externe/S3-compatible via InsForge.
- Images compressées côté client ou fonction.
- CDN/cache pour public media.

## Paiement

- Stripe source of truth.
- Projection locale pour afficher vite.
- Entitlements app-owned pour les droits produit.

## Realtime

À limiter aux messages et notifications. Feed public en polling/pagination au MVP.
