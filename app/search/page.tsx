"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon, ArrowUpRight, Wrench, Utensils, Laptop, Car, Paintbrush, Carrot, X, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useMock } from "@/components/MockProvider";

export default function SearchPage() {
  const { posts } = useMock();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("kwate_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("kwate_recent_searches", JSON.stringify(updated));
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveSearch(query);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleCategoryClick = (term: string) => {
    setQuery(term);
    saveSearch(term);
  };

  const filteredPosts = query.trim() !== "" 
    ? posts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) || 
        post.text.toLowerCase().includes(query.toLowerCase()) ||
        post.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-4 pt-8 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 border-b border-white/5">
        <h1 className="text-3xl font-space font-black text-white tracking-tighter mb-6">Recherche</h1>
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Que cherchez-vous ?"
            className="w-full bg-zinc-900 border border-white/5 rounded-full py-4 pl-14 pr-12 text-[15px] font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            >
               <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 px-5 pb-6 mt-6 relative z-10 min-h-[500px]">
        <div className="absolute top-20 left-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        
        {query.trim() === "" ? (
          <>
            {recentSearches.length > 0 && (
              <section className="mb-8 relative z-10">
                 <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Recherches récentes</h2>
                 <div className="flex flex-wrap gap-2">
                   {recentSearches.map(term => (
                     <div key={term} className="bg-zinc-900 border border-white/5 pl-4 pr-2 py-2 rounded-full flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <button onClick={() => setQuery(term)} className="text-[13px] font-bold text-zinc-300 hover:text-white transition">
                          {term}
                        </button>
                        <button onClick={() => {
                          const updated = recentSearches.filter(s => s !== term);
                          setRecentSearches(updated);
                          localStorage.setItem("kwate_recent_searches", JSON.stringify(updated));
                        }} className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition">
                           <X className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   ))}
                 </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Catégories fréquentes</h2>
                <button className="text-[12px] font-bold text-green-500 flex items-center hover:text-green-400 transition-colors">
                  Voir tout <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CategoryCard title="Bricolage" icon={Wrench} count={12} color="text-orange-400" bg="bg-orange-400/10" onClick={() => handleCategoryClick("bricolage")} />
                <CategoryCard title="Alimentation" icon={Carrot} count={24} color="text-green-400" bg="bg-green-400/10" onClick={() => handleCategoryClick("alimentation")} />
                <CategoryCard title="Tech & Info" icon={Laptop} count={8} color="text-blue-400" bg="bg-blue-400/10" onClick={() => handleCategoryClick("tech")} />
                <CategoryCard title="Transport" icon={Car} count={5} color="text-purple-400" bg="bg-purple-400/10" onClick={() => handleCategoryClick("transport")} />
                <CategoryCard title="Maison" icon={Paintbrush} count={16} color="text-pink-400" bg="bg-pink-400/10" onClick={() => handleCategoryClick("maison")} />
                <CategoryCard title="Cuisine" icon={Utensils} count={31} color="text-yellow-400" bg="bg-yellow-400/10" onClick={() => handleCategoryClick("cuisine")} />
              </div>
            </section>
          </>
        ) : (
          <section className="space-y-4">
             <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Résultats de recherche ({filteredPosts.length})</h2>
             </div>
             
             {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                   <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <SearchIcon className="w-6 h-6 text-zinc-600" />
                   </div>
                   <h3 className="font-space font-black text-white text-[18px] mb-2 tracking-tighter">Aucun résultat</h3>
                   <p className="text-[14px] text-zinc-500 font-medium">Essayez d'autres mots-clés ou modifiez votre orthographe.</p>
                </div>
             ) : (
                <div className="space-y-4">
                   {filteredPosts.map(post => (
                     <Link key={post.id} href={`/post/${post.id}`} className="block bg-zinc-900 border border-white/5 p-4 rounded-[24px] hover:border-white/10 active:scale-[0.98] transition-all group">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">{post.type}</span>
                             <h4 className="font-space font-black text-[18px] text-white tracking-tighter leading-[1.1]">{post.title}</h4>
                           </div>
                           <p className="font-space font-black text-white text-[15px]">{post.price}</p>
                        </div>
                        <p className="text-[13px] text-zinc-400 font-medium line-clamp-2 mb-4">
                          {post.text}
                        </p>
                        <div className="flex items-center text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                           <MapPin className="w-3 h-3 mr-1" /> {post.zone}
                        </div>
                     </Link>
                   ))}
                </div>
             )}
          </section>
        )}
      </main>
    </div>
  );
}

function CategoryCard({ title, icon: Icon, count, color, bg, onClick }: any) {
  return (
    <button onClick={onClick} className={`bg-zinc-900 border border-white/5 p-5 rounded-[32px] flex flex-col items-start transition-all hover:bg-zinc-800 hover:border-white/10 active:scale-95 group`}>
      <div className={`w-12 h-12 rounded-full ${bg} ${color} flex items-center justify-center mb-5 transition-colors`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`font-space font-black text-[18px] text-white mb-1 tracking-tighter`}>{title}</span>
      <span className="text-[12px] font-bold text-zinc-500">{count} annonces</span>
    </button>
  );
}
