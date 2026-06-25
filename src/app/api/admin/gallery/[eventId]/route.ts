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

  if (body.action === 'sync_event_name') {
    const { data: event } = await sb.from('events').select('name').eq('id', eventId).single();
    await sb.from('gallery_albums').update({ event_name: event?.name ?? '' }).eq('event_id', eventId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}
