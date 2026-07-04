import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@insforge/sdk';

const baseUrl = (process.env.NEXT_PUBLIC_INSFORGE_URL || process.env.INSFORGE_API_BASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';
const accountA = { email: process.env.KWATE_TEST_USER_A_EMAIL, password: process.env.KWATE_TEST_USER_A_PASSWORD };
const accountB = { email: process.env.KWATE_TEST_USER_B_EMAIL, password: process.env.KWATE_TEST_USER_B_PASSWORD };
const keepPost = process.env.KWATE_TEST_KEEP_POST === 'true';
const confirm = process.env.CONFIRM_V7_PRODUCTION_TEST;

if (confirm !== 'KWATE_V7_TEST') {
  console.error('BLOCKED: set CONFIRM_V7_PRODUCTION_TEST=KWATE_V7_TEST.');
  process.exit(1);
}
if (!baseUrl || !accountA.email || !accountA.password || !accountB.email || !accountB.password) {
  console.error('BLOCKED: InsForge URL and two verified test accounts are required.');
  process.exit(1);
}
if (accountA.email === accountB.email) {
  console.error('BLOCKED: test accounts must be different.');
  process.exit(1);
}

const report = {
  generatedAt: new Date().toISOString(),
  targetHost: new URL(baseUrl).host,
  checks: [],
  testPostId: null,
  uploadedObjects: [],
  cleanedUp: false,
  verdict: 'BLOCK',
  errors: [],
};
const pass = (label) => { report.checks.push({ ok: true, label }); console.log(`PASS ${label}`); };
const fail = (label, detail) => { report.checks.push({ ok: false, label, detail }); throw new Error(`${label}: ${detail}`); };
const clientA = createClient({ baseUrl, anonKey });
const clientB = createClient({ baseUrl, anonKey });
let postId = null;
let userAId = null;
let userBId = null;
let savedByB = false;

function tinyPngFile(index) {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z0f8AAAAASUVORK5CYII=', 'base64');
  return new File([png], `kwate-v7-${index}.png`, { type: 'image/png', lastModified: Date.now() + index });
}

async function signIn(client, account, label) {
  const { data, error } = await client.auth.signInWithPassword(account);
  if (error || !data?.user) fail(`${label} authentication`, error?.message || 'missing user');
  pass(`${label} authentication`);
  return data.user;
}

async function ensureProfile(client, user, label) {
  const current = await client.database.from('profiles').select('user_id').eq('user_id', user.id).maybeSingle();
  if (current.error) fail(`${label} profile read`, current.error.message);
  if (!current.data) {
    const created = await client.database.from('profiles').insert([{
      user_id: user.id,
      display_name: user.name || label,
      zone: 'Douala',
    }]);
    if (created.error) fail(`${label} profile bootstrap`, created.error.message);
  }
  pass(`${label} profile available`);
}

async function cleanup() {
  if (!postId || !userAId || keepPost) return;
  try {
    const media = await clientA.database
      .from('post_media')
      .select('id,object_key,bucket')
      .eq('post_id', postId)
      .eq('owner_id', userAId);
    if (media.error) throw new Error(`media inventory failed: ${media.error.message}`);

    const metadataDelete = await clientA.database
      .from('post_media')
      .delete()
      .eq('post_id', postId)
      .eq('owner_id', userAId);
    if (metadataDelete.error) throw new Error(`media metadata cleanup failed: ${metadataDelete.error.message}`);

    for (const item of media.data || []) {
      const removal = await clientA.storage.from(item.bucket || 'public-post-media').remove(item.object_key);
      if (removal.error) throw new Error(`storage cleanup failed for ${item.object_key}: ${removal.error.message}`);
    }

    const deleted = await clientA.database.rpc('kwate_delete_post', { p_post_id: postId });
    if (deleted.error) throw new Error(`post cleanup failed: ${deleted.error.message}`);

    if (savedByB && userBId) {
      const favoriteDelete = await clientB.database
        .from('saved_posts')
        .delete()
        .eq('user_id', userBId)
        .eq('post_id', postId);
      if (favoriteDelete.error) throw new Error(`favorite cleanup failed: ${favoriteDelete.error.message}`);
    }
    report.cleanedUp = true;
  } catch (error) {
    report.errors.push(`cleanup: ${error.message}`);
    report.verdict = 'BLOCK';
  }
}

try {
  const userA = await signIn(clientA, accountA, 'Account A');
  const userB = await signIn(clientB, accountB, 'Account B');
  userAId = userA.id;
  userBId = userB.id;
  await ensureProfile(clientA, userA, 'Account A');
  await ensureProfile(clientB, userB, 'Account B');

  const category = await clientA.database.from('categories').select('id,slug').eq('slug', 'service').eq('enabled', true).single();
  if (category.error || !category.data) fail('category seed', category.error?.message || 'service category missing');
  pass('category seed');

  const draft = await clientA.database.from('posts').insert([{
    owner_id: userAId,
    category_id: category.data.id,
    type: 'service',
    title: `KWATE V7 production test ${Date.now()}`,
    description: 'Annonce réelle créée automatiquement pour vérifier le pipeline média et la sécurité RLS avec deux comptes distincts.',
    price_label: 'Test automatique',
    zone: 'Douala',
    contact_locked: true,
  }]).select('id,status').single();
  if (draft.error || !draft.data) fail('draft creation by owner', draft.error?.message || 'missing draft');
  postId = draft.data.id;
  report.testPostId = postId;
  pass('draft creation by owner');

  const hiddenDraft = await clientB.database.from('posts').select('id,status').eq('id', postId);
  if (hiddenDraft.error) pass('account B cannot read account A draft');
  else if ((hiddenDraft.data || []).length === 0) pass('account B cannot read account A draft');
  else fail('account B cannot read account A draft', 'draft leaked before publication');

  const directPublishBypass = await clientA.database
    .from('posts')
    .update({ status: 'active', published_at: new Date().toISOString() })
    .eq('id', postId)
    .select('id,status');
  if (directPublishBypass.error) pass('owner cannot bypass publication RPC');
  else if ((directPublishBypass.data || []).length === 0) pass('owner cannot bypass publication RPC');
  else fail('owner cannot bypass publication RPC', 'direct draft-to-active update succeeded');

  const draftAfterBypass = await clientA.database.from('posts').select('id,status').eq('id', postId).single();
  if (draftAfterBypass.error || draftAfterBypass.data?.status !== 'draft') {
    fail('draft remains private after bypass attempt', draftAfterBypass.error?.message || JSON.stringify(draftAfterBypass.data));
  }
  pass('draft remains private after bypass attempt');

  for (let index = 1; index <= 5; index += 1) {
    const file = tinyPngFile(index);
    const key = `${userAId}/${postId}/${crypto.randomUUID()}.png`;
    const upload = await clientA.storage.from('public-post-media').upload(key, file);
    if (upload.error) fail(`photo ${index} upload`, upload.error.message);
    const publicUrl = clientA.storage.from('public-post-media').getPublicUrl(key).data?.publicUrl ?? null;
    const metadata = await clientA.database.from('post_media').insert([{
      post_id: postId,
      owner_id: userAId,
      bucket: 'public-post-media',
      object_key: key,
      public_url: publicUrl,
      mime_type: 'image/png',
      size_bytes: file.size,
      sort_order: index - 1,
    }]);
    if (metadata.error) {
      await clientA.storage.from('public-post-media').remove(key);
      fail(`photo ${index} metadata`, metadata.error.message);
    }
    report.uploadedObjects.push(key);
    pass(`photo ${index} upload and metadata`);
  }

  const publish = await clientA.database.rpc('kwate_publish_post', { p_post_id: postId, p_expected_media_count: 5 });
  if (publish.error) fail('draft to active publication gate', publish.error.message);
  pass('draft to active publication gate');

  const ownerRead = await clientA.database.from('posts').select('id,status,post_media(id)').eq('id', postId).single();
  if (ownerRead.error || ownerRead.data?.status !== 'active' || ownerRead.data?.post_media?.length !== 5) {
    fail('owner reads active post with five photos', ownerRead.error?.message || JSON.stringify(ownerRead.data));
  }
  pass('owner reads active post with five photos');

  const publicRead = await clientB.database.from('posts').select('id,status,owner_id,post_media(id)').eq('id', postId).single();
  if (publicRead.error || publicRead.data?.status !== 'active' || publicRead.data?.post_media?.length !== 5) {
    fail('account B reads active marketplace post', publicRead.error?.message || JSON.stringify(publicRead.data));
  }
  pass('account B reads active marketplace post');

  const forbiddenUpdate = await clientB.database.from('posts').update({ title: 'RLS violation attempt' }).eq('id', postId).select('id');
  if (forbiddenUpdate.error) pass('account B cannot update account A post');
  else if ((forbiddenUpdate.data || []).length === 0) pass('account B cannot update account A post');
  else fail('account B cannot update account A post', 'unauthorized update returned a row');

  const privateProfile = await clientB.database.from('profiles').select('user_id,phone').eq('user_id', userAId);
  if (privateProfile.error) pass('account B cannot read account A private profile');
  else if ((privateProfile.data || []).length === 0) pass('account B cannot read account A private profile');
  else fail('account B cannot read account A private profile', 'private profile leaked');

  const forgedMedia = await clientB.database.from('post_media').insert([{
    post_id: postId,
    owner_id: userBId,
    bucket: 'public-post-media',
    object_key: `${userBId}/${postId}/forged.png`,
    public_url: 'https://invalid.example/forged.png',
    mime_type: 'image/png',
    size_bytes: 1,
    sort_order: 5,
  }]);
  if (forgedMedia.error) pass('account B cannot attach media to account A post');
  else fail('account B cannot attach media to account A post', 'forged media insert succeeded');

  const favorite = await clientB.database.from('saved_posts').insert([{ user_id: userBId, post_id: postId }]);
  if (favorite.error) fail('account B can save public post', favorite.error.message);
  savedByB = true;
  pass('account B can save public post');

  report.verdict = 'PASS';
} catch (error) {
  report.errors.push(error.message);
  report.verdict = 'BLOCK';
} finally {
  await cleanup();
  await fs.mkdir(path.join(process.cwd(), 'artifacts'), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), 'artifacts/v7-two-account-report.json'), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`VERDICT ${report.verdict}`);
console.log(`CLEANUP ${report.cleanedUp ? 'DONE' : keepPost ? 'SKIPPED_BY_CONFIG' : 'NOT_DONE'}`);
console.log('REPORT artifacts/v7-two-account-report.json');
if (report.verdict !== 'PASS') process.exit(1);
