import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { eventTimes } from "@/lib/event-times";
import {
  getWhatsAppConfig, sendInvitation, toE164,
  SAFE_DAILY_LIMIT, SECONDS_PER_MESSAGE, rollingWindowUsage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* POST /api/admin/whatsapp/send  { event_id, guest_ids?: string[] }

   Sends the approved RSVP invitation template to the given guests (or to every
   eligible guest of the event when guest_ids is omitted). Each guest gets their
   own rsvp_token in the template's URL button, so one approved template serves
   all 300 invitations.

   Safety properties:
   - Guests already marked invite_sent are skipped, so a re-run never
     double-messages anyone.
   - Guests with no phone or no token are skipped and reported, never guessed.
   - Demo guests are excluded.
   - Marking as sent happens only after Meta accepts the message.
   - If WhatsApp env is absent the route reports disabled and changes nothing,
     leaving the manual wa.me flow untouched. */

const EVENT_TYPE = "invite_sent";
/* Sends are paced inside src/lib/whatsapp.ts (≥900ms apart) and retried on
   throttling, so parallelism here only controls how many are in flight while
   waiting on the network. Two is enough and keeps the queue orderly. */
const CONCURRENCY = 2;

export async function POST(req: NextRequest) {
  const cfg = getWhatsAppConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "whatsapp_not_configured", hint: "set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const eventId: string = body?.event_id ?? "";
  const requested: string[] | null = Array.isArray(body?.guest_ids) ? body.guest_ids : null;
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  /* Each event carries its own invitation card and its own wording. */
  const { data: eventRow } = await sb
    .from("events")
    .select("name, date, address, reception_time, chuppah_time, wa_header_image_url")
    .eq("id", eventId).maybeSingle();
  /* No global fallback. WHATSAPP_HEADER_IMAGE_URL holds ONE couple's invitation
     card, so falling back to it means the next client's 550 guests receive Dvir
     and Mirav's invitation — and a sent WhatsApp message cannot be recalled.
     Refusing to send is the correct failure. */
  const headerImage: string = eventRow?.wa_header_image_url ?? "";
  if (!headerImage) {
    return NextResponse.json(
      { error: "missing_invitation_image",
        hint: "לא הוגדרה תמונת הזמנה לאירוע — הגדירו אותה לפני שליחה" },
      { status: 400 },
    );
  }

  const { data: allGuests } = await sb
    .from("guests")
    .select("id, name, phone, rsvp_token, category")
    .eq("event_id", eventId);

  let guests = (allGuests ?? []).filter(g => g.category !== "demo");
  if (requested) {
    const want = new Set(requested);
    guests = guests.filter(g => want.has(g.id));
  }

  /* Never message anyone twice — but "twice" has to mean they actually got it
     once. Skipping on guest_events.invite_sent alone made this route refuse to
     send to ANYONE on this event: every guest carries that row from the
     pre-tracking era, when invitations went out as wa.me links with no delivery
     reporting. The button offering to invite 111 guests would have reported
     "נשלחו 0 · דולגו 111".

     Evidence of receipt is what counts:
       delivered / read   — Meta confirmed it arrived
       manual_sent        — a human sent it from their own phone, recorded
       answered or opened — the guest demonstrably has the link

     Chunked because PostgREST rejects .in() lists past roughly 390 ids (the
     16KB header limit): at 550 guests the unchunked query failed outright,
     `already` stayed empty, and every guest would have been invited twice.
     A failure here must abort, never silently proceed. */
  const ids = guests.map(g => g.id);
  const already = new Set<string>();

  const { data: statusRows } = await sb.from("guests")
    .select("id, status, opened_at").eq("event_id", eventId);
  (statusRows ?? []).forEach(g => {
    if (g.status !== "pending" || g.opened_at) already.add(g.id);
  });

  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);

    const { data: manualRows, error: sentErr } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", "manual_sent").in("guest_id", slice);
    if (sentErr) {
      return NextResponse.json(
        { error: "dedupe_check_failed",
          hint: "לא ניתן לוודא מי כבר קיבל — השליחה נעצרה כדי למנוע כפילויות" },
        { status: 503 },
      );
    }
    (manualRows ?? []).forEach(r => already.add(r.guest_id));

    const { data: msgRows, error: msgErr } = await sb
      .from("wa_messages").select("guest_id, status")
      .eq("direction", "out").in("guest_id", slice);
    if (msgErr) {
      return NextResponse.json(
        { error: "dedupe_check_failed",
          hint: "לא ניתן לוודא מי כבר קיבל — השליחה נעצרה כדי למנוע כפילויות" },
        { status: 503 },
      );
    }
    (msgRows ?? []).forEach(m => {
      if (m.guest_id && ["delivered", "read"].includes(m.status)) already.add(m.guest_id);
    });
  }

  const skipped: { name: string; reason: string }[] = [];
  const queue = guests.filter(g => {
    if (already.has(g.id)) { skipped.push({ name: g.name, reason: "כבר קיבל" }); return false; }
    if (!String(g.phone ?? "").trim()) { skipped.push({ name: g.name, reason: "אין טלפון" }); return false; }
    if (!g.rsvp_token) { skipped.push({ name: g.name, reason: "אין קישור" }); return false; }
    return true;
  });

  /* Dvir's own wedding keeps its bespoke approved template, whose names and
     date are part of the approved text. Every other event uses the generic
     template and supplies its details as variables. */
  const isOwnWedding = eventId === "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";
  const details = isOwnWedding ? undefined : {
    couple: eventRow?.name ?? "",
    date: eventRow?.date
      ? new Date(eventRow.date).toLocaleDateString("he-IL",
          { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "",
    venue: eventRow?.address ?? "",
    /* The times come from the event, not from a constant.
     *
     * This line read "קבלת פנים 19:00 | חופה וקידושין 20:00" — written when
     * there was one wedding, and left behind when the template was made
     * generic. Three of the four variables were wired to the event and this one
     * was not, so every client would have had Dvir's schedule sent out under
     * their own names. אורי ✧ שחר receive at 17:30 and stand under the chuppah
     * at 18:15, deliberately before sunset; 327 households would have been told
     * 19:00 and 20:00, and some would have arrived after the chuppah. */
    times: eventTimes(eventRow) ?? "",
  };
  /* times joins the same gate. A missing image already refuses rather than
     falling back to another couple's card; a missing time must refuse rather
     than falling back to another couple's schedule, which is what the constant
     it replaced was doing silently. */
  if (details && (!details.couple || !details.date || !details.venue || !details.times)) {
    return NextResponse.json(
      { error: "missing_event_details",
        hint: "חסרים שם הזוג, תאריך, מקום או שעות האירוע — השליחה נעצרה" },
      { status: 400 },
    );
  }

  /* How many of these may actually go out now.

     Two independent ceilings, and the run stops at the lower one:

     - Time. Pacing is ~20s per message and the function is killed at
       maxDuration. Previously the whole queue was attempted regardless, and
       marking-as-sent happened only after the loop — so a timeout meant Meta
       had delivered messages that were never recorded, and the next run sent
       them all a second time.
     - Daily volume. The failures we are trying to prevent were caused by
       volume: 68 messages went out with 9% blocked, and a batch of 24 an hour
       later came back 92% blocked. The number's day, not the gap between
       messages, is what Meta reacts to. */
  const usage = await rollingWindowUsage(sb);
  const timeCap = Math.floor((60 - 10) / SECONDS_PER_MESSAGE);
  const allowed = Math.max(0, Math.min(queue.length, usage.remaining, SAFE_DAILY_LIMIT, timeCap));
  const batchQueue = queue.slice(0, allowed);
  const deferred = queue.length - allowed;

  if (usage.blocked) {
    return NextResponse.json({
      sent: 0, failed: 0, skipped: skipped.length, deferred: queue.length,
      hint: `${usage.recipients} נמענים כבר בחלון 24 השעות. שליחה עכשיו תיחסם — ממתינים שהחלון יתנקה.`,
    });
  }

  const sent: { id: string; name: string; messageId?: string }[] = [];
  const failed: { name: string; error: string }[] = [];
  let consecutiveFailures = 0;
  let stoppedEarly: string | null = null;

  for (let i = 0; i < batchQueue.length; i += CONCURRENCY) {
    const batch = batchQueue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async g => ({
        guest: g,
        res: await sendInvitation(cfg, g.phone as string, g.rsvp_token as string, headerImage, details),
      })),
    );

    for (const { guest, res } of results) {
      if (res.ok) {
        sent.push({ id: guest.id, name: guest.name, messageId: res.messageId });
        consecutiveFailures = 0;

        /* Record immediately, not after the loop. Anything that ends this
           invocation early — a timeout, a crash — must not leave a guest
           messaged but unmarked, because the next run would message them
           again. Recording per message costs a round trip and removes the
           only path to a duplicate invitation. */
        await sb.from("guest_events").insert({ guest_id: guest.id, event_type: EVENT_TYPE });
        if (res.messageId) {
          await sb.from("wa_messages").insert({
            event_id: eventId,
            guest_id: guest.id,
            wa_phone: toE164(guest.phone ?? "") ?? "",
            direction: "out",
            body: "הזמנה לחתונה (תבנית)",
            wamid: res.messageId,
            status: "accepted",
          }).then(r => r.error && console.warn("wa_messages log skipped:", r.error.message));
        }
      } else {
        failed.push({ name: guest.name, error: res.error ?? "unknown" });
        consecutiveFailures++;
      }
    }

    /* Stop the run rather than burn the list. A previous batch reached 92%
       blocked because it kept going: every additional attempt after the
       throttle kicked in both failed and made the next one likelier to fail. */
    if (consecutiveFailures >= 3) {
      stoppedEarly = "רצף כשלים — השליחה נעצרה כדי להגן על המספר";
      break;
    }
  }

  return NextResponse.json({
    sent: sent.length,
    failed: failed.length,
    skipped: skipped.length,
    deferred: deferred + (stoppedEarly ? batchQueue.length - sent.length - failed.length : 0),
    stoppedEarly,
    details: { sent: sent.map(s => s.name), failed, skipped },
  });
}
