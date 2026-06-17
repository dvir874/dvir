import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST — admin creates or retrieves a vault token for an event
export async function POST(request: NextRequest) {
  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();

  // Idempotent: return existing token if already created
  const { data: existing } = await supabase
    .from('vault_tokens')
    .select('token')
    .eq('event_id', event_id)
    .single();

  if (existing?.token) {
    return NextResponse.json({ token: existing.token });
  }

  const { data, error } = await supabase
    .from('vault_tokens')
    .insert({ event_id })
    .select('token')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ token: data.token }, { status: 201 });
}

// GET /api/memory/vault-token?event_id=X
export async function GET(request: NextRequest) {
  const event_id = new URL(request.url).searchParams.get('event_id');
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data } = await supabase
    .from('vault_tokens')
    .select('token')
    .eq('event_id', event_id)
    .single();

  return NextResponse.json({ token: data?.token ?? null });
}
