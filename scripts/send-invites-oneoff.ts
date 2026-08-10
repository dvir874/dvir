/* One-off invitation send, run locally against production.
 *
 * The deployed admin endpoint is the normal path; this exists because its
 * session token could not be obtained from this machine. It deliberately
 * imports the SAME src/lib/whatsapp.ts used in production — the pacing,
 * retry and template logic must not be re-implemented, only re-invoked —
 * and reproduces the route's safety checks: dedupe against guest_events,
 * skip anyone without a phone or token, mark sent only after Meta accepts.
 *
 * Usage: npx tsx scripts/send-invites-oneoff.ts <event_id> <guest_id>...
 */

import { createClient } from "@supabase/supabase-js";
import {
  getWhatsAppConfig, sendInvitation, toE164,
  SAFE_DAILY_LIMIT, SECONDS_PER_MESSAGE, rollingWindowUsage,
} from "../src/lib/whatsapp";

const EVENT_TYPE = "invite_sent";

async function main() {
  const argv = process.argv.slice(2);
  /* --resend targets people already marked invite_sent, because the marker
     records that Meta accepted the message — not that it arrived. Everyone in
     that state either failed outright or never produced a delivery report, so
     the dedupe guard is exactly what has to be stepped around here. */
  const resend = argv.includes("--resend");
  const [eventId, ...guestIds] = argv.filter(a => a !== "--resend");
  if (!eventId || !guestIds.length) {
    console.error("usage: send-invites-oneoff.ts [--resend] <event_id> <guest_id>...");
    process.exit(1);
  }

  const cfg = getWhatsAppConfig();
  if (!cfg) throw new Error("WhatsApp env missing");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: ev } = await sb.from("events")
    .select("name, date, address, wa_header_image_url").eq("id", eventId).maybeSingle();
  /* No global fallback. WHATSAPP_HEADER_IMAGE_URL holds ONE couple's invitation
     card, so falling back to it means the next client's 550 guests receive Dvir
     and Mirav's invitation — and a sent WhatsApp message cannot be recalled.
     Refusing to send is the correct failure. */
  const headerImage = ev?.wa_header_image_url ?? "";
  if (!headerImage) throw new Error("no invitation image for this event — refusing to send");

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, rsvp_token, category")
    .eq("event_id", eventId).in("id", guestIds);

  /* Abort rather than risk a second invitation to someone who already has one */
  let already = new Set<string>();
  if (!resend) {
    const { data: sentRows, error: dedupeErr } = await sb.from("guest_events")
      .select("guest_id").eq("event_type", EVENT_TYPE).in("guest_id", guestIds);
    if (dedupeErr) throw new Error("dedupe check failed — aborting: " + dedupeErr.message);
    already = new Set((sentRows ?? []).map(r => r.guest_id));
  }

  /* Same unit the routes use, and the one Meta enforces: unique recipients in
     a rolling 24 hours. Counting messages instead charged three retries to one
     guest as three, and split a single window across two calendar days. */
  const usage = await rollingWindowUsage(sb);
  const budget = Math.min(usage.remaining, SAFE_DAILY_LIMIT);
  console.log(`נמענים בחלון 24 שעות: ${usage.recipients} · פנוי: ${usage.remaining} · מנה: ${budget}`);
  if (budget <= 0) {
    console.log("\nהחלון מלא. עצירה — שליחה עכשיו תיחסם.");
    return;
  }

  const eligible = (guests ?? []).filter(g => {
    if (g.category === "demo") return false;
    if (already.has(g.id)) { console.log(`  ⏭  ${g.name} — כבר קיבל`); return false; }
    if (!String(g.phone ?? "").trim()) { console.log(`  ⏭  ${g.name} — אין טלפון`); return false; }
    if (!g.rsvp_token) { console.log(`  ⏭  ${g.name} — אין קישור`); return false; }
    return true;
  });

  const queue = eligible.slice(0, budget);
  if (eligible.length > queue.length)
    console.log(`  ⏸  ${eligible.length - queue.length} נדחים למחר — חריגה מהמכסה היומית`);

  const mins = Math.ceil((queue.length * SECONDS_PER_MESSAGE) / 60);
  console.log(`\nשולח ל-${queue.length} אורחים · כ-${SECONDS_PER_MESSAGE}ש' בין הודעות · כ-${mins} דקות\n`);

  const sent: { id: string; name: string; phone: string; messageId?: string }[] = [];
  const failed: { name: string; error: string }[] = [];

  let streak = 0;
  for (const g of queue) {
    const res = await sendInvitation(cfg, g.phone!, g.rsvp_token!, headerImage);

    if (res.ok) {
      streak = 0;
      sent.push({ id: g.id, name: g.name, phone: g.phone!, messageId: res.messageId });
      console.log(`  ✅ ${g.name}`);

      /* Written per message, not at the end. A crash halfway through used to
         leave guests messaged but unrecorded, and the next run messaged them
         again. */
      if (!already.has(g.id))
        await sb.from("guest_events").insert({ guest_id: g.id, event_type: EVENT_TYPE });
      if (res.messageId) {
        const { error } = await sb.from("wa_messages").insert({
          event_id: eventId, guest_id: g.id,
          wa_phone: toE164(g.phone!) ?? "",
          direction: "out",
          body: resend ? "הזמנה לחתונה (שליחה חוזרת)" : "הזמנה לחתונה (תבנית)",
          wamid: res.messageId, status: "accepted",
        });
        if (error) console.warn(`     (מעקב מסירה לא נרשם: ${error.message})`);
      }
    } else {
      streak++;
      failed.push({ name: g.name, error: res.error ?? "unknown" });
      console.log(`  ❌ ${g.name} — ${res.error}`);
    }

    /* Stop rather than burn the list: once Meta starts throttling, each
       further attempt both fails and makes the next one likelier to fail. */
    if (streak >= 3) {
      console.log("\n⛔ שלושה כשלים ברצף — עצירה כדי להגן על המספר.");
      break;
    }
  }

  console.log(`\nנשלחו ${sent.length} · נכשלו ${failed.length}`);
  if (failed.length) {
    console.log("\nכשלים מיידיים:");
    for (const f of failed) console.log(`  ${f.name} — ${f.error}`);
  }
  console.log("\nכשל אמיתי מתגלה רק דרך ה-webhook, דקות אחר כך.");
  console.log("בדוק שוב בעוד ~10 דקות לפני שמסיקים שהכול הגיע.");
}

main().catch(e => { console.error(e); process.exit(1); });
