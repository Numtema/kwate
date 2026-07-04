"use client";

import React, { useState, use } from "react";
import { ArrowLeft, MapPin, User, Star, Map, ArrowUpRight, ShieldAlert, CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMock } from "@/components/MockProvider";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { posts } = useMock();
  const [showReported, setShowReported] = useState(false);

  // Unwrap params using React.use() for Next 15 Client Component
  const resolvedParams = use(params);
  const postId = parseInt(resolvedParams.id);
  const post = posts.find(p => p.id === postId) || posts[0];

  if (!post) return null;

  const isEchange = post.categoryId === 'echange';
  const isService = post.categoryId === 'service';
  
  const bgClass = isEchange ? 'bg-green-400 text-black shadow-lg shadow-green-500/10' : isService ? 'bg-zinc-900 border border-white/5 text-white' : 'bg-white text-black border border-black/5';

  return (
    <div className="flex flex-col min-h-screen relative pb-28">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.back()} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">Détail de l'annonce</span>
        <div className="w-12"></div>
      </header>

      <main className="p-4 space-y-6 mt-2 z-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none -z-10 -mt-32"></div>
        <div className={`${bgClass} rounded-[40px] p-7 w-full overflow-hidden relative`}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-widest ${isEchange ? 'text-black/60' : 'text-zinc-400'} mb-1.5 flex items-center`}>
                {post.type}
              </div>
              <h1 className="font-space font-black text-4xl leading-[1.0] tracking-tighter max-w-[280px]">{post.title}</h1>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border ${isEchange ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5'}`}>
                 <post.icon className="w-5 h-5" />
            </div>
          </div>

          <div className={`rounded-[32px] p-6 flex flex-col justify-center mb-6 border ${isEchange ? 'bg-black/10 border-black/5' : 'bg-zinc-950 border-white/5 shadow-inner'}`}>
             <p className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isEchange ? 'text-black/60' : 'text-zinc-500'}`}>Valeur</p>
             <p className={`font-space font-black text-3xl tracking-tighter ${isEchange ? 'text-black' : 'text-white'}`}>{post.price}</p>
          </div>

          <div className="mb-10">
            <p className={`text-[17px] font-medium leading-relaxed ${isEchange ? 'text-black/80' : 'text-zinc-300'}`}>
              {post.text}
            </p>
          </div>

          <div className={`flex items-center text-[13px] font-bold px-1 tracking-widest uppercase ${isEchange ? 'text-black/60' : 'text-zinc-500'}`}>
              <MapPin className="w-4 h-4 mr-2" />
              {post.zone}
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6 flex justify-between items-center group cursor-pointer hover:border-white/10 transition">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-zinc-800 rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
                  <User className="w-6 h-6 text-zinc-500" />
               </div>
               <div>
                  <h3 className="font-space font-black text-white text-[18px] tracking-tighter">{post.name}</h3>
                  <p className="text-[12px] font-bold text-zinc-500 flex items-center mt-0.5">
                     <Star className="w-4 h-4 mr-1 text-green-500 fill-green-500/20" /> 
                     {post.rating} ({post.count} avis)
                  </p>
               </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-white/10 transition">
              <ArrowUpRight className="w-4 h-4"/>
            </div>
        </div>

        {/* Action / Report */}
        <div className="px-2 pt-2">
           {!showReported ? (
             <button 
               onClick={() => setShowReported(true)}
               className="flex items-center text-[12px] font-bold text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest"
             >
               <ShieldAlert className="w-4 h-4 mr-2" />
               Signaler cette annonce
             </button>
           ) : (
             <div className="flex items-center text-[12px] font-bold text-green-500 uppercase tracking-widest bg-green-500/10 px-4 py-3 rounded-2xl w-fit">
               <CheckCircle2 className="w-4 h-4 mr-2" />
               Signalement envoyé
             </div>
           )}
           <p className="text-[11px] font-medium text-zinc-600 mt-3 leading-relaxed max-w-sm">
             Si cette annonce est une vente déguisée, un service interdit dans la zone gratuite, ou un comportement pro non assumé, n'hésitez pas à la signaler pour garde le réseau sain.
           </p>
        </div>
      </main>

      {/* Floating CTA bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl z-30 pointer-events-none px-4 pb-8 md:pb-6 flex justify-center lg:justify-end lg:pr-10">
         <div className="w-full max-w-md pointer-events-auto bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-3 rounded-full flex gap-3 shadow-2xl">
            <button className={`flex-1 h-[56px] rounded-full font-black text-[15px] flex items-center justify-center transition-all ${post.locked ? 'bg-zinc-900 border border-white/5 text-white' : 'bg-green-500 text-black shadow-lg shadow-green-500/20'}`}>
                {post.locked ? (
                  <>Débloquer (Pass requis)</>
                ) : (
                  <><MessageCircle className="w-5 h-5 mr-2"/> Écrire un message</>
                )}
            </button>
         </div>
      </div>
    </div>
  );
}
