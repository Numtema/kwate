# AGENTS.md — KWATE V6 Deployment Hardening + CI/CD + AGENTS OS

## Mission

Maintenir KWATE comme une marketplace Next.js réellement connectée à InsForge, déployable sur Vercel, sans mock métier et sans opération distante implicite.

L’agent doit produire des changements traçables, réversibles et testés. Une compilation seule ne vaut jamais validation fonctionnelle.

## Architecture obligatoire

```txt
Browser / Next.js UI
→ @insforge/sdk
→ InsForge Auth + Database + Storage + Payments
→ PostgreSQL RLS
→ Stripe signed webhook
→ billing_entitlements
→ Vercel
```

Les actions utilisateur utilisent la session utilisateur et la RLS. Les opérations de schéma, migrations, secrets, buckets et fulfillment utilisent uniquement un contexte serveur avec `INSFORGE_ADMIN_TOKEN` ou `INSFORGE_API_KEY`.

## Source of Truth Order

Lire dans cet ordre avant toute modification :

1. `AGENTS.md`
2. `ai/PROJECT_MANIFEST.yml`
3. `ai/AGENT_EXECUTION_PROTOCOL.yml`
4. `ai/DO_NOT_TOUCH.yml`
5. `docs/05_DATABASE_SCHEMA.md`
6. `docs/06_RLS_AND_PERMISSIONS.md`
7. `docs/07_ACTION_MATRIX.md`
8. `docs/34_DEPLOYMENT_HARDENING_V6.md`
9. `docs/35_CI_CD_RUNBOOK.md`
10. Les fichiers de la feature concernée

En cas de contradiction, la règle la plus restrictive gagne. Ne jamais inventer l’état d’un service distant.

## Agent Operating Modes

L’agent doit annoncer et respecter un mode unique par opération.

### `READ_ONLY`

Inspecter le code, les configurations, les métadonnées et les logs. Aucun fichier ni service distant modifié.

### `PLAN`

Préparer un plan d’exécution, identifier les risques, lister les fichiers et produire un dry-run. Aucun changement distant.

### `CODE`

Modifier uniquement le repository local ou une branche dédiée. Aucun provisionnement InsForge, aucune modification de secret et aucun déploiement manuel.

### `VERIFY`

Exécuter les audits, le typecheck, le lint, le build et les contrôles distants en lecture seule. Aucun changement de schéma ou de donnée.

### `APPLY`

Appliquer une opération distante déjà planifiée. Ce mode exige les confirmations et protections décrites plus bas.

### `REPAIR`

Corriger une défaillance confirmée à partir de preuves : logs, test échoué ou différence de configuration. Commencer par la correction la moins risquée.

## Mandatory Preflight

Avant toute modification :

```bash
npm run preflight
npm run audit:lockfile
```

Avant tout push :

```bash
npm ci --no-audit --no-fund --prefer-offline
npm run verify:ci
```

Avant toute opération InsForge :

```bash
npm run insforge:plan
```

L’agent doit vérifier :

- Node `22.x` et npm `10.x` ;
- lockfile sans registre privé ou URL interne ;
- branche et commit ciblés ;
- absence de secrets dans le diff ;
- migrations et rollbacks correspondants ;
- cible InsForge exacte ;
- mode demandé ;
- niveau de risque ;
- sauvegarde confirmée pour une cible de production ;
- état du CI avant opération distante.

Si un prérequis manque, retourner `BLOCK` au lieu d’improviser.

## Non-Negotiable Security Rules

- Never print secret values.
- Ne jamais enregistrer une clé admin dans un fichier versionné, un log, un artefact ou une réponse.
- Ne jamais préfixer une clé admin ou Stripe avec `NEXT_PUBLIC_`.
- Ne jamais recréer `MockProvider`, `useMock`, `MOCK_*`, `initialPosts` ou des résultats de paiement fictifs.
- Ne jamais désactiver la RLS pour contourner un problème.
- Ne jamais utiliser une clé admin pour une action utilisateur normale.
- Ne jamais effectuer de hard delete d’annonce ; utiliser `status='deleted'` et `deleted_at`.
- Ne jamais considérer `/pass/success` comme preuve de paiement.
- Seul un webhook Stripe signé peut accorder ou modifier un entitlement.
- Ne jamais lancer une migration InsForge automatiquement sur `push` ou `pull_request`.
- Ne jamais exécuter `APPLY` sans cible exacte et confirmation explicite.
- Ne jamais annoncer qu’InsForge, Stripe ou Vercel fonctionne sans preuve observable.

