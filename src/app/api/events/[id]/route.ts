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
      update.rides_group_url = raw.trim();
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
