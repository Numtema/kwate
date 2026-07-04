import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const mode = process.argv.find((arg) => arg.startsWith('--mode='))?.split('=')[1] || 'plan';
if (!['plan', 'apply'].includes(mode)) {
  console.error('BLOCKED: use --mode=plan or --mode=apply.');
  process.exit(1);
}

const baseUrl = (process.env.INSFORGE_API_BASE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || '').replace(/\/$/, '');
const adminToken = process.env.INSFORGE_ADMIN_TOKEN;
const apiKey = process.env.INSFORGE_API_KEY;
const bucket = 'public-post-media';
const requestedMinAgeHours = Number(process.env.MEDIA_ORPHAN_MIN_AGE_HOURS || 24);
if (!Number.isFinite(requestedMinAgeHours) || requestedMinAgeHours < 1) {
  console.error('BLOCKED: MEDIA_ORPHAN_MIN_AGE_HOURS must be a finite number greater than or equal to 1.');
  process.exit(1);
}
const minAgeHours = requestedMinAgeHours;
const prefix = process.env.MEDIA_ORPHAN_PREFIX || '';

if (!baseUrl || (!adminToken && !apiKey)) {
  console.error('BLOCKED: InsForge admin credentials are required.');
  process.exit(1);
}

const host = new URL(baseUrl).host;
if (mode === 'apply') {
  if (process.env.CONFIRM_MEDIA_ORPHAN_CLEANUP !== 'KWATE_MEDIA_CLEANUP') {
    console.error('BLOCKED: set CONFIRM_MEDIA_ORPHAN_CLEANUP=KWATE_MEDIA_CLEANUP.');
    process.exit(1);
  }
  if (process.env.CONFIRM_INSFORGE_TARGET_HOST !== host) {
    console.error(`BLOCKED: CONFIRM_INSFORGE_TARGET_HOST must equal ${host}.`);
    process.exit(1);
  }
}

const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
if (apiKey) headers['X-API-Key'] = apiKey;

async function request(endpoint, init = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const json = await response.json().catch(() => null);
  if (!response.ok) throw new Error(json?.message || `${init.method || 'GET'} ${endpoint} failed (${response.status})`);
  return json;
}

function unwrapArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function objectKey(item) {
  return item?.key || item?.objectKey || item?.object_key || item?.path || item?.name || null;
}

function objectTimestamp(item) {
  const value = item?.uploadedAt || item?.createdAt || item?.created_at || item?.updatedAt || item?.updated_at;
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

async function listPaginated(endpointFactory, keys) {
  const items = [];
  const limit = 100;
  let offset = 0;
  for (let pageNumber = 0; pageNumber < 10000; pageNumber += 1) {
    const payload = await request(endpointFactory({ limit, offset }));
    const page = unwrapArray(payload, keys);
    if (page.length === 0) break;
    items.push(...page);
    offset += page.length;
    const total = payload?.pagination?.total ?? payload?.data?.pagination?.total;
    if (Number.isFinite(Number(total)) && items.length >= Number(total)) break;
  }
  return items;
}

async function listAllObjects() {
  return listPaginated(({ limit, offset }) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (prefix) params.set('prefix', prefix);
    return `/api/storage/buckets/${bucket}/objects?${params}`;
  }, ['objects', 'files']);
}

async function listAllMediaRows() {
  return listPaginated(({ limit, offset }) => {
    const params = new URLSearchParams({
      select: 'id,object_key,post_id',
      limit: String(limit),
      offset: String(offset),
    });
    return `/api/database/records/post_media?${params}`;
  }, ['records', 'rows']);
}

async function listAllPosts() {
  return listPaginated(({ limit, offset }) => {
    const params = new URLSearchParams({
      select: 'id,status,deleted_at',
      limit: String(limit),
      offset: String(offset),
    });
    return `/api/database/records/posts?${params}`;
  }, ['records', 'rows']);
}

async function deleteMediaMetadata(mediaId) {
  const params = new URLSearchParams({ id: `eq.${mediaId}` });
  await request(`/api/database/records/post_media?${params}`, { method: 'DELETE' });
}

const report = {
  generatedAt: new Date().toISOString(),
  mode,
  targetHost: host,
  bucket,
  prefix,
  minAgeHours,
  objectCount: 0,
  referenceCount: 0,
  postCount: 0,
  orphanCandidates: [],
  danglingMetadata: [],
  deleted: [],
  metadataDeleted: [],
  skippedUnknownAge: [],
  errors: [],
  verdict: 'BLOCK',
};

try {
  const [objects, mediaRows, posts] = await Promise.all([listAllObjects(), listAllMediaRows(), listAllPosts()]);
  report.objectCount = objects.length;
  report.referenceCount = mediaRows.length;
  report.postCount = posts.length;

  const postState = new Map(posts.map((post) => [String(post.id), post]));
  const mediaByKey = new Map();
  for (const row of mediaRows) {
    if (row?.object_key) mediaByKey.set(String(row.object_key), row);
  }
  const objectKeys = new Set(objects.map(objectKey).filter(Boolean));
  report.danglingMetadata = mediaRows
    .filter((row) => row?.object_key && !objectKeys.has(String(row.object_key)))
    .map((row) => ({ id: row.id, key: row.object_key, postId: row.post_id }));

  const cutoff = Date.now() - minAgeHours * 60 * 60 * 1000;
  for (const item of objects) {
    const key = objectKey(item);
    if (!key) continue;
    const media = mediaByKey.get(key) || null;
    const post = media?.post_id ? postState.get(String(media.post_id)) : null;
    const isReferencedByLivePost = Boolean(media && post && post.deleted_at == null && post.status !== 'deleted');
    if (isReferencedByLivePost) continue;

    const timestamp = objectTimestamp(item);
    if (timestamp === null || timestamp > cutoff) {
      report.skippedUnknownAge.push({ key, reason: timestamp === null ? 'unknown-age' : 'too-recent' });
      continue;
    }

    report.orphanCandidates.push({
      key,
      mediaId: media?.id || null,
      postId: media?.post_id || null,
      reason: media ? (!post ? 'missing-post' : 'deleted-post') : 'missing-metadata',
      ageHours: Math.floor((Date.now() - timestamp) / 3600000),
    });
  }

  if (mode === 'apply') {
    for (const candidate of report.orphanCandidates) {
      try {
        await request(`/api/storage/buckets/${bucket}/objects/${encodeURIComponent(candidate.key)}`, { method: 'DELETE' });
        report.deleted.push(candidate.key);
        if (candidate.mediaId) {
          await deleteMediaMetadata(candidate.mediaId);
          report.metadataDeleted.push(candidate.mediaId);
        }
      } catch (error) {
        report.errors.push(`${candidate.key}: ${error.message}`);
      }
    }
  }

  report.verdict = report.errors.length ? 'BLOCK' : 'PASS';
} catch (error) {
  report.errors.push(error.message);
  report.verdict = 'BLOCK';
}

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts/media-orphan-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`MODE ${mode.toUpperCase()}`);
console.log(`OBJECTS ${report.objectCount}`);
console.log(`REFERENCES ${report.referenceCount}`);
console.log(`POSTS ${report.postCount}`);
console.log(`DANGLING_METADATA ${report.danglingMetadata.length}`);
console.log(`ORPHANS ${report.orphanCandidates.length}`);
console.log(`DELETED ${report.deleted.length}`);
console.log(`VERDICT ${report.verdict}`);
console.log('REPORT artifacts/media-orphan-report.json');
if (report.verdict !== 'PASS') process.exit(1);
