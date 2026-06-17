import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ token: string }> };

const BUCKET = 'wedding-memories';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// GET — validate token, return event info for the upload page
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: vaultToken, error } = await supabase
    .from('vault_tokens')
    .select('event_id, events(name, date, address)')
    .eq('token', token)
    .single();

  if (error || !vaultToken) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const event = Array.isArray(vaultToken.events) ? vaultToken.events[0] : vaultToken.events;
  return NextResponse.json({
    event_id: vaultToken.event_id,
    event: { name: event?.name, date: event?.date, address: event?.address },
  });
}

// POST — upload a memory item
// Content-Type: multipart/form-data
// Fields: guest_name, type (photo|video|blessing), file? (for photo/video), blessing_text? (for blessing)
export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase = createServerClient();

  // Validate token
  const { data: vaultToken } = await supabase
    .from('vault_tokens')
    .select('event_id')
    .eq('token', token)
    .single();

  if (!vaultToken) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  const formData = await request.formData();
  const guest_name   = (formData.get('guest_name') as string)?.trim();
  const type         = formData.get('type') as string;
  const blessing_text = (formData.get('blessing_text') as string)?.trim() || null;
  const file         = formData.get('file') as File | null;

  if (!guest_name) return NextResponse.json({ error: 'guest_name required' }, { status: 400 });
  if (!['photo', 'video', 'blessing'].includes(type)) {
    return NextResponse.json({ error: 'type must be photo, video, or blessing' }, { status: 400 });
  }
  if (type === 'blessing' && !blessing_text) {
    return NextResponse.json({ error: 'blessing_text required for blessing type' }, { status: 400 });
  }
  if ((type === 'photo' || type === 'video') && !file) {
    return NextResponse.json({ error: 'file required for photo/video type' }, { status: 400 });
  }

  let storage_path: string | null = null;
  let public_url: string | null   = null;
  let file_size: number | null    = null;
  let mime_type: string | null    = null;

  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `קובץ גדול מדי — מקסימום 50MB` }, { status: 413 });
    }

    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `${vaultToken.event_id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false });

    if (uploadErr) {
      // If bucket doesn't exist, give a clear error
      if (uploadErr.message.includes('Bucket not found') || uploadErr.message.includes('bucket')) {
        return NextResponse.json({
          error: 'צור bucket בשם "wedding-memories" ב-Supabase Storage תחילה',
          detail: uploadErr.message,
        }, { status: 500 });
      }
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    storage_path = path;
    public_url   = urlData.publicUrl;
    file_size    = file.size;
    mime_type    = file.type;
  }

  const { data: item, error: insertErr } = await supabase
    .from('memory_items')
    .insert({
      event_id:     vaultToken.event_id,
      vault_token:  token,
      guest_name,
      type,
      storage_path,
      public_url,
      blessing_text,
      file_size,
      mime_type,
    })
    .select()
    .single();

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  return NextResponse.json({ id: item.id, public_url }, { status: 201 });
}
