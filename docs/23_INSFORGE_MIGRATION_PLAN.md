# Plan de migration InsForge

Le runtime mock a été entièrement remplacé. Les scripts de migration sont versionnés :

1. `001_kwate_core_schema.sql`
2. `001_kwate_core_rls.sql`
3. `001_kwate_categories.sql`
4. `002_kwate_full_app.sql`
5. `002_kwate_full_app_rls.sql`
6. `003_kwate_media_pipeline.sql`
7. bucket `public-post-media`

Exécution protégée :

```bash
DEPLOYMENT_TARGET=production \
CONFIRM_INSFORGE_PROVISION=KWATE_PROVISION \
CONFIRM_INSFORGE_TARGET_HOST=PROJECT.REGION.insforge.app \
CONFIRM_PRODUCTION_BACKUP=BACKUP_CONFIRMED \
npm run insforge:provision
```

Ne jamais exécuter sans sauvegarde, contrôle de l'URL cible et secret admin server-only.
