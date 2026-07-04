/* eslint-disable @next/next/no-img-element */
'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, ImagePlus, Loader2, Paintbrush, Repeat2, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  addPostMedia,
  createPost,
  getPost,
  removePostMedia,
  updatePost,
} from '@/features/posts/repository';
import {
  POST_MEDIA_LIMIT,
  validatePostMediaFiles,
  type MediaPipelineProgress,
} from '@/features/posts/media';
import type { PostMedia, PostType } from '@/features/posts/types';

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
  const [existingMedia, setExistingMedia] = useState<PostMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [removingMediaId, setRemovingMediaId] = useState('');
  const [progress, setProgress] = useState<MediaPipelineProgress | null>(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

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
        setExistingMedia([...(post.media ?? [])].sort((a, b) => a.sort_order - b.sort_order));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Annonce indisponible.'))
      .finally(() => setLoadingPost(false));
  }, [user]);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    setError('');
    try {
      const next = [...files, ...selected];
      validatePostMediaFiles(next, existingMedia.length);
      setFiles(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sélection de photos invalide.');
    } finally {
      event.target.value = '';
    }
  };

  const removeExisting = async (media: PostMedia) => {
    if (!user || !editId || !window.confirm('Supprimer définitivement cette photo ?')) return;
    setRemovingMediaId(media.id);
    setError('');
    setWarning('');
    try {
      const warnings = await removePostMedia(user.id, editId, media.id);
      setExistingMedia((current) => current.filter((item) => item.id !== media.id));
      if (warnings.length) setWarning(warnings.join(' '));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Suppression de la photo impossible.');
    } finally {
      setRemovingMediaId('');
    }
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    setWarning('');
    setProgress(null);

    try {
      const payload = {
        type,
        title,
        description,
        priceLabel: type === 'echange' ? (price || 'Échange') : price,
        zone,
      };

      if (editId) {
        await updatePost(user.id, editId, payload);
        if (files.length) {
          await addPostMedia(user.id, editId, files, existingMedia.length, setProgress);
        }
        router.push(`/post/${editId}`);
      } else {
        const result = await createPost(user.id, { ...payload, files }, { onProgress: setProgress });
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

  const totalMedia = existingMedia.length + files.length;
  const progressLabel = progress ? labelForProgress(progress) : '';

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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500">Photos</label>
            <span className="text-xs font-bold text-zinc-500">{totalMedia}/{POST_MEDIA_LIMIT}</span>
          </div>

          <label className={`flex items-center justify-center gap-3 rounded-[28px] border border-dashed p-7 text-sm font-bold transition ${totalMedia >= POST_MEDIA_LIMIT ? 'cursor-not-allowed border-white/5 bg-zinc-900/50 text-zinc-600' : 'cursor-pointer border-white/15 bg-zinc-900 text-zinc-300 hover:border-green-500/50'}`}>
            <ImagePlus className="h-5 w-5 text-green-400" /> Ajouter des images
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onFiles} disabled={totalMedia >= POST_MEDIA_LIMIT || submitting} className="hidden" />
          </label>

          {(existingMedia.length > 0 || previews.length > 0) && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingMedia.map((media) => (
                <figure key={media.id} className="group relative aspect-square overflow-hidden rounded-[24px] border border-white/5 bg-zinc-900">
                  {media.public_url ? <img src={media.public_url} alt="Photo de l’annonce" className="h-full w-full object-cover" /> : <Camera className="h-full w-full p-12 text-zinc-700" />}
                  <button type="button" onClick={() => void removeExisting(media)} disabled={removingMediaId === media.id || submitting} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/80 text-red-300 backdrop-blur disabled:opacity-50" aria-label="Supprimer cette photo">
                    {removingMediaId === media.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </figure>
              ))}
              {previews.map(({ file, url }, index) => (
                <figure key={`${file.name}-${file.lastModified}-${index}`} className="relative aspect-square overflow-hidden rounded-[24px] border border-green-500/20 bg-zinc-900">
                  <img src={url} alt="Nouvelle photo sélectionnée" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 left-2 rounded-full bg-green-500 px-2 py-1 text-[10px] font-black text-black">NOUVELLE</span>
                  <button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} disabled={submitting} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950/80 text-white backdrop-blur" aria-label="Retirer cette photo"><X className="h-4 w-4" /></button>
                </figure>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs font-medium text-zinc-500">JPEG, PNG, WebP ou AVIF · 10 Mo maximum par photo. Une nouvelle annonce reste en brouillon jusqu’à la validation complète des uploads.</p>
        </section>

        {progress && (
          <div className="rounded-[24px] border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-center gap-3 text-sm font-bold text-green-200"><Loader2 className={`h-4 w-4 ${progress.phase === 'complete' ? '' : 'animate-spin'}`} />{progressLabel}</div>
            {progress.total > 0 && <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.max(5, Math.round((progress.completed / progress.total) * 100))}%` }} /></div>}
          </div>
        )}

        {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
        {warning && <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm font-bold text-amber-200">{warning}</p>}

        <button onClick={() => void submit()} disabled={submitting || loadingPost || !user} className="flex w-full items-center justify-center rounded-full bg-green-500 py-4 text-base font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{progressLabel || 'Enregistrement…'}</> : editId ? 'Enregistrer les modifications' : 'Publier maintenant'}
        </button>
      </main>
      <style jsx>{`.input{width:100%;border-radius:1.4rem;border:1px solid rgba(255,255,255,.08);background:#18181b;padding:1rem 1.1rem;color:white;font-size:.95rem;font-weight:600;outline:none}.input:focus{border-color:#22c55e}`}</style>
    </div>
  );
}

function labelForProgress(progress: MediaPipelineProgress) {
  switch (progress.phase) {
    case 'validating': return 'Validation des photos…';
    case 'uploading': return `Upload ${Math.min(progress.completed + 1, progress.total)}/${progress.total}${progress.currentFile ? ` · ${progress.currentFile}` : ''}`;
    case 'indexing': return `Indexation ${progress.completed}/${progress.total}`;
    case 'publishing': return 'Validation serveur et publication…';
    case 'rollback': return `Annulation sécurisée ${progress.completed}/${progress.total}`;
    case 'complete': return 'Publication terminée';
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-3 block text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>{children}</label>;
}

function TypeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Paintbrush; label: string }) {
  return <button type="button" onClick={onClick} className={`flex flex-col items-center justify-center rounded-[24px] border p-4 text-xs font-black transition ${active ? 'border-green-500 bg-green-500 text-black' : 'border-white/5 bg-zinc-900 text-zinc-400 hover:border-white/15'}`}><Icon className="mb-2 h-5 w-5" />{label}</button>;
}
