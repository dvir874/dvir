import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/admin/coverage?event_id=…

   Answers one question, for every guest, with no averaging and no optimism:
   is there evidence this person actually received their invitation?

   It exists because "sent" was never the same thing as "arrived". Meta accepts
   a message, returns an id, and only tells us minutes later — through a
   webhook — that it was blocked. Counting accepted messages made a run look
   complete when 92% of it had silently failed.

   Every guest lands in exactly one bucket, and the only bucket that matters
   is `missing`: people with no evidence of delivery and no sign of life. That
   number is the one to drive to zero before a wedding. */

type Bucket = "arrived" | "engaged" | "unknown" | "failed" | "unsendable" | "not_sent";

interface Row {
  id: string; name: string; phone: string | null;
  bucket: Bucket; detail: string;
}

const DELIVERED = new Set(["delivered", "read", "sent"]);

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: guestRows, error: gErr } = await sb
    .from("guests")
    .select("id, name, phone, status, opened_at, category")
    .eq("event_id", eventId);
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const guests = (guestRows ?? []).filter(g => g.category !== "demo");
  const ids = guests.map(g => g.id);

  /* Chunked: PostgREST rejects .in() lists past roughly 390 ids. A silent
     failure here would report perfect coverage on a broken send, so an error
     must surface rather than shrink the evidence set. */
  const sentIds = new Set<string>();
  const messages: { guest_id: string; status: string; error: string | null }[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);

    const { data: ev, error: evErr } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", "invite_sent").in("guest_id", slice);
    if (evErr) return NextResponse.json({ error: evErr.message }, { status: 500 });
    (ev ?? []).forEach(r => sentIds.add(r.guest_id));

    const { data: wa, error: waErr } = await sb
      .from("wa_messages").select("guest_id, status, error")
      .eq("direction", "out").in("guest_id", slice);
    if (waErr) return NextResponse.json({ error: waErr.message }, { status: 500 });
    messages.push(...(wa ?? []).filter(m => m.guest_id));
  }

  const byGuest = new Map<string, typeof messages>();
  for (const m of messages) {
    const list = byGuest.get(m.guest_id) ?? [];
    list.push(m);
    byGuest.set(m.guest_id, list);
  }

  const rows: Row[] = guests.map(g => {
    const ms = byGuest.get(g.id) ?? [];

    if (!String(g.phone ?? "").trim())
      return { id: g.id, name: g.name, phone: g.phone, bucket: "unsendable", detail: "אין מספר טלפון" };

    if (ms.some(m => DELIVERED.has(m.status)))
      return { id: g.id, name: g.name, phone: g.phone, bucket: "arrived", detail: "אושרה מסירה" };

    /* Opening the link or answering proves arrival more firmly than any
       delivery report — the guest demonstrably has the message. */
    if (g.opened_at || g.status !== "pending")
      return { id: g.id, name: g.name, phone: g.phone, bucket: "engaged", detail: "פתח/ענה" };

    if (!sentIds.has(g.id))
      return { id: g.id, name: g.name, phone: g.phone, bucket: "not_sent", detail: "מעולם לא נשלח" };

    const failure = ms.find(m => m.status === "failed");
    if (failure)
      return { id: g.id, name: g.name, phone: g.phone, bucket: "failed", detail: failure.error ?? "נכשל" };

    return { id: g.id, name: g.name, phone: g.phone, bucket: "unknown", detail: "נשלח, אין אישור מסירה" };
  });

  const count = (b: Bucket) => rows.filter(r => r.bucket === b).length;

  /* failed + unknown + not_sent are treated identically on purpose. Re-sending
     to someone who already has the invitation is a small annoyance; failing to
     send is the thing this whole system exists to prevent. */
  const missing = rows.filter(r => r.bucket === "failed" || r.bucket === "unknown" || r.bucket === "not_sent");

  return NextResponse.json({
    total: rows.length,
    counts: {
      arrived: count("arrived"),
      engaged: count("engaged"),
      unknown: count("unknown"),
      failed: count("failed"),
      notSent: count("not_sent"),
      unsendable: count("unsendable"),
    },
    missingCount: missing.length,
    missing: missing.sort((a, b) => a.name.localeCompare(b.name, "he")),
    unsendable: rows.filter(r => r.bucket === "unsendable"),
  });
}
