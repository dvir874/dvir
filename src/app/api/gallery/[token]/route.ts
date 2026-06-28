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

  const { data: album } = await sb
    .from('gallery_albums')
    .select('id, title, event_name, status, photo_count, event_id')
    .eq('public_token', token)
    .single();

  if (!album) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: photos } = await sb
    .from('gallery_photos')
    .select('id, public_url, mime_type, is_video, uploader_name, uploaded_at')
    .eq('album_id', album.id)
    .order('uploaded_at', { ascending: false });

  return NextResponse.json({ album, photos: photos ?? [] });
}
