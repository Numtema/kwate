import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    insforgeConfigured: Boolean(process.env.NEXT_PUBLIC_INSFORGE_URL && process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY),
    stripeEnvironment: process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT === 'live' ? 'live' : 'test',
    paymentPlans: {
      pass30: Boolean(process.env.NEXT_PUBLIC_STRIPE_PRICE_PASS30),
      pass12: Boolean(process.env.NEXT_PUBLIC_STRIPE_PRICE_PASS12),
      pro: Boolean(process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO),
    },
    vercelEnvironment: process.env.VERCEL_ENV ?? null,
  });
}
