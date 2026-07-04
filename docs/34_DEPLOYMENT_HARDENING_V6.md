# KWATE V6 — Deployment Hardening

## Incident traité

Le premier build V5 sur Vercel a échoué pendant `npm ci`. Le lockfile contenait des URLs `resolved` vers un registre npm interne non accessible depuis Vercel.

## Correctifs

```txt
Node épinglé       : 22.16.0
npm épinglé        : 10.9.2
Registry           : https://registry.npmjs.org/
Lockfile           : aucune URL interne
Install Vercel     : npm ci --no-audit --no-fund --prefer-offline
Build Vercel       : npm run build:vercel
Région             : cdg1
```

Fichiers concernés :

```txt
.npmrc
.nvmrc
package.json
package-lock.json
vercel.json
scripts/audit-lockfile.mjs
scripts/preflight-v6.mjs
scripts/audit-v6.mjs
```

## Contrôles

```bash
npm run preflight
npm run audit:lockfile
npm run verify:ci
```

Le build Vercel ne lance pas `npm audit` pendant l’installation. L’audit de sécurité est une étape CI séparée afin qu’une requête réseau secondaire ne rende pas l’installation non déterministe.
