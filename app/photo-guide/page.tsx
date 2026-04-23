'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Camera, CheckCircle2, XCircle, ArrowRight, FlaskConical,
  Sun, Smartphone, Lightbulb, Scissors, Eye, Palette,
  AlertTriangle, Sparkles, ImageIcon
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Good vs bad photo examples with descriptions
const photoExamples = [
  {
    category: 'Lighting',
    icon: Sun,
    good: {
      title: 'Natural daylight',
      desc: 'Stand near a window or step outside. Natural light reveals true color, undertone, and highlights without distortion.',
      tips: ['Face the light source', 'Avoid direct harsh sunlight', 'Overcast days are ideal'],
    },
    bad: {
      title: 'Artificial or yellow lighting',
      desc: 'Bathroom fluorescents and warm tungsten bulbs shift colors dramatically. Gold tones appear warmer, ash tones look muddy.',
      mistakes: ['Ring lights add orange cast', 'Overhead salon lights create shadows', 'Flash washes out detail'],
    },
  },
  {
    category: 'Background',
    icon: ImageIcon,
    good: {
      title: 'Clean, neutral background',
      desc: 'A plain white or light gray wall keeps focus on the hair. Solid colors prevent the AI from picking up reflections.',
      tips: ['White walls are ideal', 'Avoid patterned backgrounds', 'Step away from the wall to reduce shadow'],
    },
    bad: {
      title: 'Busy or colorful backgrounds',
      desc: 'Colored walls, mirrors, other people, and cluttered backgrounds confuse the AI and can shift perceived hair color.',
      mistakes: ['Red walls cast warm reflections', 'Mirrors create duplicates', 'Outdoor foliage adds green cast'],
    },
  },
  {
    category: 'Hair Position',
    icon: Scissors,
    good: {
      title: 'Hair down, spread naturally',
      desc: 'Let hair fall naturally and spread sections so the AI can see the root, mid-shaft, and ends clearly. Show both sides if possible.',
      tips: ['Show the part line for root analysis', 'Spread ends to show condition', 'Include some hair against the neck for depth'],
    },
    bad: {
      title: 'Hair up, covered, or wet',
      desc: 'Ponytails, buns, hats, and wet hair hide the true level and condition. Wet hair looks 1-2 levels darker than dry.',
      mistakes: ['Braids hide the mid-shaft', 'Products add shine that misleads', 'Wet hair reads darker'],
    },
  },
  {
    category: 'Distance & Focus',
    icon: Smartphone,
    good: {
      title: 'Clear, focused, full coverage',
      desc: 'Show the entire head of hair from shoulder distance. The image should be sharp enough to see individual strands and any gray.',
      tips: ['Tap to focus on the hair', 'Hold the phone still', 'Include crown, sides, and length'],
    },
    bad: {
      title: 'Blurry, cropped, or too far away',
      desc: 'Blurry photos can\'t be analyzed accurately. Too-close crops miss the overall picture. Too-far shots lose strand detail.',
      mistakes: ['Moving while shooting = blur', 'Selfie arm too close = distortion', 'Screenshot of a screenshot = low quality'],
    },
  },
];

