import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // CSRF protection for mutating API requests
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.nextUrl.pathname.startsWith('/api/')) {
    // Allow Stripe webhooks (they come from Stripe's servers)
    if (request.nextUrl.pathname === '/api/stripe/webhook') {
      return response;
    }

    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // In production, verify origin matches host
    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.endsWith('.vercel.app') && originHost !== 'colorlab.me') {
        return NextResponse.json(
          { error: 'Forbidden: Invalid origin' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
