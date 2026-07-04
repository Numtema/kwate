# KWATE — Release Checklist

## Build

- [ ] `npm run lint` passe.
- [ ] `npm run build` passe.
- [ ] Aucun type error.
- [ ] Aucun secret dans repo.

## InsForge

- [ ] `NEXT_PUBLIC_INSFORGE_URL` configuré.
- [ ] `NEXT_PUBLIC_INSFORGE_ANON_KEY` configuré si utilisé côté client.
- [ ] `INSFORGE_API_BASE_URL` configuré côté serveur.
- [ ] `INSFORGE_ADMIN_TOKEN` ou `INSFORGE_API_KEY` côté serveur seulement.
- [ ] RLS active sur tables sensibles.
- [ ] Buckets déclarés.

## Auth

- [ ] Signup.
- [ ] Login.
- [ ] Current user.
- [ ] Logout.
- [ ] Reset password.

## Posts

- [ ] Create.
- [ ] List.
- [ ] Search.
- [ ] Detail.
- [ ] Owner update.
- [ ] Soft delete.

## Payments

- [ ] Test checkout.
- [ ] Webhook test.
- [ ] Pass activation.
- [ ] Duplicate webhook safe.
- [ ] Live mode séparé de test.

## Audit/Security

- [ ] Audit events sensibles.
- [ ] Pas de token dans logs.
- [ ] Admin actions protégées.
- [ ] Hard delete bloqué par défaut.
- [ ] Report/modération testés.
