import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('event_id');
  if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });
  const sb = createServerClient();
  const { data, error } = await sb
    .from('wedding_vendors')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event_id, category, vendor_name, contact_name, phone, whatsapp, email,
    address, website, price_agreed, amount_paid, payment_due_date, payment_method,
    payment_status, notes } = body;

  if (!event_id || !category) return NextResponse.json({ error: 'event_id and category required' }, { status: 400 });

  const sb = createServerClient();
  const { data: vendor, error } = await sb
    .from('wedding_vendors')
    .insert({
      event_id, category, vendor_name: vendor_name || null,
      contact_name: contact_name || null, phone: phone || null,
      whatsapp: whatsapp || null, email: email || null,
      address: address || null, website: website || null,
      price_agreed: price_agreed || null, amount_paid: amount_paid ?? 0,
      payment_due_date: payment_due_date || null,
      payment_method: payment_method || null,
      payment_status: payment_status || 'unpaid',
      notes: notes || null, confirmed: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Integration: auto-create budget_item when price_agreed is set
  if (price_agreed && Number(price_agreed) > 0) {
    await sb.from('budget_items').insert({
      event_id,
      category,
      description: vendor_name || category,
      planned_amount: Number(price_agreed),
      actual_amount: amount_paid ? Number(amount_paid) : 0,
      notes: `ספק: ${vendor_name || category}`,
    });
  }

  // Integration: auto-create task when payment_due_date is set
  if (payment_due_date && vendor_name) {
    await sb.from('wedding_tasks').insert({
      event_id,
      title: `שלמו ל${vendor_name}`,
      category: 'vendors',
      due_date: payment_due_date,
      completed: false,
      is_default: false,
    });
  }

  return NextResponse.json(vendor, { status: 201 });
}
