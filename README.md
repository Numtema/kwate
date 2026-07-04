# KWATE — Marketplace locale InsForge

KWATE est une application Next.js mobile-first pour publier des services, des ventes locales et des échanges. La version 0.5 utilise InsForge pour l'authentification, PostgreSQL/PostgREST, Storage, les paiements et les droits d'accès.

## État du produit

```txt
Frontend          : Next.js + TypeScript + Tailwind
Authentification  : InsForge Auth réelle
Annonces          : CRUD PostgreSQL réel
Médias            : InsForge Storage — public-post-media
Recherche         : requêtes DB + catégories
Profils           : lecture et mise à jour réelles
Favoris           : saved_posts
Signalements      : reports
Messages          : conversations + messages
Pass              : InsForge Checkout + Stripe webhook
Permissions       : RLS PostgreSQL
Déploiement       : Vercel ready
Mocks métier      : aucun
```

## Démarrage local

```bash
cp .env.example .env.local
npm install
npm run audit:step5
npm run typecheck
npm run lint
npm run dev
```

Renseigner au minimum :

```env
NEXT_PUBLIC_INSFORGE_URL=
NEXT_PUBLIC_INSFORGE_ANON_KEY=
INSFORGE_API_BASE_URL=
INSFORGE_ADMIN_TOKEN=
```

## Provisionner InsForge

Lire `AGENTS.md` avant toute opération distante, puis :

```bash
CONFIRM_INSFORGE_PROVISION=YES npm run insforge:provision
```

Cette commande applique les migrations `001` et `002`, les policies RLS, les catégories et crée le bucket `public-post-media`. Vérifier impérativement l'URL cible, les sauvegardes et les droits admin avant exécution.

## Vérification avant déploiement

```bash
npm run audit:step3
npm run audit:step4
npm run audit:step5
npm run typecheck
npm run lint
VERCEL=1 npm run build:vercel
```

## Déploiement Vercel

Configurer les variables de `.env.example` dans Vercel, ajouter les redirect URLs InsForge Auth, puis configurer Stripe vers :

```txt
https://VOTRE-DOMAINE/api/webhooks/stripe
```

Commandes :

```bash
vercel
vercel --prod
```

Le guide complet de connexion InsForge, Stripe et Vercel est dans [`AGENTS.md`](./AGENTS.md). Les migrations, RLS, checks et rollbacks sont dans `insforge/`.

## Étapes InsForge

```txt
Étape 1 — Control Plane                  PASS
Étape 2 — Clients runtime                PASS
Étape 3 — Schéma initial + RLS            PASS
Étape 4 — Auth réelle                     PASS
Étape 5 — Full-stack sans mocks           PASS local
Connexion distante InsForge/Stripe        À exécuter avec vos secrets
Déploiement production Vercel              À exécuter sur votre compte
```
