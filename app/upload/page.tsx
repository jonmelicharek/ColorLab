'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Upload, Camera, Sparkles, ArrowRight, ArrowLeft, FlaskConical,
  Clock, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
  Palette, Scissors, Droplets, RotateCcw, Download, Share2,
  CheckCircle2, Loader2
} from 'lucide-react';
import { cn, fileToBase64, getMediaType, levelToDescription, difficultyColor } from '@/lib/utils';

type Step = 'upload' | 'analyzing' | 'results';

interface AnalysisResult {
  clientAnalysis: any;
  inspoAnalysis: any;
  recommendation: any;
  matchedEntries: any[];
  confidence: number;
}

export default function UploadPage() {
  const [step, setStep] = useState<Step>('upload');
  const [clientImage, setClientImage] = useState<File | null>(null);
  const [inspoImage, setInspoImage] = useState<File | null>(null);
  const [clientPreview, setClientPreview] = useState<string>('');
  const [inspoPreview, setInspoPreview] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    formula: true, technique: true, warnings: false, tips: false,
  });

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

  async function handleAnalyze() {
    if (!clientImage || !inspoImage) return;
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

      if (!res.ok) throw new Error('Analysis failed — please try again.');

      const data = await res.json();
      setResult(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setStep('upload');
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
          {step === 'results' && (
            <button onClick={handleReset} className="text-sm text-stone hover:text-espresso transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> New Analysis
            </button>
          )}
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
                        <p className="text-clay text-xs">JPG, PNG, WebP · Max 10MB</p>
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
                <div className="flex gap-2">
                  <button className="text-sm text-stone hover:text-espresso border border-sand hover:border-clay px-4 py-2 rounded-full transition-all flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Save
                  </button>
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
                    <p className="text-white text-xs font-medium">Current · Level {result.clientAnalysis.level}</p>
                    <p className="text-white/70 text-xs">{result.clientAnalysis.currentColor}</p>
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden">
                  {inspoPreview && <img src={inspoPreview} alt="Inspo" className="w-full h-48 object-cover" />}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium">Goal · Level {result.inspoAnalysis.targetLevel}</p>
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
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                        return (
                          <div key={key} className="bg-cream/50 rounded-lg p-3">
                            <p className="text-xs text-stone uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-espresso font-medium text-sm">
                              {Array.isArray(value) ? value.join(', ') : String(value)}
                            </p>
                          </div>
                        );
                      })}
                      {result.recommendation.formula.processingTimes && (
                        <div className="bg-cream/50 rounded-lg p-3 sm:col-span-2">
                          <p className="text-xs text-stone uppercase tracking-wider mb-1">Processing Times</p>
                          <div className="flex flex-wrap gap-3">
                            {Object.entries(result.recommendation.formula.processingTimes).map(([k, v]) => (
                              v && (
                                <span key={k} className="text-sm flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-caramel" />
                                  <span className="text-stone capitalize">{k}:</span>
                                  <span className="text-espresso font-medium">{String(v)}</span>
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
                <div className="formula-card rounded-2xl overflow-hidden mb-8">
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

              {/* CTA */}
              <div className="text-center py-8 border-t border-sand">
                <p className="text-stone text-sm mb-3">Want more analyses? Join ColorLab for free during beta.</p>
                <Link
                  href="/#waitlist"
                  className="inline-flex items-center gap-2 bg-espresso text-pearl px-6 py-3 rounded-full text-sm font-medium hover:bg-ink transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Get Early Access
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
