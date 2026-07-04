import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const results = [];
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const check = (condition, label) => results.push({ ok: Boolean(condition), label });

const required = [
  'features/posts/media.ts',
  'features/posts/repository.ts',
  'insforge/migrations/003_kwate_media_pipeline.sql',
  'insforge/checks/003_kwate_media_pipeline_smoke.sql',
  'insforge/rollback/003_kwate_media_pipeline_rollback.sql',
  'scripts/cleanup-media-orphans.mjs',
  'scripts/test-v7-two-account.mjs',
  '.github/workflows/v7-production-smoke.yml',
  '.github/workflows/media-orphan-cleanup.yml',
  'docs/38_V7_BACKEND_MEDIA_PIPELINE.md',
  'docs/39_V7_PRODUCTION_TEST_RUNBOOK.md',
  'ai/V7_MEDIA_PIPELINE_REGISTRY.yml',
];
for (const file of required) check(exists(file), `exists ${file}`);

const pkg = JSON.parse(read('package.json'));
check(pkg.version === '0.7.0', 'package version is 0.7.0');
for (const script of ['audit:v7', 'test:v7:two-account', 'media:orphans:plan', 'media:orphans:apply']) {
  check(Boolean(pkg.scripts?.[script]), `script ${script}`);
}
check(pkg.scripts?.['verify:ci']?.includes('audit:v7'), 'CI verification includes V7 audit');

const repository = read('features/posts/repository.ts');
check(!repository.match(/insert\(\[\{[\s\S]{0,500}(status|published_at):/), 'new posts rely on protected database draft defaults');
check(!repository.match(/insert\(\[\{[\s\S]{0,500}status: 'active'/), 'repository does not insert a new active post');
check(repository.includes("rpc('kwate_publish_post'"), 'publication uses server lifecycle gate');
check(repository.includes('rollbackUploadedMedia'), 'failed publication rolls back uploaded media');
check(repository.includes("rpc('kwate_abort_post_draft'"), 'failed publication aborts draft');
check(repository.includes('cleanupPostMediaForDeletion'), 'post deletion schedules media cleanup');

const media = read('features/posts/media.ts');
check(media.includes('POST_MEDIA_LIMIT = 5'), 'five-photo limit is centralized');
check(media.includes('POST_MEDIA_MAX_BYTES = 10 * 1024 * 1024'), 'ten-megabyte limit is centralized');
check(media.includes("remove(item.object_key)"), 'rollback removes storage objects');
check(media.includes("from('post_media').delete()"), 'rollback removes media metadata');

const migration = read('insforge/migrations/003_kwate_media_pipeline.sql');
for (const marker of ['kwate_publish_post', 'kwate_abort_post_draft', 'kwate_set_post_status', 'kwate_delete_post', 'trg_post_media_validate_insert', 'POST_MEDIA_LIMIT_REACHED', 'MEDIA_COUNT_MISMATCH', 'revoke insert (status, published_at)', 'revoke update (status, published_at, deleted_at)']) {
  check(migration.includes(marker), `migration marker ${marker}`);
}

const provision = read('scripts/provision-insforge.mjs');
check(provision.includes('003_kwate_media_pipeline'), 'provisioner includes migration 003');
check(provision.includes('bucketMismatches'), 'provisioner validates bucket configuration');

const orphan = read('scripts/cleanup-media-orphans.mjs');
check(orphan.includes("mode =") && orphan.includes("'plan'"), 'orphan cleanup defaults to plan');
check(orphan.includes('KWATE_MEDIA_CLEANUP'), 'orphan deletion requires confirmation');
check(orphan.includes('MEDIA_ORPHAN_MIN_AGE_HOURS'), 'orphan cleanup has minimum-age safety');
check(orphan.includes('Number.isFinite(requestedMinAgeHours)'), 'orphan cleanup rejects invalid age');
check(orphan.includes("reason: media ? (!post ? 'missing-post' : 'deleted-post')"), 'orphan cleanup detects deleted-post media');
check(orphan.includes('deleteMediaMetadata'), 'orphan cleanup removes stale metadata after object deletion');

const twoAccount = read('scripts/test-v7-two-account.mjs');
check(twoAccount.includes('KWATE_TEST_USER_A_EMAIL'), 'two-account test uses account A');
check(twoAccount.includes('KWATE_TEST_USER_B_EMAIL'), 'two-account test uses account B');
check(twoAccount.includes('for (let index = 1; index <= 5'), 'two-account test uploads five photos');
check(twoAccount.includes('RLS violation attempt'), 'two-account test attempts forbidden mutation');
check(twoAccount.includes('private profile leaked'), 'two-account test verifies private profile isolation');
check(twoAccount.includes('draft leaked before publication'), 'two-account test verifies draft isolation');
check(twoAccount.includes('direct draft-to-active update succeeded'), 'two-account test verifies lifecycle bypass is blocked');
check(twoAccount.includes("rpc('kwate_delete_post'"), 'two-account test cleans up through lifecycle RPC');

const failures = results.filter((result) => !result.ok);
for (const result of results) console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.label}`);
console.log(`V7 audit: ${results.length - failures.length} PASS / ${failures.length} FAIL`);
if (failures.length) process.exit(1);
