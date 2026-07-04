# KWATE V7 — Backend Production & Media Pipeline

## Objectif

V7 sécurise le cycle complet d'une annonce et de ses médias :

```txt
formulaire validé
→ création d'un brouillon privé
→ upload Storage
→ indexation post_media
→ contrôle serveur du nombre de médias
→ publication active
```

Une annonce n'est plus créée directement avec `status=active`.

## Garanties

- maximum 5 images par annonce ;
- JPEG, PNG, WebP et AVIF ;
- 10 Mo maximum par fichier ;
- chemin Storage `{userId}/{postId}/{uuid}.{extension}` ;
- owner du média obligatoirement identique à l'owner de l'annonce ;
- publication refusée si le nombre attendu ne correspond pas au nombre indexé ;
- rollback des métadonnées et objets déjà uploadés si le pipeline échoue ;
- brouillon technique clôturé en soft-delete après un échec ;
- colonnes de cycle (`status`, `published_at`, `deleted_at`) inaccessibles en écriture directe côté client ;
- insertions directes `active` bloquées par privilèges PostgreSQL ;
- sérialisation des uploads concurrents pour empêcher un sixième média ;
- nettoyage des objets lors d'une suppression d'annonce ;
- outil server-only de détection et suppression des fichiers orphelins anciens.

## Migration 003

`insforge/migrations/003_kwate_media_pipeline.sql` ajoute :

```txt
trg_post_media_validate_insert
kwate_publish_post(post_id, expected_media_count)
kwate_abort_post_draft(post_id)
kwate_set_post_status(post_id, target_status)
kwate_delete_post(post_id)
```

La migration révoque aussi les privilèges clients permettant d'insérer ou modifier directement les colonnes de cycle de vie. La valeur `draft` vient du défaut PostgreSQL, puis seul `kwate_publish_post` peut effectuer la première publication.

Le trigger verrouille la ligne de l'annonce pendant l'insertion et vérifie la propriété, le bucket, l'URL publique, la limite de cinq fichiers, le MIME et la taille.

## Cycle des statuts

```txt
draft → active     via kwate_publish_post uniquement
active → paused
paused → active
active/paused → sold
sold → état final côté utilisateur
tout état autorisé → deleted via kwate_delete_post
blocked → administration uniquement
```

## Pipeline frontend

`features/posts/media.ts` centralise :

- validation des fichiers ;
- génération des object keys ;
- upload ;
- écriture `post_media` ;
- progression UI ;
- rollback ;
- suppression unitaire ;
- nettoyage d'une annonce supprimée.

`app/publish/page.tsx` permet :

- prévisualisation ;
- ajout jusqu'à cinq images ;
- suppression d'une image existante ;
- état d'avancement upload/indexation/publication ;
- conservation privée du brouillon tant que le pipeline n'est pas validé.

## Orphelins Storage

Lecture seule :

```bash
npm run media:orphans:plan
```

Suppression gardée :

```bash
CONFIRM_MEDIA_ORPHAN_CLEANUP=KWATE_MEDIA_CLEANUP \
CONFIRM_INSFORGE_TARGET_HOST=PROJECT.REGION.insforge.app \
npm run media:orphans:apply
```

La commande ignore toujours les objets trop récents et ceux dont la date est inconnue. L'âge minimum par défaut est 24 heures et toute valeur invalide bloque l'exécution. Elle détecte aussi les objets liés à une annonce supprimée et nettoie leur ligne `post_media` seulement après suppression Storage réussie.

## Limite de transaction

PostgreSQL et Storage ne partagent pas une transaction distribuée. V7 utilise donc une saga compensatoire : toute étape réussie possède une action de rollback. Le scan d'orphelins couvre les objets sans métadonnée, les objets encore liés à une annonce supprimée et signale les métadonnées dont l'objet Storage est absent.