## Repository Ownership

### Risque faible

```txt
docs/**
ai/** hors registres de sécurité
composants purement visuels
```

### Risque moyen

```txt
app/**
features/**
components/**
lib/insforge/client.ts
```

### Risque élevé

```txt
lib/insforge/admin-client.ts
scripts/provision-insforge.mjs
insforge/migrations/**
insforge/rls/**
insforge/rollback/**
app/api/webhooks/**
.github/workflows/**
```

Toute modification à risque élevé exige : plan, test, rollback et résumé de sécurité.

## Deployment Hardening Contract

Le build de référence utilise :

```txt
Node       22.16.0
npm        10.9.2
Registry   https://registry.npmjs.org/
Install    npm ci --no-audit --no-fund --prefer-offline
Build      npm run build:vercel
Region     cdg1
```

Le `package-lock.json` ne doit contenir que des URLs `registry.npmjs.org`. Toute URL interne, locale ou Artifactory bloque le déploiement.

Vercel est lié à GitHub :

```txt
branche feature → Preview Deployment
branche main    → Production Deployment
```

Ne pas ajouter un second déploiement Vercel dans GitHub Actions sauf décision explicite. Le CI valide ; l’intégration Git Vercel déploie.

## CI Contract

Le workflow `.github/workflows/ci.yml` doit :

1. utiliser des permissions `contents: read` ;
2. utiliser Node `22.16.0` ;
3. exécuter le preflight ;
4. installer via `npm ci` ;
5. lancer `npm run verify:ci` ;
6. lancer l’audit des dépendances de production ;
7. annuler les runs obsolètes sur la même branche.

Un merge vers `main` est interdit si le CI est rouge.

## InsForge Connection Inputs

Récupérer dans le projet InsForge KWATE :

```env
NEXT_PUBLIC_INSFORGE_URL=https://PROJECT.REGION.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=...
INSFORGE_API_BASE_URL=https://PROJECT.REGION.insforge.app
INSFORGE_ADMIN_TOKEN=...
# ou
INSFORGE_API_KEY=...
```

Créer `.env.local` depuis `.env.example`. `.env.local` ne doit jamais être committé.

L’agent doit afficher uniquement :

```txt
configured=true/false
host=PROJECT.REGION.insforge.app
credential_type=admin_token/api_key/none
```

Il ne doit jamais afficher la valeur d’un credential.

## InsForge Provisioning Protocol

### Étape 1 — Plan en lecture seule

```bash
npm run insforge:plan
```

Le plan inspecte :

- `/api/metadata` ;
- `/api/metadata/database` ;
- `/api/database/migrations` ;
- `/api/storage/buckets` ;
- migrations manquantes ;
- bucket attendu.

### Étape 2 — Vérification

```bash
npm run insforge:verify
```

Le verdict est `PASS` uniquement si toutes les migrations attendues et le bucket existent.

### Étape 3 — Apply gardé

```bash
DEPLOYMENT_TARGET=preview \
CONFIRM_INSFORGE_PROVISION=KWATE_PROVISION \
CONFIRM_INSFORGE_TARGET_HOST=PROJECT.REGION.insforge.app \
npm run insforge:provision
```

Pour la production :

```bash
DEPLOYMENT_TARGET=production \
CONFIRM_INSFORGE_PROVISION=KWATE_PROVISION \
CONFIRM_INSFORGE_TARGET_HOST=PROJECT.REGION.insforge.app \
CONFIRM_PRODUCTION_BACKUP=BACKUP_CONFIRMED \
npm run insforge:provision
```

L’ordre d’application est fixe :

1. `001_kwate_core_schema`
2. `001_kwate_core_rls`
3. `001_kwate_categories_seed`
4. `002_kwate_full_app`
5. `002_kwate_full_app_rls`
6. `003_kwate_media_pipeline`
7. bucket `public-post-media`
8. vérification finale

Le rapport est écrit dans :

