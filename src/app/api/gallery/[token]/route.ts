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

  return NextResponse.json({ album });
}
