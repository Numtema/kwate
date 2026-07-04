# App map

| Route | Source réelle | Fonction |
|---|---|---|
| `/` | `posts`, `post_media`, `public_profiles` | Feed actif |
| `/search` | PostgreSQL | Recherche et catégories |
| `/post/[id]` | PostgreSQL + RPC | Détail, favori, report, contact, conversation |
| `/publish` | PostgreSQL + Storage | Publication d'annonce et médias |
| `/profile` | `profiles`, `posts` | Profil et annonces personnelles |
| `/settings` | `profiles`, InsForge Auth | Mise à jour et déconnexion |
| `/messages` | conversations/messages | Boîte de réception |
| `/messages/[id]` | messages + RPC | Discussion |
| `/pass` | InsForge Payments | Checkout et droits |
| `/api/webhooks/stripe` | Stripe → PostgreSQL | Fulfillment des pass |
| `/api/health` | InsForge health | État backend |