// What the AI analyzes
const analysisPoints = [
  {
    icon: Palette,
    title: 'Level & Tone',
    desc: 'Determines the hair level (1-10 scale) and identifies warm, cool, or neutral undertones. This drives the formula foundation.',
    detail: 'The AI compares pixel color values across root, mid, and end zones against the professional level system.',
  },
  {
    icon: Eye,
    title: 'Undertone & Porosity',
    desc: 'Detects underlying pigment (gold, orange, red, ash) and estimates porosity from visual texture cues.',
    detail: 'High-porosity hair processes faster and may grab color unevenly. The formula adjusts developer and timing accordingly.',
  },
  {
    icon: Lightbulb,
    title: 'Gray Coverage',
    desc: 'Identifies gray or white hair percentage, which triggers specific developer rules (10vol for deposit on resistant gray).',
    detail: 'Even 10-20% gray changes the formula significantly. The AI counts visible gray strands and adjusts coverage strategy.',
  },
  {
    icon: Sparkles,
    title: 'Existing Color & History',
    desc: 'Detects if hair is virgin, previously colored, highlighted, or over-processed. Factors in pigment buildup.',
    detail: 'Previously colored ends have accumulated artificial pigment. The AI avoids over-depositing and recommends bond repair.',
  },
  {
    icon: Scissors,
    title: 'Technique Matching',
    desc: 'Analyzes the inspiration photo to determine the target technique — balayage, foilyage, highlights, all-over, etc.',
    detail: 'The AI matches placement patterns, contrast levels, and dimensionality against the proven formula database.',
  },
  {
    icon: Camera,
    title: 'Lift Calculation',
    desc: 'Calculates how many levels of lift are needed and selects the right lightener, developer, and processing time.',
    detail: 'The formula ensures ends are never darker than roots and accounts for the hair\'s condition when choosing developer strength.',
  },
];

