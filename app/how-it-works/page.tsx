"use client";

import React from "react";
import { ArrowLeft, BookOpen, Repeat2, Paintbrush, ShoppingBasket, ShieldAlert, Star, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HowItWorksPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-space font-black text-white tracking-tighter">Comment ça marche</h1>
      </header>

      <main className="flex-1 p-5 space-y-6 pb-24">
        
        <div className="bg-green-500/10 border border-green-500/20 rounded-[32px] p-6 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-[40px] rounded-full pointer-events-none -mt-10 -mr-10"></div>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-[22px] font-space font-black text-white mb-2 tracking-tighter">Pour consulter</h2>
          <p className="text-zinc-400 text-[14px] leading-relaxed font-medium">
            Tout le monde peut consulter les annonces gratuitement. Vous pouvez voir les services, ventes, échanges consommables et demandes publiées autour de vous.
          </p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
             <Paintbrush className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-[22px] font-space font-black text-white mb-2 tracking-tighter">Pour publier un service</h2>
          <p className="text-zinc-400 text-[14px] leading-relaxed font-medium mb-3">
            Un service est une activité réalisée par une personne : peinture, ménage, réparation, expédition etc.
          </p>
          <div className="bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
            <p className="text-[13px] text-zinc-300 font-bold">La 1ère annonce non-pro est gratuite, ensuite un Pass 30 jours (1000 FCFA) est requis.</p>
          </div>
        </div>

        <div className="bg-green-500 rounded-[32px] p-6 text-black relative overflow-hidden shadow-lg shadow-green-500/10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-[40px] rounded-full pointer-events-none"></div>
          <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mb-4 border border-black/10 relative z-10">
             <Repeat2 className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-xl font-black text-black mb-2 tracking-tight relative z-10">L'échange gratuit</h2>
          <p className="text-black/80 text-[14px] leading-relaxed font-bold relative z-10">
            Réservé aux <span className="font-black underline">produits consommables</span> entre particuliers : denrées alimentaires, produits agricoles, etc.
          </p>
          <div className="bg-black/10 px-4 py-3 rounded-2xl mt-4 relative z-10">
             <p className="text-[12px] text-black font-black flex items-center uppercase tracking-wider">
               <ShieldAlert className="w-4 h-4 mr-2" /> Interdit dans le gratuit
             </p>
             <p className="text-[13px] text-black/80 font-bold mt-1">Services, objets durables, ventes déguisées et professionnels.</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
             <ShoppingBasket className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white mb-2 tracking-tight">Pour vendre</h2>
          <p className="text-zinc-400 text-[14px] leading-relaxed font-medium">
            Vente de produits, épices, créations. Une vente ponctuelle peut être gratuite, mais une vente répétée nécessite un Pass Actif ou compte Pro.
          </p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6 space-y-6">
          <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
               <CreditCard className="w-5 h-5 text-zinc-300" />
             </div>
             <div>
                <h3 className="text-[18px] font-space font-black text-white mb-1 tracking-tighter">Pass & Abonnements</h3>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">Le Pass 30 jours donne accès pour 30 jours, sans renouvellement auto. Non remboursable.</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
               <Star className="w-5 h-5 text-zinc-300" />
             </div>
             <div>
                <h3 className="text-[18px] font-space font-black text-white mb-1 tracking-tighter">Système d'avis</h3>
                <p className="text-[13px] text-zinc-400 font-medium leading-relaxed">Construisez votre réputation de 1 à 5 étoiles. Les faux avis entraînent la suspension.</p>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
}
