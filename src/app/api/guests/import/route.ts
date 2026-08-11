import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { parseGuestsFromXlsx } from '@/lib/xlsx-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { checkPhone } from '@/lib/phone-il';

/* Guest list import.

   Two failures seen in production drove this rewrite:
   - The same person arrived twice, as 0534793515 and 972534793515, and got
     two invitations with two different links. Numbers are now canonicalised
     before anything else happens.
   - Bad rows were silently dropped, so the count looked right while guests
     were missing. Every rejected row now comes back with a reason.

   `dryRun` returns the full report without writing, so the operator can look
   before importing 550 people into a live event. */

interface Row { name: string; phone: string; guest_count: number }
interface Reject { row: number; name: string; phone: string; reason: string }

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const event_id = formData.get('event_id') as string | null;
  const source_group = (formData.get('source_group') as string | null) || null;
  const dryRun = formData.get('dry_run') === '1';

  if (!file || !event_id)
    return NextResponse.json({ error: 'file and event_id are required' }, { status: 400 });

  let parsed: Row[];
  try {
    parsed = parseGuestsFromXlsx(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: 'לא הצלחנו לקרוא את הקובץ. ודאו שהוא אקסל או CSV תקין.' },
      { status: 422 },
    );
  }

  if (!parsed.length)
    return NextResponse.json(
      { error: 'לא נמצאו שורות. ודאו שיש עמודות: שם, טלפון, כמות אורחים' },
      { status: 422 },
    );

  if (parsed.length > 1500)
    return NextResponse.json({ error: 'מקסימום 1500 אורחים בייבוא אחד' }, { status: 422 });

  const supabase = createServerClient();

  /* Compare against everyone already on this event, canonicalised the same
     way, so re-importing an updated spreadsheet adds only what is new. */
  const { data: existingRows } = await supabase
    .from('guests').select('name, phone').eq('event_id', event_id);
  const existing = new Map<string, string>();
  for (const g of existingRows ?? []) {
    const p = checkPhone(g.phone).local;
    if (p) existing.set(p, g.name);
  }

  const accepted: { name: string; phone: string; guest_count: number }[] = [];
  const rejected: Reject[] = [];
  const seen = new Map<string, string>();          // within this file

  parsed.forEach((g, i) => {
    const row = i + 2;                              // +1 header, +1 to 1-index
    const name = String(g.name ?? '').trim().slice(0, 255);
    const rawPhone = String(g.phone ?? '').trim();

    if (!name) {
      rejected.push({ row, name: '(ריק)', phone: rawPhone, reason: 'חסר שם' });
      return;
    }

    const chk = checkPhone(rawPhone);
    if (!chk.valid || !chk.local) {
      rejected.push({ row, name, phone: rawPhone, reason: chk.reason ?? 'טלפון לא תקין' });
      return;
    }

    const dupInFile = seen.get(chk.local);
    if (dupInFile) {
      rejected.push({ row, name, phone: chk.local, reason: `כפילות בקובץ — כבר מופיע כ"${dupInFile}"` });
      return;
    }

    const dupInEvent = existing.get(chk.local);
    if (dupInEvent) {
      rejected.push({ row, name, phone: chk.local, reason: `כבר קיים ברשימה כ"${dupInEvent}"` });
      return;
    }

    seen.set(chk.local, name);
    accepted.push({
      name,
      phone: chk.local,
      guest_count: Math.max(1, Math.min(50, Math.floor(Number(g.guest_count) || 1))),
    });
  });

  const report = {
    rowsInFile: parsed.length,
    toImport: accepted.length,
    rejectedCount: rejected.length,
    rejected: rejected.slice(0, 100),
    preview: accepted.slice(0, 8),
  };

  if (dryRun) return NextResponse.json({ dryRun: true, ...report });

  if (!accepted.length)
    return NextResponse.json({ error: 'אין שורות תקינות לייבוא', ...report }, { status: 422 });

  /* Chunked insert — one oversized statement is the difference between
     importing 550 guests and importing none of them. */
  let imported = 0;
  for (let i = 0; i < accepted.length; i += 200) {
    const { data, error } = await supabase
      .from('guests')
      .insert(accepted.slice(i, i + 200).map(g => ({
        ...g, event_id, status: 'pending',
        ...(source_group ? { source_group } : {}),
      })))
      .select('id');
    if (error) {
      return NextResponse.json(
        { error: error.message, imported, ...report },
        { status: 500 },
      );
    }
    imported += data?.length ?? 0;
  }

  return NextResponse.json({ imported, ...report });
}
