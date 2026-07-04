'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';
import { createPostSchema, reportPostSchema } from './schema';
import type { Category, ContactDetails, CreatePostInput, PostRecord, PostView, PublicProfile } from './types';

function messageFromError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function safeSearch(value: string) {
  return value.trim().replace(/[(),.*]/g, ' ').replace(/\s+/g, ' ').slice(0, 80);
}

async function hydrateAuthors(posts: PostRecord[]): Promise<PostView[]> {
  if (posts.length === 0) return [];
  const client = getInsforgeBrowserClient();
  const ownerIds = Array.from(new Set(posts.map((post) => post.owner_id)));
  const { data, error } = await client.database
    .from('public_profiles')
    .select('user_id,display_name,avatar_url,zone,phone_verified,rating_average,rating_count')
    .in('user_id', ownerIds);

  if (error) return posts.map((post) => ({ ...post, author: null }));
  const profiles = new Map((data as PublicProfile[] | null | undefined)?.map((profile) => [profile.user_id, profile]) ?? []);
  return posts.map((post) => ({ ...post, author: profiles.get(post.owner_id) ?? null }));
}

const POST_SELECT = `
  id,owner_id,category_id,type,title,description,price_label,zone,status,contact_locked,
  published_at,created_at,updated_at,
  category:categories!inner(id,slug,name,description,icon,sort_order),
  media:post_media(id,post_id,public_url,object_key,mime_type,sort_order)
`;

export async function listCategories(): Promise<Category[]> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database
    .from('categories')
    .select('id,slug,name,description,icon,sort_order')
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(messageFromError(error, 'Impossible de charger les catégories.'));
  return (data ?? []) as Category[];
}

export async function listPosts(input: {
  categorySlug?: string;
  search?: string;
  ownerId?: string;
  limit?: number;
} = {}): Promise<PostView[]> {
  const client = getInsforgeBrowserClient();
  let query = client.database
    .from('posts')
    .select(POST_SELECT)
    .is('deleted_at', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(input.limit ?? 50, 1), 100));

  if (input.ownerId) {
    query = query.eq('owner_id', input.ownerId);
  } else {
    query = query.eq('status', 'active');
  }
  if (input.categorySlug && input.categorySlug !== 'all') query = query.eq('category.slug', input.categorySlug);
  if (input.search) {
    const term = safeSearch(input.search);
    if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,zone.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(messageFromError(error, 'Impossible de charger les annonces.'));
  return hydrateAuthors((data ?? []) as unknown as PostRecord[]);
}

export async function getPost(postId: string): Promise<PostView | null> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database
    .from('posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error(messageFromError(error, 'Impossible de charger cette annonce.'));
  if (!data) return null;
  return (await hydrateAuthors([data as unknown as PostRecord]))[0] ?? null;
}

async function getCategoryBySlug(slug: string) {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database
    .from('categories')
    .select('id,slug')
    .eq('slug', slug)
    .eq('enabled', true)
    .single();
  if (error || !data) throw new Error('Catégorie indisponible. Appliquez le seed InsForge.');
  return data as { id: string; slug: string };
}

function safeFilename(filename: string) {
  const extension = filename.includes('.') ? `.${filename.split('.').pop()?.toLowerCase()}` : '';
  return `${crypto.randomUUID()}${extension.replace(/[^.a-z0-9]/g, '')}`;
}

