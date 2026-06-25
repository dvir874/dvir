/**
 * In-memory sliding window rate limiter.
 *
 * Limitations: per-process memory — resets on cold start. Acceptable for a
 * small SaaS with limited traffic. Upgrade to Upstash Redis when concurrent
 * function instances become a concern.
 *
 * Usage:
 *   const result = checkRateLimit(ip, 'rsvp', 10, 60_000);
 *   if (!result.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMs: number,
): { ok: boolean; remaining: number; resetAt: number } {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { ok: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/** Extract IP from request headers (Vercel-aware). */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Standard rate limit configs */
export const LIMITS = {
  rsvp:          { max: 20,  windowMs: 60_000 },   // 20/min per IP
  leads:         { max: 5,   windowMs: 60_000 },   // 5/min per IP
  gallery_upload:{ max: 30,  windowMs: 60_000 },   // 30/min per IP
  memory_upload: { max: 20,  windowMs: 60_000 },   // 20/min per IP
  login:         { max: 10,  windowMs: 60_000 },   // 10/min per IP
  couple:        { max: 120, windowMs: 60_000 },   // 120/min per IP (dashboard polling)
} as const;
