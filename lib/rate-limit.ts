// ═══════════════════════════════════════════════════════════════
// Simple in-memory rate limiter (no external deps)
// For production, swap with Vercel KV or Upstash Redis
// ═══════════════════════════════════════════════════════════════

const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of requests) {
      if (now > val.resetAt) requests.delete(key);
    }
  }, 5 * 60 * 1000);
}
