'use client';

import { getInsforgeBrowserClient } from '@/lib/insforge/sdk-browser';

export type BillingPlan = {
  id: 'pass30' | 'pass12' | 'pro';
  title: string;
  priceLabel: string;
  priceId: string | null;
  mode: 'payment' | 'subscription';
  features: string[];
};

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'pass30',
    title: 'Pass 30 contacts',
    priceLabel: '1 000 FCFA',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PASS30 || null,
    mode: 'payment',
    features: ['Débloquez 30 contacts', 'Valable 90 jours', 'Support standard'],
  },
  {
    id: 'pass12',
    title: 'Pass annuel',
    priceLabel: '10 000 FCFA',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PASS12 || null,
    mode: 'payment',
    features: ['Contacts illimités pendant 12 mois', 'Badge membre actif', 'Support prioritaire'],
  },
  {
    id: 'pro',
    title: 'KWATE Pro',
    priceLabel: '5 000 FCFA / mois',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || null,
    mode: 'subscription',
    features: ['Contacts illimités', 'Annonces mises en avant', 'Espace professionnel'],
  },
];

export async function createCheckout(user: { id: string; email: string }, plan: BillingPlan) {
  if (!plan.priceId) throw new Error(`Configurez le Price ID Stripe pour ${plan.title} dans Vercel.`);
  const client = getInsforgeBrowserClient();
  const environment = (process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT === 'live' ? 'live' : 'test') as 'test' | 'live';
  const origin = window.location.origin;
  const request = {
    mode: plan.mode,
    lineItems: [{ priceId: plan.priceId, quantity: 1 }],
    successUrl: `${origin}/pass/success?plan=${plan.id}`,
    cancelUrl: `${origin}/pass?cancelled=1`,
    subject: { type: 'user', id: user.id },
    customerEmail: user.email,
    metadata: { kwate_plan: plan.id, kwate_user_id: user.id },
    idempotencyKey: `kwate-${user.id}-${plan.id}-${new Date().toISOString().slice(0, 10)}`,
  };
  const { data, error } = await client.payments.stripe.createCheckoutSession(environment, request);
  if (error) throw new Error(error.message || 'Impossible de démarrer le paiement.');
  const url = data?.checkoutSession?.url;
  if (!url) throw new Error('URL de paiement absente.');
  window.location.assign(url);
}

export async function listMyEntitlements(userId: string) {
  const client = getInsforgeBrowserClient();
  const { data, error } = await client.database.from('billing_entitlements').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message || 'Impossible de charger vos pass.');
  return data ?? [];
}
