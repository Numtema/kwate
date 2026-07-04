"use client";

import React, { createContext, useContext, useState } from "react";
import { Paintbrush, Repeat2, ShoppingBasket, ShieldCheck, Sparkles, Wrench, Utensils, Laptop, Car, Carrot, ChefHat } from "lucide-react";

export type Post = {
  id: number | string;
  type: string;
  categoryId: string;
  icon: any;
  badge: string;
  badgeIcon: any | null;
  title: string;
  name: string;
  zone: string;
  rating: number | string;
  count: number;
  price: string;
  text: string;
  cta: string;
  locked: boolean;
};

const initialPosts: Post[] = [
  {
    id: 1,
    type: "Service",
    categoryId: "service",
    icon: Paintbrush,
    badge: "Téléphone vérifié",
    badgeIcon: ShieldCheck,
    title: "Peinture, revêtement, époxy",
    name: "Junior M.",
    zone: "Douala · Makepe",
    rating: 4.7,
    count: 18,
    price: "À partir de 15 000 FCFA",
    text: "Je fais peinture intérieure, extérieure, décoration murale et revêtement. Photos avant/après disponibles.",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 2,
    type: "Échange consommable",
    categoryId: "echange",
    icon: Repeat2,
    badge: "Gratuit",
    badgeIcon: null,
    title: "J'échange plantain contre huile rouge",
    name: "Mado N.",
    zone: "Yaoundé · Nkolbisson",
    rating: 4.9,
    count: 11,
    price: "Échange",
    text: "Petit stock de plantain frais (alimentation). Je cherche huile rouge ou arachides. Échange consommable uniquement, pas de service.",
    cta: "Répondre",
    locked: false,
  },
  {
    id: 3,
    type: "Vente",
    categoryId: "vente",
    icon: ShoppingBasket,
    badge: "3 réalisations",
    badgeIcon: Sparkles,
    title: "Portraits et tableaux personnalisés",
    name: "Alex D.",
    zone: "Douala · Akwa",
    rating: 5.0,
    count: 3,
    price: "Sur devis",
    text: "Je réalise des portraits au crayon et des toiles sur commande pour la maison. Idéal pour cadeaux d'anniversaire.",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 4,
    type: "Service",
    categoryId: "service",
    icon: Wrench,
    badge: "Expérimenté",
    badgeIcon: ShieldCheck,
    title: "Bricolage et petites réparations",
    name: "Hervé T.",
    zone: "Yaoundé · Biyem-Assi",
    rating: 4.8,
    count: 32,
    price: "Dès 10 000 FCFA",
    text: "Expert en bricolage : montage de meubles, plomberie de base, et électricité domestique. Intervention rapide.",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 5,
    type: "Service",
    categoryId: "service",
    icon: Car,
    badge: "Rapide",
    badgeIcon: Sparkles,
    title: "Transport et déménagement",
    name: "Patrick L.",
    zone: "Douala · Deido",
    rating: 4.6,
    count: 45,
    price: "Sur devis",
    text: "Je propose mes services de transport pour vous aider dans vos déménagements avec ma camionnette. Très prudent avec vos affaires.",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 6,
    type: "Service",
    categoryId: "service",
    icon: Laptop,
    badge: "Certifié",
    badgeIcon: ShieldCheck,
    title: "Dépannage Informatique (Tech & Info)",
    name: "Steve J.",
    zone: "Douala · Bonanjo",
    rating: 5.0,
    count: 22,
    price: "Dès 20 000 FCFA",
    text: "Réparation d'ordinateurs, installation de logiciels, récupération de données et maintenance réseaux (Tech).",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 7,
    type: "Vente",
    categoryId: "vente",
    icon: Carrot,
    badge: "Frais",
    badgeIcon: Sparkles,
    title: "Paniers de légumes bio (Alimentation)",
    name: "Coopérative Vert",
    zone: "Bafoussam · Centre",
    rating: 4.9,
    count: 156,
    price: "5 000 FCFA / Panier",
    text: "Nous vendons des paniers de légumes frais et bio directement du producteur (alimentation). Livraison possible.",
    cta: "Débloquer contact",
    locked: true,
  },
  {
    id: 8,
    type: "Service",
    categoryId: "service",
    icon: ChefHat,
    badge: "Top Chef",
    badgeIcon: ShieldCheck,
    title: "Service Traiteur & Cuisine",
    name: "Maman Nicole",
    zone: "Yaoundé · Bastos",
    rating: 4.9,
    count: 89,
    price: "Sur Devis",
    text: "Je cuisine pour vos événements: mariages, baptêmes, repas d'entreprise. Spécialités culinaires locales et européennes.",
    cta: "Débloquer contact",
    locked: true,
  }
];

type MockContextType = {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'icon' | 'badge' | 'badgeIcon' | 'name' | 'rating' | 'count' | 'type' | 'cta' | 'locked'>) => void;
};

const MockContext = createContext<MockContextType | null>(null);

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const addPost = (newPostData: any) => {
    let icon = Paintbrush;
    let badge = "Nouveau";
    let badgeIcon = null;
    let titleType = "Service";
    
    if (newPostData.categoryId === "echange") {
      icon = Repeat2;
      badge = "Gratuit";
      titleType = "Échange consommable";
    } else if (newPostData.categoryId === "vente") {
      icon = ShoppingBasket;
      badge = "Nouveau";
      titleType = "Vente";
    }

    const post: Post = {
      id: Date.now(),
      type: titleType,
      categoryId: newPostData.categoryId,
      icon,
      badge,
      badgeIcon,
      title: newPostData.title,
      name: "Vous",
      zone: newPostData.zone || "Cameroun",
      rating: "-",
      count: 0,
      price: newPostData.price,
      text: newPostData.text,
      cta: newPostData.categoryId === "echange" ? "Répondre" : "Débloquer contact",
      locked: newPostData.categoryId !== "echange",
    };

    setPosts([post, ...posts]);
  };

  return (
    <MockContext.Provider value={{ posts, addPost }}>
      {children}
    </MockContext.Provider>
  );
}

export function useMock() {
  const context = useContext(MockContext);
  if (!context) throw new Error("useMock must be used within a MockProvider");
  return context;
}
