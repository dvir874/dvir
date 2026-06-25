import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getEventId(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

// GET — list all vendors for this event
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("wedding_vendors")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — create vendor (with budget + task integration)
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const { category, vendor_name, contact_name, phone, whatsapp, email,
    address, website, price_agreed, amount_paid, payment_due_date,
    payment_method, payment_status, notes } = body;

  if (!category) return NextResponse.json({ error: "category required" }, { status: 400 });

  const sb = createServerClient();
  const { data: vendor, error } = await sb
    .from("wedding_vendors")
    .insert({
      event_id: eventId, category,
      vendor_name: vendor_name || null, contact_name: contact_name || null,
      phone: phone || null, whatsapp: whatsapp || null, email: email || null,
      address: address || null, website: website || null,
      price_agreed: price_agreed || null, amount_paid: amount_paid ?? 0,
      payment_due_date: payment_due_date || null, payment_method: payment_method || null,
      payment_status: payment_status || "unpaid",
      notes: notes || null, confirmed: false,
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Integration: auto-create budget_item
  if (price_agreed && Number(price_agreed) > 0) {
    await sb.from("budget_items").insert({
      event_id: eventId, category,
      description: vendor_name || category,
      planned_amount: Number(price_agreed),
      actual_amount: amount_paid ? Number(amount_paid) : 0,
      notes: `ספק: ${vendor_name || category}`,
    });
  }

  // Integration: auto-create task when payment_due_date is set
  if (payment_due_date && vendor_name) {
    await sb.from("wedding_tasks").insert({
      event_id: eventId,
      title: `שלמו ל${vendor_name}`,
      category: "vendors",
      due_date: payment_due_date,
      completed: false, is_default: false,
    });
  }

  return NextResponse.json(vendor, { status: 201 });
}

// PATCH — update vendor
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("wedding_vendors")
    .update(updates)
    .eq("id", id)
    .eq("event_id", eventId)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove vendor
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from("wedding_vendors").delete().eq("id", id).eq("event_id", eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
