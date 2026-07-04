import { readFile, stat } from 'node:fs/promises';

const requiredFiles = [
  'insforge/migrations/001_kwate_core_schema.sql',
  'insforge/rls/001_kwate_core_rls.sql',
  'insforge/seeds/001_kwate_categories.sql',
  'insforge/checks/001_kwate_core_smoke.sql',
  'insforge/rollback/001_kwate_core_rollback.sql',
  'insforge/policies/kwate_core_policies.yml',
  'ai/SCHEMA_REGISTRY.yml',
  'ai/MIGRATION_REGISTRY.yml',
  'ai/RLS_POLICY_REGISTRY.yml',
  'ai/TABLE_ACCESS_REGISTRY.yml',
  'docs/25_DATABASE_MIGRATIONS_MVP.md',
];

const expectedTables = ['profiles', 'categories', 'posts', 'post_media', 'audit_events'];
const expectedPolicies = [
  'profiles_select_own',
  'profiles_insert_own',
  'profiles_update_own',
  'categories_select_enabled',
  'posts_select_public_or_owner',
  'posts_insert_own',
  'posts_update_own',
  'post_media_select_public_or_owner',
  'post_media_insert_owned_post',
  'post_media_delete_own',
];

const failures = [];
const passes = [];

for (const file of requiredFiles) {
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size === 0) failures.push(`${file}: missing or empty`);
    else passes.push(`${file}: present`);
  } catch {
    failures.push(`${file}: missing`);
  }
}

const schema = await readFile('insforge/migrations/001_kwate_core_schema.sql', 'utf8');
const rls = await readFile('insforge/rls/001_kwate_core_rls.sql', 'utf8');
const seed = await readFile('insforge/seeds/001_kwate_categories.sql', 'utf8');

for (const table of expectedTables) {
  const pattern = new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\b`, 'i');
  if (!pattern.test(schema)) failures.push(`schema: table ${table} not found`);
  else passes.push(`schema: table ${table}`);

  const rlsPattern = new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i');
  if (!rlsPattern.test(rls)) failures.push(`rls: ${table} is not enabled`);
  else passes.push(`rls: ${table} enabled`);
}

for (const policy of expectedPolicies) {
  if (!rls.includes(policy)) failures.push(`rls: policy ${policy} missing`);
  else passes.push(`rls: policy ${policy}`);
}

for (const slug of ['service', 'echange', 'vente']) {
  if (!seed.includes(`'${slug}'`)) failures.push(`seed: ${slug} missing`);
  else passes.push(`seed: ${slug}`);
}

if (/grant\s+(?:all|insert|update|delete).*audit_events/i.test(rls)) {
  failures.push('security: audit_events must not receive client write grants');
} else {
  passes.push('security: audit_events has no client write grant');
}

const viewStart = schema.indexOf('create or replace view public.public_profiles');
const viewSql = viewStart >= 0 ? schema.slice(viewStart) : '';
const viewSelectMatch = viewSql.match(/as\s+select([\s\S]*?)from\s+public\.profiles/i);
const viewSelectList = viewSelectMatch?.[1] ?? '';

if (viewStart < 0 || !viewSelectMatch) {
  failures.push('security: public_profiles projection missing');
} else if (/(^|[,\s])phone([,\s]|$)/i.test(viewSelectList)) {
  failures.push('security: public_profiles may expose phone');
} else {
  passes.push('security: public_profiles excludes phone');
}

console.log(`STEP 3 AUDIT — ${passes.length} PASS / ${failures.length} FAIL`);
for (const item of passes) console.log(`PASS ${item}`);
for (const item of failures) console.error(`FAIL ${item}`);

if (failures.length) process.exit(1);
