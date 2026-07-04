'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Crown, Loader2, ShieldCheck, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { BILLING_PLANS, createCheckout, listMyEntitlements, type BillingPlan } from '@/features/billing/repository';

export default function PassPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<BillingPlan>(BILLING_PLANS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [entitlements, setEntitlements] = useState<Array<Record<string, unknown>>>([]);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).get('cancelled') === '1');
    if (user) void listMyEntitlements(user.id).then((data) => setEntitlements(data as Array<Record<string, unknown>>)).catch(() => undefined);
  }, [user]);

  const checkout = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    try { await createCheckout({ id: user.id, email: user.email }, selected); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Paiement impossible.'); setBusy(false); }
  };

  return (
    <div className="min-h-full pb-10">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-white/5 bg-zinc-950/90 px-5 py-5 backdrop-blur-xl"><button onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-zinc-900"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Paiement sécurisé</p><h1 className="font-space text-2xl font-black">Pass KWATE</h1></div></header>
      <main className="space-y-6 px-5 py-7">
        {cancelled && <p className="rounded-2xl bg-amber-500/10 p-4 text-sm font-bold text-amber-200">Paiement annulé. Aucun débit n’a été effectué.</p>}
        {entitlements.some((item) => item.status === 'active') && <div className="rounded-[28px] border border-green-500/20 bg-green-500/10 p-5"><p className="flex items-center gap-2 font-black text-green-300"><ShieldCheck className="h-5 w-5" />Un pass actif est associé à votre compte</p></div>}
        <div className="space-y-4">
          {BILLING_PLANS.map((plan, index) => <PlanCard key={plan.id} plan={plan} selected={selected.id === plan.id} icon={index === 0 ? Ticket : index === 1 ? ShieldCheck : Crown} onClick={() => setSelected(plan)} />)}
        </div>
        {error && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-300">{error}</p>}
        {!selected.priceId && <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs font-semibold leading-relaxed text-amber-200">Le Price ID Stripe de cette offre n’est pas encore configuré. Ajoutez-le dans les variables Vercel indiquées dans `AGENTS.md`.</p>}
        <button onClick={() => void checkout()} disabled={busy || !selected.priceId} className="flex w-full items-center justify-center rounded-full bg-green-500 py-4 font-black text-black disabled:opacity-40">{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}Continuer vers le paiement</button>
        <p className="text-center text-[11px] font-semibold leading-relaxed text-zinc-600">Le checkout est créé par InsForge Payments. Les droits définitifs doivent être projetés dans `billing_entitlements` par webhook.</p>
      </main>
    </div>
  );
}

function PlanCard({ plan, selected, icon: Icon, onClick }: { plan: BillingPlan; selected: boolean; icon: typeof Ticket; onClick: () => void }) {
  return <button onClick={onClick} className={`w-full rounded-[32px] border p-6 text-left transition ${selected ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-zinc-900 hover:border-white/15'}`}><div className="flex items-start justify-between gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-full ${selected ? 'bg-green-500 text-black' : 'bg-white/5 text-zinc-400'}`}><Icon className="h-5 w-5" /></div><p className={`font-space text-2xl font-black ${selected ? 'text-green-400' : 'text-white'}`}>{plan.priceLabel}</p></div><h2 className="mt-5 font-space text-xl font-black">{plan.title}</h2><div className="mt-4 space-y-2">{plan.features.map((feature) => <p key={feature} className="flex items-center text-sm font-semibold text-zinc-400"><Check className="mr-2 h-4 w-4 text-green-400" />{feature}</p>)}</div></button>;
}
