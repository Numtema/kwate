'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, MapPin, Paintbrush, Repeat2, ShoppingBasket } from 'lucide-react';
import { PostCard } from '@/components/posts/PostCard';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { listPosts } from '@/features/posts/repository';
import type { PostView } from '@/features/posts/types';
import { useAuth } from '@/components/AuthProvider';
import { useNotifications } from '@/hooks/use-notifications';

const FILTERS = [
  { id: 'all', label: 'Tous', icon: null },
  { id: 'service', label: 'Services', icon: Paintbrush },
  { id: 'echange', label: 'Échanges', icon: Repeat2 },
  { id: 'vente', label: 'Ventes', icon: ShoppingBasket },
] as const;

export default function FeedPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof FILTERS)[number]['id']>('all');
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, loading: notifLoading, markRead, markAllRead } =
    useNotifications(user?.id ?? null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPosts(await listPosts({ categorySlug: activeTab, limit: 50 }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de charger les annonces.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 rounded-b-[32px] border-b border-white/5 bg-zinc-950/90 px-4 pb-4 pt-6 backdrop-blur-xl md:pt-8">
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
            <div className="mb-1 flex items-center text-[10px] font-bold uppercase tracking-widest text-zinc-400"><MapPin className="mr-1 h-3.5 w-3.5 text-green-500" />Cameroun</div>
            <h1 className="font-space text-2xl font-black tracking-tighter text-white">Autour de vous</h1>
          </div>

          {/* Bell button + panel */}
          <div className="relative">
            <button
              ref={bellRef}
              aria-label="Notifications"
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-white transition hover:bg-zinc-800"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-black text-white shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && user && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                loading={notifLoading}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
                onClose={() => setNotifOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="flex justify-center px-2">
          <div className="flex max-w-full space-x-1 overflow-x-auto rounded-full border border-white/5 bg-zinc-900 p-1.5">
            {FILTERS.map((filter) => {
              const Icon = filter.icon;
              return (
                <button key={filter.id} onClick={() => setActiveTab(filter.id)} className={`flex shrink-0 items-center rounded-full px-5 py-2.5 text-[13px] font-bold transition ${activeTab === filter.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
                  {Icon && <Icon className="mr-2 h-4 w-4" />}{filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative z-0 mt-2 space-y-6 p-4">
        {loading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[360px] animate-pulse rounded-[40px] bg-zinc-900" />)}
        {!loading && error && (
          <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="font-bold text-red-300">{error}</p>
            <button onClick={() => void load()} className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-black text-black">Réessayer</button>
          </div>
        )}
        {!loading && !error && posts.length === 0 && (
          <div className="rounded-[32px] border border-white/5 bg-zinc-900 p-8 text-center">
            <h2 className="font-space text-xl font-black">Aucune annonce pour le moment</h2>
            <p className="mt-2 text-sm text-zinc-400">Soyez le premier à publier dans cette catégorie.</p>
          </div>
        )}
        {!loading && !error && posts.map((post) => <PostCard key={post.id} post={post} />)}
      </main>
    </div>
  );
}
