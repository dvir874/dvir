import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { DEFAULT_THEME_ID } from '@/lib/themes';
import type { ParsedGuest } from '@/lib/guest-parser';

interface OnboardingBody {
  // Event details
  event_type?: string;
  name: string;
  date: string;
  venue_name?: string;
  address?: string;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
  theme?: string;
  rsvp_deadline?: string;
  // Guest list
  guests?: ParsedGuest[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as OnboardingBody;

  const {
    event_type, name, date, venue_name, address,
    client_name, client_phone, client_email, notes,
    theme, rsvp_deadline, guests = [],
  } = body;

  if (!name?.trim() || !date) {
    return NextResponse.json({ error: 'name and date are required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const eventStatus = guests.length > 0 ? 'guests_imported' : 'info_received';

  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: name.trim(),
      date,
      address: address?.trim() || null,
      theme: theme ?? DEFAULT_THEME_ID,
      status: eventStatus,
      event_type: event_type || null,
      venue_name: venue_name?.trim() || null,
      client_name: client_name?.trim() || null,
      client_phone: client_phone?.trim() || null,
      client_email: client_email?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select()
    .single();

  if (eventError || !event) {
    return NextResponse.json(
      { error: eventError?.message ?? 'Failed to create event' },
      { status: 500 },
    );
  }

  let importedCount = 0;
  let importError: string | null = null;

  if (guests.length > 0) {
    const rows = guests.map((g) => ({
      event_id: event.id,
      name: g.name.trim(),
      phone: g.phone?.trim() ?? '',
      guest_count: g.guest_count || 1,
      status: 'pending',
    }));

    const { data: imported, error: guestError } = await supabase
      .from('guests')
      .insert(rows)
      .select('id');

    if (guestError) {
      importError = guestError.message;
    } else {
      importedCount = imported?.length ?? 0;
    }
  }

  return NextResponse.json(
    {
      event_id: event.id,
      event_name: event.name,
      couple_token: event.couple_token,
      client_phone: event.client_phone,
      guest_count: importedCount,
      status: eventStatus,
      import_error: importError,
    },
    { status: 201 },
  );
}
