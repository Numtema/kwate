'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';
import { updateProfileSchema } from './schema';
import type { ProfileRecord } from './types';

export async function getMyProfile(userId: string): Promise<ProfileRecord | null> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message || 'Impossible de charger le profil.');
  return (data as ProfileRecord | null) ?? null;
}

export async function updateMyProfile(userId: string, input: unknown): Promise<ProfileRecord> {
  const parsed = updateProfileSchema.parse(input);
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('profiles').update({
    display_name: parsed.displayName,
    zone: parsed.zone || null,
    phone: parsed.phone || null,
    bio: parsed.bio || null,
    avatar_url: parsed.avatarUrl || null,
  }).eq('user_id', userId).select('*').single();
  if (error || !data) throw new Error(error?.message || 'Impossible de modifier le profil.');
  return data as ProfileRecord;
}
