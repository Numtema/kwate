import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const baseUrl = (process.env.INSFORGE_API_BASE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || '').replace(/\/$/, '');
const adminToken = process.env.INSFORGE_ADMIN_TOKEN;
const apiKey = process.env.INSFORGE_API_KEY;

if (process.env.CONFIRM_INSFORGE_PROVISION !== 'YES') {
  console.error('BLOCKED: set CONFIRM_INSFORGE_PROVISION=YES to apply remote changes.');
  process.exit(1);
}
if (!baseUrl || (!adminToken && !apiKey)) {
  console.error('Missing INSFORGE_API_BASE_URL and INSFORGE_ADMIN_TOKEN or INSFORGE_API_KEY.');
  process.exit(1);
}

const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
if (apiKey) headers['X-API-Key'] = apiKey;

async function request(endpoint, init = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(json?.message || `${init.method || 'GET'} ${endpoint} failed (${response.status})`);
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}

const operations = [
  ['001_kwate_core_schema', 'KWATE core schema', 'insforge/migrations/001_kwate_core_schema.sql'],
  ['001_kwate_core_rls', 'KWATE core RLS', 'insforge/rls/001_kwate_core_rls.sql'],
  ['001_kwate_categories_seed', 'KWATE categories seed', 'insforge/seeds/001_kwate_categories.sql'],
  ['002_kwate_full_app', 'KWATE full application schema', 'insforge/migrations/002_kwate_full_app.sql'],
  ['002_kwate_full_app_rls', 'KWATE full application RLS', 'insforge/rls/002_kwate_full_app_rls.sql'],
];

console.log(`Target: ${baseUrl}`);
let existing = [];
try {
  const result = await request('/api/database/migrations');
  existing = Array.isArray(result) ? result : result?.migrations || [];
} catch (error) {
  console.warn(`Could not list migrations: ${error.message}. Continuing with idempotent SQL.`);
}
const versions = new Set(existing.map((item) => item.version));

for (const [version, name, relativePath] of operations) {
  if (versions.has(version)) {
    console.log(`SKIP ${version} (already applied)`);
    continue;
  }
  const sql = await fs.readFile(path.join(root, relativePath), 'utf8');
  console.log(`APPLY ${version}`);
  await request('/api/database/migrations', {
    method: 'POST',
    body: JSON.stringify({ version, name, sql }),
  });
}

const bucket = JSON.parse(await fs.readFile(path.join(root, 'insforge/buckets/public-post-media.json'), 'utf8'));
try {
  await request('/api/storage/buckets', { method: 'POST', body: JSON.stringify(bucket) });
  console.log('CREATE bucket public-post-media');
} catch (error) {
  if (error.status === 409 || String(error.message).toLowerCase().includes('exist')) {
    console.log('SKIP bucket public-post-media (already exists)');
  } else {
    throw error;
  }
}

const health = await request('/api/health');
console.log('PASS InsForge health', health?.status || health?.message || 'ok');
console.log('Provisioning complete. Run npm run audit:step5 and validate with two real accounts.');
