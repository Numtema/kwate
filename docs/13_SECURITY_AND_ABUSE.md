# KWATE — Security and Abuse

## Risques principaux

- Spam d’annonces.
- Faux profils.
- Contenus interdits.
- Harcèlement en messages.
- Contournement du pass/contact.
- Fuite de téléphone/contact.
- Exposition de clés admin.
- Webhook paiement falsifié.

## Garde-fous MVP

### Auth

- Password reset sécurisé.
- Refresh web via httpOnly cookie + CSRF si utilisé.
- Pas de refreshToken dans localStorage.

### Posts

- Rate limit création annonce.
- Statut `blocked` pour modération.
- Soft delete.
- Validation longueur title/description/price.

### Contact

- Contact masqué jusqu’à règle autorisée.
- Déblocage écrit dans `contact_unlocks`.
- Audit `contact.unlocked`.

### Paiements

- Utiliser idempotency key.
- Activation pass uniquement via webhook validé ou sync admin.
- Ne pas croire uniquement la success URL.

### Admin

- Admin client server-only.
- Aucune clé admin `NEXT_PUBLIC_*`.
- Toute action admin auditée.

## Données interdites dans logs

```txt
password
refreshToken
accessToken
admin token
API keys
full card data
webhook raw secret
private message body complet si non nécessaire
```
