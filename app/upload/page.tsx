'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Upload, Camera, Sparkles, ArrowRight, ArrowLeft, FlaskConical,
  Clock, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
  Palette, Scissors, Droplets, RotateCcw, Download, Share2,
  CheckCircle2, Loader2, Lock, BookOpen, Crown, User, Save,
  ThumbsUp, ThumbsDown, MinusCircle, MessageSquare, Star, HelpCircle
} from 'lucide-react';
import { cn, fileToBase64, getMediaType, levelToDescription, difficultyColor } from '@/lib/utils';

type Step = 'upload' | 'analyzing' | 'results' | 'paywall';

interface AnalysisResult {
  clientAnalysis: Record<string, any>;
  inspoAnalysis: Record<string, any>;
  recommendation: {
    summary: string;
    technique: string;
    steps: string[];
    formula: Record<string, any>;
    warnings: string[];
    tips: string[];
    difficulty: string;
    estimatedTime: string;
    estimatedPrice: string;
  };
  whyThisWorks?: {
    colorScience: string;
    productReasoning: string;
    alternativeFormulas: string[];
    commonMistakes: string[];
    videoLinks: string[];
  };
  matchedEntries: any[];
  confidence: number;
  analysisId?: string;
}

const FREE_ANALYSIS_LIMIT = 3;

interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  hasWhyAddon: boolean;
  freeAnalysesUsed: number;
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  const [clientImage, setClientImage] = useState<File | null>(null);
  const [inspoImage, setInspoImage] = useState<File | null>(null);
  const [clientPreview, setClientPreview] = useState<string>('');
  const [inspoPreview, setInspoPreview] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [analysesUsed, setAnalysesUsed] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    formula: true, technique: true, warnings: false, tips: false, why: false,
  });
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState<string | null>(null);
  const [feedbackAccuracy, setFeedbackAccuracy] = useState<number>(0);
  const [feedbackQuality, setFeedbackQuality] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackWhatWorked, setFeedbackWhatWorked] = useState('');
  const [feedbackWhatFailed, setFeedbackWhatFailed] = useState('');
  const [feedbackAdjustments, setFeedbackAdjustments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackExpanded, setFeedbackExpanded] = useState(false);

  useEffect(() => {
    // Check auth status
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // Check usage server-side (works for both anonymous and logged-in)
    fetch('/api/usage')
      .then(r => r.json())
      .then(data => {
        setAnalysesUsed(data.used || 0);
      })
      .catch(() => {});

    // Check for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      window.history.replaceState({}, '', '/upload');
    }
  }, []);

  const onClientDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setClientImage(file);
      setClientPreview(URL.createObjectURL(file));
    }
  }, []);

  const onInspoDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (file) {
      setInspoImage(file);
      setInspoPreview(URL.createObjectURL(file));
    }
  }, []);

  const clientDropzone = useDropzone({
    onDrop: onClientDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const inspoDropzone = useDropzone({
    onDrop: onInspoDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Get the plan limit
  const getPlanLimit = (): number => {
    if (!user) return FREE_ANALYSIS_LIMIT;
    if (user.plan === 'salon' || user.plan === 'enterprise') return -1; // unlimited
    if (user.plan === 'stylist') return 50;
    return FREE_ANALYSIS_LIMIT;
  };

  const canUseAnalysis = (): boolean => {
    const limit = getPlanLimit();
    if (limit === -1) return true;
    return analysesUsed < limit;
  };

  async function handleAnalyze() {
    if (!clientImage || !inspoImage) return;

    // Check limit
    if (!canUseAnalysis()) {
      setStep('paywall');
      return;
    }

    setStep('analyzing');
    setError('');

    try {
      const [clientBase64, inspoBase64] = await Promise.all([
        fileToBase64(clientImage),
        fileToBase64(inspoImage),
      ]);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientImage: clientBase64,
          clientMediaType: getMediaType(clientImage),
          inspoImage: inspoBase64,
          inspoMediaType: getMediaType(inspoImage),
        }),
      });

      if (res.status === 403) {
        // Server says limit reached
        setStep('paywall');
        return;
      }

      if (!res.ok) throw new Error('Analysis failed. Please try again.');

      const data = await res.json();
      setResult(data);

      // Usage is tracked server-side now — update local display from response
      if (data.usage) {
        setAnalysesUsed(data.usage.used);
      } else {
        setAnalysesUsed(prev => prev + 1);
      }
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setStep('upload');
    }
  }

  async function submitFeedback() {
    if (!result?.analysisId || !feedbackRating) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId: result.analysisId,
          rating: feedbackRating,
          accuracy: feedbackAccuracy || null,
          formulaQuality: feedbackQuality || null,
          comment: feedbackComment || null,
          whatWorked: feedbackWhatWorked || null,
          whatFailed: feedbackWhatFailed || null,
          adjustmentsMade: feedbackAdjustments || null,
        }),
      });
      if (res.ok) {
        setFeedbackSubmitted(true);
      }
    } catch {
      // Silently handle
    }
    setFeedbackLoading(false);
  }

  async function saveFormula() {
    if (!result || !user) return;
    try {
      const res = await fetch('/api/saved-formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult: result }),
      });
      if (res.ok) {
        setSavedMessage('Formula saved to your account!');
        setTimeout(() => setSavedMessage(''), 3000);
      }
    } catch {
      // silently fail
    }
  }

  function handleReset() {
    setStep('upload');
    setClientImage(null);
    setInspoImage(null);
    setClientPreview('');
    setInspoPreview('');
    setResult(null);
    setError('');
    // Reset feedback state
    setFeedbackRating(null);
    setFeedbackAccuracy(0);
    setFeedbackQuality(0);
    setFeedbackComment('');
    setFeedbackWhatWorked('');
    setFeedbackWhatFailed('');
    setFeedbackAdjustments('');
    setFeedbackSubmitted(false);
    setFeedbackExpanded(false);
  }

  function toggleSection(key: string) {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">ColorLab</span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-caramel bg-caramel/10 px-1.5 py-0.5 rounded-full">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Analyses counter */}
            {getPlanLimit() !== -1 && (
              <span className="text-xs text-stone bg-cream px-3 py-1 rounded-full">
                {Math.max(0, (getPlanLimit() === -1 ? 0 : getPlanLimit()) - analysesUsed)} left
              </span>
            )}
            {!canUseAnalysis() && (
              <Link href="/pricing" className="text-xs text-caramel bg-caramel/10 px-3 py-1 rounded-full hover:bg-caramel/20 transition-colors flex items-center gap-1">
                <Crown className="w-3 h-3" /> Upgrade
              </Link>
            )}
            {step === 'results' && (
              <button onClick={handleReset} className="text-sm text-stone hover:text-espresso transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> New Analysis
              </button>
            )}
            {user ? (
              <Link href="/account" className="text-sm text-stone hover:text-espresso transition-colors flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Account
              </Link>
            ) : (
              <Link href="/login" className="text-sm bg-espresso text-pearl px-4 py-1.5 rounded-full hover:bg-ink transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* ─── UPLOAD STEP ─────────────────────────── */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-10">
                <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">Analyze & Formulate</h1>
                <p className="text-stone">Upload two photos and get a complete color formula in seconds.</p>
                <Link
                  href="/photo-guide"
                  className="inline-flex items-center gap-1.5 text-xs text-caramel hover:text-copper mt-2 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> How to take the best photos for accurate results
                </Link>
              </div>

              {error && (
                <div className="bg-rose/10 text-rose border border-rose/20 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Client Photo */}
                <div>
                  <label className="text-sm font-medium text-espresso mb-2 block flex items-center gap-2">
                    <Camera className="w-4 h-4 text-caramel" />
                    Client&apos;s Current Hair
                  </label>
                  <div
                    {...clientDropzone.getRootProps()}
                    className={cn(
                      'relative border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden',
                      'min-h-[280px] flex items-center justify-center',
                      clientDropzone.isDragActive ? 'border-caramel bg-caramel/5' : 'border-sand hover:border-clay',
                      clientPreview ? 'p-2' : 'p-8'
                    )}
                  >
                    <input {...clientDropzone.getInputProps()} />
                    {clientPreview ? (
                      <div className="relative w-full h-full min-h-[260px]">
                        <img src={clientPreview} alt="Client hair" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute bottom-2 right-2 bg-espresso/80 text-pearl text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-7 h-7 text-clay" />
                        </div>
                        <p className="text-stone text-sm mb-1">Drop photo here or click to browse</p>
                        <p className="text-clay text-xs">JPG, PNG, WebP - Max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inspo Photo */}
                <div>
                  <label className="text-sm font-medium text-espresso mb-2 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-caramel" />
                    Inspiration / Goal Photo
                  </label>
                  <div
                    {...inspoDropzone.getRootProps()}
                    className={cn(
                      'relative border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden',
                      'min-h-[280px] flex items-center justify-center',
                      inspoDropzone.isDragActive ? 'border-caramel bg-caramel/5' : 'border-sand hover:border-clay',
                      inspoPreview ? 'p-2' : 'p-8'
                    )}
                  >
                    <input {...inspoDropzone.getInputProps()} />
                    {inspoPreview ? (
                      <div className="relative w-full h-full min-h-[260px]">
                        <img src={inspoPreview} alt="Inspiration" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute bottom-2 right-2 bg-espresso/80 text-pearl text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Uploaded
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-7 h-7 text-clay" />
                        </div>
                        <p className="text-stone text-sm mb-1">Drop inspiration photo or click to browse</p>
                        <p className="text-clay text-xs">The look your client wants to achieve</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={!clientImage || !inspoImage}
                  className={cn(
                    'inline-flex items-center gap-3 px-10 py-4 rounded-full text-base font-medium transition-all',
                    clientImage && inspoImage
                      ? 'bg-espresso text-pearl hover:bg-ink hover:shadow-lg hover:shadow-espresso/20 cursor-pointer'
                      : 'bg-sand text-clay cursor-not-allowed'
                  )}
                >
                  <FlaskConical className="w-5 h-5" />
                  Analyze & Generate Formula
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── PAYWALL STEP ──────────────────────── */}
          {step === 'paywall' && (
            <motion.div
              key="paywall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-20 h-20 rounded-full bg-caramel/10 flex items-center justify-center mb-6">
                <Lock className="w-9 h-9 text-caramel" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-medium mb-3">
                You've Used Your Free Analyses
              </h2>
              <p className="text-stone text-lg max-w-md mb-8">
                You've used all {FREE_ANALYSIS_LIMIT} free analyses. Upgrade to keep generating formulas and unlock premium features.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 max-w-lg w-full mb-8">
                <div className="formula-card rounded-xl p-5 text-center">
                  <div className="font-display text-2xl font-bold text-espresso mb-1">$29</div>
                  <div className="text-xs text-stone uppercase tracking-wider mb-3">Stylist / month</div>
                  <ul className="text-xs text-stone space-y-1.5 mb-4 text-left">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> 50 analyses/month</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> Full formula breakdown</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> Priority processing</li>
                  </ul>
                  <Link href="/pricing" className="block w-full bg-espresso text-pearl py-2.5 rounded-full text-sm font-medium hover:bg-ink transition-colors">
                    Upgrade Now
                  </Link>
                </div>

                <div className="formula-card rounded-xl p-5 text-center ring-2 ring-caramel">
                  <div className="font-display text-2xl font-bold text-espresso mb-1">$79</div>
                  <div className="text-xs text-stone uppercase tracking-wider mb-3">Salon / month</div>
                  <ul className="text-xs text-stone space-y-1.5 mb-4 text-left">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> Unlimited analyses</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> Up to 5 stylists</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-caramel" /> Analytics dashboard</li>
                  </ul>
                  <Link href="/pricing" className="block w-full bg-caramel text-white py-2.5 rounded-full text-sm font-medium hover:bg-copper transition-colors">
                    Best Value
                  </Link>
                </div>
              </div>

              <button
                onClick={() => setStep('upload')}
                className="text-sm text-stone hover:text-espresso transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
              </button>
            </motion.div>
          )}

          {/* ─── ANALYZING STEP ──────────────────────── */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-cream flex items-center justify-center animate-pulse-glow">
                  <FlaskConical className="w-10 h-10 text-caramel" />
                </div>
                <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-caramel animate-spin" />
              </div>
              <h2 className="font-display text-3xl font-medium mb-3">Analyzing Your Photos</h2>
              <div className="space-y-2 text-stone text-sm">
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
                  Detecting hair level, tone & condition...
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                  Matching against formula database...
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5 }}>
                  Generating your custom formula...
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* ─── RESULTS STEP ────────────────────────── */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="font-display text-3xl font-medium mb-1">Your Formula</h1>
                  <p className="text-stone text-sm flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', difficultyColor(result.recommendation.difficulty))}>
                      {result.recommendation.difficulty}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {result.recommendation.estimatedTime}</span>
                    <span>{result.recommendation.estimatedPrice}</span>
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {savedMessage && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {savedMessage}
                    </span>
                  )}
                  {user ? (
                    <button
                      onClick={saveFormula}
                      className="text-sm text-stone hover:text-espresso border border-sand hover:border-clay px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Save to Account
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-sm text-stone hover:text-espresso border border-sand hover:border-clay px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" /> Sign in to Save
                    </Link>
                  )}
                  <button className="text-sm text-stone hover:text-espresso border border-sand hover:border-clay px-4 py-2 rounded-full transition-all flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              {/* Photo Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="relative rounded-xl overflow-hidden">
                  {clientPreview && <img src={clientPreview} alt="Client" className="w-full h-48 object-cover" />}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium">Current - Level {result.clientAnalysis.level}</p>
                    <p className="text-white/70 text-xs">{result.clientAnalysis.currentColor}</p>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden">
                  {inspoPreview && <img src={inspoPreview} alt="Inspo" className="w-full h-48 object-cover" />}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium">Goal - Level {result.inspoAnalysis.targetLevel}</p>
                    <p className="text-white/70 text-xs">{result.inspoAnalysis.colorDescription}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="formula-card rounded-2xl p-6 mb-6">
                <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-caramel" /> Summary
                </h3>
                <p className="text-stone leading-relaxed">{result.recommendation.summary}</p>
              </div>

              {/* Formula Section */}
              <div className="formula-card rounded-2xl overflow-hidden mb-4">
                <button
                  onClick={() => toggleSection('formula')}
                  className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                >
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-caramel" /> Color Formula
                  </h3>
                  {expandedSections.formula ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                </button>
                {expandedSections.formula && (
                  <div className="px-6 pb-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {Object.entries(result.recommendation.formula).map(([key, value]) => {
                        if (!value || key === 'processingTimes' || (Array.isArray(value) && value.length === 0)) return null;
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase());
                        return (
                          <div key={key} className="bg-cream/50 rounded-lg p-3">
                            <p className="text-xs text-stone uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-espresso font-medium text-sm">
                              {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
                            </p>
                          </div>
                        );
                      })}
                      {result.recommendation.formula.processingTimes && (
                        <div className="bg-cream/50 rounded-lg p-3 sm:col-span-2">
                          <p className="text-xs text-stone uppercase tracking-wider mb-1">Processing Times</p>
                          <div className="flex flex-wrap gap-3">
                            {(Object.entries(result.recommendation.formula.processingTimes) as [string, string][]).map(([k, v]) => (
                              v && (
                                <span key={k} className="text-sm flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-caramel" />
                                  <span className="text-stone capitalize">{k}:</span>
                                  <span className="text-espresso font-medium">{v}</span>
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Technique Steps */}
              <div className="formula-card rounded-2xl overflow-hidden mb-4">
                <button
                  onClick={() => toggleSection('technique')}
                  className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                >
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-caramel" /> Technique Steps
                  </h3>
                  {expandedSections.technique ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                </button>
                {expandedSections.technique && (
                  <div className="px-6 pb-6">
                    <ol className="space-y-3">
                      {result.recommendation.steps.map((s: string, i: number) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-espresso text-pearl text-xs flex items-center justify-center font-mono">
                            {i + 1}
                          </span>
                          <p className="text-stone text-sm leading-relaxed pt-1">{s}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Warnings */}
              {result.recommendation.warnings?.length > 0 && (
                <div className="formula-card rounded-2xl overflow-hidden mb-4 border-amber-200">
                  <button
                    onClick={() => toggleSection('warnings')}
                    className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                  >
                    <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> Warnings
                    </h3>
                    {expandedSections.warnings ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                  </button>
                  {expandedSections.warnings && (
                    <div className="px-6 pb-6 space-y-2">
                      {result.recommendation.warnings.map((w: string, i: number) => (
                        <p key={i} className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {w}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tips */}
              {result.recommendation.tips?.length > 0 && (
                <div className="formula-card rounded-2xl overflow-hidden mb-4">
                  <button
                    onClick={() => toggleSection('tips')}
                    className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                  >
                    <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-honey" /> Pro Tips
                    </h3>
                    {expandedSections.tips ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                  </button>
                  {expandedSections.tips && (
                    <div className="px-6 pb-6 space-y-2">
                      {result.recommendation.tips.map((t: string, i: number) => (
                        <p key={i} className="text-sm text-stone bg-honey/10 px-3 py-2 rounded-lg flex items-start gap-2">
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-honey" /> {t}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* "Why This Works" — Premium Add-on Teaser / Content */}
              <div className="formula-card rounded-2xl overflow-hidden mb-4 border-2 border-honey/30">
                <button
                  onClick={() => toggleSection('why')}
                  className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                >
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-honey" /> Why This Works
                    {!result.whyThisWorks && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-honey bg-honey/10 px-2 py-0.5 rounded-full ml-2">
                        Premium
                      </span>
                    )}
                  </h3>
                  {expandedSections.why ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                </button>
                {expandedSections.why && (
                  <div className="px-6 pb-6">
                    {result.whyThisWorks ? (
                      // Full premium content
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-espresso mb-1">Color Science</h4>
                          <p className="text-stone text-sm leading-relaxed">{result.whyThisWorks.colorScience}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-espresso mb-1">Why These Products</h4>
                          <p className="text-stone text-sm leading-relaxed">{result.whyThisWorks.productReasoning}</p>
                        </div>
                        {result.whyThisWorks.alternativeFormulas?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-espresso mb-1">Alternative Formulas</h4>
                            <ul className="space-y-1.5">
                              {result.whyThisWorks.alternativeFormulas.map((alt: string, i: number) => (
                                <li key={i} className="text-stone text-sm bg-cream/50 px-3 py-2 rounded-lg">{alt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.whyThisWorks.commonMistakes?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-espresso mb-1">Common Mistakes to Avoid</h4>
                            <ul className="space-y-1.5">
                              {result.whyThisWorks.commonMistakes.map((m: string, i: number) => (
                                <li key={i} className="text-sm text-rose bg-rose/5 px-3 py-2 rounded-lg flex items-start gap-2">
                                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Teaser for non-premium users
                      <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-honey/10 flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-6 h-6 text-honey" />
                        </div>
                        <h4 className="font-display text-lg font-semibold mb-2">Unlock Color Science Education</h4>
                        <p className="text-stone text-sm max-w-md mx-auto mb-4">
                          Understand <em>why</em> this formula works, see alternative approaches, and learn common mistakes to avoid. Perfect for growing your color knowledge.
                        </p>
                        <ul className="text-xs text-stone space-y-1.5 max-w-xs mx-auto mb-6 text-left">
                          <li className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-honey" /> Detailed color science breakdown</li>
                          <li className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-honey" /> Why each product was chosen</li>
                          <li className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-honey" /> Alternative formula options</li>
                          <li className="flex items-center gap-1.5"><BookOpen className="w-3 h-3 text-honey" /> Common mistakes to avoid</li>
                        </ul>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center gap-2 bg-honey text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-honey/90 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" /> Add for $9.99/mo
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Matched DB entries */}
              {result.matchedEntries.length > 0 && (
                <div className="formula-card rounded-2xl p-6 mb-8">
                  <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-caramel" /> Similar Transformations from Database
                  </h3>
                  <div className="space-y-3">
                    {result.matchedEntries.map((entry: any, i: number) => (
                      <div key={i} className="bg-cream/50 rounded-xl p-4 flex items-center gap-4">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-sm font-mono text-stone">Lvl {entry.beforeLevel}</div>
                          <ArrowRight className="w-4 h-4 text-caramel mx-auto my-1" />
                          <div className="text-sm font-mono text-espresso font-medium">Lvl {entry.afterLevel}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-espresso">{entry.technique}</p>
                          <p className="text-xs text-stone truncate">{entry.formulaDetails}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Formula Feedback ──────────────────── */}
              <div className="formula-card rounded-2xl overflow-hidden mb-8 border-2 border-caramel/20">
                {feedbackSubmitted ? (
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">Thanks for your feedback!</h3>
                    <p className="text-stone text-sm max-w-md mx-auto">
                      Your rating helps improve formulas for every stylist. The AI gets smarter with every review.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setFeedbackExpanded(!feedbackExpanded)}
                      className="w-full flex items-center justify-between p-6 hover:bg-cream/50 transition-colors"
                    >
                      <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-caramel" /> Rate This Formula
                      </h3>
                      {feedbackExpanded ? <ChevronUp className="w-5 h-5 text-clay" /> : <ChevronDown className="w-5 h-5 text-clay" />}
                    </button>

                    {feedbackExpanded && (
                      <div className="px-6 pb-6 space-y-5">
                        <p className="text-stone text-sm">
                          Did this formula work? Your feedback trains the AI to give better recommendations.
                        </p>

                        {/* Main rating buttons */}
                        <div>
                          <label className="text-xs text-stone uppercase tracking-wider block mb-2">How did it turn out?</label>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { value: 'worked', label: 'Worked Great', icon: ThumbsUp, color: 'emerald' },
                              { value: 'partial', label: 'Partially Worked', icon: MinusCircle, color: 'amber' },
                              { value: 'didnt_work', label: "Didn't Work", icon: ThumbsDown, color: 'red' },
                            ].map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => setFeedbackRating(opt.value)}
                                className={`p-4 rounded-xl border-2 transition-all text-center ${
                                  feedbackRating === opt.value
                                    ? opt.color === 'emerald' ? 'border-emerald-500 bg-emerald-50' :
                                      opt.color === 'amber' ? 'border-amber-500 bg-amber-50' :
                                      'border-red-500 bg-red-50'
                                    : 'border-sand hover:border-clay'
                                }`}
                              >
                                <opt.icon className={`w-6 h-6 mx-auto mb-1.5 ${
                                  feedbackRating === opt.value
                                    ? opt.color === 'emerald' ? 'text-emerald-600' :
                                      opt.color === 'amber' ? 'text-amber-600' :
                                      'text-red-600'
                                    : 'text-stone'
                                }`} />
                                <span className="text-xs font-medium">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Star ratings */}
                        {feedbackRating && (
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-stone uppercase tracking-wider block mb-2">
                                Level & Tone Detection Accuracy
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button
                                    key={n}
                                    onClick={() => setFeedbackAccuracy(n)}
                                    className="p-1 transition-colors"
                                  >
                                    <Star className={`w-6 h-6 ${n <= feedbackAccuracy ? 'fill-honey text-honey' : 'text-sand'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-stone uppercase tracking-wider block mb-2">
                                Formula Recommendation Quality
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <button
                                    key={n}
                                    onClick={() => setFeedbackQuality(n)}
                                    className="p-1 transition-colors"
                                  >
                                    <Star className={`w-6 h-6 ${n <= feedbackQuality ? 'fill-honey text-honey' : 'text-sand'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detailed feedback (collapsed until rating selected) */}
                        {feedbackRating && (
                          <div className="space-y-3">
                            {(feedbackRating === 'worked' || feedbackRating === 'partial') && (
                              <div>
                                <label className="text-xs text-stone uppercase tracking-wider block mb-1">What worked well?</label>
                                <input
                                  type="text"
                                  value={feedbackWhatWorked}
                                  onChange={e => setFeedbackWhatWorked(e.target.value)}
                                  placeholder="e.g. Toner shade was spot-on, technique was perfect"
                                  className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
                                />
                              </div>
                            )}

                            {(feedbackRating === 'partial' || feedbackRating === 'didnt_work') && (
                              <>
                                <div>
                                  <label className="text-xs text-stone uppercase tracking-wider block mb-1">What didn&apos;t work?</label>
                                  <input
                                    type="text"
                                    value={feedbackWhatFailed}
                                    onChange={e => setFeedbackWhatFailed(e.target.value)}
                                    placeholder="e.g. Ends came out too warm, developer was too strong"
                                    className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-stone uppercase tracking-wider block mb-1">What did you adjust?</label>
                                  <input
                                    type="text"
                                    value={feedbackAdjustments}
                                    onChange={e => setFeedbackAdjustments(e.target.value)}
                                    placeholder="e.g. Dropped developer to 10vol, added violet additive"
                                    className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm"
                                  />
                                </div>
                              </>
                            )}

                            <div>
                              <label className="text-xs text-stone uppercase tracking-wider block mb-1">Additional notes (optional)</label>
                              <textarea
                                value={feedbackComment}
                                onChange={e => setFeedbackComment(e.target.value)}
                                placeholder="Any other details about the result..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg border border-sand bg-pearl/50 focus:outline-none focus:border-caramel text-sm resize-none"
                              />
                            </div>

                            <button
                              onClick={submitFeedback}
                              disabled={feedbackLoading || !feedbackRating}
                              className="flex items-center gap-2 px-5 py-2.5 bg-espresso text-pearl rounded-full text-sm font-medium hover:bg-ink transition-colors disabled:opacity-50"
                            >
                              {feedbackLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Submit Feedback
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* CTA */}
              <div className="text-center py-8 border-t border-sand">
                {canUseAnalysis() ? (
                  <>
                    <p className="text-stone text-sm mb-3">
                      {!user && `You have ${Math.max(0, FREE_ANALYSIS_LIMIT - analysesUsed)} free ${FREE_ANALYSIS_LIMIT - analysesUsed === 1 ? 'analysis' : 'analyses'} remaining.`}
                      {user && getPlanLimit() !== -1 && `You have ${Math.max(0, getPlanLimit() - analysesUsed)} analyses remaining this month.`}
                      {user && getPlanLimit() === -1 && 'Unlimited analyses on your plan.'}
                      {!user && ' Sign in to track your usage.'}
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 bg-espresso text-pearl px-6 py-3 rounded-full text-sm font-medium hover:bg-ink transition-colors"
                      >
                        <FlaskConical className="w-4 h-4" /> Run Another Analysis
                      </button>
                      {!user && (
                        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-stone hover:text-espresso border border-sand px-5 py-3 rounded-full transition-colors">
                          <User className="w-4 h-4" /> Sign In
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-stone text-sm mb-3">Want more analyses? Upgrade your plan.</p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 bg-caramel text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-copper transition-colors"
                    >
                      <Crown className="w-4 h-4" /> View Plans & Pricing
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