export default function PhotoGuidePage() {
  return (
    <div className="min-h-screen bg-pearl">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">ColorLab</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-2 py-0.5 rounded-full">AI</span>
          </Link>
          <Link
            href="/upload"
            className="bg-espresso text-pearl px-5 py-2 rounded-full text-sm font-medium hover:bg-ink transition-colors flex items-center gap-2"
          >
            Try It Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6"
          >
            <Camera className="w-3.5 h-3.5" />
            Photo Guide
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-medium leading-tight tracking-tight mb-4"
          >
            Better Photos = <span className="bg-gradient-to-r from-caramel to-copper bg-clip-text text-transparent">Better Formulas</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-stone text-lg max-w-2xl mx-auto leading-relaxed"
          >
            The quality of your formula depends on the quality of your photos. Follow these guidelines to get the most accurate AI analysis every time.
          </motion.p>
        </div>
      </section>

      {/* Good vs Bad Photo Examples */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-4xl font-medium text-center mb-4"
          >
            Good vs. Bad Photos
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-stone text-center mb-12 max-w-xl mx-auto"
          >
            The difference between a perfect formula and a mediocre one often comes down to the photo quality.
          </motion.p>

          <div className="space-y-8">
            {photoExamples.map((example, i) => (
              <motion.div
                key={example.category}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
                className="formula-card rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-espresso/5 flex items-center justify-center">
                    <example.icon className="w-5 h-5 text-espresso" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold">{example.category}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Good */}
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-display text-lg font-semibold text-emerald-800">{example.good.title}</h4>
                    </div>
                    <p className="text-stone text-sm leading-relaxed mb-4">{example.good.desc}</p>

                    {/* Visual placeholder for example photo */}
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-4 border border-emerald-200">
                      <div className="text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <span className="text-xs text-emerald-600 font-medium">Ideal Example</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {example.good.tips.map((tip, j) => (
                        <li key={j} className="text-xs text-emerald-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bad */}
                  <div className="rounded-xl border-2 border-red-200 bg-red-50/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <h4 className="font-display text-lg font-semibold text-red-800">{example.bad.title}</h4>
                    </div>
                    <p className="text-stone text-sm leading-relaxed mb-4">{example.bad.desc}</p>

                    {/* Visual placeholder for bad example */}
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-4 border border-red-200">
                      <div className="text-center">
                        <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <span className="text-xs text-red-600 font-medium">Avoid This</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {example.bad.mistakes.map((mistake, j) => (
                        <li key={j} className="text-xs text-red-700 flex items-start gap-2">
                          <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Checklist */}
      <section className="py-16 px-6 bg-cream/50">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-4xl font-medium text-center mb-4"
          >
            Photo Checklist
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-stone text-center mb-10"
          >
            Run through this before every upload for the best results.
          </motion.p>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="formula-card rounded-2xl p-8"
          >
            {[
              { text: 'Natural daylight (near a window or outside)', icon: Sun },
              { text: 'Clean, neutral background (white wall preferred)', icon: ImageIcon },
              { text: 'Hair is dry and product-free', icon: Scissors },
              { text: 'Hair is down and spread to show root to ends', icon: Eye },
              { text: 'Photo is sharp and in focus', icon: Camera },
              { text: 'Full head visible (not cropped or obstructed)', icon: Smartphone },
              { text: 'Inspiration photo is clear and well-lit too', icon: Sparkles },
              { text: 'No filters or color edits on either photo', icon: AlertTriangle },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="flex items-center gap-4 py-3 border-b border-sand/50 last:border-0"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm text-espresso">{item.text}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto flex-shrink-0" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What the AI Analyzes */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-4xl font-medium text-center mb-4"
          >
            What the AI Is Analyzing
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-stone text-center mb-12 max-w-xl mx-auto"
          >
            Here&apos;s exactly what happens when you upload your two photos.
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="formula-card rounded-2xl p-6 group hover:border-caramel/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-caramel/10 to-copper/10 flex items-center justify-center mb-4 group-hover:from-caramel/20 group-hover:to-copper/20 transition-all">
                  <point.icon className="w-5 h-5 text-caramel" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{point.title}</h3>
                <p className="text-stone text-sm leading-relaxed mb-3">{point.desc}</p>
                <p className="text-xs text-clay leading-relaxed border-t border-sand/50 pt-3">{point.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Photo vs Inspiration Photo */}
      <section className="py-16 px-6 bg-espresso text-pearl">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-4xl font-medium text-center mb-12"
          >
            Two Photos, One Perfect Formula
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-caramel/20 text-caramel rounded-full text-xs font-medium">Photo 1</span>
                <h3 className="font-display text-xl font-semibold">Client&apos;s Current Hair</h3>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Camera className="w-10 h-10 text-pearl/30 mx-auto mb-2" />
                  <span className="text-xs text-pearl/40">Current hair state</span>
                </div>
              </div>
              <p className="text-pearl/70 text-sm leading-relaxed mb-3">
                This is what the AI reads to understand the starting point — current level, tone, condition, porosity, and any existing color.
              </p>
              <ul className="space-y-1.5">
                {[
                  'Show the root area clearly (part line visible)',
                  'Include the full length to the ends',
                  'Capture both sides if there is variation',
                  'Dry hair only — no product, no wet hair',
                ].map((tip, j) => (
                  <li key={j} className="text-xs text-pearl/50 flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-caramel flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-honey/20 text-honey rounded-full text-xs font-medium">Photo 2</span>
                <h3 className="font-display text-xl font-semibold">Inspiration / Goal</h3>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Sparkles className="w-10 h-10 text-pearl/30 mx-auto mb-2" />
                  <span className="text-xs text-pearl/40">Dream result</span>
                </div>
              </div>
              <p className="text-pearl/70 text-sm leading-relaxed mb-3">
                This is the target. The AI detects the desired level, tone, technique, and placement to build a roadmap from current to goal.
              </p>
              <ul className="space-y-1.5">
                {[
                  'Instagram screenshots work great',
                  'Make sure the color is visible and accurate',
                  'Avoid heavily filtered or edited photos',
                  'Choose photos with similar hair type if possible',
                ].map((tip, j) => (
                  <li key={j} className="text-xs text-pearl/50 flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-honey flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="font-display text-3xl md:text-4xl font-medium mb-4"
          >
            Ready to Try It?
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-stone mb-8"
          >
            Upload two photos and get your custom formula in under 30 seconds.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          >
            <Link
              href="/upload"
              className="inline-flex items-center gap-3 bg-espresso text-pearl px-8 py-4 rounded-full text-base font-medium hover:bg-ink transition-all hover:shadow-lg hover:shadow-espresso/20"
            >
              <FlaskConical className="w-5 h-5" />
              Start Your Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="font-display text-lg font-semibold">ColorLab AI</span>
          </div>
          <p className="text-xs text-clay">&copy; {new Date().getFullYear()} ColorLab AI</p>
        </div>
      </footer>
    </div>
  );
}
