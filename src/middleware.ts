import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'raga_admin_session';

// API routes that require admin auth (all admin-only data APIs)
const PROTECTED_API_PREFIXES = [
  '/api/events',
  '/api/guests',
  '/api/seating',
  '/api/budget',
  '/api/gifts',
  '/api/leads',
  '/api/admin',
  '/api/manager',
  '/api/wedding-tasks',
  '/api/wedding-vendors',
  '/api/coupons',
  '/api/approval',
  '/api/referral',
];

// Public API routes — never require admin auth
const PUBLIC_API_PREFIXES = [
  '/api/couple',
  '/api/rsvp',
  '/api/gallery',
  '/api/memory',
  '/api/survey',
  '/api/onboarding',
  '/api/stripe',
  '/api/auth',
  '/api/cron',
  '/api/health',         // uptime monitoring — no auth required
  '/api/sentry-test',    // TEMPORARY — Sprint 1 verification, remove after
];

function isAdminProtectedApi(pathname: string): boolean {
  // Explicitly public — skip immediately
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
}

// Destructive HTTP methods that must NEVER be allowed without ADMIN_TOKEN,
// even in local dev — this prevents accidental production data loss during testing.
const DESTRUCTIVE_METHODS = ['DELETE', 'PUT'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const token = request.cookies.get(COOKIE)?.value;
  const expected = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN is not configured (local dev without env):
  // - Allow GET/POST/PATCH through (read and non-destructive writes are fine for dev)
  // - BLOCK DELETE/PUT on protected API routes — prevents accidental production data wipe
  if (!expected) {
    if (DESTRUCTIVE_METHODS.includes(method) && isAdminProtectedApi(pathname)) {
      console.error(
        `[middleware] BLOCKED ${method} ${pathname} — ADMIN_TOKEN not set. ` +
        `Set ADMIN_TOKEN in .env.local to enable destructive operations in dev.`
      );
      return NextResponse.json(
        {
          error: 'Destructive operation blocked in dev: ADMIN_TOKEN not configured.',
          hint: 'Add ADMIN_TOKEN to your .env.local file and restart the dev server.',
        },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Guard /admin pages (skip login page itself)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (token !== expected) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Guard admin API routes
  if (isAdminProtectedApi(pathname)) {
    if (token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/events/:path*',
    '/api/guests/:path*',
    '/api/seating/:path*',
    '/api/budget/:path*',
    '/api/gifts/:path*',
    '/api/leads/:path*',
    '/api/admin/:path*',
    '/api/manager/:path*',
    '/api/wedding-tasks/:path*',
    '/api/wedding-vendors/:path*',
    '/api/coupons/:path*',
    '/api/approval/:path*',
    '/api/referral/:path*',
  ],
};
