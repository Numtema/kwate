# Étape 4 — Rapport d’audit

## Résultats

```txt
Audit structure auth : 43 PASS / 0 FAIL
ESLint               : PASS / 0 erreur
TypeScript noEmit     : PASS
Next build verify     : PASS
Smoke HTTP local      : 6 routes / 6 en HTTP 200
```

Routes testées :

```txt
/login
/signup
/forgot-password
/reset-password
/verify-email
/profile
```

## Build

Le projet conserve `output: standalone` pour le déploiement. Un script de vérification sans packaging standalone permet un contrôle rapide dans les environnements limités :

```bash
npm run build:verify
```

Le build de production normal reste :

```bash
npm run build
```

## Sécurité vérifiée statiquement

- aucun stockage de token auth dans `localStorage` ;
- aucun stockage de token auth dans `sessionStorage` ;
- aucune référence au token admin dans le code auth client ;
- simulations `setTimeout` supprimées des écrans auth ;
- validation Zod sur tous les formulaires ;
- routes privées déclarées ;
- redirection `next` limitée aux chemins internes ;
- profil applicatif créé uniquement via la session Auth courante et RLS.

## Limites de l’audit

Aucun identifiant de projet InsForge réel n’a été fourni. Les appels réseau d’inscription, de login, d’email et de reset doivent donc être validés après configuration de `.env.local` et des URLs autorisées dans InsForge Auth.

`npm audit` signale actuellement 2 vulnérabilités modérées dans les dépendances de production, liées à la chaîne Next.js/PostCSS. Aucun correctif forcé potentiellement cassant n’a été appliqué dans cette étape.
