import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { syncToGoogleSheets } from '@/lib/sheets';
import { requireAdmin } from '@/lib/auth-guard';
import type { GuestStatus } from '@/lib/types';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const { status, guest_count } = body as {
    status?: GuestStatus;
    guest_count?: number;
  };

  const update: Record<string, unknown> = {};
  if (status !== undefined) {
    update.status = status;
    update.response_time =
      status !== 'pending' ? new Date().toISOString() : null;
  }
  if (guest_count !== undefined) update.guest_count = guest_count;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error || !data)
    return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 500 });

  // Sync sheets in background — don't await to keep response fast
  supabase
    .from('guests')
    .select('*')
    .eq('event_id', data.event_id)
    .then(({ data: all }) => {
      if (all) syncToGoogleSheets(all).catch(console.error);
    });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;

  const confirmHeader = request.headers.get('x-delete-confirm');
  if (confirmHeader !== 'delete-guest') {
    return NextResponse.json(
      { error: 'Missing delete confirmation header.', hint: 'Set header: X-Delete-Confirm: delete-guest' },
      { status: 400 }
    );
  }

  const supabase = createServerClient();
  const { error } = await supabase.from('guests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
