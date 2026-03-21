import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const stylistId = session.metadata?.stylistId;
        const plan = session.metadata?.plan;
        const addon = session.metadata?.addon;

        if (stylistId) {
          const updateData: any = {};

          if (plan && plan !== 'free') {
            updateData.plan = plan;
            updateData.planStatus = 'active';
            updateData.stripeSubscriptionId = session.subscription;
          }

          if (addon === 'why') {
            updateData.hasWhyAddon = true;
          }

          await prisma.stylist.update({
            where: { id: stylistId },
            data: updateData,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const stylist = await prisma.stylist.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (stylist) {
          await prisma.stylist.update({
            where: { id: stylist.id },
            data: {
              planStatus: subscription.status === 'active' ? 'active' : subscription.status,
              planExpiresAt: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const stylist = await prisma.stylist.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (stylist) {
          await prisma.stylist.update({
            where: { id: stylist.id },
            data: {
              plan: 'free',
              planStatus: 'canceled',
              stripeSubscriptionId: null,
              hasWhyAddon: false,
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;
        const stylist = await prisma.stylist.findFirst({
          where: { stripeCustomerId: customerId as string },
        });

        if (stylist) {
          await prisma.stylist.update({
            where: { id: stylist.id },
            data: { planStatus: 'past_due' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
