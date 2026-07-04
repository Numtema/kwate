"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle2, MailCheck, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { firstZodError, verifyEmailSchema } from '@/features/auth/schema';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'code' | 'link'>('code');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') ?? '');
    setMode(params.get('mode') === 'link' ? 'link' : 'code');
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const parsed = verifyEmailSchema.safeParse({ email, otp });
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }

    setIsLoading(true);
    const result = await verifyEmail(parsed.data);
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  const resend = async () => {
    setError('');
    setNotice('');
    if (!email) {
      setError('Adresse email manquante.');
      return;
    }

    setIsLoading(true);
    const result = await resendVerification({ email, redirectTo: `${window.location.origin}/login` });
    setIsLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice('Un nouvel email de vérification a été envoyé.');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 flex justify-center">
      <div className="w-full max-w-md flex flex-col">
        <header className="pt-6 mb-12"><button onClick={() => router.back()} aria-label="Retour" className="w-12 h-12 rounded-full border border-white/10 bg-zinc-900 flex items-center justify-center"><ArrowLeft className="w-5 h-5" /></button></header>
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-7"><MailCheck className="w-8 h-8 text-green-500" /></div>
        <h1 className="text-[38px] font-space font-black tracking-tighter leading-tight">Vérifiez votre email.</h1>
        <p className="text-zinc-400 mt-4 font-medium">{mode === 'code' ? `Saisissez le code à 6 chiffres envoyé à ${email || 'votre adresse email'}.` : `Un lien de vérification a été envoyé à ${email || 'votre adresse email'}. Ouvrez-le puis revenez vous connecter.`}</p>

        {error && <div role="alert" className="mt-6 bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex gap-3 text-red-400 text-sm font-bold"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mt-6 bg-green-500/10 border border-green-500/20 rounded-[20px] p-4 flex gap-3 text-green-400 text-sm font-bold"><CheckCircle2 className="w-5 h-5 shrink-0" />{notice}</div>}

        {mode === 'code' ? (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label htmlFor="otp" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block pl-4">Code de vérification</label>
            <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-5 px-6 text-center text-3xl tracking-[0.35em] font-black focus:outline-none focus:border-green-500" />
            <button disabled={isLoading} className="w-full bg-green-500 text-black rounded-[24px] py-4 font-space font-black disabled:opacity-50">{isLoading ? 'Vérification…' : 'Valider le code'}</button>
          </form>
        ) : (
          <Link href="/login" className="mt-8 w-full text-center bg-green-500 text-black rounded-[24px] py-4 font-space font-black">Retour à la connexion</Link>
        )}

        <button onClick={resend} disabled={isLoading} className="mt-4 flex items-center justify-center gap-2 py-3 text-sm font-bold text-zinc-400 hover:text-white disabled:opacity-50"><RotateCcw className="w-4 h-4" />Renvoyer l&apos;email</button>
      </div>
    </div>
  );
}
