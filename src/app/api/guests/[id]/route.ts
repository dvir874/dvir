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
  const { status, guest_count, do_not_contact, do_not_contact_note } = body as {
    status?: GuestStatus;
    guest_count?: number;
    do_not_contact?: boolean;
    do_not_contact_note?: string | null;
  };

  const update: Record<string, unknown> = {};
  if (status !== undefined) {
    update.status = status;
    update.response_time =
      status !== 'pending' ? new Date().toISOString() : null;
  }
  if (guest_count !== undefined) update.guest_count = guest_count;

  /* "Do not message this person" — readable by the sender since the day it was
     added, writable by nobody.
   *
     The cron has always honoured it: a marked guest is dropped from every
     group, permanently, and the note explains why. But nothing could set it,
     so honouring a guest who asks to stop meant opening the SQL editor — and
     the realistic outcome of that is that nobody does it, and the automation
     keeps messaging someone who asked it not to. That is a promise broken to a
     guest and the fastest route back to the spam reports that restricted this
     number on 9/8 and stopped all three weddings for days.

     Clearing it also clears the note, so a guest brought back does not carry a
     stale reason forward. */
  if (do_not_contact !== undefined) {
    update.do_not_contact = do_not_contact;
    update.do_not_contact_at = do_not_contact ? new Date().toISOString() : null;
    update.do_not_contact_note = do_not_contact
      ? (do_not_contact_note?.trim() || 'סומן ידנית: לא לפנות')
      : null;
  }

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
