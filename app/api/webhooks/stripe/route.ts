import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { insforgeAdmin } from '@/lib/insforge/admin-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-08-27.basil',
});

type PlanId = 'pass30' | 'pass12' | 'pro';

function plusDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

function entitlementForPlan(plan: PlanId) {
  if (plan === 'pass30') return { key: 'contact_pass', days: 90, usageLimit: 30 };
  if (plan === 'pass12') return { key: 'contact_pass', days: 365, usageLimit: null };
  return { key: 'kwate_pro', days: 32, usageLimit: null };
}

async function upsertEntitlement(input: {
  userId: string;
  plan: PlanId;
  sourceReference: string;
  validUntil?: string;
}) {
  const entitlement = entitlementForPlan(input.plan);
  return insforgeAdmin.post<unknown[]>(
    '/api/database/records/billing_entitlements',
    [{
      user_id: input.userId,
      entitlement_key: entitlement.key,
      status: 'active',
      source: 'stripe',
      source_reference: input.sourceReference,
      valid_from: new Date().toISOString(),
      valid_until: input.validUntil || plusDays(new Date(), entitlement.days),
      usage_limit: entitlement.usageLimit,
      usage_count: 0,
    }],
    { headers: { Prefer: 'return=representation' } },
  );
}

async function updateSubscriptionEntitlement(subscriptionId: string, patch: Record<string, unknown>) {
  return insforgeAdmin.patch<unknown[]>(
    `/api/database/records/billing_entitlements?source=eq.stripe&source_reference=eq.${encodeURIComponent(subscriptionId)}`,
    patch,
    { headers: { Prefer: 'return=representation' } },
  );
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe webhook not configured' }, { status: 503 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.kwate_user_id;
      const plan = session.metadata?.kwate_plan as PlanId | undefined;
      const reference = typeof session.subscription === 'string'
        ? session.subscription
        : typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.id;
      if (userId && plan && ['pass30', 'pass12', 'pro'].includes(plan)) {
        const result = await upsertEntitlement({ userId, plan, sourceReference: reference });
        if (!result.ok && result.error.status !== 409 && !result.error.message.toLowerCase().includes('duplicate')) {
          throw new Error(result.error.message);
        }
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id;
      const periodEnd = invoice.lines.data.reduce((max, line) => Math.max(max, line.period?.end ?? 0), 0);
      if (subscriptionId) {
        const result = await updateSubscriptionEntitlement(subscriptionId, {
          status: 'active',
          valid_until: periodEnd ? new Date(periodEnd * 1000).toISOString() : plusDays(new Date(), 32),
        });
        if (!result.ok) throw new Error(result.error.message);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const result = await updateSubscriptionEntitlement(subscription.id, { status: 'revoked', valid_until: new Date().toISOString() });
      if (!result.ok) throw new Error(result.error.message);
    }

    return NextResponse.json({ received: true, handled: true, eventType: event.type });
  } catch (error) {
    console.error('KWATE Stripe fulfillment failed', { eventId: event.id, error });
    return NextResponse.json({ received: true, handled: false, error: error instanceof Error ? error.message : 'Fulfillment failed' }, { status: 500 });
  }
}
