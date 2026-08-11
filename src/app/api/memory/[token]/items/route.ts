import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

/**
 * Everything guests contributed — for the couple only.
 *
 * This used to accept the same token that /memory/[token] hands to every guest,
 * which meant the link asking someone to add a photo also gave them the whole
 * album: every other guest's photos, and every blessing written for the couple
 * by somebody else. Now the guest token uploads and nothing more; owner_token
 * views.
 *
 * A guest token gets 404 rather than 403. Telling a stranger "this token is
 * real but not yours" tells them there is something here worth the effort.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase  = createServerClient();

  /* A uuid column will not accept an arbitrary string, and PostgREST rejects
     the whole query rather than the one bad comparison — so only ask about
     owner_token when the token could actually be one. */
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
  if (!isUuid) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: vault } = await supabase
    .from('vault_tokens')
    .select('event_id')
    .eq('owner_token', token)
    .maybeSingle();

  if (!vault) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('memory_items')
    .select('id, guest_name, type, public_url, blessing_text, mime_type, uploaded_at, taken_at')
    .eq('event_id', vault.event_id)
    /* The evening in the order it happened. Anything with no capture time
       cannot be placed in it honestly, so it follows at the end in arrival
       order rather than being guessed into the middle of the chuppah. */
    .order('taken_at',    { ascending: true, nullsFirst: false })
    .order('uploaded_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
