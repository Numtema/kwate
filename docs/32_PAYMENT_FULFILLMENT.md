# Payment fulfillment

Le checkout est créé par InsForge Payments. La redirection de succès n’active aucun droit.

Le webhook Vercel vérifie `stripe-signature`, puis écrit avec une clé InsForge serveur :

- `pass30` → `contact_pass`, 30 usages, 90 jours ;
- `pass12` → `contact_pass`, usages illimités, 365 jours ;
- `pro` → `kwate_pro`, usages illimités, renouvelé par `invoice.paid`.

`kwate_get_post_contact()` réutilise un déverrouillage existant et n’incrémente `usage_count` qu’au premier accès à une annonce.
