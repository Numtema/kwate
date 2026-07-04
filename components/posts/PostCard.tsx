/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { ArrowUpRight, Map, Paintbrush, Repeat2, ShoppingBasket, User } from 'lucide-react';
import type { PostView } from '@/features/posts/types';

const iconByType = {
  service: Paintbrush,
  echange: Repeat2,
  vente: ShoppingBasket,
};

export function PostCard({ post, compact = false }: { post: PostView; compact?: boolean }) {
  const Icon = iconByType[post.type];
  const isExchange = post.type === 'echange';
  const isService = post.type === 'service';
  const background = isExchange
    ? 'bg-green-400 text-black'
    : isService
      ? 'bg-zinc-900 border border-white/5 text-white'
      : 'bg-white text-black';
  const muted = isExchange ? 'text-black/60' : isService ? 'text-zinc-400' : 'text-zinc-500';
  const image = post.media?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.public_url;

  if (compact) {
    return (
      <Link href={`/post/${post.id}`} className="block rounded-[26px] border border-white/5 bg-zinc-900 p-5 transition hover:border-white/15 active:scale-[0.99]">
        <div className="flex gap-4">
          {image ? <img src={image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" /> : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/5"><Icon className="h-6 w-6 text-green-400" /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{post.category?.name ?? post.type}</p>
            <h3 className="line-clamp-2 font-space text-lg font-black leading-tight text-white">{post.title}</h3>
            <p className="mt-2 truncate text-sm font-bold text-green-400">{post.price_label || (isExchange ? 'Échange' : 'Sur devis')}</p>
            <p className="mt-2 flex items-center text-xs font-semibold text-zinc-500"><Map className="mr-1.5 h-3.5 w-3.5" />{post.zone}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/post/${post.id}`} className={`${background} block overflow-hidden rounded-[40px] p-7 transition hover:scale-[0.995] active:scale-[0.985]`}>
      {image && <img src={image} alt="" className="mb-6 h-52 w-full rounded-[28px] object-cover" />}
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${muted}`}>{post.category?.name ?? post.type}</p>
          <h3 className="max-w-[280px] font-space text-2xl font-black leading-[1.08] tracking-tighter">{post.title}</h3>
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${isExchange ? 'border-black/10 bg-black/5' : isService ? 'border-white/10 bg-white/5' : 'border-black/5 bg-zinc-100'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className={`rounded-[24px] p-5 ${isExchange ? 'bg-black/10' : isService ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${muted}`}>Prix / valeur</p>
          <p className="truncate text-lg font-black">{post.price_label || (isExchange ? 'Échange' : 'Sur devis')}</p>
        </div>
        <div className={`rounded-[24px] p-5 ${isExchange ? 'bg-black/10' : isService ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
          <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${muted}`}>Auteur</p>
          <div className="flex items-center gap-2">
            {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" /> : <User className="h-7 w-7 rounded-full bg-zinc-300 p-1 text-white/60" />}
            <p className="truncate text-sm font-bold">{post.author?.display_name ?? 'Membre KWATE'}</p>
          </div>
        </div>
      </div>

      <p className={`mb-7 line-clamp-3 text-[15px] font-medium leading-relaxed ${isExchange ? 'text-black/80' : isService ? 'text-zinc-300' : 'text-zinc-600'}`}>{post.description}</p>
      <div className="flex items-end justify-between gap-4">
        <p className={`flex min-w-0 items-center text-xs font-bold ${muted}`}><Map className="mr-1.5 h-4 w-4 shrink-0" /><span className="truncate">{post.zone}</span></p>
        <span className={`flex h-14 shrink-0 items-center rounded-full px-6 text-sm font-black ${isExchange ? 'bg-zinc-950 text-white' : isService ? 'bg-green-500 text-black' : 'bg-zinc-950 text-white'}`}>
          {isExchange ? 'Répondre' : 'Voir l’annonce'} <ArrowUpRight className="ml-2 h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
