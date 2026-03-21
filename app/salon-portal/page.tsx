'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical, ArrowRight, Check, Sparkles, Users,
  MapPin, Star, DollarSign, Send, ShieldCheck, Zap
} from 'lucide-react';

const benefits = [
  {
    icon: Users,
    title: 'Pre-Qualified Clients',
    desc: 'Every lead has already uploaded photos and knows exactly what they want. No tire-kickers.',
  },
  {
    icon: MapPin,
    title: 'Location-Based Matching',
    desc: 'Only receive leads in your service area. Set your radius and preferred services.',
  },
  {
    icon: DollarSign,
    title: 'Pay Per Lead',
    desc: 'Only $5-10 per qualified lead. No monthly minimums. Buy credits as you need them.',
  },
  {
    icon: Zap,
    title: 'Instant Delivery',
    desc: 'Get notified the moment a client in your area wants a color service you specialize in.',
  },
];

const pricing = [
  { credits: 10, price: 50, perLead: 5.00, savings: null },
  { credits: 25, price: 100, perLead: 4.00, savings: '20% off' },
  { credits: 50, price: 175, perLead: 3.50, savings: '30% off' },
  { credits: 100, price: 300, perLead: 3.00, savings: '40% off' },
];

export default function SalonPortalPage() {
  const [form, setForm] = useState({
    salonName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    instagram: '',
    preferredServices: '',
    serviceRadius: '25',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/salon-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          preferredServices: form.preferredServices.split(',').map(s => s.trim()).filter(Boolean),
          serviceRadius: parseInt(form.serviceRadius) || 25,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Something went wrong');
      }
    } catch {
      alert('Failed to submit. Please try again.');
    }
    setLoading(false);
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
            <Link href="/pricing" className="text-sm text-stone hover:text-espresso transition-colors">Pricing</Link>
            <Link href="/affiliates" className="text-sm text-stone hover:text-espresso transition-colors">Affiliates</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Salon Lead Portal
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-medium mb-4">
            Clients Who Already Know<br />
            <span className="bg-gradient-to-r from-caramel via-copper to-rose bg-clip-text text-transparent">
              What They Want
            </span>
          </h1>
          <p className="text-stone text-lg max-w-2xl mx-auto">
            Every day, clients use ColorLab AI to find their dream hair color. They've already picked their look and uploaded photos.
            They just need a salon to make it happen. That's where you come in.
          </p>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="formula-card rounded-2xl p-6"
            >
              <b.icon className="w-6 h-6 text-emerald-500 mb-3" />
              <h3 className="font-display text-xl font-semibold mb-2">{b.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 pb-20 bg-cream/50 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-medium text-center mb-4">Lead Credit Packages</h2>
          <p className="text-stone text-center mb-12 max-w-lg mx-auto">Buy credits upfront. Use them whenever a matching lead appears. No monthly fees, no expiration.</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricing.map((tier, i) => (
              <motion.div
                key={tier.credits}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`formula-card rounded-xl p-5 text-center ${tier.savings === '30% off' ? 'ring-2 ring-caramel' : ''}`}
              >
                {tier.savings && (
                  <div className="text-xs font-medium text-caramel mb-2">{tier.savings}</div>
                )}
                <div className="font-display text-3xl font-bold text-espresso">{tier.credits}</div>
                <div className="text-xs text-stone uppercase tracking-wider mb-3">Lead Credits</div>
                <div className="font-display text-2xl font-semibold text-espresso mb-1">${tier.price}</div>
                <div className="text-xs text-stone">${tier.perLead.toFixed(2)} per lead</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section id="signup" className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl font-medium mb-3">Register Your Salon</h2>
            <p className="text-stone">Sign up to start receiving pre-qualified color clients in your area.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-700 px-8 py-8 rounded-2xl text-center"
            >
              <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="font-display text-2xl font-semibold mb-2">Registration Received!</h3>
              <p className="text-emerald-600">We'll verify your salon and activate your account within 24 hours. You'll receive an email with next steps.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="formula-card rounded-2xl p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Salon Name *</label>
                  <input type="text" value={form.salonName} onChange={(e) => setForm(p => ({ ...p, salonName: e.target.value }))}
                    placeholder="Your Salon Name" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Owner/Manager Name *</label>
                  <input type="text" value={form.ownerName} onChange={(e) => setForm(p => ({ ...p, ownerName: e.target.value }))}
                    placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="salon@email.com" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">City *</label>
                  <input type="text" value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                    placeholder="City" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">State *</label>
                  <input type="text" value={form.state} onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))}
                    placeholder="State" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Zip Code</label>
                  <input type="text" value={form.zipCode} onChange={(e) => setForm(p => ({ ...p, zipCode: e.target.value }))}
                    placeholder="12345" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Website</label>
                  <input type="url" value={form.website} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
                    placeholder="https://yoursalon.com" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Instagram</label>
                  <input type="text" value={form.instagram} onChange={(e) => setForm(p => ({ ...p, instagram: e.target.value }))}
                    placeholder="@yoursalon" className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Services You Specialize In *</label>
                <input type="text" value={form.preferredServices} onChange={(e) => setForm(p => ({ ...p, preferredServices: e.target.value }))}
                  placeholder="e.g. Balayage, Color Correction, Vivid Color, Highlights (comma-separated)"
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm" required />
              </div>

              <div>
                <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Service Radius (miles)</label>
                <select value={form.serviceRadius} onChange={(e) => setForm(p => ({ ...p, serviceRadius: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm">
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                </select>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-espresso text-pearl py-3.5 rounded-full font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pearl/30 border-t-pearl rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Register My Salon <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}
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
            <Link href="/pricing" className="hover:text-espresso transition-colors">Pricing</Link>
            <Link href="/affiliates" className="hover:text-espresso transition-colors">Affiliates</Link>
            <a href="mailto:hello@colorlab.ai" className="hover:text-espresso transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
