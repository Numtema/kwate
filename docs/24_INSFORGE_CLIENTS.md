# Clients InsForge

La couche runtime est active :

- `lib/insforge/sdk-browser.ts` : SDK navigateur/Auth/Database/Storage/Payments.
- `lib/insforge/admin-client.ts` : opérations server-only.
- `lib/insforge/records.ts` : tables autorisées et helpers contrôlés.
- `features/*/repository.ts` : accès métier centralisé.
- `app/api/*` : health, config publique et webhook Stripe.

Les variables sont validées lors de l'appel réel afin de permettre un build sans secrets, mais l'application signale clairement une configuration manquante au runtime. Aucun provider mock n'est utilisé.
