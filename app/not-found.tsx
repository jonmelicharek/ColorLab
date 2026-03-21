import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-display text-[120px] font-bold leading-none text-sand mb-4">404</div>
        <h1 className="font-display text-2xl font-semibold text-espresso mb-3">Page Not Found</h1>
        <p className="text-stone mb-8">
          Looks like this page got lost in the color mix. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-espresso text-pearl px-6 py-3 rounded-full text-sm font-medium hover:bg-ink transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/upload"
            className="border border-sand text-stone px-6 py-3 rounded-full text-sm font-medium hover:border-caramel hover:text-espresso transition-colors"
          >
            Try the Formula Tool
          </Link>
        </div>
      </div>
    </div>
  );
}
