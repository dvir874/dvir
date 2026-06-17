import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE = 'raga_admin_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminPassword || !adminToken) {
    // Not configured — allow any login in dev
    if (process.env.NODE_ENV !== 'production') {
      const jar = await cookies();
      jar.set(COOKIE, 'dev_session', { httpOnly: true, path: '/', maxAge: MAX_AGE, sameSite: 'lax' });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(COOKIE, adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
  });

  return NextResponse.json({ ok: true });
}
