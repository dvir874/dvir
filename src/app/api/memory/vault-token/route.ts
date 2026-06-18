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
// GET /api/memory/vault-token?couple_token=X  (lookup by couple token)
export async function GET(request: NextRequest) {
  const sp           = new URL(request.url).searchParams;
  const event_id     = sp.get('event_id');
  const couple_token = sp.get('couple_token');
  const supabase     = createServerClient();

  if (couple_token) {
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('couple_token', couple_token)
      .single();
    if (!event) return NextResponse.json({ token: null });
    const { data } = await supabase
      .from('vault_tokens')
      .select('token')
      .eq('event_id', event.id)
      .single();
    return NextResponse.json({ token: data?.token ?? null });
  }

  if (!event_id) return NextResponse.json({ error: 'event_id or couple_token required' }, { status: 400 });
  const { data } = await supabase
    .from('vault_tokens')
    .select('token')
    .eq('event_id', event_id)
    .single();

  return NextResponse.json({ token: data?.token ?? null });
}
