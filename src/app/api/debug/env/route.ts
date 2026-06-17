import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  const hasUrl = url.length > 0;
  const hasServiceRole = serviceKey.length > 0;
  const hasAnon = anonKey.length > 0;

  // Detailed shape info for each key — never log full secrets
  const urlPreview = hasUrl ? url : 'MISSING';
  const serviceKeyType = !hasServiceRole
    ? 'MISSING'
    : serviceKey.startsWith('eyJ')
    ? 'JWT (correct format)'
    : serviceKey.startsWith('sb_')
    ? 'WRONG — this is a publishable/anon key, not the service role JWT'
    : `UNKNOWN FORMAT — first 8 chars: ${serviceKey.slice(0, 8)}`;
  const anonKeyType = !hasAnon
    ? 'MISSING'
    : anonKey.startsWith('eyJ')
    ? 'JWT format'
    : anonKey.startsWith('sb_')
    ? 'publishable key format (sb_publishable_...)'
    : `UNKNOWN — first 8 chars: ${anonKey.slice(0, 8)}`;

  // Try a real Supabase HTTP request to /rest/v1/ — no SDK needed
  let supabaseConnectionWorks = false;
  let supabaseError = '';
  if (hasUrl && hasServiceRole) {
    try {
      const res = await fetch(`${url}/rest/v1/events?select=id&limit=1`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      const body = await res.text();
      if (res.ok) {
        supabaseConnectionWorks = true;
      } else {
        supabaseError = `HTTP ${res.status}: ${body.slice(0, 200)}`;
      }
    } catch (e) {
      supabaseError = String(e);
    }
  } else {
    supabaseError = 'Skipped — missing URL or service role key';
  }

  return NextResponse.json({
    hasUrl,
    hasAnon,
    hasServiceRole,
    supabaseConnectionWorks,
    // Diagnostic detail (safe — no full key values)
    detail: {
      urlPreview,
      serviceKeyType,
      anonKeyType,
      supabaseError: supabaseError || null,
      nodeEnv: process.env.NODE_ENV,
    },
  });
}
