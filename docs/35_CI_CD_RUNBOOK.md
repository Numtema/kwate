# KWATE V6 — CI/CD Runbook

## CI

Le workflow `.github/workflows/ci.yml` est déclenché sur :

```txt
push vers main
pull request vers main
workflow_dispatch manuel
```

Il exécute :

```txt
runtime preflight
npm ci exact
lockfile audit
audits Step 3, 4, 5 et V6
typecheck
lint
build Next.js Vercel
audit des dépendances de production
```

Les permissions du workflow sont en lecture seule.

## CD Vercel

Le déploiement reste géré par l’intégration Git Vercel :

```txt
branche hors main → preview
main              → production
```

GitHub Actions ne lance pas un deuxième déploiement Vercel.

## Control Plane InsForge

Le workflow `.github/workflows/insforge-provision.yml` est exclusivement manuel.

```txt
plan    lecture seule
verify  lecture seule et verdict
apply   modifications distantes gardées
```

Créer les GitHub Environments `preview` et `production`, y stocker les secrets InsForge et exiger un reviewer sur `production`.

L’apply production nécessite :

```txt
KWATE_PROVISION
hostname InsForge exact
BACKUP_CONFIRMED
```

Chaque run publie `artifacts/insforge-provision-report.json` comme artefact GitHub Actions.
