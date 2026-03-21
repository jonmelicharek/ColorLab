'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="font-display text-2xl font-semibold text-espresso mb-3">Something Went Wrong</h1>
        <p className="text-stone mb-8">
          We hit an unexpected error. This has been logged and we&apos;ll look into it.
        </p>
        <button
          onClick={reset}
          className="bg-espresso text-pearl px-6 py-3 rounded-full text-sm font-medium hover:bg-ink transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
