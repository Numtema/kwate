'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '@/features/notifications/repository';
import type { Notification } from '@/features/notifications/types';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await listNotifications(userId);
      setNotifications(data);
    } catch {
      // Fail silently — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    try {
      await markNotificationRead(notificationId);
    } catch {
      // revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n)),
      );
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead(userId);
    } catch {
      // revert on failure
      void load();
    }
  }, [userId, load]);

  // Initial load
  useEffect(() => {
    void load();
  }, [load]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    unsubRef.current = subscribeToNotifications(userId, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return () => {
      unsubRef.current?.();
    };
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    reload: load,
  };
}
