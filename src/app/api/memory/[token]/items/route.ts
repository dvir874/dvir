import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase  = createServerClient();

  // Validate token
  const { data: vaultToken } = await supabase
    .from('vault_tokens')
    .select('event_id')
    .eq('token', token)
    .single();

  if (!vaultToken) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const { data, error } = await supabase
    .from('memory_items')
    .select('id, guest_name, type, public_url, blessing_text, mime_type, uploaded_at')
    .eq('event_id', vaultToken.event_id)
    .order('uploaded_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
