# KWATE — InsForge assets

## Étape 3

```txt
migrations/001_kwate_core_schema.sql  # tables, indexes, triggers, public view
rls/001_kwate_core_rls.sql             # RLS policies and grants
seeds/001_kwate_categories.sql         # idempotent seed
checks/001_kwate_core_smoke.sql        # read-only validation
rollback/001_kwate_core_rollback.sql   # destructive rollback, approval required
policies/kwate_core_policies.yml       # human/AI policy map
```

## Execution

Run the files in the documented order through the InsForge Admin migration endpoint. Do not execute the rollback without a verified backup and explicit production approval.
