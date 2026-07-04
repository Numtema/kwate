"use client";

import React from "react";
import { Search, MoreVertical, User, Compass, CheckCheck } from "lucide-react";

const MOCK_CHATS = [
  {
    id: 1,
    name: "Mado N.",
    service: "Échange plantain contre huile",
    lastMsg: "Ok je t'attends pour l'huile. Tu passes vers quelle heure ?",
    time: "10:42",
    unread: 2,
    isPro: false,
  },
  {
    id: 2,
    name: "Alex D.",
    service: "Portraits au crayon",
    lastMsg: "Je suis dispo demain pour commencer la toile.",
    time: "Hier",
    unread: 0,
    isPro: true,
  },
  {
    id: 3,
    name: "Junior M.",
    service: "Peinture, revêtement...",
    lastMsg: "Le prix dépend de la surface chef. On peut se voir ?",
    time: "Lun",
    unread: 0,
    isPro: true,
  }
];

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 pt-8 flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-10 border-b border-white/5">
        <h1 className="text-3xl font-space font-black text-white tracking-tighter">Messages</h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 border border-transparent hover:border-white/10 transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-4 space-y-3 mt-2 relative z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        {MOCK_CHATS.map((chat) => (
          <div key={chat.id} className="bg-zinc-900 border border-white/5 rounded-[32px] p-4 flex items-center gap-4 hover:bg-zinc-800 transition-colors cursor-pointer active:scale-[0.98]">
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-6 h-6 text-zinc-600" />
              </div>
              {chat.isPro && (
                <span className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-zinc-900 w-4 h-4 rounded-full flex items-center justify-center" title="Pro">
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="text-[16px] font-black tracking-tight text-white truncate pr-2">{chat.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${chat.unread > 0 ? 'text-green-500' : 'text-zinc-500'}`}>
                  {chat.time}
                </span>
              </div>
              <p className="text-[12px] font-bold text-zinc-500 mb-1.5 truncate tracking-wide">{chat.service}</p>
              <div className="flex items-start justify-between">
                <p className={`text-[14px] leading-tight truncate pr-4 ${chat.unread > 0 ? 'text-white font-bold' : 'text-zinc-400 font-medium'}`}>
                  {chat.unread === 0 && <CheckCheck className="w-4 h-4 inline mr-1 text-green-500"/>}
                  {chat.lastMsg}
                </p>
                {chat.unread > 0 && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-[11px] font-black text-black shrink-0 mt-0.5">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
