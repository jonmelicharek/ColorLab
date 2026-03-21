import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
      typescript: true,
    });
  }
  return _stripe;
}

// Keep backward compat
export const stripe = null as unknown as Stripe; // Use getStripe() instead

// ─── PRICE IDS (set these in env after creating products in Stripe) ───

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    analysesPerMonth: 3,
    priceId: null,
    features: [
      '3 analyses per month',
      'Basic formula breakdown',
      'Product recommendations',
    ],
  },
  stylist: {
    name: 'Stylist',
    price: 29,
    analysesPerMonth: 50,
    priceId: process.env.STRIPE_STYLIST_PRICE_ID || '',
    features: [
      '50 analyses per month',
      'Full formula breakdown',
      'Formula history & saved clients',
      'Priority processing',
      'Email support',
    ],
  },
  salon: {
    name: 'Salon',
    price: 79,
    analysesPerMonth: -1, // unlimited
    priceId: process.env.STRIPE_SALON_PRICE_ID || '',
    features: [
      'Unlimited analyses',
      'Up to 5 stylist seats',
      'Client management portal',
      'Custom branding',
      'Priority support',
      'Analytics dashboard',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    analysesPerMonth: -1,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    features: [
      'Unlimited everything',
      'Unlimited stylist seats',
      'API access',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
    ],
  },
} as const;

export const WHY_ADDON = {
  name: '"Why This Works" Education Add-on',
  price: 9.99,
  priceId: process.env.STRIPE_WHY_ADDON_PRICE_ID || '',
  features: [
    'Detailed color science breakdown',
    'Why each product was chosen',
    'Alternative formula options',
    'Common mistakes to avoid',
    'Video tutorial links',
  ],
};

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string): number {
  const p = PLANS[plan as PlanKey];
  if (!p) return 3;
  return p.analysesPerMonth;
}

export function canAnalyze(plan: string, usedCount: number): boolean {
  const limit = getPlanLimits(plan);
  if (limit === -1) return true; // unlimited
  return usedCount < limit;
}
