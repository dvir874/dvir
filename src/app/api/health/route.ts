import { NextResponse } from 'next/server';
import { flags } from '@/lib/feature-flags';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Used by uptime monitoring (Uptime Robot) to verify the service is alive
 * and the database is reachable.
 *
 * Response 200 — all checks passed.
 * Response 503 — one or more checks failed (uptime tool marks as DOWN).
 * Response 404 — ENABLE_HEALTH_ENDPOINT is not "true" (endpoint disabled).
 *
 * Privacy: returns no user data — only system health indicators.
 */
export async function GET() {
  if (!flags.healthEndpoint) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const start = Date.now();
  const checks: Record<string, 'ok' | 'error'> = {};

  // Database check — run a lightweight query that hits the connection pool
  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('events')
      .select('id')
      .limit(1)
      .maybeSingle();

    checks.database = error ? 'error' : 'ok';
  } catch {
    checks.database = 'error';
  }

  const latency_ms = Date.now() - start;
  const allOk = Object.values(checks).every((v) => v === 'ok');

  const body = {
    status: allOk ? 'ok' : 'degraded',
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
    timestamp: new Date().toISOString(),
    latency_ms,
    checks,
  };

  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}
