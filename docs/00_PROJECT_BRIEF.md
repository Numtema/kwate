# KWATE — Project brief

KWATE est une marketplace locale mobile-first connectée à InsForge. Les utilisateurs créent un compte, publient des annonces de service/vente/échange, ajoutent des photos, recherchent des offres, enregistrent des favoris, signalent un contenu, discutent et déverrouillent un contact selon leurs droits.

## État actuel

- Auth InsForge réelle.
- Données métier PostgreSQL réelles.
- Upload InsForge Storage.
- RLS sur chaque table privée.
- Checkout InsForge Payments et fulfillment par webhook Stripe.
- Aucun provider ou jeu de données mock dans le runtime.
- Build Vercel validé localement.

La configuration distante et le déploiement nécessitent les secrets du compte propriétaire. Voir `AGENTS.md`.
