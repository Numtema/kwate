'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, LogOut, Save, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getMyProfile, updateMyProfile } from '@/features/profiles/repository';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [zone, setZone] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    void getMyProfile(user.id).then((profile) => {
      setDisplayName(profile?.display_name ?? user.name ?? '');
      setZone(profile?.zone ?? '');
      setPhone(profile?.phone ?? '');
      setBio(profile?.bio ?? '');
      setAvatarUrl(profile?.avatar_url ?? '');
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Profil indisponible.')).finally(() => setLoading(false));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateMyProfile(user.id, { displayName, zone: zone || null, phone: phone || null, bio: bio || null, avatarUrl: avatarUrl || null });
      await refreshUser();
      setMessage('Profil enregistré.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-full pb-10">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-zinc-950/90 px-5 py-5 backdrop-blur-xl">
        <button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900"><ArrowLeft className="h-5 w-5" /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Compte</p><h1 className="font-space text-2xl font-black">Paramètres</h1></div>
      </header>
      <main className="space-y-6 px-5 py-7">
        {loading ? <div className="h-96 animate-pulse rounded-[36px] bg-zinc-900" /> : (
          <section className="space-y-5 rounded-[36px] border border-white/5 bg-zinc-900 p-6">
            <Field label="Nom affiché"><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="input" /></Field>
            <Field label="Zone"><input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Ville · Quartier" className="input" /></Field>
            <Field label="Téléphone"><input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="+237…" className="input" /></Field>
            <Field label="Biographie"><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="input resize-none" /></Field>
            <Field label="URL de l’avatar"><input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} type="url" placeholder="https://…" className="input" /></Field>
            {message && <p className="rounded-2xl bg-green-500/10 p-4 text-sm font-bold text-green-300">{message}</p>}
            {error && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
            <button onClick={() => void save()} disabled={saving} className="flex w-full items-center justify-center rounded-full bg-green-500 py-4 font-black text-black disabled:opacity-50">{saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}Enregistrer</button>
          </section>
        )}

        <section className="overflow-hidden rounded-[30px] border border-white/5 bg-zinc-900">
          <button onClick={() => void signOut()} className="flex w-full items-center justify-between px-6 py-5 text-red-300 hover:bg-red-500/5"><span className="flex items-center gap-3 font-bold"><LogOut className="h-5 w-5" />Se déconnecter</span></button>
          <div className="border-t border-white/5 px-6 py-5 text-zinc-500"><p className="flex items-center gap-3 text-sm font-bold"><ShieldAlert className="h-5 w-5" />Suppression du compte</p><p className="mt-2 text-xs leading-relaxed">Cette action doit être exécutée par un workflow serveur approuvé. Elle n’est pas simulée côté navigateur.</p></div>
        </section>
      </main>
      <style jsx>{`.input{width:100%;border-radius:1.3rem;border:1px solid rgba(255,255,255,.08);background:#27272a;padding:1rem;color:white;font-weight:600;outline:none}.input:focus{border-color:#22c55e}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>{children}</label>;
}