```txt
artifacts/insforge-provision-report.json
```

## GitHub Actions InsForge Protocol

Le workflow `.github/workflows/insforge-provision.yml` est exclusivement manuel via `workflow_dispatch`.

Modes disponibles :

```txt
plan    lecture seule
verify  lecture seule + verdict
apply   écriture gardée
```

Configurer deux GitHub Environments :

```txt
preview
production
```

Placer les secrets InsForge dans l’Environment correspondant. Pour `production`, activer les required reviewers.

Une opération `apply` exige :

```txt
confirmation       = KWATE_PROVISION
target_host        = hostname InsForge exact
backup_confirmation= BACKUP_CONFIRMED pour production
```

## Database and RLS Contract

Tables principales :

```txt
profiles
categories
posts
post_media
saved_posts
reports
conversations
conversation_members
messages
billing_entitlements
contact_unlocks
audit_events
```

Fonctions sécurisées :

```txt
kwate_start_conversation()
kwate_get_post_contact()
kwate_mark_conversation_read()
kwate_is_conversation_member()
kwate_publish_post()
kwate_abort_post_draft()
kwate_set_post_status()
kwate_delete_post()
```

Chaque nouvelle table privée doit avoir :

- propriétaire ou justification d’accès ;
- RLS activée ;
- policies SELECT/INSERT/UPDATE/DELETE explicites ;
- validation applicative ;
- migration versionnée ;
- rollback ;
- smoke test ;
- mise à jour des docs et registres IA.

## Auth Validation Matrix

Tester avec au moins deux comptes réels :

```txt
signup
email verification
login
session refresh
logout
forgot password
reset password
profile bootstrap
route protection
cross-user access denial
```

Redirect URLs minimales :

```txt
http://localhost:3000/login
http://localhost:3000/reset-password
https://YOUR_VERCEL_DOMAIN/login
https://YOUR_VERCEL_DOMAIN/reset-password
```

## Storage Validation Matrix

Bucket attendu : `public-post-media`.

```txt
lecture publique
upload authentifié
JPEG/PNG/WebP/AVIF
10 Mo maximum
5 images maximum par annonce
chemin {userId}/{postId}/{uuid}.{extension}
```

Ne jamais stocker les binaires dans PostgreSQL.

## Payments Validation Matrix

Variables publiques :

