import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const sb = createServerClient();

  // Get or create album for this event
  let { data: album } = await sb
    .from('gallery_albums')
    .select('*')
    .eq('event_id', eventId)
    .single();

  if (!album) {
    // Get event name first
    const { data: event } = await sb.from('events').select('name').eq('id', eventId).single();
    const { data: created } = await sb.from('gallery_albums').insert({
      event_id:   eventId,
      event_name: event?.name ?? '',
      title:      'גלריית האירוע',
    }).select().single();
    album = created;
  }

  const { data: photos } = await sb
    .from('gallery_photos')
    .select('id,public_url,storage_path,uploader_name,is_video,file_size,created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ album, photos: photos ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const body = await req.json() as { action: string };
  const sb   = createServerClient();

  if (body.action === 'toggle_status') {
    const { data: album } = await sb.from('gallery_albums').select('status').eq('event_id', eventId).single();
    const newStatus = album?.status === 'open' ? 'closed' : 'open';
    await sb.from('gallery_albums').update({ status: newStatus }).eq('event_id', eventId);
    return NextResponse.json({ ok: true, status: newStatus });
  }

  /* Declaring the gallery ready — the switch that was missing.
   *
   * The post-wedding thank-you has had an approved template, a working cron and
   * three correct gates since before the first wedding. What it never had was a
   * way for anyone to say "the photos are up": gallery_ready could only be set
   * by hand in SQL, so the feature existed for whoever remembered it and for
   * nobody else — the same shape as every other failure this week, a mechanism
   * that works perfectly and that no one can reach.
   *
   * Setting it sends nothing. The cron still requires the date to have passed
   * and still messages only guests who wanted photos, so flipping this early is
   * harmless and flipping it twice sends nothing twice.
   *
   * Turning it back off also clears gallery_notified_at, because without that
   * an event switched off and on again stays closed for ever.
   *
   * Admin-side on purpose. The couple-facing control is a real screen and goes
   * through Stitch; this exists so the capability is reachable today rather
   * than after a design round, ten days before a wedding. */
  if (body.action === 'gallery_ready') {
    const ready = (body as { ready?: boolean }).ready !== false;
    const { error } = await sb.from('events')
      .update({ gallery_ready: ready, ...(ready ? {} : { gallery_notified_at: null }) })
      .eq('id', eventId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, gallery_ready: ready });
  }

  if (body.action === 'sync_event_name') {
    const { data: event } = await sb.from('events').select('name').eq('id', eventId).single();
    await sb.from('gallery_albums').update({ event_name: event?.name ?? '' }).eq('event_id', eventId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
