import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { policyFor } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/* GET /api/admin/delivery?event_id=X
   One honest answer to "did every guest actually get it?".

   Three buckets, because they need different actions:
   - failed     → Meta rejected or blocked it; resend or fix the number
   - untracked  → sent before delivery tracking existed, or logging failed;
                  we genuinely do not know, and saying so beats guessing
   - unsent     → never queued at all (no phone, no token, or skipped) */

interface Msg {
  retry_after?: string | null;
  retry_count?: number | null;
  /* Optional like the retry columns above: it arrived by migration, so rows
     written before it exist with error_code null and only Meta's text. */
  error_code?: number | null;
  guest_id: string | null;
  wa_phone: string;
  status: string | null;
  error: string | null;
  created_at: string;
}

/* Meta's wording is opaque to a non-engineer; translate to something
   actionable, and say what to do about it.

   Whether a failure may be retried is deliberately NOT decided here. This
   function reads the error TEXT, and text cannot see 131050 — the guest
   pressed "stop receiving messages". That code has no phrase in common with
   anything below, so it fell through to the default and came back retryable:
   the "שלח שוב לכל הניתנים" button would have messaged people who had asked us
   to stop. policyFor has always called 131050 "never"; this screen simply
   never asked it. It does now, at the one place the answer is used. */
function explain(code: number | null | undefined, err: string | null): { he: string; action: string } {
  /* Only the numeric code identifies an opt-out — there is nothing to match
     on in the text. */
  if (code === 131050)
    return { he: "הנמען ביקש להפסיק לקבל הודעות", action: "אין לשלוח שוב — פנה אליו בטלפון" };

  const e = (err ?? "").toLowerCase();
  if (e.includes("spam") || e.includes("rate limit"))
    return { he: "נחסם זמנית — קצב שליחה", action: "שלח שוב, יעבור" };
  if (e.includes("healthy ecosystem"))
    return { he: "וואטסאפ חסם — הנמען ממעט להגיב להודעות עסקיות", action: "נסה שוב מאוחר יותר, או צור קשר בדרך אחרת" };
  if (e.includes("undeliverable"))
    return { he: "המספר לא פעיל בוואטסאפ", action: "בדוק את המספר או התקשר" };
  if (e.includes("experiment"))
    return { he: "ניסוי של מטא על המספר הזה", action: "נסה שוב מאוחר יותר" };
  if (e.includes("invalid phone") || e.includes("not exist"))
    return { he: "מספר לא תקין", action: "תקן את המספר ברשימה" };
  return { he: err ?? "כשל לא מזוהה", action: "נסה שוב" };
}

/* May "שלח שוב לכל הניתנים" include this guest?
 *
 * Not the same question as "does this failure go on the automatic retry
 * timer", which is what action === "retry_later" answers. Two of the four
 * actions are refusals about the GUEST and must exclude them here:
 *   never             131026 has no WhatsApp, 131050 asked us to stop
 *   wait_for_inbound  130472 — a template cannot reach them on any timer
 *
 * stop_run is not one of them. 131048 is a restriction on OUR number — the run
 * had to stop, but the guest is reachable the moment it lifts, and that is
 * precisely what this button is for. Reading it as "not retryable" would have
 * dropped the 22 guests one blocked run produced out of the only bulk resend
 * they have, and — because /admin reads the same flag — filed them under
 * "📵 אין וואטסאפ — להתקשר", which is not true of a single one of them.
 */
