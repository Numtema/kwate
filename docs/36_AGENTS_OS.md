# KWATE V6 — AGENTS OS

`AGENTS.md` est désormais le runbook exécutable du projet.

Il définit :

```txt
ordre des sources de vérité
modes READ_ONLY / PLAN / CODE / VERIFY / APPLY / REPAIR
préflight obligatoire
ownership et niveaux de risque
contrat CI
contrat Vercel
connexion InsForge
provisionnement plan/verify/apply
validation Auth, Storage et Payments
smoke tests production
repair et rollback
verdict PASS / BLOCK
Definition of Done
```

Le fichier machine-readable `ai/AGENT_EXECUTION_PROTOCOL.yml` permet à une IA de retrouver les mêmes garde-fous sans interprétation libre.

Principe : aucune opération distante n’est implicite. Un agent non connecté à InsForge peut terminer le code, produire le plan et les scripts ; l’agent disposant des credentials suit ensuite le protocole gardé.
