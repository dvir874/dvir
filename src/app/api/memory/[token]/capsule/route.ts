import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

// GET — list time capsule messages for this vault (guest view, shows only yours)
// GET ?couple=1 — list all messages (couple view via vault token)
export async function GET(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase  = createServerClient();
  const isCouple  = req.nextUrl.searchParams.get('couple') === '1';

  const { data: vault } = await supabase
    .from('vault_tokens')
    .select('event_id, events(date)')
    .eq('token', token)
    .single();

  if (!vault) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const query = supabase
    .from('time_capsule_messages')
    .select('id, guest_name, message_type, content, unlock_years, unlock_at, unlocked, created_at')
    .eq('event_id', vault.event_id)
    .order('unlock_years');

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For couple view: show locked messages as teaser (hide content until unlocked)
  const now = new Date();
  const items = (data ?? []).map((m) => {
    const isUnlocked = new Date(m.unlock_at) <= now;
    return {
      ...m,
      unlocked:   isUnlocked,
      content:    isCouple && !isUnlocked ? null : m.content,
      daysToUnlock: isUnlocked ? 0 : Math.ceil((new Date(m.unlock_at).getTime() - now.getTime()) / 86_400_000),
    };
  });

  return NextResponse.json(items);
}

// POST — guest writes a time capsule message
export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase  = createServerClient();
  const body      = await req.json();

  const { data: vault } = await supabase
    .from('vault_tokens')
    .select('event_id, events(date)')
    .eq('token', token)
    .single();

  if (!vault) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const { guest_name, message_type, content, unlock_years } = body;
  if (!guest_name || !content || !message_type) {
    return NextResponse.json({ error: 'guest_name, message_type, content required' }, { status: 400 });
  }
  if (![1, 5, 10].includes(Number(unlock_years))) {
    return NextResponse.json({ error: 'unlock_years must be 1, 5, or 10' }, { status: 400 });
  }

  const event = Array.isArray(vault.events) ? vault.events[0] : vault.events as { date: string } | null;
  if (!event?.date) return NextResponse.json({ error: 'Event date not found' }, { status: 500 });

  const weddingDate = new Date(event.date);
  const unlockDate  = new Date(weddingDate);
  unlockDate.setFullYear(unlockDate.getFullYear() + Number(unlock_years));
  const unlock_at = unlockDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('time_capsule_messages')
    .insert({
      event_id:     vault.event_id,
      vault_token:  token,
      guest_name,
      message_type,
      content,
      unlock_years: Number(unlock_years),
      unlock_at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, unlock_at }, { status: 201 });
}
