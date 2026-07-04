"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, UserPlus, AlertCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      // For demo, accept any non-empty
      router.push("/");
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-zinc-950 z-0">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-500/10 blur-[100px] rounded-full pointer-events-none -z-10 -mt-32 -ml-32"></div>
      
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10">
        <header className="flex items-center justify-between pt-6 mb-12">
          <button onClick={() => router.back()} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12"></div> {/* spacer */}
        </header>

        <main className="flex-1 flex flex-col">
          <div className="mb-10">
             <h1 className="text-[40px] leading-[1.1] font-space font-black text-white tracking-tighter mb-4">
               Nouveau ici ?
             </h1>
             <p className="text-zinc-400 text-[15px] font-medium">
               Créez votre compte pour publier et interagir avec la communauté.
             </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1">
            <div className="space-y-4 mb-8">
               {error && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-[20px] p-4 flex items-center text-red-500 text-[14px] font-bold">
                    <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                    {error}
                 </div>
               )}
               
               <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                       type="text"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Jean Dupont"
                       className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                    />
                  </div>
               </div>
               
               <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       placeholder="nom@exemple.com"
                       className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                    />
                  </div>
               </div>
               
               <div>
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block pl-4">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input 
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••"
                       className="w-full bg-zinc-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-[15px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                    />
                  </div>
               </div>
            </div>
            
            <div className="mt-auto pb-8 pt-6">
               <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full bg-green-500 text-black rounded-[24px] py-4 text-[16px] font-space font-black tracking-tighter hover:bg-green-400 transition active:scale-[0.98] shadow-xl shadow-green-500/20 disabled:opacity-50 disabled:active:scale-100"
               >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Créer le compte <UserPlus className="w-5 h-5 ml-2 opacity-80" />
                    </>
                  )}
               </button>
               
               <p className="text-center mt-6 text-[14px] font-bold text-zinc-400">
                  Déjà membre ? <Link href="/login" className="text-white hover:text-green-500 transition">Se connecter</Link>
               </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
