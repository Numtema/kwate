"use client";

import React, { useState } from "react";
import { ArrowLeft, AlertOctagon, Trash2, Key, Bell, Shield, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="flex flex-col min-h-full relative">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-space font-black text-white tracking-tighter">Paramètres</h1>
      </header>

      <main className="flex-1 p-4 space-y-4 pb-24">
        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-2 relative z-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[40px] rounded-full pointer-events-none -z-10"></div>
          <SettingItem icon={Key} title="Identifiants" />
          <SettingItem icon={Bell} title="Notifications" />
          <SettingItem icon={Shield} title="Confidentialité" />
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-2">
          <div className="px-4 py-3">
             <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2">Zone Dangereuse</h3>
          </div>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-[24px] hover:bg-red-500/10 transition-colors group cursor-pointer border border-transparent hover:border-red-500/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-black transition-colors">
                 <Trash2 className="w-5 h-5" />
              </div>
              <span className="text-[16px] font-space font-black tracking-tighter text-red-500">Supprimer mon compte</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-500/50 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
           <div className="bg-zinc-900 border border-white/10 rounded-[32px] p-6 max-w-sm w-full shadow-2xl">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                 <AlertOctagon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white text-center mb-3">Supprimer le compte ?</h3>
              <p className="text-[14px] text-zinc-400 text-center mb-6 font-medium leading-relaxed">
                Cette action est irréversible. Toutes vos annonces, messages et données seront effacés. Les abonnements en cours ne sont pas remboursables.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    // Logic to delete account
                    router.push("/");
                  }}
                  className="w-full py-4 bg-red-500 text-black font-black text-[15px] rounded-full hover:bg-red-400 transition"
                >
                  Oui, supprimer définitivement
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-4 bg-white/5 text-white font-bold text-[15px] rounded-full hover:bg-white/10 transition"
                >
                  Annuler
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function SettingItem({ icon: Icon, title }: any) {
  return (
    <button className="w-full flex items-center justify-between px-6 py-4 rounded-[24px] hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors">
           <Icon className="w-5 h-5" />
        </div>
        <span className="text-[18px] font-space font-black text-white tracking-tighter">{title}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
    </button>
  );
}
