# KWATE — Realtime and Events

## Position

Realtime n’est pas prioritaire pour le premier branchement. Il devient utile après auth + posts + messages.

## Channels cible

| Channel | Usage | Permission |
|---|---|---|
| `messages:user:{userId}` | nouveaux messages | owner only |
| `conversation:{conversationId}` | thread actif | participant only |
| `notifications:user:{userId}` | notifications générales | owner only |
| `admin:moderation` | nouveaux signalements | admin only |
| `payment:user:{userId}` | statut pass/paiement | owner only |

## Règles

```txt
Pas de donnée sensible brute dans un message realtime.
Le client reçoit une notification minimale puis refetch la donnée autorisée.
Toute subscription doit vérifier l’acteur.
Tout channel doit être déclaré dans ai/REALTIME_CHANNEL_REGISTRY.yml.
```

## Events produit

- `post_created`
- `post_updated`
- `post_blocked`
- `report_created`
- `message_sent`
- `pass_activated`
- `payment_failed`
