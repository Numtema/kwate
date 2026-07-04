"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, User, Plus, Compass, Menu, X } from "lucide-react";
import { motion } from "motion/react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = pathname === "/publish" || ['/login', '/signup', '/forgot-password', '/welcome'].includes(pathname);
  const [isExpanded, setIsExpanded] = useState(false);

  if (hideLayout) {
    return (
      <div className="min-h-screen bg-zinc-950 flex justify-center font-sans tracking-tight text-white">
        <div className="w-full max-w-2xl bg-zinc-950 min-h-screen shadow-2xl flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans tracking-tight text-white flex justify-center lg:px-4 selection:bg-green-500/30">
      <div className="w-full max-w-6xl flex justify-center lg:gap-6">
        
        {/* Desktop Sidebar */}
        <motion.aside 
          animate={{ width: isExpanded ? 240 : 88 }}
          className="hidden md:flex flex-col pt-8 sticky top-0 h-screen bg-transparent shrink-0 border-r border-white/5 overflow-visible z-20"
        >
          <div className="mb-8 px-6 flex items-center h-8">
            <div className="w-10 h-10 bg-green-500 rounded-full flex shrink-0 items-center justify-center font-black text-black text-xl">
              K
            </div>
            <motion.h1 
              initial={false}
              animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0, marginLeft: isExpanded ? 12 : 0 }}
              className="text-2xl font-black text-white tracking-tighter overflow-hidden whitespace-nowrap"
            >
              KWATE
            </motion.h1>
          </div>

          <nav className="flex-1 space-y-4 px-4 flex flex-col items-center md:items-start">
            <DesktopNavItem href="/" icon={Home} label="Accueil" active={pathname === "/"} isExpanded={isExpanded} />
            <DesktopNavItem href="/search" icon={Search} label="Recherche" active={pathname === "/search"} isExpanded={isExpanded} />
            <DesktopNavItem href="/messages" icon={MessageCircle} label="Messages" active={pathname === "/messages"} badge="2" isExpanded={isExpanded} />
            <DesktopNavItem href="/profile" icon={User} label="Profil" active={pathname === "/profile"} isExpanded={isExpanded} />
          </nav>

          <div className="p-4 mb-4">
            <Link href="/publish" className={`w-full flex items-center justify-center bg-green-500 text-black rounded-full hover:bg-green-400 transition active:scale-95 py-3 shadow-lg shadow-green-500/20 ${isExpanded ? 'px-4' : 'px-0 h-14 w-14 mx-auto'}`}>
              <Plus className="w-6 h-6 shrink-0" />
              <motion.span animate={{ width: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0, marginLeft: isExpanded ? 8 : 0 }} className="font-bold whitespace-nowrap overflow-hidden">
                Publier
              </motion.span>
            </Link>
          </div>
          
          <button onClick={() => setIsExpanded(!isExpanded)} className="absolute top-[42px] -right-4 w-8 h-8 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-zinc-800 z-50 transition drop-shadow-md">
             {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4"/>}
          </button>
        </motion.aside>

        {/* Main Feed Container */}
        <main className="flex-1 w-full md:max-w-2xl md:border-x md:border-white/5 min-h-screen relative flex flex-col pb-28 md:pb-0 overflow-x-hidden">
          {children}
        </main>

        {/* Desktop Right Panel */}
        <aside className="hidden lg:flex w-80 flex-col pt-8 sticky top-0 h-screen overflow-y-auto pl-4 shrink-0 pb-8">
           <div className="bg-zinc-900 rounded-[32px] p-6 shadow-sm mb-4 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-green-500/10 blur-[50px] rounded-full pointer-events-none"></div>
              
              <h3 className="font-bold text-white mb-2 text-xl relative z-10">Le réseau Kwate</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed font-medium relative z-10">
                Connectez-vous pour des services, échanges et ventes de proximité.
              </p>
              
              <div className="space-y-4 relative z-10">
                 <Link href="/how-it-works" className="bg-white/5 rounded-[24px] p-4 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-zinc-700">
                        <Compass className="w-5 h-5 text-white"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight mb-0.5 group-hover:text-green-400 transition-colors">Comment ça marche ?</h4>
                      <p className="text-xs text-zinc-500">Règles et abonnements.</p>
                    </div>
                 </Link>
                 
                 <div className="bg-green-500/10 rounded-[24px] p-4 flex items-center gap-4 cursor-default border border-green-500/10">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20">
                        <Compass className="w-5 h-5 text-black"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-green-400 leading-tight mb-0.5">Échanges gratuits</h4>
                      <p className="text-xs text-green-500/70">Troc de denrées et consommables.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="text-xs font-bold text-zinc-600 px-4 flex flex-wrap gap-x-4 gap-y-2 mt-2 tracking-wide uppercase">
             <span>© 2026 Kwate</span>
             <Link href="#" className="hover:text-zinc-400 transition-colors">Conditions</Link>
             <Link href="#" className="hover:text-zinc-400 transition-colors">Confidentialité</Link>
           </div>
        </aside>

        {/* Mobile Navigation - Floating Pill */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <nav className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-between px-2 py-2 shadow-2xl">
            <MobileNavItem href="/" icon={Home} active={pathname === "/"} />
            <MobileNavItem href="/search" icon={Search} active={pathname === "/search"} />
            
            <Link href="/publish" className="w-[56px] h-[56px] bg-green-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 shrink-0 transform -translate-y-4 border-[6px] border-zinc-950 active:scale-95 transition-transform">
              <Plus className="w-7 h-7 stroke-[3px]" />
            </Link>

            <MobileNavItem href="/messages" icon={MessageCircle} active={pathname === "/messages"} badge="2" />
            <MobileNavItem href="/profile" icon={User} active={pathname === "/profile"} />
          </nav>
        </div>

      </div>
    </div>
  );
}

function DesktopNavItem({ href, icon: Icon, label, active, badge, isExpanded }: any) {
  return (
    <Link href={href} className={`flex items-center gap-4 py-3.5 rounded-full transition-all group w-full ${active ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'} ${isExpanded ? 'px-4' : 'justify-center px-0'}`}>
      <div className="relative shrink-0">
        <Icon className={`w-6 h-6 transition-transform group-active:scale-95 ${active ? 'text-green-500 fill-green-500/10' : 'text-zinc-400 group-hover:text-white'}`} />
        {badge && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-950">
            {badge}
          </span>
        )}
      </div>
      <motion.span animate={{ width: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }} className={`text-[15px] whitespace-nowrap overflow-hidden ${active ? 'font-black text-white' : 'font-bold text-zinc-400 group-hover:text-white'}`}>
        {label}
      </motion.span>
    </Link>
  );
}

function MobileNavItem({ href, icon: Icon, active, badge }: any) {
  return (
    <Link href={href} className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-colors ${active ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}>
      <Icon className={`w-[24px] h-[24px] ${active ? 'text-green-500 fill-green-500/10' : 'text-zinc-400'}`} />
      {badge && (
        <span className="absolute top-2.5 right-2 lg:top-2 lg:right-2 bg-green-500 text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}
