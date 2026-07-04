# KWATE — Payment Control Plane

## Objectif

Brancher les pass KWATE via InsForge Payments + Stripe.

## Plans produit

| Plan | Code | Prix affiché actuel | Statut |
|---|---|---:|---|
| Pass 30 jours | `pass30` | à confirmer | MVP |
| Pass annuel | `pass12` | à confirmer | later |
| Compte Pro | `pro` | à confirmer | later |

## Flow checkout MVP

```txt
user selects plan on /pass
→ validate plan
→ create payment_session with idempotency key
→ call InsForge checkout session
→ redirect Stripe Checkout
→ Stripe webhook received
→ validate signature
→ mark payment_session completed
→ create/extend pass
→ audit pass.activated
→ UI refetch pass state
```

## Règles

- Ne jamais activer pass seulement via success URL.
- Utiliser webhook + idempotency.
- Séparer `test` et `live`.
- Stripe reste source of truth, KWATE possède ses entitlements produit.
- Les endpoints admin paiement restent server-only.

## Tables concernées

- `payment_sessions`
- `passes`
- `audit_events`
- éventuellement `analytics_events`

## Audit events

- `pass.checkout_started`
- `payment.webhook_received`
- `payment.completed`
- `payment.failed`
- `pass.activated`
- `pass.expired`
