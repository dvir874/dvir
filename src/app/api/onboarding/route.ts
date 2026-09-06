import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limit';
import { DEFAULT_THEME_ID } from '@/lib/themes';
import type { ParsedGuest } from '@/lib/guest-parser';
import { getWhatsAppConfig, sendRunSummary } from "@/lib/whatsapp";

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
  /* Public, unauthenticated, and creating events and guests with the service
     role. Nothing stood between a script and an unbounded number of rows. */
  const rl = checkRateLimit(getClientIp(request), 'onboarding',
                            LIMITS.onboarding.max, LIMITS.onboarding.windowMs);
  if (!rl.ok) {
    return NextResponse.json({ error: 'יותר מדי בקשות. נסו שוב בעוד דקה.' }, { status: 429 });
  }

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

  /* A couple who signed themselves up, and nobody knew.
   *
   * /start is a finished funnel — 965 lines: event type, date, venue, their
   * details, a theme, and a guest list imported with the same parser the admin
   * uses. It creates a real event and real guest rows. And then it told
   * nobody: no alert, no ntfy, nothing. A couple could complete the whole
   * thing at midnight and Dvir would find them days later, if he happened to
   * scroll far enough.
   *
   * This is the one funnel where the customer has already done the work, and
   * it was the quietest path in the system. With the couple's own link, so the
   * first thing he can do is look at what they built. */
  (async () => {
    const to = process.env.ADMIN_ALERT_PHONE;
    const cfg = getWhatsAppConfig();
    if (!to || !cfg) return;
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app";
    const phone = String(event.client_phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
    try {
      await sendRunSummary(cfg, to, {
        event: "✨ זוג נרשם לבד",
        sent: String(importedCount ?? 0), failed: "—", left: "—",
        attention: `${String(event.name ?? "")} · ${String(event.client_phone ?? "")}`
          + ` · ${importedCount ?? 0} אורחים כבר יובאו`
          + (importError ? ` · ⚠️ ${String(importError).slice(0, 60)}` : "")
          + ` · הדף שלהם: ${base}/couple/${event.couple_token}`
          + (phone ? ` · לדבר איתם: https://wa.me/${phone}` : ""),
      });
    } catch { /* the event is created either way */ }
  })();

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
