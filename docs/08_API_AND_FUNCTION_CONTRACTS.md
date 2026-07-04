# KWATE — API and Function Contracts

## Principe

Les pages ne doivent pas appeler directement des endpoints sensibles sans wrapper.

Structure cible :

```txt
UI component
→ feature action
→ validation Zod
→ permission guard
→ InsForge SDK/Admin API/Records API
→ audit event
→ typed result
```

## Contrats serveur à créer plus tard

### Auth

- `src/features/auth/actions.ts`
- `src/features/auth/schema.ts`
- `src/features/auth/events.ts`

### Posts

- `src/features/posts/schema.ts`
- `src/features/posts/queries.ts`
- `src/features/posts/mutations.ts`
- `src/features/posts/actions.ts`
- `src/features/posts/permissions.ts`

### Payments

- `src/features/billing/actions.ts`
- `src/server/payments/create-checkout-session.ts`
- `src/server/webhooks/stripe.ts`

### Audit

- `src/server/audit/write-audit-event.ts`

## Réponse standard

```ts
type AppResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; status?: number; nextAction?: string } };
```

## Erreurs standard

| Code | Usage |
|---|---|
| INVALID_INPUT | Validation échouée |
| UNAUTHENTICATED | Session absente |
| FORBIDDEN | Permission refusée |
| NOT_FOUND | Ressource introuvable |
| RATE_LIMITED | Trop d’actions |
| PAYMENT_REQUIRED | Pass requis |
| CONTACT_LOCKED | Contact verrouillé |
| ADMIN_ONLY | Action admin |
| WEBHOOK_INVALID | Signature/payload webhook invalide |
| UNKNOWN_ERROR | Fallback |
