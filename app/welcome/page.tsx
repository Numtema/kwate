"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-zinc-950 z-0">
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full pointer-events-none -z-10 -mt-32 -mr-32"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 blur-[100px] rounded-full pointer-events-none -z-10 -mb-32 -ml-32"></div>
      
      <div className="flex-1 flex flex-col p-6 pt-12 max-w-md mx-auto w-full relative z-10">
        <header className="flex justify-between items-center mb-16">
           <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-green-500/20">
                 <span className="font-space font-black text-black text-xl">K</span>
              </div>
              <span className="font-space font-black text-white text-2xl tracking-tighter">KWATE</span>
           </div>
        </header>

        <main className="flex-1 flex flex-col justify-center mb-12">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
           >
              <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-[12px] font-bold text-zinc-300 tracking-widest uppercase">L'App du Cameroun</span>
              </div>
              
              <h1 className="text-[52px] leading-[1.05] font-space font-black text-white tracking-tighter mb-6">
                Tout ce qu'il vous faut, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">à côté de vous.</span>
              </h1>
              
              <p className="text-zinc-400 text-[16px] leading-relaxed font-medium mb-10 max-w-sm">
                Découvrez des services, achetez, vendez et échangez avec des personnes de confiance autour de vous. 
              </p>
           </motion.div>
        </main>
        
        <footer className="space-y-4 pb-8">
           <Link href="/signup" className="flex items-center justify-center w-full bg-green-500 text-black rounded-[24px] py-4 text-[16px] font-space font-black tracking-tighter hover:bg-green-400 transition active:scale-[0.98] shadow-xl shadow-green-500/20 group">
              Créer un compte
              <UserPlus className="w-5 h-5 ml-2 opacity-80 group-hover:opacity-100" />
           </Link>
           <Link href="/login" className="flex items-center justify-center w-full bg-zinc-900 border border-white/5 text-white rounded-[24px] py-4 text-[16px] font-space font-black tracking-tighter hover:bg-zinc-800 transition active:scale-[0.98]">
              Se connecter
           </Link>
           
           <div className="pt-6 text-center">
              <Link href="/" className="text-[14px] font-bold text-zinc-500 hover:text-white transition flex items-center justify-center gap-1">
                 Continuer en tant qu'invité <ArrowRight className="w-4 h-4" />
              </Link>
           </div>
        </footer>
      </div>
    </div>
  );
}
