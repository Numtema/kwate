# Prompt — Fix KWATE Bug

Tu dois corriger un bug dans KWATE.

Avant de modifier :

1. Reproduis mentalement le bug.
2. Identifie route/composant/feature.
3. Vérifie `ai/FILE_OWNERSHIP.yml`.
4. Si la correction touche auth, payment, admin, storage ou RLS : classer high/critical.
5. Préserve l’UI existante sauf nécessité.

Bug : `{{BUG_DESCRIPTION}}`

Retour attendu :

1. Cause probable.
2. Fichiers touchés.
3. Risque.
4. Patch proposé.
5. Tests.
6. Verdict PASS/BLOCK.
