"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Repeat2, Paintbrush, ShoppingBasket, ImagePlus, MapPin, Check } from "lucide-react";
import { useMock } from "@/components/MockProvider";

export default function PublishPage() {
  const router = useRouter();
  const { addPost } = useMock();
  
  const [type, setType] = useState<"service" | "echange" | "vente" | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [text, setText] = useState("");
  const [zone, setZone] = useState("Douala · Makepe");

  const handlePublish = () => {
    if (!type || !title || !text || (!price && type !== "echange")) return;
    addPost({
      categoryId: type,
      title,
      price: type === "echange" ? price || "Échange de denrées" : price,
      text,
      zone
    });
    router.push("/");
  };

  return (
    <div className="flex flex-col bg-zinc-950 min-h-screen text-white rounded-t-[32px] md:rounded-none">
      <header className="px-6 py-4 pt-8 bg-zinc-950 sticky top-0 z-10 flex items-center justify-between border-b border-white/5">
        <button onClick={() => router.back()} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-zinc-800 transition-colors shadow-sm bg-zinc-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-space font-black tracking-tighter">Nouvelle annonce</h1>
        <div className="w-12"></div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-20 relative z-10">
        <div className="absolute top-10 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        
        <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2.5">Type d'annonce</h2>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <TypeButton
            icon={Paintbrush}
            label="Service"
            selected={type === "service"}
            onClick={() => setType("service")}
          />
          <TypeButton
            icon={Repeat2}
            label="Échange"
            selected={type === "echange"}
            onClick={() => setType("echange")}
          />
          <TypeButton
            icon={ShoppingBasket}
            label="Vente"
            selected={type === "vente"}
            onClick={() => setType("vente")}
          />
        </div>

        <div className="space-y-5">
          <div className="bg-zinc-900 border border-white/5 rounded-[32px] p-6 space-y-6 shadow-lg shadow-black/20">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5 ml-1.5 cursor-pointer">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === "echange" ? "Ex: J'échange 2 régimes de plantain" : "Ex: Dépannage plomberie..."}
                className="w-full bg-zinc-950 border border-white/5 rounded-[20px] px-5 py-4 text-[16px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-inner"
               />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5 ml-1.5 cursor-pointer">
                Photos <span className="font-normal opacity-70">(Optionnel)</span>
              </label>
              <div className="flex gap-3">
                <button className="w-[100px] h-[100px] bg-zinc-950 border border-dashed border-white/10 rounded-[20px] flex flex-col items-center justify-center text-zinc-500 hover:text-green-500 hover:border-green-500/30 hover:bg-green-500/5 transition-colors group">
                  <ImagePlus className="w-7 h-7 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Ajouter</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5 ml-1.5 cursor-pointer">Description</label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Décrivez en détail ce que vous proposez..."
                className="w-full bg-zinc-950 border border-white/5 rounded-[20px] px-5 py-4 text-[15px] font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5 ml-1.5 cursor-pointer">
                {type === "echange" ? "Contre quoi ?" : "Prix (FCFA)"}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={type === "echange" ? "Ex: Huile rouge, arachides..." : "Ex: 5000"}
                className="w-full bg-zinc-950 border border-white/5 rounded-[20px] px-5 py-4 text-[16px] font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-inner"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5 ml-1.5 cursor-pointer">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="Douala · Makepe"
                  className="w-full bg-zinc-950 border border-white/5 rounded-[20px] pl-12 pr-5 py-4 text-[15px] font-bold text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={!type || !title || !text}
          onClick={handlePublish}
          className={`w-full mt-8 h-[64px] rounded-full font-black text-[16px] flex items-center justify-center transition-all shadow-xl ${
             type && title && text ? 'bg-green-500 text-black active:scale-[0.98] shadow-green-500/20' : 'bg-zinc-900 border border-white/5 text-zinc-600 cursor-not-allowed shadow-none'
          }`}
        >
          {type && title && text ? (
            <>
              <Check className="w-5 h-5 mr-2" strokeWidth={3} />
              Publier l'annonce
            </>
          ) : (
            "Remplissez les champs"
          )}
        </button>
      </main>
    </div>
  );
}

function TypeButton({ icon: Icon, label, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-5 rounded-[28px] border transition-all active:scale-[0.95] ${selected ? 'bg-green-500 text-black border-green-500 shadow-lg shadow-green-500/20' : 'bg-zinc-900 border-white/5 text-white hover:bg-zinc-800 hover:border-white/10'}`}
    >
      <Icon className={`w-7 h-7 mb-2.5 ${selected ? 'text-black' : 'text-zinc-400'}`} />
      <span className={`text-[13px] tracking-tight ${selected ? 'font-black' : 'font-bold text-zinc-400'}`}>{label}</span>
    </button>
  );
}
