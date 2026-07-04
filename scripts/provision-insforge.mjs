import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const modeArg = process.argv.find((arg) => arg.startsWith('--mode='));
const mode = modeArg?.split('=')[1] || 'plan';
const allowedModes = new Set(['plan', 'verify', 'apply']);
if (!allowedModes.has(mode)) {
  console.error(`BLOCKED: invalid mode "${mode}". Use plan, verify or apply.`);
  process.exit(1);
}

const baseUrl = (process.env.INSFORGE_API_BASE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || '').replace(/\/$/, '');
const adminToken = process.env.INSFORGE_ADMIN_TOKEN;
const apiKey = process.env.INSFORGE_API_KEY;
const target = process.env.DEPLOYMENT_TARGET || 'development';

if (!baseUrl || (!adminToken && !apiKey)) {
  console.error('BLOCKED: missing INSFORGE_API_BASE_URL and INSFORGE_ADMIN_TOKEN or INSFORGE_API_KEY.');
  process.exit(1);
}

let targetHost;
try {
  targetHost = new URL(baseUrl).host;
} catch {
  console.error('BLOCKED: INSFORGE_API_BASE_URL is not a valid absolute URL.');
  process.exit(1);
}

if (mode === 'apply') {
  if (process.env.CONFIRM_INSFORGE_PROVISION !== 'KWATE_PROVISION') {
    console.error('BLOCKED: set CONFIRM_INSFORGE_PROVISION=KWATE_PROVISION for apply mode.');
    process.exit(1);
  }
  if (process.env.CONFIRM_INSFORGE_TARGET_HOST !== targetHost) {
    console.error(`BLOCKED: CONFIRM_INSFORGE_TARGET_HOST must exactly equal ${targetHost}.`);
    process.exit(1);
  }
  if (target === 'production' && process.env.CONFIRM_PRODUCTION_BACKUP !== 'BACKUP_CONFIRMED') {
    console.error('BLOCKED: production apply requires CONFIRM_PRODUCTION_BACKUP=BACKUP_CONFIRMED.');
    process.exit(1);
  }
}

const headers = {'Content-Type': 'application/json', Accept: 'application/json'};
if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
if (apiKey) headers['X-API-Key'] = apiKey;

async function request(endpoint, init = {}, {optional = false} = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...init,
    headers: {...headers, ...(init.headers || {})},
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    if (optional) return {ok: false, status: response.status, data: json};
    const error = new Error(json?.message || `${init.method || 'GET'} ${endpoint} failed (${response.status})`);
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return {ok: true, status: response.status, data: json};
}

const operations = [
  ['001_kwate_core_schema', 'KWATE core schema', 'insforge/migrations/001_kwate_core_schema.sql'],
  ['001_kwate_core_rls', 'KWATE core RLS', 'insforge/rls/001_kwate_core_rls.sql'],
  ['001_kwate_categories_seed', 'KWATE categories seed', 'insforge/seeds/001_kwate_categories.sql'],
  ['002_kwate_full_app', 'KWATE full application schema', 'insforge/migrations/002_kwate_full_app.sql'],
  ['002_kwate_full_app_rls', 'KWATE full application RLS', 'insforge/rls/002_kwate_full_app_rls.sql'],
  ['003_kwate_media_pipeline', 'KWATE V7 production media lifecycle', 'insforge/migrations/003_kwate_media_pipeline.sql'],
];
const expectedBucket = 'public-post-media';
const expectedBucketConfig = JSON.parse(await fs.readFile(path.join(root, 'insforge/buckets/public-post-media.json'), 'utf8'));
const expectedBucketApiPayload = {
  bucketName: expectedBucketConfig.bucketName,
  isPublic: expectedBucketConfig.isPublic,
};
const report = {
  generatedAt: new Date().toISOString(),
  mode,
  target,
  targetHost,
  metadata: null,
  database: null,
  existingMigrations: [],
  plannedMigrations: [],
  appliedMigrations: [],
  buckets: [],
  bucketAction: 'none',
  bucketValidation: { mismatches: [] },
  verdict: 'BLOCK',
  errors: [],
};

const normalizeArray = (value, keys) => {
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return [];
};

const bucketNameOf = (item) => typeof item === 'string' ? item : item?.name || item?.id || item?.bucketName || item?.bucket_name;
const bucketMismatches = (item) => {
  if (!item) return ['missing'];
  const mismatches = [];
  const isPublic = item.isPublic ?? item.public ?? item.is_public;
  const maxFileSize = item.maxFileSize ?? item.max_file_size ?? item.fileSizeLimit;
  const allowed = item.allowedMimeTypes ?? item.allowed_mime_types ?? item.allowedContentTypes;
  if (typeof isPublic === 'boolean' && isPublic !== expectedBucketConfig.isPublic) mismatches.push(`isPublic expected ${expectedBucketConfig.isPublic}`);
  if (Number.isFinite(Number(maxFileSize)) && Number(maxFileSize) !== expectedBucketConfig.maxFileSize) mismatches.push(`maxFileSize expected ${expectedBucketConfig.maxFileSize}`);
  if (Array.isArray(allowed)) {
    const actual = [...allowed].sort().join(',');
    const expected = [...expectedBucketConfig.allowedMimeTypes].sort().join(',');
    if (actual !== expected) mismatches.push('allowedMimeTypes mismatch');
  }
  return mismatches;
};

