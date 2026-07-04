/* eslint-disable @next/next/no-img-element */
'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, CheckCircle2, Loader2, MapPin, MessageCircle, Phone, ShieldAlert, Star, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getPost, getPostContact, isPostSaved, reportPost, startConversation, toggleSavedPost } from '@/features/posts/repository';
import type { ContactDetails, PostView } from '@/features/posts/types';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [contact, setContact] = useState<ContactDetails | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const loaded = await getPost(id);
      setPost(loaded);
      if (user && loaded) setSaved(await isPostSaved(user.id, id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Annonce indisponible.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { void load(); }, [load]);

  const requireUser = () => {
    if (user) return true;
    router.push(`/login?next=${encodeURIComponent(`/post/${id}`)}`);
    return false;
  };

  const save = async () => {
    if (!requireUser() || !user) return;
    setBusy('save');
    try { setSaved(await toggleSavedPost(user.id, id, saved)); } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Action impossible.'); } finally { setBusy(''); }
  };

  const unlock = async () => {
    if (!requireUser()) return;
    setBusy('contact');
    setNotice('');
    try { setContact(await getPostContact(id)); } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Contact verrouillé.'); } finally { setBusy(''); }
  };

  const message = async () => {
    if (!requireUser()) return;
    setBusy('message');
    setNotice('');
    try { router.push(`/messages/${await startConversation(id)}`); } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'Conversation impossible.'); } finally { setBusy(''); }
  };

  const report = async () => {
    if (!requireUser() || !user) return;
    setBusy('report');
    setNotice('');
    try {
      await reportPost(user.id, { postId: id, reason: 'other', details: 'Signalement envoyé depuis la fiche annonce.' });
      setNotice('Signalement enregistré. Merci pour votre vigilance.');
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Signalement impossible.');
    } finally { setBusy(''); }
  };

  if (loading) return <div className="p-5"><div className="h-[650px] animate-pulse rounded-[40px] bg-zinc-900" /></div>;
  if (error || !post) return <div className="p-6 text-center"><p className="rounded-[30px] bg-red-500/10 p-6 font-bold text-red-300">{error || 'Annonce introuvable.'}</p></div>;

  const isOwner = user?.id === post.owner_id;
  const image = post.media?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.public_url;

  return (
    <div className="min-h-full pb-10">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-zinc-950/90 px-5 py-5 backdrop-blur-xl">
        <button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex gap-2">
          <button onClick={() => void save()} disabled={busy === 'save'} className={`flex h-11 w-11 items-center justify-center rounded-full border ${saved ? 'border-green-500 bg-green-500 text-black' : 'border-white/10 bg-zinc-900'}`}><Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} /></button>
          {!isOwner && <button onClick={() => void report()} disabled={busy === 'report'} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400"><ShieldAlert className="h-5 w-5" /></button>}
        </div>
      </header>

      <main className="px-5">
        {image ? <img src={image} alt={post.title} className="mb-6 h-72 w-full rounded-[36px] object-cover" /> : <div className="mb-6 flex h-48 items-center justify-center rounded-[36px] bg-zinc-900"><User className="h-16 w-16 text-zinc-700" /></div>}
        <div className="rounded-[38px] border border-white/5 bg-zinc-900 p-7">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-green-500">{post.category?.name ?? post.type}</p>
          <h1 className="font-space text-3xl font-black leading-tight tracking-tighter">{post.title}</h1>
          <p className="mt-4 font-space text-2xl font-black text-green-400">{post.price_label || (post.type === 'echange' ? 'Échange' : 'Sur devis')}</p>
          <p className="mt-6 whitespace-pre-wrap text-[15px] font-medium leading-relaxed text-zinc-300">{post.description}</p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-zinc-800 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Zone</p><p className="mt-2 flex items-center text-sm font-bold"><MapPin className="mr-2 h-4 w-4 text-green-400" />{post.zone}</p></div>
            <div className="rounded-[24px] bg-zinc-800 p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Auteur</p><p className="mt-2 truncate text-sm font-bold">{post.author?.display_name ?? 'Membre KWATE'}</p></div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[24px] bg-zinc-800 p-4">
            {post.author?.avatar_url ? <img src={post.author.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" /> : <User className="h-12 w-12 rounded-full bg-white/10 p-2 text-zinc-400" />}
            <div className="min-w-0 flex-1"><p className="font-black">{post.author?.display_name ?? 'Membre KWATE'}</p><p className="flex items-center text-xs font-semibold text-zinc-500"><Star className="mr-1 h-3.5 w-3.5 text-amber-400" />{post.author?.rating_average ?? 'Nouveau'} · {post.author?.rating_count ?? 0} avis</p></div>
            {post.author?.phone_verified && <CheckCircle2 className="h-5 w-5 text-green-400" />}
          </div>

          {contact && <div className="mt-5 rounded-[24px] border border-green-500/20 bg-green-500/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-green-400">Contact débloqué</p><a href={`tel:${contact.phone}`} className="mt-2 flex items-center text-xl font-black text-white"><Phone className="mr-2 h-5 w-5" />{contact.phone}</a></div>}
          {notice && <p className="mt-5 rounded-2xl bg-white/5 p-4 text-sm font-bold text-zinc-300">{notice}</p>}

          {!isOwner ? <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button onClick={() => void message()} disabled={Boolean(busy)} className="flex items-center justify-center rounded-full bg-white py-4 font-black text-black disabled:opacity-50">{busy === 'message' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageCircle className="mr-2 h-5 w-5" />}Écrire un message</button>
            <button onClick={() => void unlock()} disabled={Boolean(busy)} className="flex items-center justify-center rounded-full bg-green-500 py-4 font-black text-black disabled:opacity-50">{busy === 'contact' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Phone className="mr-2 h-5 w-5" />}Voir le contact</button>
          </div> : <button onClick={() => router.push('/profile')} className="mt-7 w-full rounded-full bg-green-500 py-4 font-black text-black">Gérer mon annonce</button>}
        </div>
      </main>
    </div>
  );
}
