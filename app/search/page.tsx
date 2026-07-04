'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, X, Wrench, Utensils, Laptop, Car, Paintbrush, Carrot } from 'lucide-react';
import { PostCard } from '@/components/posts/PostCard';
import { listCategories, listPosts } from '@/features/posts/repository';
import type { Category, PostView } from '@/features/posts/types';

const fallbackIcons = [Wrench, Carrot, Laptop, Car, Paintbrush, Utensils];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void listCategories().then(setCategories).catch((cause) => setError(cause instanceof Error ? cause.message : 'Catégories indisponibles.'));
  }, []);

  const effectiveQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!effectiveQuery && !selectedCategory) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        setResults(await listPosts({ search: effectiveQuery || undefined, categorySlug: selectedCategory, limit: 60 }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Recherche impossible.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [effectiveQuery, selectedCategory]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/90 px-6 pb-5 pt-8 backdrop-blur-xl">
        <h1 className="mb-6 font-space text-3xl font-black tracking-tighter text-white">Recherche</h1>
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Service, produit, ville…" className="w-full rounded-full border border-white/5 bg-zinc-900 py-4 pl-14 pr-12 text-[15px] font-bold text-white placeholder:text-zinc-500 focus:border-green-500 focus:outline-none" />
          {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10"><X className="h-4 w-4" /></button>}
        </div>
      </header>

      <main className="flex-1 px-5 pb-8 pt-6">
        {!effectiveQuery && !selectedCategory ? (
          <section>
            <h2 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Explorer les catégories</h2>
            {error && <p className="mb-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => {
                const Icon = fallbackIcons[index % fallbackIcons.length];
                return (
                  <button key={category.id} onClick={() => setSelectedCategory(category.slug)} className="rounded-[30px] border border-white/5 bg-zinc-900 p-5 text-left transition hover:border-white/15 hover:bg-zinc-800">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400"><Icon className="h-6 w-6" /></div>
                    <p className="font-space text-lg font-black text-white">{category.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-zinc-500">{category.description || 'Voir les annonces disponibles'}</p>
                  </button>
                );
              })}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{loading ? 'Recherche…' : `${results.length} résultat${results.length > 1 ? 's' : ''}`}</h2>
              {selectedCategory && <button onClick={() => setSelectedCategory(undefined)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300">Effacer le filtre</button>}
            </div>
            {error && <p className="mb-4 rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
            {loading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="mb-4 h-28 animate-pulse rounded-[26px] bg-zinc-900" />)}
            {!loading && !error && results.length === 0 && <div className="rounded-[30px] border border-white/5 bg-zinc-900 p-8 text-center text-zinc-400">Aucun résultat. Essayez une autre recherche.</div>}
            <div className="space-y-4">{!loading && results.map((post) => <PostCard key={post.id} post={post} compact />)}</div>
          </section>
        )}
      </main>
    </div>
  );
}
