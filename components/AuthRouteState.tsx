'use client';

import { AlertCircle } from 'lucide-react';

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-zinc-400">Vérification de la session…</p>
      </div>
    </div>
  );
}

export function AuthConfigurationError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-zinc-900 border border-amber-500/20 rounded-[28px] p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-space font-black text-xl tracking-tight">InsForge non configuré</h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{message}</p>
            <code className="block mt-4 p-3 rounded-2xl bg-black/30 text-xs text-zinc-300 whitespace-pre-wrap">NEXT_PUBLIC_INSFORGE_URL=…{`\n`}NEXT_PUBLIC_INSFORGE_ANON_KEY=…</code>
          </div>
        </div>
      </div>
    </div>
  );
}
