import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PassSuccessPage() {
  return <div className="flex min-h-[70vh] items-center justify-center px-5"><div className="max-w-md rounded-[40px] border border-green-500/20 bg-zinc-900 p-9 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-green-400" /><h1 className="mt-5 font-space text-3xl font-black">Paiement reçu</h1><p className="mt-3 text-sm leading-relaxed text-zinc-400">Stripe a renvoyé le navigateur vers KWATE. L’activation finale du pass dépend du webhook InsForge et de la projection dans `billing_entitlements`.</p><Link href="/pass" className="mt-7 inline-flex rounded-full bg-green-500 px-6 py-3 font-black text-black">Vérifier mon pass</Link></div></div>;
}
