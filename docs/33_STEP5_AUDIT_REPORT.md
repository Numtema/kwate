# Step 5 audit report

## Résultat local

```txt
audit:step3       36 PASS / 0 FAIL
audit:step4       43 PASS / 0 FAIL
audit:step5       44 PASS / 0 FAIL
TypeScript        PASS
ESLint            PASS
Build Vercel      PASS
npm audit prod     0 vulnérabilité
HTTP smoke         12 pages 200; config 200; health 503 attendu sans secrets
Mocks runtime     0
```

Le build Vercel a été exécuté avec `VERCEL=1`. La configuration limite Next.js à deux workers pour éviter la saturation des hôtes CI exposant un très grand nombre de CPU virtuels.

## Limite

Ces contrôles prouvent la cohérence locale. Ils ne prouvent pas la configuration du compte distant : migrations, bucket, redirects Auth, produits/prix Stripe, secrets, webhook et tests multi-utilisateurs doivent être exécutés avec les accès du propriétaire.
