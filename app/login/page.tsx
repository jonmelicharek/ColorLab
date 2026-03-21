'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FlaskConical, ArrowRight, Mail, KeyRound, Check, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep('code');
      } else {
        setError(data.error || 'Failed to send code');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store user info in localStorage for client-side access
        localStorage.setItem('colorlab_user', JSON.stringify(data.user));
        setStep('success');
        // Redirect after brief success message
        setTimeout(() => {
          window.location.href = '/account';
        }, 1500);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-caramel to-copper flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-medium mb-2">
            {step === 'email' && 'Sign In to ColorLab'}
            {step === 'code' && 'Check Your Email'}
            {step === 'success' && 'Welcome Back!'}
          </h1>
          <p className="text-stone text-sm">
            {step === 'email' && 'Enter your email to receive a login code. No password needed.'}
            {step === 'code' && `We sent a 6-digit code to ${email}`}
            {step === 'success' && 'Redirecting to your account...'}
          </p>
        </div>

        {error && (
          <div className="bg-rose/10 text-rose border border-rose/20 px-4 py-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={sendCode}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 text-sm"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-espresso text-pearl py-3.5 rounded-xl font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Send Login Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </motion.form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={verifyCode}
            className="space-y-4"
          >
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-sand bg-white focus:outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/20 text-sm tracking-[0.3em] text-center font-mono text-lg"
                maxLength={6}
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-espresso text-pearl py-3.5 rounded-xl font-medium hover:bg-ink transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Verify Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="w-full text-sm text-stone hover:text-espresso transition-colors py-2"
            >
              Use a different email
            </button>
          </motion.form>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-stone mx-auto mt-4" />
          </motion.div>
        )}

        {/* Footer */}
        <p className="text-xs text-clay text-center mt-8">
          By signing in, you agree to our terms. No password needed — we use secure email codes.
        </p>
      </div>
    </div>
  );
}