export async function createPost(userId: string, rawInput: CreatePostInput): Promise<{ post: PostView; warnings: string[] }> {
  const input = createPostSchema.parse(rawInput);
  const category = await getCategoryBySlug(input.type);
  const client = getInsforgeBrowserClient();
  const now = new Date().toISOString();
  const { data, error } = await client.database
    .from('posts')
    .insert([{ 
      owner_id: userId,
      category_id: category.id,
      type: input.type,
      title: input.title,
      description: input.description,
      price_label: input.type === 'echange' ? (input.priceLabel || 'Échange') : input.priceLabel,
      zone: input.zone,
      status: 'active',
      contact_locked: input.type !== 'echange',
      published_at: now,
    }])
    .select(POST_SELECT)
    .single();
  if (error || !data) throw new Error(messageFromError(error, 'Publication impossible.'));

  const warnings: string[] = [];
  for (const [index, file] of (rawInput.files ?? []).slice(0, 5).entries()) {
    try {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
        warnings.push(`${file.name}: format non pris en charge.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        warnings.push(`${file.name}: fichier supérieur à 10 Mo.`);
        continue;
      }
      const objectKey = `${userId}/${data.id}/${safeFilename(file.name)}`;
      const upload = await client.storage.from('public-post-media').upload(objectKey, file);
      if (upload.error) {
        warnings.push(`${file.name}: ${upload.error.message}`);
        continue;
      }
      const publicUrl = client.storage.from('public-post-media').getPublicUrl(objectKey).data?.publicUrl ?? null;
      const mediaInsert = await client.database.from('post_media').insert([{ 
        post_id: data.id,
        owner_id: userId,
        bucket: 'public-post-media',
        object_key: objectKey,
        public_url: publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
        sort_order: index,
      }]);
      if (mediaInsert.error) warnings.push(`${file.name}: média chargé mais indexation impossible.`);
    } catch (error) {
      warnings.push(`${file.name}: ${messageFromError(error, 'échec du chargement')}`);
    }
  }

  const post = await getPost(String(data.id));
  if (!post) throw new Error('Annonce créée mais relecture impossible.');
  return { post, warnings };
}

export async function updatePost(userId: string, postId: string, rawInput: Omit<CreatePostInput, 'files'>) {
  const input = createPostSchema.parse(rawInput);
  const category = await getCategoryBySlug(input.type);
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('posts').update({
    category_id: category.id,
    type: input.type,
    title: input.title,
    description: input.description,
    price_label: input.type === 'echange' ? (input.priceLabel || 'Échange') : input.priceLabel,
    zone: input.zone,
    contact_locked: input.type !== 'echange',
  }).eq('id', postId).eq('owner_id', userId).select(POST_SELECT).single();
  if (error || !data) throw new Error(messageFromError(error, 'Modification impossible.'));
  return (await hydrateAuthors([data as unknown as PostRecord]))[0];
}

export async function softDeletePost(userId: string, postId: string) {
  const client = getInsforgeBrowserClient();
  const { error } = await client.database.from('posts').update({
    status: 'deleted',
    deleted_at: new Date().toISOString(),
  }).eq('id', postId).eq('owner_id', userId);
  if (error) throw new Error(messageFromError(error, 'Suppression impossible.'));
}

export async function toggleSavedPost(userId: string, postId: string, currentlySaved: boolean) {
  const client = getInsforgeBrowserClient();
  const operation = currentlySaved
    ? client.database.from('saved_posts').delete().eq('user_id', userId).eq('post_id', postId)
    : client.database.from('saved_posts').insert([{ user_id: userId, post_id: postId }]);
  const { error } = await operation;
  if (error) throw new Error(messageFromError(error, 'Impossible de mettre à jour les favoris.'));
  return !currentlySaved;
}

export async function isPostSaved(userId: string, postId: string) {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('saved_posts').select('post_id').eq('user_id', userId).eq('post_id', postId).maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function reportPost(userId: string, input: { postId: string; reason: string; details?: string }) {
  const parsed = reportPostSchema.parse(input);
  const client = getInsforgeBrowserClient();
  const { error } = await client.database.from('reports').insert([{ 
    reporter_id: userId,
    post_id: parsed.postId,
    reason: parsed.reason,
    details: parsed.details || null,
  }]);
  if (error && !String(error.message || '').toLowerCase().includes('duplicate')) {
    throw new Error(messageFromError(error, 'Signalement impossible.'));
  }
}

export async function getPostContact(postId: string): Promise<ContactDetails> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.rpc('kwate_get_post_contact', { p_post_id: postId });
  if (error) throw new Error(messageFromError(error, 'Contact verrouillé. Activez un pass.'));
  const first = Array.isArray(data) ? data[0] : data;
  if (!first?.phone) throw new Error('Le vendeur n’a pas encore renseigné son téléphone.');
  return first as ContactDetails;
}

export async function startConversation(postId: string): Promise<string> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.rpc('kwate_start_conversation', { p_post_id: postId });
  if (error || !data) throw new Error(messageFromError(error, 'Impossible de démarrer la conversation.'));
  return String(data);
}
