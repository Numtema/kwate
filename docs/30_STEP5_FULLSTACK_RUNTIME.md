# Step 5 — Full-stack runtime

Cette étape supprime toutes les sources mock et connecte l’interface aux services réels InsForge.

## Fonctionnalités branchées

- feed et filtre catégories depuis `posts` / `categories` ;
- recherche PostgREST ;
- création, modification préparée et suppression douce des annonces ;
- upload d’images dans `public-post-media` et indexation `post_media` ;
- fiche annonce, auteur public, favoris et signalements ;
- profil privé et mise à jour contrôlée par RLS ;
- conversations, participants, messages et lecture ;
- RPC sécurisées pour démarrer une conversation et révéler le téléphone ;
- checkout InsForge Payments ;
- webhook Stripe Vercel vers `billing_entitlements` ;
- API `/api/health`, `/api/runtime/config`, `/api/webhooks/stripe`.

## Source de vérité

Toutes les données métier sont lues depuis InsForge. Les seules constantes frontend restantes sont la présentation des offres tarifaires et les libellés UI. Elles ne simulent aucun enregistrement utilisateur.
