import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createServerClient();

  // Verify album exists and is open
  const { data: album } = await sb
    .from('gallery_albums')
    .select('id, status, event_id, photo_count')
    .eq('public_token', token)
    .single();

  if (!album) return NextResponse.json({ error: 'album not found' }, { status: 404 });
  if (album.status === 'closed') return NextResponse.json({ error: 'album closed' }, { status: 403 });

  const formData   = await req.formData();
  const file       = formData.get('file') as File | null;
  const uploaderName = (formData.get('uploader_name') as string | null)?.trim() || 'אורח';

  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

  const isVideo    = file.type.startsWith('video/');
  const ext        = file.name.split('.').pop() ?? (isVideo ? 'mp4' : 'jpg');
  const path       = `${album.event_id}/${album.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bytes      = await file.arrayBuffer();

  const { error: storageErr } = await sb.storage.from('gallery').upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (storageErr) {
    console.error('[gallery upload]', storageErr.message);
    return NextResponse.json({ error: storageErr.message }, { status: 500 });
  }

  // Get signed URL (valid 10 years — for admin view)
  const { data: signed } = await sb.storage.from('gallery').createSignedUrl(path, 315_360_000);

  const { error: dbErr } = await sb.from('gallery_photos').insert({
    album_id:      album.id,
    event_id:      album.event_id,
    storage_path:  path,
    public_url:    signed?.signedUrl ?? null,
    uploader_name: uploaderName,
    file_size:     file.size,
    mime_type:     file.type,
    is_video:      isVideo,
    uploaded_by:   'guest',
  });

  if (dbErr) {
    console.error('[gallery db]', dbErr.message);
    return NextResponse.json({ error: dbErr.message }, { status: 500 });
  }

  // Increment photo_count
  await sb
    .from('gallery_albums')
    .update({ photo_count: album.photo_count + 1 })
    .eq('id', album.id);

  return NextResponse.json({ ok: true, path });
}
