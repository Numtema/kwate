"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import {
  codeResetPasswordSchema,
  firstZodError,
  tokenResetPasswordSchema,
} from '@/features/auth/schema';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { resetPasswordCode, resetPasswordToken } = useAuth();
  const [mode, setMode] = useState<'code' | 'link' | 'invalid'>('invalid');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get('mode');
    const queryEmail = params.get('email') ?? '';
    const queryToken = params.get('token') ?? '';
    const status = params.get('insforge_status');
    const type = params.get('insforge_type');

    setEmail(queryEmail);

    if (queryMode === 'code' && queryEmail) {
      setMode('code');
      return;
    }

    if (status === 'ready' && type === 'reset_password' && queryToken) {
      setToken(queryToken);
      setMode('link');
      return;
    }

    if (status === 'error') {
      setError(params.get('insforge_error') ?? 'Le lien de réinitialisation est invalide ou expiré.');
    } else {
      setError('Lien ou code de réinitialisation manquant.');
    }
    setMode('invalid');
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    if (mode === 'code') {
      const parsed = codeResetPasswordSchema.safeParse({ email, code, newPassword });
      if (!parsed.success) {
        setIsLoading(false);
        setError(firstZodError(parsed.error));
        return;
      }

      const result = await resetPasswordCode(parsed.data);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else if (mode === 'link') {
      const parsed = tokenResetPasswordSchema.safeParse({ token, newPassword });
      if (!parsed.success) {
        setIsLoading(false);
        setError(firstZodError(parsed.error));
        return;
      }

      const result = await resetPasswordToken(parsed.data);
      setIsLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
    } else {
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex justify-center">
      <div className="w-full max-w-md flex flex-col">
        <header className="pt-6 mb-12"><button onClick={() => router.back()} aria-label="Retour" className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button></header>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>
            <h1 className="text-3xl font-space font-black tracking-tighter">Mot de passe modifié.</h1>
            <p className="text-zinc-400 mt-3 mb-8">Votre nouveau mot de passe est actif.</p>
            <Link href="/login?reset=success" className="w-full bg-green-500 text-black rounded-[24px] py-4 font-space font-black">Se connecter</Link>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-7"><KeyRound className="w-8 h-8 text-green-500" /></div>
            <h1 className="text-[38px] font-space font-black tracking-tighter leading-tight">Nouveau mot de passe.</h1>
            <p className="text-zinc-400 mt-4 font-medium">Choisissez un mot de passe robuste d’au moins 8 caractères.</p>

            {error && <div role="alert" className="mt-6 bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex gap-3 text-red-400 text-sm font-bold"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

            {mode !== 'invalid' && (
              <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
                {mode === 'code' && (
                  <div>
                    <label htmlFor="code" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">Code à 6 chiffres</label>
                    <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 px-6 text-center text-2xl tracking-[0.3em] font-black focus:outline-none focus:border-green-500" />
                  </div>
                )}

                <PasswordField id="new-password" label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
                <PasswordField id="confirm-password" label="Confirmer le mot de passe" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />

                <button disabled={isLoading} className="w-full mt-4 bg-green-500 text-black rounded-[24px] py-4 font-space font-black disabled:opacity-50">{isLoading ? 'Modification…' : 'Modifier le mot de passe'}</button>
              </form>
            )}

            <Link href="/forgot-password" className="mt-5 text-center text-sm font-bold text-zinc-400 hover:text-white">Demander un nouveau code ou lien</Link>
          </>
        )}
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">{label}</label>
      <div className="relative"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" /><input id={id} type="password" autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold focus:outline-none focus:border-green-500" /></div>
    </div>
  );
}
