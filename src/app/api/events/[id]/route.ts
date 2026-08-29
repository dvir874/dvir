import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  const body = await req.json();
  const allowed = ['name', 'date', 'address', 'theme', 'bit_phone', 'notes', 'client_name', 'client_phone', 'client_email', 'venue_name', 'dress_code', 'parking_info', 'greeting', 'mood_palette', 'mood_style', 'mood_vision', 'partner1_name', 'partner2_name', 'payment_status', 'payment_amount', 'payment_date', 'rsvp_deadline', 'service_steps', 'event_timeline', 'mini_site_enabled', 'mini_site_hero_path', 'slug', 'send_paused_until', 'rides_group_url'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  /* send_paused_until is read straight into a comparison by the sender
     (api/cron/wa-send) — an unparseable value there is an event that is either
     skipped forever or sent when it was meant to be held back. It was added on
     14/08 for holding one wedding while another's invitations go out, and until
     now had no writer at all, so nothing had ever validated it. Only a real
     timestamp or null (= resume sending) gets through. */
  /* The rides group link, which the invitation template embeds.
   *
   * Validated rather than trusted, for the same reason send_paused_until is:
   * this value is pasted into a message that goes to every guest of a wedding,
   * and a typo is not a broken link on a screen somebody checks — it is 500
   * people tapping through to nothing. Only a real WhatsApp invite, or empty
   * to clear it. */
  if ('rides_group_url' in update) {
    const raw = update.rides_group_url;
    if (raw === null || raw === '') {
      update.rides_group_url = null;
    } else if (typeof raw === 'string'
               && /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,}$/.test(raw.trim())) {
      /* Shape is not enough. A link can be perfectly formed and lead nowhere,
       * and on 30/08 one did: a capital I read as a lowercase l off a
       * screenshot, saved, and put in front of 175 of שחר's guests before
       * anybody found out. The couple was told her group link had been reset.
       * It had not.
       *
       * WhatsApp answers an invite it recognises with the group's name in
       * og:title, and answers a dead one with that field empty. So the link is
       * asked whether it is real before it is stored — one request, once, at
       * the only moment it is cheap to be wrong. */
      const link = raw.trim();
      try {
        const probe = await fetch(link, {
          headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
          signal: AbortSignal.timeout(8_000),
        });
        const html = await probe.text();
        const title = html.match(/property="og:title" content="([^"]*)"/)?.[1] ?? '';
        if (!title.trim()) {
          return NextResponse.json({
            error: 'הקישור תקין בצורתו אבל וואטסאפ לא מזהה אותו כקבוצה. ' +
                   'בדקו שהועתק במלואו — אות אחת שונה מספיקה.',
          }, { status: 400 });
        }
      } catch {
        /* Reachability is WhatsApp's problem, not the couple's: a timeout must
           not block a link that is fine. Shape already passed. */
      }
      update.rides_group_url = link;
    } else {
      return NextResponse.json(
        { error: 'rides_group_url must be a https://chat.whatsapp.com/... invite link, or empty' },
        { status: 400 },
      );
    }
  }

  if ('send_paused_until' in update) {
    const raw = update.send_paused_until;
    if (raw === null || raw === '') {
      update.send_paused_until = null;
    } else if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw) && !Number.isNaN(Date.parse(raw))) {
      update.send_paused_until = new Date(raw).toISOString();
    } else {
      return NextResponse.json(
        { error: 'send_paused_until must be an ISO timestamp or null' },
        { status: 400 },
      );
    }
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.from('events').update(update).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  // Safety: require explicit confirmation header for destructive operations.
  // This prevents accidental deletions from tests, scripts, or curl commands.
  const confirmHeader = req.headers.get('x-delete-confirm');
  if (confirmHeader !== 'delete-event') {
    return NextResponse.json(
      {
        error: 'Missing delete confirmation header.',
        hint: "Set header: X-Delete-Confirm: delete-event",
      },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Get guest count before deletion (for response info)
  const { count: guestCount } = await supabase
    .from('guests')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id);

  // Cascade delete all related data in correct FK order
  const tables = [
    'seating_assignments',
    'seating_tables',
    'guest_activity',
    'guests',
    'wedding_vendor_contacts',
    'wedding_tasks',
    'budget_items',
    'budget_categories',
    'gift_items',
    'memory_items',
    'approval_requests',
    'referral_codes',
    'event_surveys',
    'vendor_recommendations',
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table as string).delete().eq('event_id', id);
    // Non-fatal: table may not exist or column may differ — log and continue
    if (error) console.warn(`[DELETE /api/events/${id}] ${table}: ${error.message}`);
  }

  // Finally delete the event itself
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true, guestCount: guestCount ?? 0 });
}
