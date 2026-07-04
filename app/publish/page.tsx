'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Loader2, Paintbrush, Repeat2, ShoppingBasket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { createPost, getPost, updatePost } from '@/features/posts/repository';
import type { PostType } from '@/features/posts/types';

export default function PublishPage() {
  const router = useRouter();
  const { user } = useAuth();
  const initialized = useRef(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [type, setType] = useState<PostType>('service');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('Douala');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;
    const id = new URLSearchParams(window.location.search).get('edit');
    if (!id) return;

    setEditId(id);
    setLoadingPost(true);
    void getPost(id)
      .then((post) => {
        if (!post || post.owner_id !== user.id) throw new Error('Annonce introuvable ou modification interdite.');
        setType(post.type);
        setTitle(post.title);
        setDescription(post.description);
        setPrice(post.price_label ?? '');
        setZone(post.zone);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Annonce indisponible.'))
      .finally(() => setLoadingPost(false));
  }, [user]);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(event.target.files ?? []).slice(0, 5));
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    setWarning('');
    try {
      const payload = {
        type,
        title,
        description,
        priceLabel: type === 'echange' ? (price || 'Échange') : price,
        zone,
      };

      if (editId) {
        const post = await updatePost(user.id, editId, payload);
        router.push(`/post/${post.id}`);
      } else {
        const result = await createPost(user.id, { ...payload, files });
        if (result.warnings.length) setWarning(result.warnings.join(' '));
        router.push(`/post/${result.post.id}`);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-zinc-950">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-zinc-950/90 px-5 py-5 backdrop-blur-xl">
        <button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900"><ArrowLeft className="h-5 w-5" /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">{editId ? 'Modification' : 'Nouvelle annonce'}</p><h1 className="font-space text-2xl font-black">{editId ? 'Modifier l’annonce' : 'Publier sur KWATE'}</h1></div>
      </header>

      <main className="space-y-7 px-5 py-7">
        {loadingPost && <div className="flex items-center justify-center gap-3 rounded-[28px] bg-zinc-900 p-8 text-sm font-bold text-zinc-400"><Loader2 className="h-5 w-5 animate-spin" />Chargement de l’annonce…</div>}

        <section>
          <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Type d’annonce</label>
          <div className="grid grid-cols-3 gap-3">
            <TypeButton active={type === 'service'} onClick={() => setType('service')} icon={Paintbrush} label="Service" />
            <TypeButton active={type === 'echange'} onClick={() => setType('echange')} icon={Repeat2} label="Échange" />
            <TypeButton active={type === 'vente'} onClick={() => setType('vente')} icon={ShoppingBasket} label="Vente" />
          </div>
        </section>

        <Field label="Titre"><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={140} placeholder="Ex. Réparation de téléphones" className="input" /></Field>
        <Field label="Description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} rows={6} placeholder="Décrivez clairement votre offre, vos conditions et votre disponibilité…" className="input resize-none" /></Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label={type === 'echange' ? 'Ce que vous recherchez' : 'Prix / tarif'}><input value={price} onChange={(event) => setPrice(event.target.value)} maxLength={120} placeholder={type === 'echange' ? 'Ex. Huile rouge ou arachides' : 'Ex. Dès 10 000 FCFA'} className="input" /></Field>
          <Field label="Zone"><input value={zone} onChange={(event) => setZone(event.target.value)} maxLength={120} placeholder="Ville · Quartier" className="input" /></Field>
        </div>

        {!editId ? (
          <section>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Photos (5 maximum)</label>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[28px] border border-dashed border-white/15 bg-zinc-900 p-7 text-sm font-bold text-zinc-300 hover:border-green-500/50">
              <Camera className="h-5 w-5 text-green-400" /> Choisir des images
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onFiles} className="hidden" />
            </label>
            {files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{files.map((file, index) => <span key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold"><span className="max-w-40 truncate">{file.name}</span><button onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><X className="h-3.5 w-3.5" /></button></span>)}</div>}
          </section>
        ) : <p className="rounded-2xl border border-white/5 bg-zinc-900 p-4 text-xs font-semibold text-zinc-400">Les photos existantes sont conservées pendant cette modification.</p>}

        {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
        {warning && <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-bold text-amber-200">{warning}</p>}

        <button onClick={() => void submit()} disabled={submitting || loadingPost || !user} className="flex w-full items-center justify-center rounded-full bg-green-500 py-4 text-base font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Enregistrement…</> : editId ? 'Enregistrer les modifications' : 'Publier maintenant'}
        </button>
      </main>
      <style jsx>{`.input{width:100%;border-radius:1.4rem;border:1px solid rgba(255,255,255,.08);background:#18181b;padding:1rem 1.1rem;color:white;font-size:.95rem;font-weight:600;outline:none}.input:focus{border-color:#22c55e}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>{children}</label>;
}

function TypeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Paintbrush; label: string }) {
  return <button onClick={onClick} className={`flex flex-col items-center justify-center rounded-[24px] border p-4 text-xs font-black transition ${active ? 'border-green-500 bg-green-500 text-black' : 'border-white/5 bg-zinc-900 text-zinc-400 hover:border-white/15'}`}><Icon className="mb-2 h-5 w-5" />{label}</button>;
}
