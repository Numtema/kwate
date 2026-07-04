import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [];
const pass = (label) => checks.push({ ok: true, label });
const fail = (label) => checks.push({ ok: false, label });
const exists = (file) => fs.existsSync(path.join(root, file));
const text = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const required = [
  'AGENTS.md', 'vercel.json',
  'features/posts/repository.ts', 'features/profiles/repository.ts', 'features/messages/repository.ts', 'features/billing/repository.ts',
  'app/api/health/route.ts', 'app/api/runtime/config/route.ts', 'app/api/webhooks/stripe/route.ts',
  'app/messages/[id]/page.tsx',
  'insforge/migrations/002_kwate_full_app.sql', 'insforge/rls/002_kwate_full_app_rls.sql',
  'insforge/buckets/public-post-media.json', 'scripts/provision-insforge.mjs',
];
required.forEach((file) => exists(file) ? pass(`exists ${file}`) : fail(`missing ${file}`));

const scanRoots = ['app', 'components', 'features', 'lib'];
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(rel);
  }
}
scanRoots.forEach(walk);
const source = sourceFiles.map((file) => text(file)).join('\n');
for (const forbidden of ['MockProvider', 'useMock(', 'MOCK_CHATS', 'initialPosts', 'setTimeout(() => router.push']) {
  source.includes(forbidden) ? fail(`forbidden mock marker: ${forbidden}`) : pass(`no mock marker: ${forbidden}`);
}

const env = text('.env.example');
for (const key of ['NEXT_PUBLIC_INSFORGE_URL', 'NEXT_PUBLIC_INSFORGE_ANON_KEY', 'INSFORGE_API_BASE_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PRICE_PASS30']) {
  env.includes(key) ? pass(`env ${key}`) : fail(`missing env ${key}`);
}
!env.includes('NEXT_PUBLIC_INSFORGE_ADMIN') ? pass('no public admin secret') : fail('public admin secret found');

const migration = text('insforge/migrations/002_kwate_full_app.sql');
for (const table of ['saved_posts', 'reports', 'conversations', 'conversation_members', 'messages', 'billing_entitlements', 'contact_unlocks']) {
  migration.includes(`public.${table}`) ? pass(`migration table ${table}`) : fail(`missing table ${table}`);
}
for (const fn of ['kwate_start_conversation', 'kwate_get_post_contact', 'kwate_mark_conversation_read', 'kwate_is_conversation_member']) {
  migration.includes(fn) ? pass(`migration function ${fn}`) : fail(`missing function ${fn}`);
}

const packageJson = JSON.parse(text('package.json'));
for (const script of ['typecheck', 'audit:step5', 'insforge:provision', 'build:vercel']) {
  packageJson.scripts?.[script] ? pass(`script ${script}`) : fail(`missing script ${script}`);
}
packageJson.dependencies?.stripe ? pass('stripe dependency') : fail('missing stripe dependency');

const publishSource = text('app/publish/page.tsx');
publishSource.includes('updatePost') ? pass('post edit repository connected') : fail('post edit repository missing');
const profileSource = text('app/profile/page.tsx');
profileSource.includes('/publish?edit=') ? pass('post edit UI connected') : fail('post edit UI missing');

const failures = checks.filter((item) => !item.ok);
for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.label}`);
console.log(`\n${checks.length - failures.length} PASS / ${failures.length} FAIL`);
process.exit(failures.length ? 1 : 0);
