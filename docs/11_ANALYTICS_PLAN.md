# KWATE — Analytics Plan

## Objectif

Comprendre l’usage produit sans exposer de données sensibles.

## Events MVP

| Event | Properties |
|---|---|
| page_viewed | route |
| post_viewed | post_id, type, category |
| search_performed | query_hash, category, result_count |
| post_create_started | type |
| post_created | post_id, type, category |
| contact_unlock_clicked | post_id, locked, has_pass |
| pass_selected | plan |
| checkout_started | plan, environment |
| checkout_completed | plan, environment |
| message_sent | conversation_id |
| report_created | target_type |

## Règles privacy

- Ne jamais stocker mot de passe, token, secret.
- Éviter texte brut des messages dans analytics.
- Hasher ou tronquer les recherches sensibles si besoin.
- Séparer `analytics_events` de `audit_events`.

## KPIs MVP

- Nombre d’inscriptions.
- Nombre d’annonces publiées.
- Taux publication après signup.
- Nombre de contacts débloqués.
- Conversion pass.
- Nombre de signalements.
- Temps moyen avant premier message.
