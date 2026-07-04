"use client";

import React, { useState } from "react";
import { ArrowLeft, Check, TicketPercent, Zap, Building, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PassPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string>("pass30");

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-space font-black text-white tracking-tighter">Pass & Abonnements</h1>
      </header>

      <main className="flex-1 p-5 space-y-6 pb-24 relative z-10">
        <div className="absolute top-10 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="space-y-4">
           {/* Pass 30 Jours */}
           <PlanCard 
             id="pass30"
             title="Pass 30 Jours"
             price="1 000 FCFA"
             icon={TicketPercent}
             selected={selectedPlan === "pass30"}
             onClick={() => setSelectedPlan("pass30")}
             features={["Publier des services et ventes", "Répondre aux clients", "Sans renouvellement auto"]}
           />
           
           {/* Pass Annuel */}
           <PlanCard 
             id="pass12"
             title="Pass Annuel"
             price="10 000 FCFA"
             icon={Zap}
             selected={selectedPlan === "pass12"}
             onClick={() => setSelectedPlan("pass12")}
             features={["2 mois offerts", "Accès complet 12 mois", "Support prioritaire"]}
             badge="Populaire"
           />

           {/* Compte Pro */}
           <PlanCard 
             id="pro"
             title="Compte Pro"
             price="5 000 FCFA / mois"
             icon={Building}
             selected={selectedPlan === "pro"}
             onClick={() => setSelectedPlan("pro")}
             features={["Badge Pro Vérifié", "Publications illimitées", "Statistiques & Vitrine"]}
           />
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6 mt-6">
           <h3 className="font-bold text-white text-[15px] mb-2">Méthodes de paiement</h3>
           <div className="flex items-center gap-2 mt-4">
              <div className="bg-[#ff6600]/10 border border-[#ff6600]/20 text-[#ff6600] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Orange Money</div>
              <div className="bg-[#ffcc00]/10 border border-[#ffcc00]/20 text-[#ffcc00] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">MTN MoMo</div>
           </div>
        </div>

        <button className="w-full h-[64px] bg-green-500 text-black rounded-full shadow-lg shadow-green-500/20 font-black text-[16px] flex items-center justify-center transition active:scale-[0.98]">
           Payer avec Mobile Money <ChevronRight className="w-5 h-5 ml-1" />
        </button>

        <p className="text-[12px] text-zinc-500 text-center font-medium leading-relaxed px-4">
          L'achat n'est pas remboursable une fois la période entamée. Les paiements sont sécurisés.
        </p>
      </main>
    </div>
  );
}

function PlanCard({ id, title, price, icon: Icon, features, selected, onClick, badge }: any) {
  return (
    <div 
      onClick={onClick}
      className={`relative rounded-[32px] p-6 cursor-pointer transition-all border-2 ${selected ? 'bg-zinc-900 border-green-500 shadow-xl shadow-green-500/10' : 'bg-zinc-900 border-white/5 hover:border-white/20'}`}
    >
      {badge && (
        <span className="absolute -top-3 right-6 bg-green-500 text-black text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full border-4 border-zinc-950">
          {badge}
        </span>
      )}
      <div className="flex justify-between items-start mb-4">
         <div>
            <h3 className="text-[20px] font-space font-black text-white tracking-tighter">{title}</h3>
            <p className={`font-space font-black tracking-tighter ${selected ? 'text-green-500 text-3xl' : 'text-zinc-400 text-2xl'}`}>{price}</p>
         </div>
         <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${selected ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-black/20 border-white/5 text-zinc-500'}`}>
            <Icon className="w-6 h-6" />
         </div>
      </div>
      <ul className="space-y-2 mt-4 pt-4 border-t border-white/5">
         {features.map((feat: string, i: number) => (
           <li key={i} className="flex items-center text-[13px] font-bold text-zinc-300">
             <Check className={`w-4 h-4 mr-2 ${selected ? 'text-green-500' : 'text-zinc-600'}`} />
             {feat}
           </li>
         ))}
      </ul>
      
      {/* Radio indicator */}
      <div className={`absolute bottom-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? 'border-green-500' : 'border-zinc-700'}`}>
         {selected && <div className="w-3 h-3 bg-green-500 rounded-full" />}
      </div>
    </div>
  );
}
