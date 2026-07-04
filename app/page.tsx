"use client";

import React, { useState } from "react";
import { MapPin, Bell, Repeat2, Paintbrush, ShoppingBasket, User, ArrowUpRight, Map } from "lucide-react";
import Link from "next/link";
import { useMock } from "@/components/MockProvider";

export default function Feed() {
  const { posts } = useMock();
  const [activeTab, setActiveTab] = useState("all");

  const filteredPosts = activeTab === "all"
    ? posts
    : posts.filter(post => post.categoryId === activeTab);

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-xl px-4 py-4 pt-6 md:pt-8 rounded-b-[32px] border-b border-white/5">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex flex-col">
            <div className="flex items-center text-[10px] text-zinc-400 mb-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-green-500" />
              <span className="font-bold tracking-widest uppercase">Localisation</span>
            </div>
            <h2 className="text-2xl font-space font-black text-white tracking-tighter">Douala, CM</h2>
          </div>
          <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center relative text-white hover:bg-white/5 transition-colors bg-zinc-900 shadow-sm">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-3.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-zinc-900"></span>
          </button>
        </div>

        {/* Categories Scroll */}
        <div className="flex justify-center mt-2 px-2">
          <div className="bg-zinc-900 border border-white/5 p-1.5 rounded-full flex space-x-1 overflow-x-auto scrollbar-hide shadow-inner max-w-full">
            <FilterPill label="Tous" active={activeTab === "all"} onClick={() => setActiveTab("all")} />
            <FilterPill icon={Paintbrush} label="Services" active={activeTab === "service"} onClick={() => setActiveTab("service")} />
            <FilterPill icon={Repeat2} label="Échanges" active={activeTab === "echange"} onClick={() => setActiveTab("echange")} />
            <FilterPill icon={ShoppingBasket} label="Ventes" active={activeTab === "vente"} onClick={() => setActiveTab("vente")} />
          </div>
        </div>
      </header>

      {/* Background Graphic like reference image */}
      <div className="absolute top-40 inset-x-0 flex justify-center pointer-events-none opacity-20 -z-10">
        <div className="relative w-[300px] h-[300px]">
           <div className="absolute inset-0 bg-green-500 rounded-full blur-[100px]"></div>
           <div className="absolute right-[-50px] bottom-[-50px] w-48 h-48 border-[4px] border-dotted border-green-500 rounded-full opacity-50 blur-[2px]"></div>
        </div>
      </div>

      {/* Feed */}
      <main className="p-4 space-y-6 mt-2 z-0 relative">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
}

function FilterPill({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all flex items-center justify-center shrink-0 ${active ? "bg-white text-black shadow-md" : "bg-transparent text-zinc-400 hover:text-white"}`}
    >
      {Icon && <Icon className={`w-4 h-4 mr-2 ${active ? 'text-black' : 'text-zinc-500'}`} />}
      {label}
    </button>
  );
}

function PostCard({ post }: { post: any }) {
  const isEchange = post.categoryId === 'echange';
  const isService = post.categoryId === 'service';
  
  // Neon aesthetic colors like the reference image
  const bgClass = isEchange ? 'bg-green-400 text-black shadow-lg shadow-green-500/10' : isService ? 'bg-zinc-900 border border-white/5 text-white' : 'bg-white text-black border border-black/5';
  const innerCard1 = isEchange ? 'bg-black/10' : isService ? 'bg-zinc-800' : 'bg-zinc-100';
  const innerCard2 = isEchange ? 'bg-black/10' : isService ? 'bg-zinc-800' : 'bg-zinc-100';
  const ctaBtn = isEchange ? 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-xl' : isService ? 'bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20' : 'bg-zinc-950 text-white hover:bg-zinc-800';
  const smallText = isEchange ? 'text-black/60' : isService ? 'text-zinc-400' : 'text-zinc-500';
  const badgeClass = isEchange ? 'border-black/10 bg-black/5' : isService ? 'border-white/10 bg-white/5 text-green-400' : 'border-black/5 bg-zinc-100 text-zinc-600';
  const iconWrapper = isEchange ? 'border-black/10 bg-black/5' : isService ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white shadow-sm';

  return (
    <Link href={`/post/${post.id}`} className={`${bgClass} rounded-[40px] p-7 transition-all hover:scale-[0.99] active:scale-[0.98] relative overflow-hidden group w-full block cursor-pointer`}>
      {/* Top Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-widest ${smallText} mb-1.5 flex items-center`}>
            {post.type}
          </div>
          <h3 className="font-space font-black text-2xl leading-[1.1] max-w-[220px] tracking-tighter">{post.title}</h3>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border ${iconWrapper}`}>
             <post.icon className="w-5 h-5" />
        </div>
      </div>

      {/* Grid Data */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`${innerCard1} rounded-[24px] p-5 flex flex-col justify-center`}>
           <p className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${smallText}`}>Prix / Valeur</p>
           <p className="font-black text-lg max-w-[120px] leading-tight truncate">{post.price}</p>
        </div>
        <div className={`${innerCard2} rounded-[24px] p-5 flex flex-col justify-center`}>
           <p className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${smallText}`}>Auteur</p>
           <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-full bg-zinc-400 overflow-hidden shrink-0 border border-black/10"><User className="w-full h-full text-white/50 bg-zinc-300 p-1"/></div>
             <p className="font-bold text-[14px] truncate tracking-tight">{post.name}</p>
           </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="mb-8 px-1">
        <p className={`text-[15px] font-medium leading-relaxed ${isEchange ? 'text-black/80' : isService ? 'text-zinc-300' : 'text-zinc-600'}`}>
          {post.text}
        </p>
      </div>

      {/* Footer Info & CTA */}
      <div className="flex items-end justify-between">
         <div className="space-y-3">
            {post.badge && (
              <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full inline-flex items-center border ${badgeClass} tracking-wide`}>
                  {post.badgeIcon && <post.badgeIcon className="w-3.5 h-3.5 mr-1.5" />}
                  {post.badge}
              </div>
            )}
            <div className={`flex items-center text-xs font-bold ${smallText} px-1 tracking-wide`}>
                <Map className="w-4 h-4 mr-1.5 opacity-80" />
                {post.zone}
            </div>
         </div>
         <div className={`h-[56px] px-6 rounded-full font-black text-[15px] flex items-center justify-center transition-all ${ctaBtn}`}>
            {post.cta}
            <ArrowUpRight className="w-4 h-4 ml-2 opacity-80" strokeWidth={3} />
         </div>
      </div>
    </Link>
  );
}
