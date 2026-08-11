import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

/* Guest reports "this link reached the wrong person".
   Stored additively — no schema change required:
   · guest_events row (event_type: 'wrong_person') marks the report
   · guests.notes keeps the free-text message the reporter left
   Both columns already exist in production. */

const WrongPersonSchema = z.object({
  message: z.string().max(500).optional().nullable(),
});

const REPORT_PREFIX = '🚫 דיווח מספר שגוי';

type Params = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'rsvp', LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { token } = await params;
  const parsed = WrongPersonSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const message = parsed.data.message?.trim() ?? '';
  const supabase = createServerClient();

  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, notes')
    .eq('rsvp_token', token)
    .single();

  if (error || !guest) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Mark the report (fire-and-forget — the note below is the durable record)
  supabase.from('guest_events').insert({ guest_id: guest.id, event_type: 'wrong_person' }).then(() => {});

  const stamp = new Date().toLocaleDateString('he-IL');
  const line = message ? `${REPORT_PREFIX} (${stamp}): ${message}` : `${REPORT_PREFIX} (${stamp})`;
  // Append so an earlier couple-written note is never overwritten
  const notes = guest.notes?.trim() ? `${guest.notes.trim()}\n${line}` : line;

  const { error: updateError } = await supabase
    .from('guests')
    .update({ notes })
    .eq('rsvp_token', token);

  if (updateError) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  return NextResponse.json({ success: true });
}
