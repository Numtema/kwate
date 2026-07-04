# KWATE — Storage and Media

## Buckets cible

| Bucket | Visibilité | Usage | Risque |
|---|---|---|---|
| `public-post-media` | public | Photos annonces actives | medium |
| `avatars` | public | Avatars profils publics | medium |
| `private-message-media` | private | Pièces jointes messages | high |
| `moderation-evidence` | private | Preuves admin/modération | critical |

## Règles absolues

```txt
Ne jamais créer un bucket sans entrée dans ai/BUCKET_REGISTRY.yml.
Ne jamais rendre public un bucket qui peut contenir des documents privés.
Ne jamais accepter un bucket name venant directement du client.
Limiter mime type et taille.
Signer/presigner les uploads privés.
Écrire un audit log pour toute modification bucket/admin.
```

## Media post MVP

- JPEG, PNG, WEBP.
- Taille max recommandée : 8 MB par image.
- 6 images max par annonce au MVP.
- Chemin recommandé : `posts/{ownerId}/{postId}/{uuid}.webp`.

## Avatar MVP

- JPEG, PNG, WEBP.
- Taille max : 5 MB.
- Chemin recommandé : `avatars/{userId}/{uuid}.webp`.
