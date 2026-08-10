import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/admin/delivery?event_id=X
   One honest answer to "did every guest actually get it?".

   Three buckets, because they need different actions:
   - failed     → Meta rejected or blocked it; resend or fix the number
   - untracked  → sent before delivery tracking existed, or logging failed;
                  we genuinely do not know, and saying so beats guessing
   - unsent     → never queued at all (no phone, no token, or skipped) */

interface Msg {
  guest_id: string | null;
  wa_phone: string;
  status: string | null;
  error: string | null;
  created_at: string;
}

/* Meta's wording is opaque to a non-engineer; translate to something
   actionable, and say what to do about it. */
function explain(err: string | null): { he: string; action: string; retryable: boolean } {
  const e = (err ?? "").toLowerCase();
  if (e.includes("spam") || e.includes("rate limit"))
    return { he: "נחסם זמנית — קצב שליחה", action: "שלח שוב, יעבור", retryable: true };
  if (e.includes("healthy ecosystem"))
    return { he: "וואטסאפ חסם — הנמען ממעט להגיב להודעות עסקיות", action: "נסה שוב מאוחר יותר, או צור קשר בדרך אחרת", retryable: true };
  if (e.includes("undeliverable"))
    return { he: "המספר לא פעיל בוואטסאפ", action: "בדוק את המספר או התקשר", retryable: false };
  if (e.includes("experiment"))
    return { he: "ניסוי של מטא על המספר הזה", action: "נסה שוב מאוחר יותר", retryable: true };
  if (e.includes("invalid phone") || e.includes("not exist"))
    return { he: "מספר לא תקין", action: "תקן את המספר ברשימה", retryable: false };
  return { he: err ?? "כשל לא מזוהה", action: "נסה שוב", retryable: true };
}

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: guestRows } = await sb
    .from("guests")
    .select("id, name, phone, status, source_group, category, rsvp_token, opened_at")
    .eq("event_id", eventId);
  const guests = (guestRows ?? []).filter(g => g.category !== "demo");
  const byId = new Map(guests.map(g => [g.id, g]));

  /* Who was queued at all */
  const ids = guests.map(g => g.id);
  const sentIds = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", "invite_sent").in("guest_id", ids.slice(i, i + 100));
    (data ?? []).forEach(r => sentIds.add(r.guest_id));
  }

  /* Sends made by hand from a personal phone. They produce no wa_messages row
     at all, so without this they landed in "ללא נתוני מסירה" — the operator
     had just messaged them minutes earlier and the screen said it did not
     know. */
  const manualSent = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from("guest_events").select("guest_id")
      .eq("event_type", "manual_sent").in("guest_id", ids.slice(i, i + 100));
    (data ?? []).forEach(r => r.guest_id && manualSent.add(r.guest_id));
  }

  /* Delivery log — may not exist on older deployments */
  const { data: msgRows, error: msgErr } = await sb
    .from("wa_messages")
    .select("guest_id, wa_phone, status, error, created_at")
    .eq("event_id", eventId)
    .eq("direction", "out")
    .order("created_at", { ascending: false });

  const msgs = (msgErr ? [] : (msgRows ?? [])) as Msg[];

  /* Latest outbound row per guest is what counts */
  const latest = new Map<string, Msg>();
  for (const m of msgs) {
    if (m.guest_id && !latest.has(m.guest_id)) latest.set(m.guest_id, m);
  }

  const failed: unknown[] = [];
  const untracked: unknown[] = [];
  const unsent: unknown[] = [];
  const reachedNoLog: unknown[] = [];
  /* Per-guest, not just a tally: the guest table needs to show a state beside
     each name, and a count cannot do that. */
  const reached: unknown[] = [];
  const tally = { delivered: 0, read: 0, accepted: 0, sent: 0 };

  for (const g of guests) {
    const base = {
      id: g.id, name: g.name, phone: g.phone,
      group: g.source_group, rsvpStatus: g.status,
    };

    if (!sentIds.has(g.id)) {
      unsent.push({
        ...base,
        reason: !String(g.phone ?? "").trim() ? "אין טלפון"
              : !g.rsvp_token ? "אין קישור אישי"
              : "טרם נשלח",
      });
      continue;
    }

    /* Opening the personal link or answering IS proof of receipt, and it
       outranks a missing delivery log. Without this, guests who had already
       confirmed sat in "ללא נתוני מסירה" beside a "שלח שוב לכולם (212)" button
       — one click would have re-invited people who answered days ago and spent
       weeks of Meta quota doing it. */
    const answered = g.status !== "pending" || !!g.opened_at;
    const byHand = manualSent.has(g.id);

    const m = latest.get(g.id);
    if (!m) {
      (answered || byHand ? reachedNoLog : untracked).push({
        ...base,
        evidence: g.opened_at ? "פתח את הקישור"
                : g.status !== "pending" ? "השיב"
                : "נשלח ידנית מהטלפון",
      });
      continue;
    }

    if (m.status === "failed") {
      failed.push({ ...base, at: m.created_at, raw: m.error, ...explain(m.error) });
    } else {
      reached.push({ ...base, status: m.status, at: m.created_at });
      if (m.status === "read")            tally.read++;
      else if (m.status === "delivered")  tally.delivered++;
      else if (m.status === "sent")       tally.sent++;
      else                                tally.accepted++;
    }
  }

  return NextResponse.json({
    trackingAvailable: !msgErr,
    reachedNoLog, reached,
    totals: {
      guests: guests.length,
      queued: sentIds.size,
      ...tally,
      failed: failed.length,
      untracked: untracked.length,
      unsent: unsent.length,
    },
    failed, untracked, unsent,
  });
}
