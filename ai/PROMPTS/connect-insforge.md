# Connecter KWATE à une instance InsForge

1. Lire `AGENTS.md`.
2. Vérifier l'URL et l'environnement ciblés.
3. Configurer `.env.local` sans exposer de secret.
4. Exécuter les audits et le build.
5. Faire une sauvegarde distante.
6. Exécuter `CONFIRM_INSFORGE_PROVISION=YES npm run insforge:provision`.
7. Configurer Auth redirects, email et Storage.
8. Configurer les produits/prix Stripe et le webhook.
9. Déployer Vercel.
10. Tester avec deux comptes réels.

Interdictions : données fictives, RLS désactivée, admin key côté client, entitlement accordé depuis la success URL.
