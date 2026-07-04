# AGENTS.md — KWATE InsForge + Vercel Production Runbook

## Mission

Transformer et maintenir KWATE comme application Next.js réellement connectée à InsForge. Aucun mock, aucune donnée métier codée en dur, aucune clé admin dans le navigateur.

## Architecture obligatoire

```txt
Browser / Next.js UI
→ @insforge/sdk (Auth, Database, Storage, Payments, Realtime)
→ InsForge Auth + PostgREST + Storage + Payments
→ PostgreSQL RLS
→ Stripe webhooks
→ billing_entitlements
→ Vercel
```

Les actions utilisateur normales utilisent le SDK et la session utilisateur. Les opérations de schéma, secrets, migrations et fulfillment utilisent uniquement le serveur avec `INSFORGE_ADMIN_TOKEN` ou `INSFORGE_API_KEY`. Le projet suit la règle : validation, permission, RLS, état UI et audit doivent rester traçables.

## Interdictions

- Ne jamais recréer `MockProvider`, `useMock`, `MOCK_*` ou des listes d’annonces/messages fictives.
- Ne jamais exposer `INSFORGE_ADMIN_TOKEN`, `INSFORGE_API_KEY`, `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` avec `NEXT_PUBLIC_*`.
- Ne jamais désactiver RLS pour faire fonctionner une page.
- Ne jamais faire de hard delete d’annonce : utiliser `status='deleted'` et `deleted_at`.
- Ne jamais considérer la redirection Stripe success comme preuve de paiement. Seul le webhook active les droits.
- Ne jamais exécuter `npm run insforge:provision` sans vérifier la cible et définir explicitement `CONFIRM_INSFORGE_PROVISION=YES`.

## 1. Connecter le compte InsForge

Dans le dashboard InsForge du projet KWATE, récupérer :

```env
NEXT_PUBLIC_INSFORGE_URL=https://PROJECT.REGION.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=...
INSFORGE_API_BASE_URL=https://PROJECT.REGION.insforge.app
INSFORGE_ADMIN_TOKEN=...
# ou INSFORGE_API_KEY=...
```

Créer `.env.local` à partir de `.env.example`. Ne jamais committer `.env.local`.

Tester d’abord :

```bash
npm install
npm run typecheck
npm run audit:step5
curl http://localhost:3000/api/health
```

## 2. Provisionner la base et Storage

Le provisionnement applique dans l’ordre :

1. `001_kwate_core_schema.sql`
2. `001_kwate_core_rls.sql`
3. `001_kwate_categories.sql`
4. `002_kwate_full_app.sql`
5. `002_kwate_full_app_rls.sql`
6. bucket public `public-post-media`

Commande explicite :

```bash
CONFIRM_INSFORGE_PROVISION=YES npm run insforge:provision
```

Avant exécution production : sauvegarde, lecture des SQL, contrôle de l’URL cible et validation du rollback.

## 3. Configurer InsForge Auth

Ajouter aux redirect URLs autorisées :

```txt
http://localhost:3000/login
http://localhost:3000/reset-password
https://YOUR_VERCEL_DOMAIN/login
https://YOUR_VERCEL_DOMAIN/reset-password
```

Activer email/password. Configurer l’envoi d’emails et la vérification email selon le flow choisi. Tester inscription, vérification, login, refresh, logout et reset avec deux comptes réels.

## 4. Configurer Storage

Le bucket attendu est `public-post-media` : public en lecture, upload authentifié, maximum 10 Mo, formats JPEG/PNG/WebP/AVIF. Les objets suivent :

```txt
{userId}/{postId}/{uuid}.{extension}
```

Les métadonnées restent dans `post_media`. Ne pas stocker les fichiers binaires dans PostgreSQL.

## 5. Configurer Stripe dans InsForge

Dans InsForge Payments :

1. Ajouter la clé Stripe test.
2. Configurer le webhook géré par InsForge.
3. Créer/synchroniser les produits et prix.
4. Copier les Price IDs dans :

```env
NEXT_PUBLIC_STRIPE_ENVIRONMENT=test
NEXT_PUBLIC_STRIPE_PRICE_PASS30=price_...
NEXT_PUBLIC_STRIPE_PRICE_PASS12=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

Le checkout est créé via `client.payments.stripe.createCheckoutSession()`.

## 6. Configurer le webhook KWATE sur Vercel

Ajouter dans Stripe un endpoint supplémentaire :

```txt
https://YOUR_VERCEL_DOMAIN/api/webhooks/stripe
```

Événements :

```txt
checkout.session.completed
invoice.paid
customer.subscription.deleted
```

Variables serveur Vercel :

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Le webhook écrit les droits dans `billing_entitlements`. Le Pass 30 dispose de 30 déverrouillages ; les autres droits sont illimités pendant leur validité.

## 7. Variables Vercel

Configurer pour Production, Preview et Development selon le besoin :

```env
NEXT_PUBLIC_INSFORGE_URL
NEXT_PUBLIC_INSFORGE_ANON_KEY
INSFORGE_API_BASE_URL
INSFORGE_ADMIN_TOKEN ou INSFORGE_API_KEY
NEXT_PUBLIC_STRIPE_ENVIRONMENT
NEXT_PUBLIC_STRIPE_PRICE_PASS30
NEXT_PUBLIC_STRIPE_PRICE_PASS12
NEXT_PUBLIC_STRIPE_PRICE_PRO
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
APP_URL=https://YOUR_VERCEL_DOMAIN
```

Ne pas ajouter `GEMINI_API_KEY` si aucune fonctionnalité IA ne l’utilise.

## 8. Déployer sur Vercel

```bash
npm run verify
vercel
vercel --prod
```

Le projet utilise `vercel.json` et désactive `output: standalone` quand `VERCEL=1`.

## 9. Validation production obligatoire

- `/api/health` retourne 200 et `backend.ok=true`.
- Inscription et login réels.
- Création/édition/suppression douce d’une annonce.
- Upload et affichage d’une photo.
- Recherche texte et filtre catégorie.
- Favori et signalement.
- Conversation entre deux comptes, lecture et envoi.
- Un utilisateur ne lit pas les conversations d’un autre.
- Contact échange accessible ; contact service verrouillé sans pass.
- Checkout test Stripe, webhook 200, entitlement créé.
- Le Pass 30 incrémente `usage_count` une seule fois par annonce.
- Aucun secret dans le bundle client ou les logs.

## 10. Commandes qualité

```bash
npm run audit:step3
npm run audit:step4
npm run verify
```

Un travail n’est PASS que si ces commandes réussissent et que les tests réels InsForge/Stripe sont exécutés sur une instance configurée.