async function inspect() {
  const metadata = await request('/api/metadata', {}, {optional: true});
  report.metadata = metadata.ok ? metadata.data : {unavailable: true, status: metadata.status};

  const database = await request('/api/metadata/database', {}, {optional: true});
  report.database = database.ok ? database.data : {unavailable: true, status: database.status};

  const migrationResponse = await request('/api/database/migrations');
  report.existingMigrations = normalizeArray(migrationResponse.data, ['migrations']);

  const bucketResponse = await request('/api/storage/buckets', {}, {optional: true});
  report.buckets = bucketResponse.ok ? normalizeArray(bucketResponse.data, ['buckets']) : [];
}

async function writeReport() {
  await fs.mkdir(path.join(root, 'artifacts'), {recursive: true});
  await fs.writeFile(
    path.join(root, 'artifacts', 'insforge-provision-report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}

try {
  console.log(`MODE ${mode.toUpperCase()}`);
  console.log(`TARGET ${target}`);
  console.log(`HOST ${targetHost}`);
  await inspect();

  const versions = new Set(report.existingMigrations.map((item) => item.version));
  report.plannedMigrations = operations
    .filter(([version]) => !versions.has(version))
    .map(([version, name, relativePath]) => ({version, name, relativePath}));

  const bucketNames = new Set(report.buckets.map(bucketNameOf));
  const existingBucket = report.buckets.find((item) => bucketNameOf(item) === expectedBucket);
  const bucketMissing = !bucketNames.has(expectedBucket);
  const mismatches = bucketMissing ? ['missing'] : bucketMismatches(existingBucket);
  report.bucketValidation = { mismatches };

  if (mode === 'plan') {
    for (const item of report.plannedMigrations) console.log(`PLAN migration ${item.version}`);
    if (bucketMissing) console.log(`PLAN bucket ${expectedBucket}`);
    else if (mismatches.length) console.log(`PLAN update bucket ${expectedBucket}: ${mismatches.join(', ')}`);
    else console.log(`SKIP bucket ${expectedBucket} (valid)`);
    report.bucketAction = bucketMissing ? 'create-planned' : mismatches.length ? 'update-planned' : 'valid';
    report.verdict = 'PASS';
  }

  if (mode === 'verify') {
    const missing = report.plannedMigrations.map((item) => item.version);
    if (missing.length) report.errors.push(`Missing migrations: ${missing.join(', ')}`);
    if (bucketMissing) report.errors.push(`Missing bucket: ${expectedBucket}`);
    else if (mismatches.length) report.errors.push(`Bucket configuration mismatch: ${mismatches.join(', ')}`);
    report.bucketAction = bucketMissing ? 'missing' : mismatches.length ? 'invalid' : 'valid';
    report.verdict = report.errors.length ? 'BLOCK' : 'PASS';
  }

  if (mode === 'apply') {
    for (const [version, name, relativePath] of operations) {
      if (versions.has(version)) {
        console.log(`SKIP migration ${version} (exists)`);
        continue;
      }
      const sql = await fs.readFile(path.join(root, relativePath), 'utf8');
      console.log(`APPLY migration ${version}`);
      await request('/api/database/migrations', {
        method: 'POST',
        body: JSON.stringify({version, name, sql}),
      });
      report.appliedMigrations.push(version);
    }

    if (bucketMissing) {
      console.log(`CREATE bucket ${expectedBucket}`);
      await request('/api/storage/buckets', {method: 'POST', body: JSON.stringify(expectedBucketApiPayload)});
      report.bucketAction = 'created';
    } else if (mismatches.length) {
      console.log(`UPDATE bucket ${expectedBucket}`);
      await request(`/api/storage/buckets/${encodeURIComponent(expectedBucket)}`, {
        method: 'PATCH',
        body: JSON.stringify({isPublic: expectedBucketConfig.isPublic}),
      });
      report.bucketAction = 'updated';
    } else {
      report.bucketAction = 'valid';
    }

    report.existingMigrations = [];
    report.buckets = [];
    await inspect();
    const finalVersions = new Set(report.existingMigrations.map((item) => item.version));
    const missingAfterApply = operations.map(([version]) => version).filter((version) => !finalVersions.has(version));
    const finalBucketNames = new Set(report.buckets.map(bucketNameOf));
    const finalBucket = report.buckets.find((item) => bucketNameOf(item) === expectedBucket);
    const finalMismatches = finalBucketNames.has(expectedBucket) ? bucketMismatches(finalBucket) : ['missing'];
    report.bucketValidation = { mismatches: finalMismatches };
    if (missingAfterApply.length) report.errors.push(`Still missing migrations: ${missingAfterApply.join(', ')}`);
    if (!finalBucketNames.has(expectedBucket)) report.errors.push(`Still missing bucket: ${expectedBucket}`);
    else if (finalMismatches.length) report.errors.push(`Bucket still invalid: ${finalMismatches.join(', ')}`);
    report.verdict = report.errors.length ? 'BLOCK' : 'PASS';
  }
} catch (error) {
  report.errors.push(error.message);
  report.verdict = 'BLOCK';
  console.error(`BLOCK ${error.message}`);
} finally {
  await writeReport();
}

console.log(`VERDICT ${report.verdict}`);
console.log('REPORT artifacts/insforge-provision-report.json');
if (report.verdict !== 'PASS') process.exit(1);
