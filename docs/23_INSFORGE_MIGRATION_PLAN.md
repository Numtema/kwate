# Plan de migration InsForge

Le runtime mock a été entièrement remplacé. Les scripts de migration sont versionnés :

1. `001_kwate_core_schema.sql`
2. `001_kwate_core_rls.sql`
3. `001_kwate_categories.sql`
4. `002_kwate_full_app.sql`
5. `002_kwate_full_app_rls.sql`
6. bucket `public-post-media`

Exécution protégée :

```bash
CONFIRM_INSFORGE_PROVISION=YES npm run insforge:provision
```

Ne jamais exécuter sans sauvegarde, contrôle de l'URL cible et secret admin server-only.