function mayResend(code: number | null | undefined, err: string | null): boolean {
  const { action } = policyFor(code, err);
  return action === "retry_later" || action === "stop_run";
}

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: guestRows, error: gErr } = await sb
    .from("guests")
    .select("id, name, phone, status, source_group, category, rsvp_token, opened_at")
    .eq("event_id", eventId);
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const guests = (guestRows ?? []).filter(g => g.category !== "demo");
  const byId = new Map(guests.map(g => [g.id, g]));

  /* Who was queued at all.

     A dropped chunk here is indistinguishable from an honest empty answer, and
     it fails in the one direction that costs real messages: every guest it
     covered misses the invite_sent mark, lands in "לא נשלחו כלל" before the
     answered check can save them, and appears under a "שלח לכולם" button. One
     tap on a momentary Supabase hiccup re-invites the whole list and spends
     days of the number's quota. Saying "לא הצלחתי לקרוא" is the only honest
     answer we have — same rule as the coverage route. */
  const ids = guests.map(g => g.id);
  const sentIds = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", "invite_sent").in("guest_id", ids.slice(i, i + 100));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    (data ?? []).forEach(r => sentIds.add(r.guest_id));
  }

  /* Sends made by hand from a personal phone. They produce no wa_messages row
     at all, so without this they landed in "ללא נתוני מסירה" — the operator
     had just messaged them minutes earlier and the screen said it did not
     know. */
  const manualSent = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await sb.from("guest_events").select("guest_id")
      .eq("event_type", "manual_sent").in("guest_id", ids.slice(i, i + 100));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    (data ?? []).forEach(r => r.guest_id && manualSent.add(r.guest_id));
  }

  /* Delivery log — may not exist on older deployments */
  const { data: msgRows, error: msgErr } = await sb
    .from("wa_messages")
    .select("guest_id, wa_phone, status, error, error_code, created_at, retry_after, retry_count")
    .eq("event_id", eventId)
    .eq("direction", "out")
    .order("created_at", { ascending: false });

  const msgs = (msgErr ? [] : (msgRows ?? [])) as Msg[];

  /* Latest outbound row per guest is what counts */
  const latest = new Map<string, Msg>();
  for (const m of msgs) {
    if (m.guest_id && !latest.has(m.guest_id)) latest.set(m.guest_id, m);
  }

  /* Anyone Meta ever confirmed delivering to, whatever happened afterwards.

     "Latest row wins" is the right rule for what to try NEXT and the wrong one
     for whether a guest HAS the invitation. Rina got two messages in the same
     second on 11/8 — one delivered, one refused with 131049 because she had
     just received the first. Both carry the same timestamp, so which one counts
     as "latest" is decided by sort order, and the screen showed her as "נכשל —
     האורח לא קיבל" beside a resend button. She was holding the invitation.

     A failed retry is a failed retry. It cannot un-deliver a message that
     WhatsApp already put on someone's phone. */
  const everDelivered = new Set(
    msgs.filter(m => m.guest_id && ["delivered", "read"].includes(m.status ?? ""))
        .map(m => m.guest_id as string),
  );

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
      /* Answering outranks a failed send, exactly as it outranks a missing
         delivery log above — and this branch was the one place that forgot it.
         The check existed but only ran when there was NO message at all, so a
         guest whose WhatsApp failed and who then received the invitation some
         other way and CONFIRMED still appeared under "נכשלו — האורח לא קיבל".
         Zohar Nachmias sat there while her status read confirmed.

         The failure is real; it is simply no longer the story. A screen that
         describes what the system attempted rather than what actually happened
         is the failure this whole product spent a day removing. */
      if (answered || byHand || everDelivered.has(g.id)) {
        reachedNoLog.push({
          ...base,
          evidence: g.status !== "pending" ? "השיב למרות שהשליחה נכשלה"
                  : g.opened_at ? "פתח את הקישור למרות שהשליחה נכשלה"
                  : everDelivered.has(g.id) ? "ההזמנה נמסרה — הכישלון הוא של ניסיון חוזר"
                  : "נשלח ידנית מהטלפון",
        });
        continue;
      }

      /* A failure whose retries are spent still belongs on this screen —
         arguably more than one that will be tried again. It used to fall out of
         every timer-driven query and appear nowhere, so the guest simply
         stopped existing as a problem while still never having received
         anything. */
      failed.push({
        ...base, at: m.created_at, raw: m.error, ...explain(m.error_code, m.error),
        /* The screen's bulk resend sends every row it marks retryable, and
           /api/admin/whatsapp/send does not re-check the policy when it is
           handed explicit guest_ids — so this flag is the last gate before a
           real message. It must come from the same place the send runs use. */
        retryable: mayResend(m.error_code, m.error),
        exhausted: !m.retry_after && (m.retry_count ?? 0) > 0,
      });
    } else {
      /* Meta accepting a message is the weakest evidence there is, and it
         never expires on its own. Avia's row has sat at "accepted" for 55
         hours: the delivery webhook never arrived and never will. Meanwhile
         she was messaged by hand and OPENED HER INVITATION — and the screen
         still described her as "בדרך", because it read the message and ignored
         the guest.

         Opening the link is proof the invitation arrived. It outranks any
         status Meta did or did not report, so it is reported instead. */
      const weak = m.status === "accepted" || m.status === "sent";
      if (weak && (answered || byHand)) {
        reachedNoLog.push({
          ...base,
          evidence: g.status !== "pending" ? "השיב"
                  : g.opened_at ? "פתח את הקישור"
                  : "נשלח ידנית מהטלפון",
        });
        continue;
      }

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
