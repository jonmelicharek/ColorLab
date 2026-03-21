'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Upload, Palette, Clock, Zap, ChevronRight,
  Star, ArrowRight, Check, Scissors, Droplets, FlaskConical
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'waitlist' }),
      });
      if (res.ok) setSubmitted(true);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* ─── NAV ─────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">ColorLab</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone">
            <a href="#how-it-works" className="hover:text-espresso transition-colors">How It Works</a>
            <a href="#features" className="hover:text-espresso transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-espresso transition-colors">Pricing</Link>
            <Link href="/affiliates" className="hover:text-espresso transition-colors">Affiliates</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone hover:text-espresso transition-colors">Sign In</Link>
            <Link
              href="/upload"
              className="bg-espresso text-pearl px-5 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
            >
              Try Free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-caramel/5 to-copper/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose/5 to-violet/5 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Formula Engine for Stylists
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tight mb-6"
          >
            Upload. Analyze.
            <br />
            <span className="bg-gradient-to-r from-caramel via-copper to-rose bg-clip-text text-transparent">
              Formulate.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-stone text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Snap a photo of your client&apos;s hair and their dream look.
            ColorLab AI matches it against a proven formula database and delivers
            the exact formula, technique, and product list — in seconds.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/upload"
              className="group bg-espresso text-pearl px-8 py-4 rounded-full text-base font-medium hover:bg-ink transition-all hover:shadow-lg hover:shadow-espresso/20 flex items-center gap-3"
            >
              <Upload className="w-5 h-5" />
              Try It Free — No Account Needed
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="text-stone hover:text-espresso transition-colors text-sm flex items-center gap-2"
            >
              See how it works <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { num: '< 30s', label: 'Analysis Time' },
              { num: '100+', label: 'Formula Database' },
              { num: 'Free', label: 'During Beta' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-semibold text-espresso">{stat.num}</div>
                <div className="text-xs text-stone mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-cream/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">Three Steps to the Perfect Formula</h2>
            <p className="text-stone text-lg max-w-xl mx-auto">No more guessing. No more wasted product. Just precision color, every time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                step: '01',
                title: 'Upload Two Photos',
                desc: "Snap your client's current hair and the inspiration photo they showed you on Instagram. That's all we need.",
              },
              {
                icon: Sparkles,
                step: '02',
                title: 'AI Analyzes Both',
                desc: 'Our AI detects hair level, tone, condition, and porosity — then compares against hundreds of proven before/after transformations.',
              },
              {
                icon: FlaskConical,
                step: '03',
                title: 'Get Your Formula',
                desc: 'Receive a complete formula with exact shades, developer, lightener, toner, ratios, timing, and step-by-step technique guide.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="formula-card rounded-2xl p-8 relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 font-display text-6xl font-bold text-sand/60 group-hover:text-caramel/20 transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-espresso/5 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-espresso" />
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-stone leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">Built by Colorists, for Colorists</h2>
            <p className="text-stone text-lg max-w-xl mx-auto">Every feature designed around the real workflow of a professional stylist.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Palette, title: 'Level & Tone Detection', desc: 'AI reads natural level, undertone, and existing color with precision.' },
              { icon: Scissors, title: 'Technique Matching', desc: 'Balayage, foilyage, vivid — matched from proven before/after database.' },
              { icon: Droplets, title: 'Full Product Formulas', desc: 'Exact shades, developer volume, ratios, and brand-specific recommendations.' },
              { icon: Clock, title: 'Processing Timelines', desc: 'Step-by-step timing for lightener, color, toner — nothing left to guess.' },
              { icon: Zap, title: 'Instant Results', desc: 'Full analysis and formula delivered in under 30 seconds.' },
              { icon: Star, title: 'Growing Database', desc: 'Formula database continuously expanded with real-world proven results.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl border border-sand/60 hover:border-caramel/30 transition-all group"
              >
                <feature.icon className="w-5 h-5 text-caramel mb-3" />
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ────────────────────────────── */}
      <section className="py-24 px-6 bg-espresso text-pearl">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-12">
            &ldquo;This is the tool I&apos;ve been waiting for.&rdquo;
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { quote: "I used to spend 20 minutes figuring out a formula for new clients. Now it's instant.", name: 'Coming soon', role: 'Beta Tester' },
              { quote: "The database matching is insanely accurate. It matched my balayage technique perfectly.", name: 'Coming soon', role: 'Beta Tester' },
              { quote: "My assistants can now prep formula cards before the client even sits down.", name: 'Coming soon', role: 'Beta Tester' },
            ].map((t, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex gap-1 mb-3">
                  {Array(5).fill(0).map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-honey text-honey" />)}
                </div>
                <p className="text-pearl/80 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-pearl/50">{t.name} · {t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WAITLIST / LEAD GEN CTA ─────────────────── */}
      <section id="waitlist" className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Free During Beta
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">
            Get Early Access
          </h2>
          <p className="text-stone text-lg mb-8 max-w-lg mx-auto">
            Join the waitlist to get notified when we launch new features, expand the formula database, and open premium tiers.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-xl flex items-center justify-center gap-3 max-w-md mx-auto"
            >
              <Check className="w-5 h-5" />
              <span className="font-medium">You&apos;re on the list! Check your inbox soon.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 rounded-full border border-sand bg-white text-espresso placeholder:text-clay focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition-all"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-espresso text-pearl px-8 py-3.5 rounded-full font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pearl/30 border-t-pearl rounded-full animate-spin" />
                ) : (
                  <>Join Waitlist <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          <p className="text-xs text-clay mt-4">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-sand py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">ColorLab AI</span>
          </div>
          <p className="text-xs text-clay">© {new Date().getFullYear()} ColorLab AI. Professional hair color formulation tool.</p>
          <div className="flex gap-6 text-xs text-stone">
            <a href="#" className="hover:text-espresso transition-colors">Privacy</a>
            <a href="#" className="hover:text-espresso transition-colors">Terms</a>
            <a href="mailto:hello@colorlab.ai" className="hover:text-espresso transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
