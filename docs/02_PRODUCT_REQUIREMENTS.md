# KWATE — Product Requirements

## Personas

### 1. Vendeur / prestataire

Veut publier rapidement un service, une vente ou une proposition d’échange.

Besoins :

- créer un compte ;
- publier une annonce ;
- ajouter photos ;
- recevoir messages ;
- activer ou renouveler un pass ;
- voir ses annonces.

### 2. Acheteur / demandeur

Veut rechercher une annonce fiable localement.

Besoins :

- parcourir les annonces ;
- filtrer par catégorie et zone ;
- voir les badges de confiance ;
- contacter ou répondre ;
- signaler une annonce.

### 3. Admin KWATE

Veut contrôler la qualité et la sécurité.

Besoins :

- voir signalements ;
- masquer annonces ;
- bloquer utilisateurs ;
- consulter logs ;
- vérifier paiements/pass ;
- gérer catégories.

## Exigences MVP

### Auth

- Signup email/password.
- Login.
- Logout.
- Password reset.
- Session persistante sûre.
- Profile current user.

### Annonces

- Créer, lire, modifier, soft-delete.
- Types : service, vente, échange consommable.
- Catégories : bricolage, alimentation, tech, transport, maison, cuisine, autre.
- Prix texte au MVP.
- Zone texte au MVP.
- Statut : draft, active, paused, blocked, deleted.

### Contact

- Échange consommable : réponse libre.
- Service/vente : contact verrouillé si pass absent.
- Déblocage contact audité.

### Pass

- Pass 30 jours.
- Pass annuel plus tard.
- Compte pro plus tard.
- Stripe Checkout via InsForge Payments.

### Modération

- Signaler annonce.
- Masquer annonce.
- Audit de toute action admin.

## Critères d’acceptation MVP

- Un utilisateur peut créer un compte et publier une annonce réelle.
- Une annonce créée apparaît dans feed/search après reload.
- Un utilisateur ne peut modifier que ses propres annonces.
- Un utilisateur non connecté ne peut pas publier.
- Le pass actif débloque les contacts selon règle produit.
- Un webhook paiement active un entitlement sans dépendre uniquement de la success URL.
- Les actions sensibles écrivent un audit event.
