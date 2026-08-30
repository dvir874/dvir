import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { checkPhone } from '@/lib/phone-il';
import { isPlausiblePhone } from '@/lib/phone-validate';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');
  if (!event_id)
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', event_id)
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  const { event_id, name, phone, guest_count } = body as {
    event_id?: string;
    name?: string;
    phone?: string;
    guest_count?: number;
  };

  if (!event_id || !name)
    return NextResponse.json({ error: 'event_id and name required' }, { status: 400 });

  /* The database stores the LOCAL form (05X…) — see phone-il.ts. This route
     used normalizePhone(), which converts the other way, so every guest added
     by hand from the admin landed as 972… while every imported guest landed as
     05…. Thirty-four rows were written that way before anyone noticed, and the
     webhook only found their replies because it happens to try both spellings.

     Validating here as well: a number that cannot be dialled is a guest who
     silently never hears from us, and the add screen is the one place where a
     typo can still be corrected by the person who made it. */
  const trimmed = phone?.trim() ?? '';
  let normalizedPhone = '';
  if (trimmed) {
    const chk = checkPhone(trimmed);
    if (chk.valid && chk.local) {
      normalizedPhone = chk.local;
    } else if (isPlausiblePhone(trimmed)) {
      /* Not Israeli, but reachable. סטיב ומריאן live abroad on +1 646 284 1932;
         checkPhone only knows Israeli prefixes and would call that a typo. This
         is the screen where a foreign guest actually gets typed in. */
      normalizedPhone = trimmed.replace(/\D/g, '');
    } else {
      return NextResponse.json(
        { error: `מספר הטלפון לא תקין — ${chk.reason ?? 'לא ניתן לחיוג'}` },
        { status: 422 },
      );
    }
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .insert({ event_id, name: name.trim().slice(0, 255), phone: normalizedPhone, guest_count: Math.max(1, Math.min(50, guest_count ?? 1)) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
