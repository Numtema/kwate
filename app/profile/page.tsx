/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Loader2, LogOut, PauseCircle, Pencil, PlayCircle, Settings, ShieldCheck, Trash2, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { PostCard } from '@/components/posts/PostCard';
import { getMyProfile } from '@/features/profiles/repository';
import type { ProfileRecord } from '@/features/profiles/types';
import { listPosts, setPostStatus, softDeletePost } from '@/features/posts/repository';
import type { PostView } from '@/features/posts/types';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const [loadedProfile, loadedPosts] = await Promise.all([getMyProfile(user.id), listPosts({ ownerId: user.id, limit: 100 })]);
      setProfile(loadedProfile);
      setPosts(loadedPosts.filter((post) => post.status !== 'deleted'));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Profil indisponible.');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const remove = async (postId: string) => {
    if (!user || !window.confirm('Supprimer cette annonce ?')) return;
    setBusyId(postId);
    try {
      const warnings = await softDeletePost(user.id, postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setNotice(warnings.length ? `Annonce masquée. ${warnings.join(' ')}` : 'Annonce supprimée et médias nettoyés.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Suppression impossible.');
    } finally { setBusyId(''); }
  };


  const changeStatus = async (postId: string, status: 'active' | 'paused' | 'sold') => {
    if (!user) return;
    setBusyId(postId);
    setError('');
    setNotice('');
    try {
      const updated = await setPostStatus(user.id, postId, status);
      setPosts((current) => current.map((post) => post.id === postId ? updated : post));
      setNotice(status === 'active' ? 'Annonce remise en ligne.' : status === 'paused' ? 'Annonce mise en pause.' : 'Annonce marquée comme vendue.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Changement de statut impossible.');
    } finally {
      setBusyId('');
    }
  };

  if (loading) return <div className="p-5"><div className="h-[500px] animate-pulse rounded-[38px] bg-zinc-900" /></div>;

  return (
    <div className="min-h-full pb-8">
      <header className="px-5 pb-4 pt-8"><h1 className="font-space text-3xl font-black tracking-tighter">Mon profil</h1></header>
      <main className="space-y-6 px-5">
        {error && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
        {notice && <p className="rounded-2xl bg-green-500/10 p-4 text-sm font-bold text-green-200">{notice}</p>}
        <section className="rounded-[38px] border border-white/5 bg-zinc-900 p-7">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" /> : <User className="h-20 w-20 rounded-full bg-white/5 p-5 text-zinc-500" />}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><h2 className="truncate font-space text-2xl font-black">{profile?.display_name ?? user?.name ?? user?.email}</h2>{profile?.phone_verified && <ShieldCheck className="h-5 w-5 text-green-400" />}</div>
              <p className="mt-1 text-sm font-medium text-zinc-500">{profile?.zone || 'Zone non renseignée'}</p>
              {profile?.bio && <p className="mt-3 line-clamp-3 text-sm text-zinc-300">{profile.bio}</p>}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat value={posts.length} label="Annonces" />
            <Stat value={profile?.rating_average ?? '—'} label="Note" />
            <Stat value={profile?.rating_count ?? 0} label="Avis" />
          </div>
        </section>

        <section className="overflow-hidden rounded-[30px] border border-white/5 bg-zinc-900">
          <Link href="/settings" className="flex items-center justify-between px-6 py-5 hover:bg-white/5"><span className="flex items-center gap-3 font-bold"><Settings className="h-5 w-5 text-green-400" />Modifier mon profil</span><ChevronRight className="h-5 w-5 text-zinc-500" /></Link>
          <Link href="/pass" className="flex items-center justify-between border-t border-white/5 px-6 py-5 hover:bg-white/5"><span className="flex items-center gap-3 font-bold"><ShieldCheck className="h-5 w-5 text-green-400" />Mes pass et contacts</span><ChevronRight className="h-5 w-5 text-zinc-500" /></Link>
          <button onClick={() => void signOut()} className="flex w-full items-center justify-between border-t border-white/5 px-6 py-5 text-red-300 hover:bg-red-500/5"><span className="flex items-center gap-3 font-bold"><LogOut className="h-5 w-5" />Se déconnecter</span><ChevronRight className="h-5 w-5" /></button>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between"><h2 className="font-space text-xl font-black">Mes annonces</h2><Link href="/publish" className="rounded-full bg-green-500 px-4 py-2 text-xs font-black text-black">Publier</Link></div>
          {posts.length === 0 ? <div className="rounded-[28px] border border-white/5 bg-zinc-900 p-7 text-center text-sm text-zinc-400">Vous n’avez pas encore publié d’annonce.</div> : (
            <div className="space-y-4">{posts.map((post) => <div key={post.id} className="overflow-hidden rounded-[30px] border border-white/5 bg-zinc-900"><div className="relative"><PostCard post={post} compact /><span className="absolute left-4 top-4 rounded-full bg-zinc-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-200 backdrop-blur">{post.status}</span></div><div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/5 px-4 py-3"><Link href={`/publish?edit=${post.id}`} aria-label="Modifier l’annonce" className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/75 text-green-300"><Pencil className="h-4 w-4" /></Link>{post.status === 'active' && <button onClick={() => void changeStatus(post.id, 'paused')} aria-label="Mettre en pause" disabled={busyId === post.id} className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-200"><PauseCircle className="h-4 w-4" /></button>}{post.status === 'paused' && <button onClick={() => void changeStatus(post.id, 'active')} aria-label="Remettre en ligne" disabled={busyId === post.id} className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/15 text-green-200"><PlayCircle className="h-4 w-4" /></button>}{post.status !== 'sold' && <button onClick={() => void changeStatus(post.id, 'sold')} aria-label="Marquer comme vendu" disabled={busyId === post.id} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-blue-200"><CheckCircle2 className="h-4 w-4" /></button>}<button onClick={() => void remove(post.id)} aria-label="Supprimer l’annonce" disabled={busyId === post.id} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15 text-red-300">{busyId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></div></div>)}</div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-[22px] bg-zinc-800 p-4"><p className="font-space text-xl font-black text-white">{value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p></div>;
}
