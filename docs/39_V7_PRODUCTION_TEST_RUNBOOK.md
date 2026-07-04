# KWATE V7 — Production Test Runbook

## Préconditions

Le GitHub Environment ciblé doit contenir :

```txt
INSFORGE_API_BASE_URL
INSFORGE_API_KEY ou INSFORGE_ADMIN_TOKEN
NEXT_PUBLIC_INSFORGE_URL
NEXT_PUBLIC_INSFORGE_ANON_KEY
KWATE_TEST_USER_A_EMAIL
KWATE_TEST_USER_A_PASSWORD
KWATE_TEST_USER_B_EMAIL
KWATE_TEST_USER_B_PASSWORD
```

Les deux comptes doivent être distincts, vérifiés et réservés aux tests.

## 1. Provisionnement

Exécuter `KWATE InsForge Control Plane` :

```txt
plan → verify → apply → verify
```

Production apply :

```txt
confirmation        KWATE_PROVISION
target_host         hostname exact
backup_confirmation BACKUP_CONFIRMED
```

Le PASS exige les migrations 001, 002 et 003 ainsi qu'un bucket `public-post-media` conforme.

## 2. Test réel à deux comptes

Exécuter le workflow :

```txt
KWATE V7 Two-Account Production Test
```

Confirmation :

```txt
KWATE_V7_TEST
```

Le scénario :

1. connecte le compte A ;
2. connecte le compte B ;
3. vérifie ou crée leurs profils ;
4. crée un brouillon réel avec A ;
5. vérifie que B ne voit pas ce brouillon ;
6. tente et refuse une activation directe par A, sans RPC ;
7. génère et charge cinq PNG ;
8. indexe cinq lignes `post_media` ;
9. publie via `kwate_publish_post` ;
10. vérifie que B peut lire l'annonce active ;
11. vérifie que B ne peut ni modifier l'annonce ni joindre un média forgé ;
12. vérifie que B ne peut pas lire le profil privé de A ;
13. vérifie que B peut enregistrer l'annonce publique ;
14. nettoie par défaut les données et fichiers de test via les RPC de cycle.

Rapport :

```txt
artifacts/v7-two-account-report.json
```

## 3. Test des orphelins

Exécuter d'abord :

```txt
KWATE Media Orphan Control
mode=plan
```

Ne lancer `apply` qu'après lecture de l'artefact et sauvegarde des médias en production.

## Verdict

`PASS` signifie :

- migration 003 observée à distance ;
- bucket observé avec la bonne configuration ;
- deux sessions réelles ;
- annonce réelle publiée ;
- cinq fichiers réels ;
- brouillon invisible au second compte ;
- contournement direct `draft → active` refusé ;
- RLS inter-utilisateur refusée ;
- cleanup exécuté ou explicitement conservé.

Sans comptes de test ou secrets GitHub, le verdict distant reste `BLOCK`, même si le code local compile.
