import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET — fetch album info (for guest page)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createServerClient();

  /* Only columns that actually exist on gallery_albums. Selecting event_name
     and status — which do not — made PostgREST error, so every gallery in
     production answered "not found" no matter how valid its token was. */
  const { data: album } = await sb
    .from('gallery_albums')
    .select('id, title, photo_count, event_id, is_public')
    .eq('public_token', token)
    .single();

  /* The couple's names live on the event, not the album */
  let eventName: string | null = null;
  if (album?.event_id) {
    const { data: ev } = await sb
      .from('events').select('name').eq('id', album.event_id).maybeSingle();
    eventName = ev?.name ?? null;
  }

  if (!album) return NextResponse.json({ error: 'not found' }, { status: 404 });

  /* The upload timestamp column is created_at. Asking for uploaded_at made
     PostgREST reject the whole query, so an album could report photo_count 1
     and still hand the guests an empty gallery. */
  const { data: photos, error: photosErr } = await sb
    .from('gallery_photos')
    .select('id, public_url, mime_type, is_video, uploader_name, created_at')
    .eq('album_id', album.id)
    .order('created_at', { ascending: false });

  /* Never answer 200-with-nothing when the read failed — an empty gallery and
     a broken gallery look identical to a couple, and only one is fixable. */
  if (photosErr)
    return NextResponse.json({ error: photosErr.message }, { status: 500 });

  return NextResponse.json({ album: { ...album, event_name: eventName }, photos: photos ?? [] });
}
