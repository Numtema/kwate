'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';
import type { ConversationListItem, ConversationRecord, MessageRecord } from './types';
import type { PublicProfile } from '@/features/posts/types';

export async function listConversations(userId: string): Promise<ConversationListItem[]> {
  const client = getInsforgeBrowserClient();
  const memberships = await client.database
    .from('conversation_members')
    .select('conversation_id,last_read_at')
    .eq('user_id', userId);
  if (memberships.error) throw new Error(memberships.error.message || 'Impossible de charger les conversations.');

  const rows = (memberships.data ?? []) as Array<{ conversation_id: string; last_read_at: string | null }>;
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.conversation_id);

  const [conversationsResult, membersResult, messagesResult] = await Promise.all([
    client.database.from('conversations').select('id,post_id,created_by,last_message_at,created_at,post:posts(id,title,owner_id)').in('id', ids).order('last_message_at', { ascending: false, nullsFirst: false }),
    client.database.from('conversation_members').select('conversation_id,user_id,last_read_at').in('conversation_id', ids),
    client.database.from('messages').select('id,conversation_id,sender_id,body,created_at').in('conversation_id', ids).is('deleted_at', null).order('created_at', { ascending: false }),
  ]);
  if (conversationsResult.error) throw new Error(conversationsResult.error.message || 'Impossible de charger les conversations.');
  if (membersResult.error) throw new Error(membersResult.error.message || 'Impossible de charger les participants.');
  if (messagesResult.error) throw new Error(messagesResult.error.message || 'Impossible de charger les messages.');

  const memberRows = (membersResult.data ?? []) as Array<{ conversation_id: string; user_id: string; last_read_at: string | null }>;
  const counterpartIds = Array.from(new Set(memberRows.filter((row) => row.user_id !== userId).map((row) => row.user_id)));
  let profiles: PublicProfile[] = [];
  if (counterpartIds.length > 0) {
    const profileResult = await client.database.from('public_profiles').select('user_id,display_name,avatar_url,zone,phone_verified,rating_average,rating_count').in('user_id', counterpartIds);
    if (!profileResult.error) profiles = (profileResult.data ?? []) as PublicProfile[];
  }
  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const allMessages = (messagesResult.data ?? []) as MessageRecord[];
  const membershipMap = new Map(rows.map((row) => [row.conversation_id, row]));

  return ((conversationsResult.data ?? []) as unknown as ConversationRecord[]).map((conversation) => {
    const counterpartId = memberRows.find((row) => row.conversation_id === conversation.id && row.user_id !== userId)?.user_id ?? null;
    const profile = counterpartId ? profileMap.get(counterpartId) : null;
    const messages = allMessages.filter((message) => message.conversation_id === conversation.id);
    const lastRead = membershipMap.get(conversation.id)?.last_read_at;
    return {
      ...conversation,
      counterpartId,
      counterpartName: profile?.display_name ?? 'Membre KWATE',
      counterpartAvatar: profile?.avatar_url ?? null,
      lastMessage: messages[0]?.body ?? null,
      unreadCount: messages.filter((message) => message.sender_id !== userId && (!lastRead || message.created_at > lastRead)).length,
    };
  });
}

export async function listMessages(conversationId: string): Promise<MessageRecord[]> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id', conversationId).is('deleted_at', null).order('created_at', { ascending: true });
  if (error) throw new Error(error.message || 'Impossible de charger les messages.');
  return (data ?? []) as MessageRecord[];
}

export async function sendMessage(userId: string, conversationId: string, body: string): Promise<MessageRecord> {
  const clean = body.trim();
  if (!clean) throw new Error('Le message est vide.');
  if (clean.length > 4000) throw new Error('Le message est trop long.');
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('messages').insert([{ conversation_id: conversationId, sender_id: userId, body: clean }]).select('id,conversation_id,sender_id,body,created_at').single();
  if (error || !data) throw new Error(error?.message || 'Envoi impossible.');
  return data as MessageRecord;
}

export async function markConversationRead(conversationId: string) {
  const client = getInsforgeBrowserClient();
  await client.database.rpc('kwate_mark_conversation_read', { p_conversation_id: conversationId });
}

export async function subscribeToMessages(conversationId: string, onMessage: () => void) {
  const client = getInsforgeBrowserClient();
  const event = `message_created:${conversationId}`;
  const handler = () => onMessage();
  try {
    await client.realtime.subscribe(`conversation:${conversationId}`);
    client.realtime.on(event, handler);
  } catch {
    // Realtime is optional; polling/manual refresh remains available.
  }
  return () => {
    try {
      client.realtime.off(event, handler);
      client.realtime.unsubscribe(`conversation:${conversationId}`);
    } catch {
      // no-op
    }
  };
}
