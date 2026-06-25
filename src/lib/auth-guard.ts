/**
 * Route-level authorization guard.
 *
 * Provides a second layer of auth on top of middleware.
 * Middleware can be bypassed by caching/edge quirks — this cannot.
 *
 * Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const COOKIE = 'raga_admin_session';

/**
 * Returns a 401 response if the request is not authenticated as admin.
 * Returns null if the request is authorized (caller should continue).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const expected = process.env.ADMIN_TOKEN;

  // In local dev without ADMIN_TOKEN — allow (matches middleware behavior)
  if (!expected) {
    if (process.env.NODE_ENV !== 'production') return null;
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const jar   = await cookies();
  const token = jar.get(COOKIE)?.value;

  if (token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authorized
}

/**
 * Validate couple token and return the event, or a 404 response.
 * Centralizes couple token lookup so every couple route uses the same logic.
 */
import { createServerClient } from '@/lib/supabase-server';

export async function requireCoupleEvent(token: string): Promise<
  { event: { id: string; name: string; date: string }; denied: null } |
  { event: null; denied: NextResponse }
> {
  const supabase = createServerClient();
  const { data: event } = await supabase
    .from('events')
    .select('id, name, date')
    .eq('couple_token', token)
    .single();

  if (!event) {
    return { event: null, denied: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }

  return { event, denied: null };
}
