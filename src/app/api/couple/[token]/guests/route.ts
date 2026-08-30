import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkPhone } from "@/lib/phone-il";

export const dynamic = "force-dynamic";

async function getEventId(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const sb = createServerClient();
  /* Demo rows are excluded everywhere else — the sender, every count, every
     report, the admin lists — because a demo guest is a preview with nobody
     behind it. This route was the one place that still returned them, and it
     is the client's own screen: a couple opening their dashboard would find a
     stranger in their guest list and have no way to know it was not real.
     A preview link that lives on their event must be invisible to them. */
  const { data, error } = await sb
    .from("guests")
    .select("*")
    .eq("event_id", eventId)
    .neq("category", "demo")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  /* The couple can now fix the fields that actually go wrong in an imported
     list. Previously only side and notes were writable, so a couple looking at
     "3 guests without a phone" on their own dashboard had no way to add one —
     and no way to delete a duplicate either. With 550 imported rows that is not
     a missing feature, it is a missing basic. */
  const body = await req.json();
  const { id, side, notes, name, phone, guest_count } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (side !== undefined) patch.side = side;
  if (notes !== undefined) patch.notes = notes;
  if (typeof name === "string" && name.trim()) patch.name = name.trim().slice(0, 255);
  if (guest_count !== undefined)
    patch.guest_count = Math.max(1, Math.min(50, Math.floor(Number(guest_count) || 1)));

  if (phone !== undefined) {
    /* Canonicalised on the way in, exactly as the importer does — otherwise a
       couple typing 972… creates the same duplicate the importer was fixed to
       prevent. */
    const chk = checkPhone(phone);
    if (!chk.valid)
      return NextResponse.json({ error: chk.reason ?? "מספר טלפון לא תקין" }, { status: 400 });

    const sbDup = createServerClient();
    const { data: clash } = await sbDup.from("guests")
      .select("id, name").eq("event_id", eventId).eq("phone", chk.local).neq("id", id).maybeSingle();
    if (clash)
      return NextResponse.json(
        { error: `המספר כבר משויך ל"${clash.name}"` }, { status: 409 });

    patch.phone = chk.local;
  }

  if (!Object.keys(patch).length)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("guests").update(patch)
    .eq("id", id).eq("event_id", eventId)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/* DELETE — remove a guest the couple no longer wants on the list.
   Scoped by event_id so a token can only ever reach its own guests, and it
   refuses anyone who has already answered: deleting a confirmed guest silently
   changes the headcount the caterer was given. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const id = req.nextUrl.searchParams.get("id");
  const force = req.nextUrl.searchParams.get("force") === "1";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createServerClient();
  const { data: guest } = await sb.from("guests")
    .select("id, name, status").eq("id", id).eq("event_id", eventId).maybeSingle();
  if (!guest) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (guest.status !== "pending" && !force)
    return NextResponse.json(
      { error: "guest_answered",
        hint: `${guest.name} כבר ענה/תה. מחיקה תשנה את מספר המגיעים.` },
      { status: 409 });

  for (const t of ["wa_messages", "guest_events", "seating_assignments"]) {
    await sb.from(t).delete().eq("guest_id", id);
  }
  const { error } = await sb.from("guests").delete().eq("id", id).eq("event_id", eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: guest.name });
}
