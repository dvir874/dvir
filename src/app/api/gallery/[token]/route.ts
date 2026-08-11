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
  /* Either token opens this route, and which one matters.

     is_public has existed all along, the API selected it, and nothing ever
     checked it — the live album is marked private and served its photos to
     anyone holding the token anyway. A flag that describes an intention nobody
     enforces is worse than no flag: it reads as a protection that is not there.

     Enforcing it alone would have locked the couple out as well, because there
     was only one token. So the couple has their own, and it is the only link
     that should ever be sent to them.

     This matters more today than it did yesterday: guests are no longer sent
     to the gallery at all — they get /memory, to upload — which makes the
     viewing gallery the couple's private space rather than a shared one. */
  const { data: album } = await sb
    .from('gallery_albums')
    .select('id, title, photo_count, event_id, is_public, owner_token, public_token')
    .or(`public_token.eq.${token},owner_token.eq.${token}`)
    .maybeSingle();

  const isOwner = !!album && album.owner_token === token;

  /* A private album opened with the guest link is refused — and refused as
     "not found", not "forbidden". Confirming that a token is real but
     restricted tells a stranger they have found something worth pursuing. */
  if (album && !isOwner && album.is_public === false) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

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
