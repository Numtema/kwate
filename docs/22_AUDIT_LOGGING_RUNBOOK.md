# KWATE — Audit Logging Runbook

## Objectif

Tracer les actions sensibles sans exposer de secrets.

## Actions à auditer dès le MVP

| Action | Acteur | Entity |
|---|---|---|
| auth.signup | user | profile |
| auth.login | user | session |
| auth.logout | user | session |
| post.created | user | post |
| post.updated | owner | post |
| post.deleted_soft | owner | post |
| contact.unlocked | user | post |
| pass.checkout_started | user | payment_session |
| payment.webhook_received | system | payment_session |
| pass.activated | system | pass |
| message.sent | user | message |
| report.created | user | report |
| admin.post_blocked | admin | post |
| admin.user_blocked | admin | user |

## Structure minimale

```json
{
  "actor_user_id": "uuid|null",
  "action": "post.created",
  "entity_type": "post",
  "entity_id": "uuid",
  "metadata": {},
  "created_at": "timestamp"
}
```

## Interdit dans metadata

- passwords ;
- tokens ;
- API keys ;
- secrets Stripe ;
- corps complet de message privé ;
- données carte bancaire.

## Sévérité

| Severity | Exemple |
|---|---|
| info | post.created |
| warning | report.created |
| high | admin.post_blocked |
| critical | admin.schema_changed / secret.updated |