```env
NEXT_PUBLIC_STRIPE_ENVIRONMENT=test
NEXT_PUBLIC_STRIPE_PRICE_PASS30=price_...
NEXT_PUBLIC_STRIPE_PRICE_PASS12=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

Variables serveur :

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Webhook KWATE :

```txt
https://YOUR_VERCEL_DOMAIN/api/webhooks/stripe
```

Événements :

```txt
checkout.session.completed
invoice.paid
customer.subscription.deleted
```

Le corps brut et la signature doivent être vérifiés avant fulfillment. Une clé d’idempotence est obligatoire pour le checkout.


## V7 Backend & Media Pipeline

Toute nouvelle annonce suit obligatoirement :

```txt
validation Zod
→ INSERT posts sans colonnes de cycle (défaut PostgreSQL = draft)
→ upload maximum 5 fichiers dans public-post-media
→ INSERT post_media pour chaque objet
→ RPC kwate_publish_post(post_id, expected_media_count)
→ status=active uniquement après contrôle serveur
```

Interdictions V7 :

- ne jamais insérer une nouvelle annonce directement en `active` ;
- ne jamais réaccorder au client INSERT/UPDATE sur `status`, `published_at` ou `deleted_at` ;
- ne jamais modifier un statut sans RPC de cycle propriétaire ;
- ne jamais ignorer un échec d'indexation `post_media` ;
- ne jamais laisser volontairement un objet Storage sans metadata ;
- ne jamais publier si le nombre attendu diffère du nombre indexé ;
- ne jamais tester la RLS avec une clé admin ;
- ne jamais exécuter un nettoyage d'orphelins directement en `apply` sans rapport `plan` ;
- ne jamais lancer le test production avec des comptes personnels.

Contrôles locaux :

```bash
npm run audit:v7
npm run verify:ci
```

Contrôles distants :

```txt
1. InsForge plan
2. InsForge verify
3. Apply migration 003 et bucket si approuvé
4. InsForge verify final
5. Workflow KWATE V7 Two-Account Production Test
6. Workflow KWATE Media Orphan Control en plan
```

Secrets GitHub Environment nécessaires au test distant :

```txt
KWATE_TEST_USER_A_EMAIL
KWATE_TEST_USER_A_PASSWORD
KWATE_TEST_USER_B_EMAIL
KWATE_TEST_USER_B_PASSWORD
```

Le test doit créer un brouillon réel, vérifier qu'il est invisible au second compte, tenter un bypass direct `active`, uploader cinq images, publier par RPC, vérifier les refus RLS du second compte puis nettoyer les données par défaut.

### Media orphan policy

`npm run media:orphans:plan` est en lecture seule. L'apply exige :

```txt
CONFIRM_MEDIA_ORPHAN_CLEANUP=KWATE_MEDIA_CLEANUP
CONFIRM_INSFORGE_TARGET_HOST=<hostname exact>
```

En production, le workflow exige aussi `MEDIA_BACKUP_CONFIRMED`. Les objets de moins de 24 heures ou sans timestamp exploitable sont ignorés. Une durée invalide bloque l'exécution. Les objets liés aux annonces supprimées sont candidats et leur métadonnée n'est supprimée qu'après suppression Storage réussie.

## Production Smoke Tests

Après déploiement :

```txt
GET /api/runtime/config → 200, aucun secret
GET /api/health         → 200
GET /                   → 200
```

Puis tester :

1. inscription et connexion réelles ;
2. création, édition et soft-delete d’une annonce ;
3. upload et affichage d’images ;
4. recherche et filtre catégorie ;
5. favori et signalement ;
6. conversation entre deux comptes ;
7. refus d’accès à la conversation d’un tiers ;
8. verrouillage/déverrouillage du contact ;
9. checkout Stripe test ;
10. webhook 200 et entitlement créé ;
11. consommation unique du quota Pass 30 ;
12. absence de secrets dans bundle et logs.

## Repair Protocol

En cas d’échec :

```txt
1. Capturer le commit, le deployment ID et le timestamp.
2. Lire les logs de build ou runtime.
3. Identifier la première erreur causale, pas les erreurs secondaires.
4. Reproduire avec la même version Node/npm.
5. Corriger le changement minimal.
6. Exécuter npm run verify:ci.
7. Déployer sur preview.
8. Exécuter les smoke tests.
9. Promouvoir vers main seulement après PASS.
```

Pour un échec `npm ci`, vérifier en priorité :

```txt
Node/npm épinglés
package-lock cohérent
URLs resolved publiques
absence de dépendance file:/link:
cache Vercel
intégrité npm
```

## Rollback Protocol

### Code

Revenir au dernier commit `READY` ou utiliser un revert Git. Ne jamais réécrire `main` sans nécessité critique.

### Vercel

Promouvoir le dernier déploiement `READY` connu si la production est indisponible.

### InsForge

- arrêter toute nouvelle opération ;
- conserver le rapport d’exécution ;
- identifier les migrations appliquées ;
- exécuter uniquement le rollback correspondant après validation ;
- ne jamais supprimer une table en production sans sauvegarde et approbation.

## PASS / BLOCK Contract

Chaque mission doit se terminer par un verdict :

```txt
PASS
- preuves
- tests exécutés
- commit/deployment ciblé
- limites restantes
```

ou :

```txt
BLOCK
- blocage exact
- preuve ou log
- état non modifié / état partiellement modifié
- action corrective minimale
```

Interdiction d’utiliser `PASS` si :

- un test obligatoire n’a pas été exécuté ;
- l’instance distante n’a pas été observée ;
- le CI est rouge ;
- le build Vercel n’est pas `READY` ;
- une migration ou policy attendue manque ;
- un secret est exposé ;
- un mock métier existe dans le runtime.

## Definition of Done

Une modification V7 est terminée seulement si :

```bash
npm run preflight
npm run audit:lockfile
npm run audit:v7
npm run verify:ci
```

réussissent, que le CI GitHub est vert, que Vercel est `READY`, et que les tests distants pertinents ont été exécutés.

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **kwate** (API base `https://yz3i3ys4.eu-central.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
