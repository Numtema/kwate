"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { firstZodError, signInSchema } from "@/features/auth/schema";

function safeNextPath(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, status, configurationError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [nextPath, setNextPath] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(safeNextPath(params.get('next')));

    if (params.get('insforge_status') === 'success' && params.get('insforge_type') === 'verify_email') {
      setNotice('Adresse email vérifiée. Vous pouvez maintenant vous connecter.');
    }

    if (params.get('insforge_status') === 'error') {
      setError(params.get('insforge_error') ?? 'Le lien de vérification est invalide ou expiré.');
    }

    if (params.get('reset') === 'success') {
      setNotice('Mot de passe modifié. Connectez-vous avec votre nouveau mot de passe.');
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') router.replace(nextPath);
  }, [status, router, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }

    setIsLoading(true);
    const result = await signIn(parsed.data);
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-zinc-950 z-0">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none -z-10 -mt-32 -mr-32"></div>

      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10">
        <header className="flex items-center justify-between pt-6 mb-12">
          <button onClick={() => router.back()} aria-label="Retour" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12"></div>
        </header>

        <main className="flex-1 flex flex-col">
          <div className="mb-10">
            <h1 className="text-[40px] leading-[1.1] font-space font-black text-white tracking-tighter mb-4">Bon retour.</h1>
            <p className="text-zinc-400 text-[15px] font-medium">Connectez-vous pour retrouver vos annonces et messages.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1" noValidate>
            <div className="space-y-4 mb-8">
              {(error || configurationError) && (
                <div role="alert" className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex items-center text-red-400 text-[14px] font-bold">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                  {error || configurationError}
                </div>
              )}

              {notice && (
                <div role="status" className="bg-green-500/10 border border-green-500/20 rounded-[20px] p-4 flex items-center text-green-400 text-[14px] font-bold">
                  <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
                  {notice}
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 pl-4 pr-4">
                  <label htmlFor="password" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Mot de passe</label>
                  <Link href="/forgot-password" className="text-[12px] font-bold text-green-500 hover:text-green-400 transition">Oublié ?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner" />
                </div>
              </div>
            </div>

            <div className="mt-auto pb-8 pt-6">
              <button type="submit" disabled={isLoading || status === 'configuration_error'} className="flex items-center justify-center w-full bg-green-500 text-black rounded-[24px] py-4 text-[16px] font-space font-black tracking-tighter hover:bg-green-400 transition active:scale-[0.98] shadow-xl shadow-green-500/20 disabled:opacity-50 disabled:active:scale-100">
                {isLoading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <>Se connecter <LogIn className="w-5 h-5 ml-2 opacity-80" /></>}
              </button>

              <p className="text-center mt-6 text-[14px] font-bold text-zinc-400">Pas encore de compte ? <Link href="/signup" className="text-white hover:text-green-500 transition">S&apos;inscrire</Link></p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
