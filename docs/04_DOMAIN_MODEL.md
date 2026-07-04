# KWATE — Domain Model

## Entités principales

### User

Utilisateur authentifié par InsForge Auth.

### Profile

Données publiques/privées de l’utilisateur : nom, avatar, zone, téléphone vérifié, rating agrégé.

### Post

Annonce publiée sur KWATE.

Types :

- `service`
- `sale`
- `exchange`

Statuts :

- `draft`
- `active`
- `paused`
- `blocked`
- `deleted`

### Category

Classification produit.

### MediaAsset

Image ou fichier rattaché à une annonce ou un profil.

### Pass / Entitlement

Droit d’accès payant ou offert.

Exemple : `pass_30_days_active`.

### ContactUnlock

Trace qu’un utilisateur a obtenu le droit de contacter le propriétaire d’une annonce.

### Conversation / Message

Messagerie interne entre deux utilisateurs autour d’une annonce ou d’un besoin.

### Report

Signalement d’une annonce, d’un message ou d’un utilisateur.

### AuditEvent

Trace immuable d’une action sensible.

## Règles métier

```txt
Un utilisateur connecté peut créer une annonce.
Un utilisateur ne modifie que ses annonces.
Une annonce active est publique, sauf données de contact.
Une annonce bloquée est invisible publiquement.
Un échange consommable peut rester gratuit.
Un service ou une vente peut exiger un pass/contact unlock.
Un paiement validé active un entitlement.
Une action admin doit être auditée.
```
