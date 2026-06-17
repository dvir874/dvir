import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'raga_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin pages — skip the login page itself
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE)?.value;
  const expected = process.env.ADMIN_TOKEN;

  // If ADMIN_TOKEN is not configured (local dev without env), allow through
  if (!expected) return NextResponse.next();

  if (token !== expected) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
