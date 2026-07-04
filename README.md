# KWATE V7 — Backend Production & Media Pipeline

KWATE est une application Next.js mobile-first pour publier des services, ventes locales et échanges. La V7 ajoute un cycle d'annonce sécurisé `draft → upload → indexation → publication`, un rollback média, un nettoyage d'orphelins et un test RLS réel avec deux comptes.

## État du produit

```txt
Frontend          Next.js + TypeScript + Tailwind
Authentification  InsForge Auth
Annonces          CRUD PostgreSQL + RLS
Médias            InsForge Storage + saga de rollback
Recherche         DB + catégories
Messages          conversations + messages
Pass              InsForge Payments + webhook Stripe
Mocks métier      aucun
Node               22.16.0
npm                10.9.2
CI                 GitHub Actions
CD                 Vercel Git Integration
InsForge apply     workflow manuel protégé
Tests production   deux comptes + cinq photos + RLS
```

## Démarrage local

```bash
nvm use
cp .env.example .env.local
npm ci --no-audit --no-fund --prefer-offline
npm run preflight
npm run verify:ci
npm run dev
```

## InsForge

Toujours commencer en lecture seule :

```bash
npm run insforge:plan
npm run insforge:verify
```

Apply preview :

```bash
DEPLOYMENT_TARGET=preview \
CONFIRM_INSFORGE_PROVISION=KWATE_PROVISION \
CONFIRM_INSFORGE_TARGET_HOST=PROJECT.REGION.insforge.app \
npm run insforge:provision
```

L’apply production exige aussi :

```bash
CONFIRM_PRODUCTION_BACKUP=BACKUP_CONFIRMED
```

## CI/CD

```txt
.github/workflows/ci.yml
.github/workflows/insforge-provision.yml
```

Le CI teste chaque push/PR. Vercel déploie via Git. InsForge n’est jamais provisionné automatiquement.

## Documentation

```txt
AGENTS.md                              runbook agentique principal
docs/34_DEPLOYMENT_HARDENING_V6.md   hardening Vercel/npm
docs/35_CI_CD_RUNBOOK.md             CI/CD
docs/36_AGENTS_OS.md                 protocole agentique
docs/37_V6_AUDIT_REPORT.md           critères d’audit
docs/38_V7_BACKEND_MEDIA_PIPELINE.md pipeline annonces/médias
docs/39_V7_PRODUCTION_TEST_RUNBOOK.md tests distants à deux comptes
```


## V7 — tests et maintenance média

```bash
npm run audit:v7
npm run media:orphans:plan
```

Le test distant à deux comptes est volontairement manuel :

```bash
CONFIRM_V7_PRODUCTION_TEST=KWATE_V7_TEST npm run test:v7:two-account
```

Les credentials des deux comptes de test restent dans un GitHub Environment et ne sont jamais committés.
