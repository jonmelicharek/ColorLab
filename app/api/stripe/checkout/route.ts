import { NextRequest, NextResponse } from 'next/server';
import { getStripe, PLANS, WHY_ADDON, PlanKey } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const { email, plan, addon } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find or create stylist
    let stylist = await prisma.stylist.findUnique({ where: { email } });
    if (!stylist) {
      stylist = await prisma.stylist.create({
        data: { email, name: email.split('@')[0] },
      });
    }

    // Create or get Stripe customer
    let customerId = stylist.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { stylistId: stylist.id },
      });
      customerId = customer.id;
      await prisma.stylist.update({
        where: { id: stylist.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const lineItems: any[] = [];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://project-aiub5.vercel.app';

    // Add plan subscription
    if (plan && plan !== 'free') {
      const planConfig = PLANS[plan as PlanKey];
      if (!planConfig || !planConfig.priceId) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      lineItems.push({
        price: planConfig.priceId,
        quantity: 1,
      });
    }

    // Add "Why This Works" addon
    if (addon === 'why') {
      if (!WHY_ADDON.priceId) {
        return NextResponse.json({ error: 'Addon not configured' }, { status: 400 });
      }
      lineItems.push({
        price: WHY_ADDON.priceId,
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No items selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${appUrl}/upload?checkout=success&plan=${plan || 'free'}`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      metadata: {
        stylistId: stylist.id,
        plan: plan || 'free',
        addon: addon || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
