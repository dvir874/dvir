import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Temporary diagnostic endpoint — remove before public launch
// Access: GET /api/debug/env
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const report: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `SET (${url.slice(0, 30)}...)` : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: serviceKey
      ? `SET (${serviceKey.slice(0, 20)}...)`
      : 'MISSING ← THIS BREAKS ALL API ROUTES',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey ? `SET (${anonKey.slice(0, 20)}...)` : 'MISSING',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey
      ? `SET (${publishableKey.slice(0, 30)}...)`
      : 'MISSING',
    NEXT_PUBLIC_BASE_URL: baseUrl ?? 'MISSING (optional)',
    NODE_ENV: process.env.NODE_ENV ?? 'unknown',
  };

  // Try an actual Supabase query
  let dbStatus = 'not tested';
  if (url && serviceKey) {
    try {
      const supabase = createServerClient();
      const { error } = await supabase.from('events').select('id').limit(1);
      dbStatus = error ? `ERROR: ${error.message}` : 'OK — Supabase connected';
    } catch (e) {
      dbStatus = `EXCEPTION: ${String(e)}`;
    }
  } else {
    dbStatus = 'SKIPPED — missing URL or service key';
  }

  return NextResponse.json({ env: report, db: dbStatus });
}
