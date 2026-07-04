# Déploiement Vercel

Le projet est compatible avec le runtime Node.js de Vercel. `next.config.ts` retire le mode standalone lorsque `VERCEL=1`.

## Gates

```bash
npm install
npm run audit:step5
npm run lint
npm run typecheck
npm run build:vercel
```

Configurer toutes les variables listées dans `.env.example`, puis les redirects InsForge Auth et le webhook Stripe vers `/api/webhooks/stripe`.

Le déploiement peut compiler sans secrets, mais les pages protégées afficheront une erreur de configuration et `/api/health` retournera 503 tant qu’InsForge n’est pas connecté.
