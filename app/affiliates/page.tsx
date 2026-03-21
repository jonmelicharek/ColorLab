'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FlaskConical, ArrowRight, Check, Sparkles, TrendingUp,
  Eye, MousePointer, DollarSign, BarChart3, Send
} from 'lucide-react';

const benefits = [
  {
    icon: Eye,
    title: 'Product Placement in AI Results',
    desc: 'Your products get recommended directly in formula results seen by thousands of stylists monthly.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Insights',
    desc: 'See exactly how many times your products are recommended, clicked, and purchased.',
  },
  {
    icon: DollarSign,
    title: 'Performance-Based Model',
    desc: 'Only pay for results. Commission-based pricing means you only spend when stylists engage.',
  },
  {
    icon: BarChart3,
    title: 'Monthly Analytics Reports',
    desc: 'Detailed reports on impressions, clicks, conversions, and revenue attributed to ColorLab.',
  },
];

const howItWorks = [
  { step: '01', title: 'Apply', desc: 'Fill out the form below with your brand and product details.' },
  { step: '02', title: 'Get Approved', desc: 'We review your products and set up your affiliate profile within 48 hours.' },
  { step: '03', title: 'Products Get Featured', desc: 'Your products appear in AI formula recommendations when they match the client needs.' },
  { step: '04', title: 'Track & Earn', desc: 'Monitor impressions, clicks, and conversions through your affiliate dashboard.' },
];

export default function AffiliatePage() {
  const [form, setForm] = useState({
    brandName: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    website: '',
    productLines: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          productLines: form.productLines.split(',').map(s => s.trim()).filter(Boolean),
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
            <Link href="/upload" className="bg-espresso text-pearl px-5 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-copper/10 text-copper px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Brand Partnership Program
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-medium mb-4">
            Get Your Products in Front of<br />
            <span className="bg-gradient-to-r from-caramel via-copper to-rose bg-clip-text text-transparent">
              Thousands of Stylists
            </span>
          </h1>
          <p className="text-stone text-lg max-w-2xl mx-auto">
            When ColorLab AI recommends a formula, your products can be featured directly in the results.
            Stylists trust our AI — and they'll trust your brand.
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
              <b.icon className="w-6 h-6 text-copper mb-3" />
              <h3 className="font-display text-xl font-semibold mb-2">{b.title}</h3>
              <p className="text-stone text-sm leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 pb-20 bg-cream/50 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-medium text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-espresso text-pearl font-display text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-stone text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl font-medium mb-3">Apply to Partner</h2>
            <p className="text-stone">Fill out the form below and we'll review your application within 48 hours.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-700 px-8 py-8 rounded-2xl text-center"
            >
              <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
              <h3 className="font-display text-2xl font-semibold mb-2">Application Received!</h3>
              <p className="text-emerald-600">We'll review your application and get back to you within 48 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="formula-card rounded-2xl p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    value={form.brandName}
                    onChange={(e) => setForm(p => ({ ...p, brandName: e.target.value }))}
                    placeholder="e.g. Redken, Wella"
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Contact Name *</label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                    placeholder="you@brand.com"
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourbrand.com"
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Product Lines to Feature *</label>
                <input
                  type="text"
                  value={form.productLines}
                  onChange={(e) => setForm(p => ({ ...p, productLines: e.target.value }))}
                  placeholder="e.g. Shades EQ, Flash Lift, Color Fusion (comma-separated)"
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-stone uppercase tracking-wider block mb-1.5">Message (Optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your brand and what you're looking for in a partnership..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-espresso text-pearl py-3.5 rounded-full font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pearl/30 border-t-pearl rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Application <ArrowRight className="w-4 h-4" />
                  </>
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
            <Link href="/salon-portal" className="hover:text-espresso transition-colors">For Salons</Link>
            <a href="mailto:hello@colorlab.ai" className="hover:text-espresso transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
