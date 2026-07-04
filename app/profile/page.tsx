"use client";

import React from "react";
import Link from "next/link";
import { User, Star, Settings, ShieldCheck, LayoutList, CreditCard, LogOut, ArrowRight, ArrowUpRight, Copy, TicketPercent, Share, ScanLine, BookOpen } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex items-center justify-between border-b border-white/5">
        <h1 className="text-2xl font-space font-black text-white tracking-tighter">Profil</h1>
        <Link href="/settings" className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition shadow-sm">
          <Settings className="w-5 h-5" />
        </Link>
      </header>

      <main className="p-4 space-y-6 mt-2 relative">
         {/* Identity Card like the reference image */}
         <div className="bg-green-500 rounded-[40px] p-7 pb-8 shadow-xl shadow-green-500/10 text-black relative overflow-hidden z-10 w-full max-w-md mx-auto aspect-[4/5] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/30 blur-[80px] rounded-full pointer-events-none -mt-32 -mr-32"></div>
            
            <div>
               <div className="flex items-start justify-between mb-8 relative z-10">
                  <div>
                     <h2 className="text-[40px] font-space font-black leading-[1.0] mb-2 tracking-tighter">Samuel<br/>Eto&apos;o</h2>
                     <p className="text-[13px] font-bold opacity-60 flex items-center tracking-wide">
                       27 Fév 1987 <span className="mx-2">•</span> 12:14:24 (2 yr)
                     </p>
                  </div>
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-black/5 border-[3px] border-black/10 shrink-0">
                     <img src="https://picsum.photos/seed/samuel/200/200" alt="Avatar" className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80" />
                  </div>
               </div>
            </div>

            <div className="bg-zinc-950 rounded-[32px] p-6 relative z-10 shadow-inner mt-4 border border-black/10 flex-1 flex flex-col justify-end text-white">
               <div className="absolute -top-6 right-6 flex gap-2">
                 <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-zinc-200 transition"><Copy className="w-5 h-5"/></button>
                 <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:bg-zinc-200 transition"><Share className="w-5 h-5"/></button>
               </div>
               
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-5">Données d&apos;identité</p>
               
               <div className="flex gap-5 items-center">
                  <div className="w-[90px] h-[90px] bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 p-2.5 relative group cursor-pointer overflow-hidden">
                     {/* Fake QR code using grid */}
                     <div className="w-full h-full grid grid-cols-5 gap-0.5 opacity-80 group-hover:opacity-100 transition">
                       {Array.from({length: 25}).map((_, i) => (
                         <div key={i} className={`bg-green-500 rounded-[2px] ${i%4===0 || i%7===0 ? 'opacity-0' : 'opacity-100'}`} />
                       ))}
                     </div>
                  </div>
                  
                  <div className="flex flex-col justify-center space-y-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">ID Numéro</p>
                        <p className="text-[17px] font-space font-black tracking-tighter text-white">311097152 <span className="text-green-500 opacity-60">X01</span></p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Résidence</p>
                        <p className="text-[15px] font-bold text-zinc-300 tracking-tight">Douala, Makepe</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Stats/Limits */}
         <div className="grid grid-cols-2 gap-4 w-full max-w-md mx-auto">
            <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-5 flex flex-col justify-between items-start hover:border-white/10 transition">
               <div>
                 <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><Star className="w-3.5 h-3.5 mr-1.5"/> Avis (24)</p>
                 <p className="text-3xl font-black text-white tracking-tighter">
                    4.9
                 </p>
               </div>
               <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mt-4 text-white hover:bg-white/10 transition"><ArrowUpRight className="w-4 h-4"/></button>
            </div>
            
            <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-5 flex flex-col justify-between items-start hover:border-white/10 transition">
               <div className="w-full">
                 <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center"><TicketPercent className="w-3.5 h-3.5 mr-1.5"/> Forfait Pro</p>
                 <div className="flex items-center justify-between w-full">
                   <p className="text-lg font-black text-red-500 tracking-tight">Expiré</p>
                   <span className="text-xs font-bold text-white bg-red-500/20 px-2 py-1 rounded-md">0j</span>
                 </div>
               </div>
               <Link href="/pass" className="w-full py-3 bg-green-500/10 text-green-500 font-black text-[13px] rounded-full mt-4 hover:bg-green-500/20 transition tracking-wide text-center">Renouveler</Link>
            </div>
         </div>

         {/* Menu List */}
         <div className="bg-zinc-900 border border-white/5 rounded-[32px] overflow-hidden w-full max-w-md mx-auto mb-6">
            <MenuItem href="/how-it-works" icon={BookOpen} title="Comment ça marche" />
            <MenuItem href="#" icon={LayoutList} title="Mes annonces" count={3} />
            <MenuItem href="#" icon={CreditCard} title="Transactions" />
            <MenuItem href="#" icon={ShieldCheck} title="Vérification" badge="Validé" />
            <div className="h-px bg-white/5 mx-6 my-2"></div>
            <MenuItem href="/" icon={LogOut} title="Se déconnecter" textDanger borderNone/>
         </div>
         
      </main>
    </div>
  );
}

function MenuItem({ href, icon: Icon, title, count, badge, textDanger, borderNone }: any) {
  return (
    <Link href={href || "#"} className={`w-full flex items-center justify-between px-6 py-5 hover:bg-white/5 transition-colors group cursor-pointer`}>
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${textDanger ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20' : 'bg-zinc-800 text-zinc-300 group-hover:bg-white/10 group-hover:text-white'}`}>
           <Icon className="w-5 h-5" />
        </div>
        <span className={`text-[16px] font-bold tracking-tight ${textDanger ? 'text-red-500' : 'text-white'}`}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="w-8 h-8 bg-green-500 text-black rounded-full flex items-center justify-center text-[13px] font-black">
            {count}
          </span>
        )}
        {badge && (
          <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-[10px] uppercase font-black tracking-wider">
            {badge}
          </span>
        )}
        <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}
