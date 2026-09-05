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
  '/api/health',   // uptime monitoring — no auth required
];

/* Routes where ONE method is public and the rest are not.
 *
 * /api/leads is the contact form on the public site. Its POST handler is
 * written to be public — it rate-limits by IP, validates with a schema, and
 * has no requireAdmin — but the prefix sits in PROTECTED_API_PREFIXES, so this
 * middleware answered 401 before the handler was ever reached. Every enquiry
 * anybody has typed into the website has been refused, silently: the form's
 * fetch ends in .catch(() => {}) and then opens WhatsApp regardless, so the
 * visitor saw a normal flow and Dvir saw nothing at all.
 *
 * Listing the method explicitly rather than moving the whole prefix to
 * PUBLIC_API_PREFIXES: GET on this route returns every lead in the business. */
const PUBLIC_METHOD_ROUTES: { path: string; methods: string[] }[] = [
  { path: "/api/leads", methods: ["POST"] },
];

function isAdminProtectedApi(pathname: string, method?: string): boolean {
  // Explicitly public — skip immediately
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  if (method && PUBLIC_METHOD_ROUTES.some(
    (r) => pathname === r.path && r.methods.includes(method))) return false;
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
    if (DESTRUCTIVE_METHODS.includes(method) && isAdminProtectedApi(pathname, method)) {
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
  if (isAdminProtectedApi(pathname, method)) {
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
