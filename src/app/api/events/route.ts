import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';
import { DEFAULT_THEME_ID } from '@/lib/themes';

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[api/events] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, 'SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return NextResponse.json({ error: 'Server misconfiguration: missing Supabase env vars' }, { status: 500 });
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date');
  if (error) {
    console.error('[api/events] Supabase error:', error.message, error.code);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();

  const { name, date, address, theme, client_phone } = body as {
    name?: string;
    date?: string;
    address?: string;
    theme?: string;
    client_phone?: string;
  };
  if (!name || !date)
    return NextResponse.json({ error: 'name and date are required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .insert({ name, date, address, theme: theme ?? DEFAULT_THEME_ID, client_phone: client_phone ?? null })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
