# KWATE V6 — Audit Report

## Périmètre

```txt
Deployment hardening
Public npm lockfile
Node/npm pinning
Vercel deterministic install
GitHub CI
Manual InsForge control plane
AGENTS OS
Provisioning report
```

## Commandes de validation

```bash
npm run preflight
npm run audit:lockfile
npm run audit:step3
npm run audit:step4
npm run audit:step5
npm run audit:v6
npm run typecheck
npm run lint
VERCEL=1 npm run build:vercel
```

## Critères

```txt
0 URL npm interne
0 trigger automatique de migration InsForge
0 secret dans le repository
0 mock métier runtime
CI en permissions lecture seule
Apply InsForge protégé par cible + confirmation + backup production
AGENTS.md avec PASS/BLOCK explicite
```

Le verdict final distant reste conditionné au CI GitHub, au déploiement Vercel `READY` et aux tests sur l’instance InsForge réelle.
