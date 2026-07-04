/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { MessageCircle, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { listConversations } from '@/features/messages/repository';
import type { ConversationListItem } from '@/features/messages/types';

export default function MessagesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try { setItems(await listConversations(user.id)); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Messagerie indisponible.'); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="min-h-full pb-8">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/90 px-6 pb-5 pt-8 backdrop-blur-xl"><h1 className="font-space text-3xl font-black tracking-tighter">Messages</h1></header>
      <main className="space-y-3 px-5 py-6">
        {loading && Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-[26px] bg-zinc-900" />)}
        {error && <div className="rounded-[28px] bg-red-500/10 p-5 text-sm font-bold text-red-300">{error}</div>}
        {!loading && !error && items.length === 0 && <div className="rounded-[34px] border border-white/5 bg-zinc-900 p-10 text-center"><MessageCircle className="mx-auto h-10 w-10 text-zinc-600" /><h2 className="mt-4 font-space text-xl font-black">Aucune conversation</h2><p className="mt-2 text-sm text-zinc-500">Ouvrez une annonce puis écrivez au vendeur.</p></div>}
        {!loading && items.map((item) => (
          <Link key={item.id} href={`/messages/${item.id}`} className="flex items-center gap-4 rounded-[28px] border border-white/5 bg-zinc-900 p-4 transition hover:border-white/15">
            {item.counterpartAvatar ? <img src={item.counterpartAvatar} alt="" className="h-14 w-14 rounded-full object-cover" /> : <User className="h-14 w-14 rounded-full bg-white/5 p-3 text-zinc-500" />}
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="truncate font-black">{item.counterpartName}</h2>{item.unreadCount > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-green-500 px-2 text-[10px] font-black text-black">{item.unreadCount}</span>}</div><p className="mt-1 truncate text-xs font-semibold text-green-400">{item.post?.title || 'Conversation KWATE'}</p><p className="mt-1 truncate text-sm text-zinc-500">{item.lastMessage || 'Démarrez la conversation'}</p></div>
          </Link>
        ))}
      </main>
    </div>
  );
}
