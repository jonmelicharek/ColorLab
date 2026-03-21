'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Upload, Palette, Clock, Zap, ChevronRight,
  Star, ArrowRight, Check, Scissors, Droplets, FlaskConical,
  Eye, Layers, Ruler, Thermometer, ScanLine, FileText,
  ShieldCheck, Lightbulb, Beaker, Timer, BookOpen, Camera
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const rotateIn = {
  hidden: { opacity: 0, rotate: -5, scale: 0.9 },
  visible: {
    opacity: 1, rotate: 0, scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Helper: generate a smooth, fluid hair strand path ──── */
function strandPath(startX: number, amplitude: number, wavelength: number, height: number, drift: number = 0): string {
  // Use cubic Bezier curves with smooth S commands for continuous, soft curves
  // S (smooth curveto) automatically mirrors the previous control point = no sharp angles
  const segments = 12;
  const segH = height / segments;

  // Pre-calculate smooth x positions using sine waves
  const xPositions: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(t * Math.PI * wavelength) * amplitude;
    const driftOffset = drift * t;
    xPositions.push(startX + wave + driftOffset);
  }

  // Start path
  let d = `M${xPositions[0].toFixed(1)},0`;

  // First segment uses C (cubic Bezier) to set up the initial control point
  const cp1x = xPositions[0] + (xPositions[1] - xPositions[0]) * 0.1;
  const cp1y = segH * 0.33;
  const cp2x = xPositions[1] - (xPositions[2] - xPositions[0]) * 0.15;
  const cp2y = segH * 0.67;
  d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${xPositions[1].toFixed(1)},${segH.toFixed(1)}`;

  // Remaining segments use S (smooth cubic Bezier) — automatically creates tangent continuity
  for (let i = 2; i <= segments; i++) {
    const y = segH * i;
    // Control point guides the curve smoothly toward the next position
    const cpx = xPositions[i] - (xPositions[i] - xPositions[i - 1]) * 0.4;
    const cpy = y - segH * 0.3;
    d += ` S${cpx.toFixed(1)},${cpy.toFixed(1)} ${xPositions[i].toFixed(1)},${y.toFixed(1)}`;
  }

  return d;
}

/* ─── Flowing Hair SVG Component ──────────────────── */
function FlowingHair() {
  // Generate many strands with different parameters
  const rightStrands = Array.from({ length: 18 }, (_, i) => ({
    startX: 120 + i * 18 + (i % 3) * 7,
    amp: 15 + (i % 5) * 8,
    wave: 2 + (i % 3) * 0.5,
    drift: (i % 2 === 0 ? 1 : -1) * (5 + i * 2),
    width: 1 + (i % 4) * 0.5,
    opacity: 0.03 + (i % 5) * 0.012,
  }));

  const leftStrands = Array.from({ length: 14 }, (_, i) => ({
    startX: 40 + i * 20 + (i % 3) * 5,
    amp: 12 + (i % 4) * 9,
    wave: 1.5 + (i % 3) * 0.7,
    drift: (i % 2 === 0 ? -1 : 1) * (4 + i * 1.5),
    width: 0.8 + (i % 3) * 0.5,
    opacity: 0.02 + (i % 4) * 0.01,
  }));

  const centerStrands = Array.from({ length: 10 }, (_, i) => ({
    startX: 30 + i * 14,
    amp: 10 + (i % 3) * 6,
    wave: 2 + (i % 2),
    drift: (i % 2 === 0 ? 1 : -1) * 8,
    width: 0.7 + (i % 3) * 0.4,
    opacity: 0.015 + (i % 3) * 0.01,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Dense right cluster */}
      <svg
        className="absolute -right-10 top-0 w-[600px] h-[750px] hair-strand"
        viewBox="0 0 500 700"
        fill="none"
      >
        {rightStrands.map((s, i) => (
          <path
            key={`r-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 700, s.drift)}
            stroke="url(#hair-grad-1)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
        <defs>
          <linearGradient id="hair-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8874B" />
            <stop offset="35%" stopColor="#B87333" />
            <stop offset="70%" stopColor="#8A7E72" />
            <stop offset="100%" stopColor="#3D2E1F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Dense left cluster */}
      <svg
        className="absolute -left-10 top-20 w-[500px] h-[650px] hair-strand-2"
        viewBox="0 0 400 600"
        fill="none"
      >
        {leftStrands.map((s, i) => (
          <path
            key={`l-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 600, s.drift)}
            stroke="url(#hair-grad-2)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
        <defs>
          <linearGradient id="hair-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C4736E" />
            <stop offset="40%" stopColor="#C8874B" />
            <stop offset="100%" stopColor="#8A7E72" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wispy center strands */}
      <svg
        className="absolute left-1/4 right-1/4 top-10 w-[300px] h-[500px] mx-auto hair-strand-3"
        viewBox="0 0 200 450"
        fill="none"
      >
        {centerStrands.map((s, i) => (
          <path
            key={`c-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 450, s.drift)}
            stroke="url(#hair-grad-3)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
        <defs>
          <linearGradient id="hair-grad-3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E5A84B" />
            <stop offset="50%" stopColor="#C8874B" />
            <stop offset="100%" stopColor="#B87333" />
          </linearGradient>
        </defs>
      </svg>

      {/* Extra wispy drifting strands scattered across */}
      <svg
        className="absolute right-1/3 top-32 w-[250px] h-[400px] hair-strand-drift"
        viewBox="0 0 200 380"
        fill="none"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={`d-${i}`}
            d={strandPath(20 + i * 22, 18 + i * 3, 2.5, 380, (i % 2 === 0 ? 1 : -1) * 12)}
            stroke="#C8874B" strokeWidth={0.6 + (i % 3) * 0.3} fill="none" opacity={0.02 + (i % 4) * 0.008}
          />
        ))}
      </svg>

      {/* Far left whisps */}
      <svg
        className="absolute left-[5%] top-48 w-[180px] h-[350px] hair-strand-3"
        viewBox="0 0 140 320"
        fill="none"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <path
            key={`fl-${i}`}
            d={strandPath(15 + i * 20, 14 + i * 4, 1.8 + i * 0.3, 320, -6 + i * 2)}
            stroke="#C4736E" strokeWidth={0.5 + (i % 3) * 0.4} fill="none" opacity={0.02 + (i % 3) * 0.01}
          />
        ))}
      </svg>

      {/* Far right whisps */}
      <svg
        className="absolute right-[8%] top-60 w-[200px] h-[300px] hair-strand"
        viewBox="0 0 160 280"
        fill="none"
      >
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={`fr-${i}`}
            d={strandPath(10 + i * 20, 10 + i * 5, 2.2, 280, 4 + i * 2)}
            stroke="#B87333" strokeWidth={0.6 + (i % 2) * 0.3} fill="none" opacity={0.018 + (i % 3) * 0.008}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─── Scroll-Linked Hair Animation ────────────────── */
function ScrollHairSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rotate1 = useTransform(scrollYProgress, [0, 0.5, 1], [0, 4, -3]);
  const rotate2 = useTransform(scrollYProgress, [0, 0.5, 1], [0, -5, 3]);
  const rotate3 = useTransform(scrollYProgress, [0, 0.5, 1], [2, -2, 2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Generate scroll-linked strand sets
  const scrollStrandsRight = Array.from({ length: 14 }, (_, i) => ({
    startX: 30 + i * 16,
    amp: 12 + (i % 4) * 7,
    wave: 2 + (i % 3) * 0.4,
    drift: (i % 2 === 0 ? 1 : -1) * (6 + i),
    width: 0.8 + (i % 3) * 0.5,
    opacity: 0.04 + (i % 5) * 0.015,
  }));

  const scrollStrandsLeft = Array.from({ length: 12 }, (_, i) => ({
    startX: 20 + i * 16,
    amp: 10 + (i % 3) * 8,
    wave: 1.8 + (i % 4) * 0.5,
    drift: (i % 2 === 0 ? -1 : 1) * (5 + i * 1.5),
    width: 0.7 + (i % 3) * 0.4,
    opacity: 0.03 + (i % 4) * 0.012,
  }));

  const scrollStrandsCenter = Array.from({ length: 10 }, (_, i) => ({
    startX: 25 + i * 15,
    amp: 8 + (i % 3) * 5,
    wave: 2.2 + (i % 2) * 0.6,
    drift: (i % 2 === 0 ? 1 : -1) * 5,
    width: 0.6 + (i % 3) * 0.3,
    opacity: 0.025 + (i % 4) * 0.01,
  }));

  const scrollStrandsExtra1 = Array.from({ length: 8 }, (_, i) => ({
    startX: 15 + i * 18,
    amp: 14 + (i % 3) * 6,
    wave: 1.5 + (i % 2) * 0.8,
    drift: (i % 2 === 0 ? 1 : -1) * (3 + i * 2),
    width: 0.5 + (i % 2) * 0.4,
    opacity: 0.02 + (i % 3) * 0.01,
  }));

  const scrollStrandsExtra2 = Array.from({ length: 8 }, (_, i) => ({
    startX: 20 + i * 20,
    amp: 16 + (i % 4) * 5,
    wave: 2.5 + (i % 3) * 0.3,
    drift: (i % 2 === 0 ? -1 : 1) * (7 + i),
    width: 0.6 + (i % 2) * 0.3,
    opacity: 0.02 + (i % 3) * 0.008,
  }));

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Right cluster — fast parallax */}
      <motion.svg
        style={{ y: y1, rotate: rotate1, opacity }}
        className="absolute right-0 top-0 w-[350px] h-[550px]"
        viewBox="0 0 280 500"
        fill="none"
      >
        {scrollStrandsRight.map((s, i) => (
          <path
            key={`sr-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 500, s.drift)}
            stroke="url(#scroll-grad)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
        <defs>
          <linearGradient id="scroll-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8874B" />
            <stop offset="50%" stopColor="#B87333" />
            <stop offset="100%" stopColor="#3D2E1F" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Left cluster — slower parallax, opposite rotation */}
      <motion.svg
        style={{ y: y2, rotate: rotate2, opacity }}
        className="absolute left-0 top-10 w-[300px] h-[500px]"
        viewBox="0 0 240 450"
        fill="none"
      >
        {scrollStrandsLeft.map((s, i) => (
          <path
            key={`sl-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 450, s.drift)}
            stroke="url(#scroll-grad-2)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
        <defs>
          <linearGradient id="scroll-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C4736E" />
            <stop offset="50%" stopColor="#C8874B" />
            <stop offset="100%" stopColor="#8A7E72" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Center whisps — gentle drift */}
      <motion.svg
        style={{ y: y3, rotate: rotate3, opacity }}
        className="absolute left-1/4 top-5 w-[250px] h-[400px]"
        viewBox="0 0 200 370"
        fill="none"
      >
        {scrollStrandsCenter.map((s, i) => (
          <path
            key={`sc-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 370, s.drift)}
            stroke="#C8874B" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
      </motion.svg>

      {/* Extra layer — fastest parallax, right-center */}
      <motion.svg
        style={{ y: y4, opacity }}
        className="absolute right-1/4 top-16 w-[220px] h-[420px]"
        viewBox="0 0 180 390"
        fill="none"
      >
        {scrollStrandsExtra1.map((s, i) => (
          <path
            key={`se1-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 390, s.drift)}
            stroke="url(#scroll-grad)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
      </motion.svg>

      {/* Extra layer — slowest parallax, left-center */}
      <motion.svg
        style={{ y: y5, rotate: rotate2, opacity }}
        className="absolute left-[15%] top-24 w-[200px] h-[380px]"
        viewBox="0 0 170 350"
        fill="none"
      >
        {scrollStrandsExtra2.map((s, i) => (
          <path
            key={`se2-${i}`}
            d={strandPath(s.startX, s.amp, s.wave, 350, s.drift)}
            stroke="url(#scroll-grad-2)" strokeWidth={s.width} fill="none" opacity={s.opacity}
          />
        ))}
      </motion.svg>
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useSpring(useTransform(heroScroll, [0, 1], [0, 150]), { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

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
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center"
            >
              <FlaskConical className="w-4 h-4 text-white" />
            </motion.div>
            <span className="font-display text-xl font-semibold tracking-tight">ColorLab</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone">
            <a href="#how-it-works" className="hover:text-espresso transition-colors">How It Works</a>
            <a href="#parameters" className="hover:text-espresso transition-colors">Formula Report</a>
            <a href="#ai-analysis" className="hover:text-espresso transition-colors">AI Analysis</a>
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
      </motion.nav>

      {/* ─── HERO ────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6">
        {/* Flowing hair background animation */}
        <FlowingHair />

        {/* Decorative background blobs with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-caramel/5 to-copper/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-rose/5 to-violet/5 blur-3xl" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-8"
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.span>
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
            <motion.span
              className="bg-gradient-to-r from-caramel via-copper to-rose bg-clip-text text-transparent inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Formulate.
            </motion.span>
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
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/upload"
                className="group bg-espresso text-pearl px-8 py-4 rounded-full text-base font-medium hover:bg-ink transition-all hover:shadow-lg hover:shadow-espresso/20 flex items-center gap-3"
              >
                <Upload className="w-5 h-5" />
                Try It Free — No Account Needed
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <a
              href="#how-it-works"
              className="text-stone hover:text-espresso transition-colors text-sm flex items-center gap-2"
            >
              See how it works <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Stats with count-up feel */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { num: '< 30s', label: 'Analysis Time' },
              { num: '100+', label: 'Formula Database' },
              { num: 'Free', label: 'During Beta' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                custom={i}
                whileHover={{ scale: 1.08, y: -4 }}
                className="text-center cursor-default"
              >
                <div className="font-display text-2xl md:text-3xl font-semibold text-espresso">{stat.num}</div>
                <div className="text-xs text-stone mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-cream/50 relative">
        <ScrollHairSection />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl md:text-5xl font-medium mb-4"
            >
              Three Steps to the Perfect Formula
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-stone text-lg max-w-xl mx-auto"
            >
              No more guessing. No more wasted product. Just precision color, every time.
            </motion.p>
          </motion.div>

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
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={i === 0 ? slideFromLeft : i === 2 ? slideFromRight : scaleIn}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(61, 46, 31, 0.1)" }}
                className="formula-card rounded-2xl p-8 relative overflow-hidden group cursor-default"
              >
                <div className="absolute top-4 right-4 font-display text-6xl font-bold text-sand/60 group-hover:text-caramel/20 transition-colors">
                  {item.step}
                </div>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-12 h-12 rounded-xl bg-espresso/5 flex items-center justify-center mb-5"
                >
                  <item.icon className="w-6 h-6 text-espresso" />
                </motion.div>
                <h3 className="font-display text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-stone leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">Built by Colorists, for Colorists</h2>
            <p className="text-stone text-lg max-w-xl mx-auto">Every feature designed around the real workflow of a professional stylist.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                variants={fadeUp}
                custom={i}
                whileHover={{
                  y: -6,
                  borderColor: "rgba(200, 135, 75, 0.4)",
                  boxShadow: "0 12px 30px rgba(61, 46, 31, 0.08)",
                }}
                className="p-6 rounded-xl border border-sand/60 transition-all group cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-5 h-5 text-caramel mb-3" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-stone text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT YOU GET — FORMULA PARAMETERS ────────── */}
      <section id="parameters" className="py-24 px-6 bg-cream/50 relative overflow-hidden">
        <ScrollHairSection />
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-espresso/5 text-espresso px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
              <FileText className="w-3.5 h-3.5" />
              Complete Formula Report
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">
              Everything You Need, in One Report
            </h2>
            <p className="text-stone text-lg max-w-2xl mx-auto">
              Every analysis returns a detailed, actionable formula card you can take straight to the chair — no guesswork, no second-guessing.
            </p>
          </motion.div>

          {/* Two-column layout: left = formula card mockup, right = parameter list */}
          <div className="grid lg:grid-cols-2 gap-12 mt-16 items-center">
            {/* Left — Formula card preview */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideFromLeft}
              className="relative"
            >
              <div className="formula-card rounded-2xl p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl font-semibold">Sample Formula Card</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-3 py-1 rounded-full">AI Generated</span>
                </div>
                <div className="h-px bg-sand" />
                {[
                  { label: 'Technique', value: 'Balayage with Shadow Root' },
                  { label: 'Lightener', value: 'Wella Blondor + 30vol (1:2)' },
                  { label: 'Root Formula', value: '6N + 6WB (1:1) — 10vol' },
                  { label: 'Mid Formula', value: '8NB + 8G (2:1) — 10vol' },
                  { label: 'End Formula', value: 'Leave natural / Gloss only' },
                  { label: 'Toner', value: 'Redken Shades EQ 09V + 09T' },
                  { label: 'Processing', value: 'Lightener: 35min → Root: 25min → Toner: 20min' },
                  { label: 'Bond Builder', value: 'Olaplex No.1 in lightener, No.2 standalone' },
                ].map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="flex justify-between items-start gap-4"
                  >
                    <span className="text-xs uppercase tracking-wider text-stone whitespace-nowrap min-w-[100px]">{row.label}</span>
                    <span className="text-sm text-espresso font-medium text-right">{row.value}</span>
                  </motion.div>
                ))}
                <div className="h-px bg-sand" />
                <div className="flex items-center gap-3 text-xs text-stone">
                  <ShieldCheck className="w-4 h-4 text-caramel" />
                  <span>Includes strand test warning, difficulty rating, estimated chair time &amp; pricing tier</span>
                </div>
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-caramel/5 to-copper/5 rounded-3xl blur-2xl -z-10" />
            </motion.div>

            {/* Right — Parameter breakdown */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="space-y-4"
            >
              {[
                { icon: FlaskConical, title: 'Zone-by-Zone Formulas', desc: 'Separate formulas for root, mid-length, and ends — with exact shade numbers, ratios, and developer volumes for each zone.' },
                { icon: Layers, title: 'Technique & Placement', desc: 'Whether it\'s balayage, foilyage, foil highlights, or a color melt — you get the exact technique plus where to place it (face frame, full head, scattered, etc.).' },
                { icon: Timer, title: 'Processing Timelines', desc: 'Step-by-step timing for each phase: lightener processing, root color, toner application. No more guessing when to check.' },
                { icon: Beaker, title: 'Product & Brand Recommendations', desc: 'Specific color lines, lightener products, developers, toners, and glosses — with bond builder recommendations included.' },
                { icon: ShieldCheck, title: 'Warnings & Strand Test Alerts', desc: 'Automatic warnings for color corrections, high lift situations, grey coverage needs, or previously over-processed hair.' },
                { icon: Lightbulb, title: 'Pro Tips & Estimated Pricing', desc: 'Expert tips for better results, difficulty rating (beginner to advanced), estimated chair time, and a pricing tier ($–$$$$).' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ x: 6 }}
                  className="flex gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-caramel/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-5 h-5 text-caramel" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold mb-1">{item.title}</h4>
                    <p className="text-stone text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── AI ANALYSIS DEEP DIVE ───────────────────── */}
      <section id="ai-analysis" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-rose/10 text-rose px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
              <Eye className="w-3.5 h-3.5" />
              Under the Hood
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-medium mb-4">
              What the AI Sees in Your Photos
            </h2>
            <p className="text-stone text-lg max-w-2xl mx-auto">
              Our vision model doesn&apos;t just &ldquo;look&rdquo; at hair — it performs a professional-grade analysis across 15+ parameters, just like a master colorist would during a consultation.
            </p>
          </motion.div>

          {/* Client photo analysis vs Inspo photo analysis — side by side */}
          <div className="grid lg:grid-cols-2 gap-8 mt-16">
            {/* Client Hair Analysis */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideFromLeft}
            >
              <div className="rounded-2xl border border-sand bg-gradient-to-b from-cream to-pearl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-espresso flex items-center justify-center">
                    <Camera className="w-5 h-5 text-pearl" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">Client Photo Analysis</h3>
                    <p className="text-xs text-stone uppercase tracking-wider">Current state of the hair</p>
                  </div>
                </div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="space-y-3"
                >
                  {[
                    { icon: Ruler, param: 'Natural Level', detail: 'Detected on a 1–10 scale (1 = black, 10 = lightest blonde). The AI identifies root color vs. lengths to distinguish virgin from previously colored hair.' },
                    { icon: Palette, param: 'Tone & Undertone', detail: 'Warm, cool, or neutral — plus underlying pigment (gold, orange, red, ash, violet). Critical for choosing the right toner and avoiding brassiness.' },
                    { icon: ScanLine, param: 'Condition & Porosity', detail: 'Detects damage level (virgin → over-processed) and porosity (low/medium/high). High porosity processes faster and needs lower developer volume.' },
                    { icon: Layers, param: 'Texture & Pattern', detail: 'Fine, medium, or coarse texture — plus curl pattern (straight → coily). Coarse hair resists lifting; fine hair processes faster.' },
                    { icon: Thermometer, param: 'Grey Percentage', detail: 'Estimated grey coverage from 0–100%. Even 10–20% grey triggers our 10vol developer rule for better deposit and coverage.' },
                    { icon: Eye, param: 'Existing Color & Highlights', detail: 'Identifies prior color work, balayage, highlights, or color buildup — all factors that change how new color will take.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.param}
                      variants={fadeUp}
                      custom={i}
                      className="flex gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-espresso mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-display text-sm font-semibold text-espresso">{item.param}</span>
                        <p className="text-stone text-xs leading-relaxed mt-0.5">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Inspo Photo Analysis */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideFromRight}
            >
              <div className="rounded-2xl border border-sand bg-gradient-to-b from-cream to-pearl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-caramel flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pearl" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">Inspiration Photo Analysis</h3>
                    <p className="text-xs text-stone uppercase tracking-wider">Target look decoded</p>
                  </div>
                </div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="space-y-3"
                >
                  {[
                    { icon: Star, param: 'Target Level & Tone', detail: 'The exact level and tone the client wants to achieve. The AI calculates the lift needed from current → target and adjusts developer strength accordingly.' },
                    { icon: Scissors, param: 'Technique Identification', detail: 'Balayage, foilyage, babylights, money piece, color melt, shadow root — the AI identifies the exact technique used in the inspo photo.' },
                    { icon: Layers, param: 'Placement Mapping', detail: 'Where the color lives: face frame, full head, half head, scattered, concentrated at ends. This determines foil count and application strategy.' },
                    { icon: Zap, param: 'Dimensionality', detail: 'High contrast vs. seamless blend, chunky highlights vs. ribbons, or natural dimension. This drives how the formula is sectioned and applied.' },
                    { icon: Palette, param: 'Color Description', detail: 'A detailed breakdown of every color present — "honey blonde with caramel lowlights and platinum face frame" rather than just "blonde."' },
                    { icon: Ruler, param: 'Estimated Lift Needed', detail: 'The number of levels the hair needs to lift, factoring in the client\'s starting point. Determines lightener strength, developer volume, and processing time.' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.param}
                      variants={fadeUp}
                      custom={i}
                      className="flex gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-caramel mt-1 flex-shrink-0" />
                      <div>
                        <span className="font-display text-sm font-semibold text-espresso">{item.param}</span>
                        <p className="text-stone text-xs leading-relaxed mt-0.5">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom callout — database matching */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-espresso/5 rounded-2xl px-8 py-5 max-w-3xl">
              <BookOpen className="w-8 h-8 text-caramel flex-shrink-0" />
              <p className="text-stone text-sm leading-relaxed text-left">
                <span className="font-semibold text-espresso">Database-Matched Formulas:</span> After analyzing both photos, the AI cross-references its findings against our 100+ proven formula database — matching technique, starting level, target level, and tone to find real-world formulas that have worked before. Your recommendation is grounded in data, not just theory.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FLOWING DIVIDER ─────────────────────────── */}
      <div className="relative h-24 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 96">
          <motion.path
            d="M0,32 C240,80 480,0 720,48 C960,96 1200,16 1440,64 L1440,96 L0,96 Z"
            fill="#3D2E1F"
            initial={{ d: "M0,48 C240,48 480,48 720,48 C960,48 1200,48 1440,48 L1440,96 L0,96 Z" }}
            animate={{
              d: [
                "M0,32 C240,80 480,0 720,48 C960,96 1200,16 1440,64 L1440,96 L0,96 Z",
                "M0,64 C240,16 480,96 720,48 C960,0 1200,80 1440,32 L1440,96 L0,96 Z",
                "M0,32 C240,80 480,0 720,48 C960,96 1200,16 1440,64 L1440,96 L0,96 Z",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,48 C320,90 640,10 960,60 C1280,110 1440,30 1440,60 L1440,96 L0,96 Z"
            fill="#3D2E1F"
            opacity="0.5"
            animate={{
              d: [
                "M0,48 C320,90 640,10 960,60 C1280,110 1440,30 1440,60 L1440,96 L0,96 Z",
                "M0,70 C320,20 640,80 960,40 C1280,0 1440,70 1440,50 L1440,96 L0,96 Z",
                "M0,48 C320,90 640,10 960,60 C1280,110 1440,30 1440,60 L1440,96 L0,96 Z",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* ─── SOCIAL PROOF ────────────────────────────── */}
      <section className="py-24 px-6 bg-espresso text-pearl relative overflow-hidden">
        {/* Dense flowing strands in dark section */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg
            className="absolute -right-10 top-0 w-[500px] h-[500px] hair-strand"
            viewBox="0 0 400 450"
            fill="none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={`dp-r-${i}`}
                d={strandPath(40 + i * 28, 14 + (i % 4) * 6, 2 + (i % 3) * 0.4, 450, (i % 2 === 0 ? 1 : -1) * (5 + i * 2))}
                stroke="#C8874B" strokeWidth={0.6 + (i % 3) * 0.3} fill="none" opacity={0.025 + (i % 4) * 0.008}
              />
            ))}
          </svg>
          <svg
            className="absolute -left-10 top-10 w-[400px] h-[450px] hair-strand-2"
            viewBox="0 0 320 420"
            fill="none"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <path
                key={`dp-l-${i}`}
                d={strandPath(30 + i * 26, 12 + (i % 3) * 7, 1.8 + (i % 4) * 0.5, 420, (i % 2 === 0 ? -1 : 1) * (4 + i * 1.5))}
                stroke="#E5A84B" strokeWidth={0.5 + (i % 2) * 0.3} fill="none" opacity={0.02 + (i % 3) * 0.008}
              />
            ))}
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={rotateIn}
            className="font-display text-4xl md:text-5xl font-medium mb-12"
          >
            &ldquo;This is the tool I&apos;ve been waiting for.&rdquo;
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 text-left"
          >
            {[
              { quote: "This is the app I've been looking for, and the client portal is extremely helpful.", name: 'Marissa M.', role: 'Stylist' },
              { quote: "The database matching is insanely accurate. It matched my balayage technique perfectly.", name: 'Alyssa N.', role: 'Stylist' },
              { quote: "My assistants can now prep formula cards before the client even sits down.", name: 'Simone H.', role: 'Stylist' },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-3">
                  {Array(5).fill(0).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 + j * 0.05 }}
                    >
                      <Star className="w-3.5 h-3.5 fill-honey text-honey" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-pearl/80 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-xs text-pearl/50">{t.name} · {t.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WAITLIST / LEAD GEN CTA ─────────────────── */}
      <section id="waitlist" className="py-24 px-6 relative overflow-hidden">
        {/* Background hair accent */}
        <svg
          className="absolute -left-10 bottom-0 w-[400px] h-[450px] hair-strand"
          viewBox="0 0 320 420"
          fill="none"
          aria-hidden="true"
        >
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={`wl-${i}`}
              d={strandPath(25 + i * 28, 12 + (i % 3) * 6, 2 + (i % 2) * 0.5, 420, (i % 2 === 0 ? 1 : -1) * (4 + i * 2))}
              stroke={i % 2 === 0 ? '#C8874B' : '#B87333'} strokeWidth={0.6 + (i % 3) * 0.3} fill="none" opacity={0.02 + (i % 4) * 0.008}
            />
          ))}
        </svg>
        <svg
          className="absolute -right-10 top-10 w-[300px] h-[350px] hair-strand-2"
          viewBox="0 0 240 320"
          fill="none"
          aria-hidden="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={`wlr-${i}`}
              d={strandPath(20 + i * 26, 10 + (i % 3) * 5, 1.8 + (i % 3) * 0.4, 320, (i % 2 === 0 ? -1 : 1) * (3 + i))}
              stroke="#C4736E" strokeWidth={0.5 + (i % 2) * 0.3} fill="none" opacity={0.015 + (i % 3) * 0.008}
            />
          ))}
        </svg>

        <div className="max-w-2xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 bg-caramel/10 text-caramel px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Free During Beta
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-medium mb-4"
          >
            Get Early Access
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone text-lg mb-8 max-w-lg mx-auto"
          >
            Join the waitlist to get notified when we launch new features, expand the formula database, and open premium tiers.
          </motion.p>

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
            <motion.form
              onSubmit={handleWaitlist}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 rounded-full border border-sand bg-white text-espresso placeholder:text-clay focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 transition-all"
                required
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-espresso text-pearl px-8 py-3.5 rounded-full font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-pearl/30 border-t-pearl rounded-full animate-spin" />
                ) : (
                  <>Join Waitlist <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xs text-clay mt-4"
          >
            No spam, ever. Unsubscribe anytime.
          </motion.p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-sand py-12 px-6"
      >
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
      </motion.footer>
    </div>
  );
}
