'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, MessageSquare, ShoppingBag, X } from 'lucide-react';
import type { Notification, NotificationType } from '@/features/notifications/types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function NotifIcon({ type }: { type: NotificationType }) {
  const cls = 'h-5 w-5';
  if (type === 'new_message') return <MessageSquare className={cls} />;
  if (type === 'new_post') return <ShoppingBag className={cls} />;
  return <Bell className={cls} />;
}

function iconBg(type: NotificationType): string {
  if (type === 'new_message') return 'bg-blue-500/20 text-blue-400';
  if (type === 'new_post') return 'bg-green-500/20 text-green-400';
  return 'bg-purple-500/20 text-purple-400';
}

interface Props {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotifClick = useCallback(
    (notif: Notification) => {
      if (!notif.read) onMarkRead(notif.id);
      if (notif.link) router.push(notif.link);
      onClose();
    },
    [onMarkRead, router, onClose],
  );

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-[24px] border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-bold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-[11px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              title="Tout marquer comme lu"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-y-auto">
        {loading && (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-[16px] bg-zinc-800" />
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-sm font-bold text-zinc-400">Aucune notification</p>
            <p className="mt-1 text-xs text-zinc-600">
              Vous serez notifié des nouvelles annonces et messages.
            </p>
          </div>
        )}

        {!loading &&
          notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5 ${
                !notif.read ? 'bg-white/[0.03]' : ''
              }`}
            >
              {/* Icon */}
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg(notif.type)}`}
              >
                <NotifIcon type={notif.type} />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm font-bold ${!notif.read ? 'text-white' : 'text-zinc-300'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{notif.body}</p>
                <p className="mt-1 text-[10px] text-zinc-600">{timeAgo(notif.created_at)}</p>
              </div>
            </button>
          ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-white/5 px-4 py-2 text-center">
          <p className="text-[11px] text-zinc-600">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
