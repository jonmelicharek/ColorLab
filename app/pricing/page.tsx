'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical, Check, ArrowRight, Sparkles, Zap,
  Crown, Building2, Star, BookOpen
} from 'lucide-react';

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    period: '',
    icon: Sparkles,
    description: 'Try ColorLab AI with no commitment',
    features: [
      '3 analyses per month',
      'Basic formula breakdown',
      'Product recommendations',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    key: 'stylist',
    name: 'Stylist',
    price: 29,
    period: '/month',
    icon: Zap,
    description: 'For independent stylists who want more',
    features: [
      '50 analyses per month',
      'Full formula breakdown',
      'Formula history & saved clients',
      'Priority processing',
      'Email support',
    ],
    cta: 'Start Stylist Plan',
    popular: true,
  },
  {
    key: 'salon',
    name: 'Salon',
    price: 79,
    period: '/month',
    icon: Crown,
    description: 'For salons with multiple stylists',
    features: [
      'Unlimited analyses',
      'Up to 5 stylist seats',
      'Client management portal',
      'Custom branding',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Start Salon Plan',
    popular: false,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 199,
    period: '/month',
    icon: Building2,
    description: 'For salon chains and education brands',
    features: [
      'Unlimited everything',
      'Unlimited stylist seats',
      'API access',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const whyAddon = {
  name: '"Why This Works"',
  price: 9.99,
  period: '/month',
  description: 'Deep-dive education on every formula',
  features: [
    'Detailed color science breakdown for each analysis',
    'Why each product and shade was chosen',
    'Alternative formula options',
    'Common mistakes to avoid for that transformation',
    'Links to technique video tutorials',
  ],
};

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState<string | null>(null);

  async function handleCheckout(plan: string, addon?: string) {
    if (plan === 'free') {
      window.location.href = '/upload';
      return;
    }

    if (plan === 'enterprise') {
      window.location.href = 'mailto:hello@colorlab.ai?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    if (!email) {
      setShowEmailInput(plan + (addon || ''));
      return;
    }

    setLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan, addon }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch {
      alert('Failed to create checkout session');
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">ColorLab</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-2 py-0.5 rounded-full">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/upload" className="text-sm text-stone hover:text-espresso transition-colors">
              Try Free
            </Link>
            <Link href="/affiliates" className="text-sm text-stone hover:text-espresso transition-colors">
              Affiliates
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            <Star className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-medium mb-4">
            Pick Your Plan
          </h1>
          <p className="text-stone text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more analyses, features, or team seats.
          </p>
        </motion.div>
      </section>

      {/* Plans Grid */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? 'bg-espresso text-pearl ring-2 ring-caramel shadow-xl shadow-espresso/20'
                  : 'formula-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-caramel text-white text-xs font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <plan.icon className={`w-6 h-6 mb-3 ${plan.popular ? 'text-caramel' : 'text-caramel'}`} />
                <h3 className={`font-display text-2xl font-semibold ${plan.popular ? 'text-pearl' : 'text-espresso'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-pearl/70' : 'text-stone'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`font-display text-4xl font-bold ${plan.popular ? 'text-pearl' : 'text-espresso'}`}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.popular ? 'text-pearl/60' : 'text-stone'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? 'text-pearl/80' : 'text-stone'}`}>
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-caramel' : 'text-caramel'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Email input for checkout */}
              {showEmailInput === plan.key && (
                <div className="mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-lg border border-sand bg-white text-espresso text-sm focus:outline-none focus:border-caramel"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckout(plan.key)}
                  />
                </div>
              )}

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className={`w-full py-3 rounded-full text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-caramel text-white hover:bg-copper'
                    : 'bg-espresso text-pearl hover:bg-ink'
                } disabled:opacity-50`}
              >
                {loading === plan.key ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {plan.cta} <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* "Why This Works" Add-on */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="formula-card rounded-2xl p-8 border-2 border-honey/30"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-honey/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-honey" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-espresso">
                      {whyAddon.name}
                    </h3>
                    <p className="text-stone text-sm">Add-on for any paid plan</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {whyAddon.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-stone">
                      <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-honey" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center md:text-right flex-shrink-0">
                <div className="font-display text-3xl font-bold text-espresso mb-1">
                  +${whyAddon.price}
                </div>
                <div className="text-stone text-sm mb-4">{whyAddon.period}</div>
                <button
                  onClick={() => {
                    if (!email) {
                      setShowEmailInput('why');
                    } else {
                      handleCheckout('stylist', 'why');
                    }
                  }}
                  className="bg-honey text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-honey/90 transition-colors"
                >
                  Add to Any Plan
                </button>

                {showEmailInput === 'why' && (
                  <div className="mt-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 rounded-lg border border-sand bg-white text-espresso text-sm focus:outline-none focus:border-caramel"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">ColorLab AI</span>
          </div>
          <div className="flex gap-6 text-xs text-stone">
            <Link href="/upload" className="hover:text-espresso transition-colors">Try Free</Link>
            <Link href="/affiliates" className="hover:text-espresso transition-colors">Affiliates</Link>
            <Link href="/salon-portal" className="hover:text-espresso transition-colors">For Salons</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
