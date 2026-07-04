'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';
import type { Notification } from './types';

function messageFromError(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

export async function listNotifications(userId: string, limit = 50): Promise<Notification[]> {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database
    .from('notifications')
    .select('id,user_id,type,title,body,link,read,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error(messageFromError(error, 'Impossible de charger les notifications.'));
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const client = getInsforgeBrowserClient();
  const { error } = await client.database
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw new Error(messageFromError(error, 'Impossible de marquer comme lu.'));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const client = getInsforgeBrowserClient();
  const { error } = await client.database
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw new Error(messageFromError(error, 'Impossible de marquer tout comme lu.'));
}

export function subscribeToNotifications(
  userId: string,
  onNew: (notification: Notification) => void,
) {
  const client = getInsforgeBrowserClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rt = client.realtime as any;
  if (!rt?.channel) return () => undefined;

  const channel = rt
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload: { new: Notification }) => {
        onNew(payload.new);
      },
    )
    .subscribe();

  return () => {
    try { rt.removeChannel(channel); } catch { /* ignore */ }
  };
}
