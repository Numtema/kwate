'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';
import type { PostMedia } from './types';

export const POST_MEDIA_BUCKET = 'public-post-media';
export const POST_MEDIA_LIMIT = 5;
export const POST_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const POST_MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

export type MediaPipelinePhase = 'validating' | 'uploading' | 'indexing' | 'publishing' | 'rollback' | 'complete';

export type MediaPipelineProgress = {
  phase: MediaPipelinePhase;
  completed: number;
  total: number;
  currentFile?: string;
};

export type UploadMediaOptions = {
  startSortOrder?: number;
  onProgress?: (progress: MediaPipelineProgress) => void;
};

type UploadedMedia = PostMedia & { owner_id: string; bucket: string };

function messageFromError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function extensionForMime(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/avif': return '.avif';
    default: return '';
  }
}

function objectKeyFor(userId: string, postId: string, mimeType: string) {
  return `${userId}/${postId}/${crypto.randomUUID()}${extensionForMime(mimeType)}`;
}

export function validatePostMediaFiles(files: File[], existingCount = 0) {
  if (existingCount < 0 || existingCount > POST_MEDIA_LIMIT) {
    throw new Error('Le nombre de médias existants est invalide.');
  }
  if (files.length + existingCount > POST_MEDIA_LIMIT) {
    throw new Error(`Une annonce peut contenir ${POST_MEDIA_LIMIT} photos maximum.`);
  }

  for (const file of files) {
    if (!POST_MEDIA_MIME_TYPES.includes(file.type as (typeof POST_MEDIA_MIME_TYPES)[number])) {
      throw new Error(`${file.name}: format non pris en charge.`);
    }
    if (file.size <= 0) {
      throw new Error(`${file.name}: le fichier est vide.`);
    }
    if (file.size > POST_MEDIA_MAX_BYTES) {
      throw new Error(`${file.name}: fichier supérieur à 10 Mo.`);
    }
  }
}

export async function rollbackUploadedMedia(items: UploadedMedia[], onProgress?: UploadMediaOptions['onProgress']) {
  if (items.length === 0) return [];
  const client = getInsforgeBrowserClient();
  const warnings: string[] = [];
  onProgress?.({ phase: 'rollback', completed: 0, total: items.length });

  const ids = items.map((item) => item.id);
  const metadataDelete = await client.database.from('post_media').delete().in('id', ids);
  if (metadataDelete.error) {
    warnings.push(`Métadonnées média non nettoyées: ${metadataDelete.error.message}`);
  }

  for (const [index, item] of items.entries()) {
    const removal = await client.storage.from(item.bucket || POST_MEDIA_BUCKET).remove(item.object_key);
    if (removal.error) warnings.push(`${item.object_key}: ${removal.error.message}`);
    onProgress?.({ phase: 'rollback', completed: index + 1, total: items.length });
  }
  return warnings;
}

export async function uploadPostMedia(
  userId: string,
  postId: string,
  files: File[],
  options: UploadMediaOptions = {},
): Promise<UploadedMedia[]> {
  validatePostMediaFiles(files, options.startSortOrder ?? 0);
  const client = getInsforgeBrowserClient();
  const uploaded: UploadedMedia[] = [];
  const total = files.length;

  options.onProgress?.({ phase: 'validating', completed: 0, total });

  try {
    for (const [index, file] of files.entries()) {
      const objectKey = objectKeyFor(userId, postId, file.type);
      options.onProgress?.({ phase: 'uploading', completed: index, total, currentFile: file.name });

      const upload = await client.storage.from(POST_MEDIA_BUCKET).upload(objectKey, file);
      if (upload.error) throw new Error(`${file.name}: ${upload.error.message}`);

      const publicUrl = client.storage.from(POST_MEDIA_BUCKET).getPublicUrl(objectKey).data?.publicUrl ?? null;
      options.onProgress?.({ phase: 'indexing', completed: index, total, currentFile: file.name });

      const mediaInsert = await client.database
        .from('post_media')
        .insert([{
          post_id: postId,
          owner_id: userId,
          bucket: POST_MEDIA_BUCKET,
          object_key: objectKey,
          public_url: publicUrl,
          mime_type: file.type,
          size_bytes: file.size,
          sort_order: (options.startSortOrder ?? 0) + index,
        }])
        .select('id,post_id,owner_id,bucket,public_url,object_key,mime_type,size_bytes,sort_order')
        .single();

      if (mediaInsert.error || !mediaInsert.data) {
        await client.storage.from(POST_MEDIA_BUCKET).remove(objectKey);
        throw new Error(`${file.name}: indexation du média impossible.`);
      }

      uploaded.push(mediaInsert.data as UploadedMedia);
      options.onProgress?.({ phase: 'indexing', completed: index + 1, total, currentFile: file.name });
    }

    return uploaded;
  } catch (error) {
    const cleanupWarnings = await rollbackUploadedMedia(uploaded, options.onProgress);
    const suffix = cleanupWarnings.length ? ` Nettoyage incomplet: ${cleanupWarnings.join(' ')}` : '';
    throw new Error(`${messageFromError(error, 'Échec du pipeline média.')}${suffix}`);
  }
}

export async function deletePostMedia(userId: string, postId: string, mediaId: string) {
  const client = getInsforgeBrowserClient();
  const lookup = await client.database
    .from('post_media')
    .select('id,post_id,owner_id,bucket,public_url,object_key,mime_type,size_bytes,sort_order')
    .eq('id', mediaId)
    .eq('post_id', postId)
    .eq('owner_id', userId)
    .single();

  if (lookup.error || !lookup.data) throw new Error('Média introuvable ou suppression interdite.');
  const media = lookup.data as UploadedMedia;

  const metadataDelete = await client.database
    .from('post_media')
    .delete()
    .eq('id', media.id)
    .eq('owner_id', userId);
  if (metadataDelete.error) throw new Error(messageFromError(metadataDelete.error, 'Suppression du média impossible.'));

  const removal = await client.storage.from(media.bucket || POST_MEDIA_BUCKET).remove(media.object_key);
  return removal.error ? [`Fichier orphelin à nettoyer: ${media.object_key}`] : [];
}

export async function cleanupPostMediaForDeletion(userId: string, postId: string) {
  const client = getInsforgeBrowserClient();
  const lookup = await client.database
    .from('post_media')
    .select('id,post_id,owner_id,bucket,public_url,object_key,mime_type,size_bytes,sort_order')
    .eq('post_id', postId)
    .eq('owner_id', userId);
  if (lookup.error) return [`Inventaire média impossible: ${lookup.error.message}`];

  const media = (lookup.data ?? []) as UploadedMedia[];
  if (media.length === 0) return [];

  const metadataDelete = await client.database
    .from('post_media')
    .delete()
    .eq('post_id', postId)
    .eq('owner_id', userId);
  if (metadataDelete.error) return [`Nettoyage metadata impossible: ${metadataDelete.error.message}`];

  const warnings: string[] = [];
  for (const item of media) {
    const removal = await client.storage.from(item.bucket || POST_MEDIA_BUCKET).remove(item.object_key);
    if (removal.error) warnings.push(`Fichier orphelin à nettoyer: ${item.object_key}`);
  }
  return warnings;
}
