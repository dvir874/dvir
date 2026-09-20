/* One-off table-number send, run locally against production.
 *
 * The cron does this already — sendTableNumbers in wa-send — but at 60 a run,
 * and on 20/09 only two runs were left before ערב יום כיפור closed sending
 * until Monday night. 183 guests were waiting and 120 would have gone. Dvir:
 * "אני רוצה שכל ההודעות של לאל וטל יצאו היום".
 *
 * So this is the same send without the per-run ceiling, and deliberately
 * nothing else: it imports sendTableNumber from src/lib/whatsapp.ts rather
 * than rebuilding the call, and reproduces the cron's guards one for one —
 *
 *   · only guests who are seated AND have a phone
 *   · skip anyone already carrying table_number_sent
 *   · every table name must be a plain number, because the guest is told the
 *     number that is on the sign at the venue
 *   · mark table_number_sent AND day_before_sent, because this message now
 *     carries the whole card and "מחר מתחתנים" must not follow it
 *   · stop if the rolling 24-hour window cannot take the whole batch
 *
 * The message is the one the cron builds: date, venue with its Waze link, both
 * times on the 🥂 line, table number. See the comment in wa-send for why those
 * three parameters carry more than their labels suggest.
 *
 * Usage: npx tsx scripts/send-tables-oneoff.ts <event_id> [--commit] [--limit N]
 */

import { createClient } from "@supabase/supabase-js";
import {
  getWhatsAppConfig, sendTableNumber, toE164,
  rollingWindowUsage, SECONDS_PER_MESSAGE, SEND_CONCURRENCY,
} from "../src/lib/whatsapp";
import { coupleName } from "../src/lib/couple-name";
import { venueLine, wazeLink } from "../src/lib/venue";
import { eventDay } from "../src/lib/event-times";

async function main() {
  const argv = process.argv.slice(2);
  const commit = argv.includes("--commit");
  const limIdx = argv.indexOf("--limit");
  const limit = limIdx >= 0 ? Number(argv[limIdx + 1]) : Infinity;
  const eventId = argv.find(a => !a.startsWith("--") && a !== String(limit));
  if (!eventId) {
    console.error("usage: send-tables-oneoff.ts <event_id> [--commit] [--limit N]");
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
    .select("id, name, couple_names, date, venue_name, address, reception_time, chuppah_time, tables_send_requested_at, send_paused_until")
    .eq("id", eventId).single();
  if (!ev) throw new Error("event not found");
  if (!ev.tables_send_requested_at) throw new Error("הזוג לא ביקש לשלוח מספרי שולחן — tables_send_requested_at ריק");

  const couple = coupleName(ev as Parameters<typeof coupleName>[0]);
  const venueName = venueLine(ev as Parameters<typeof venueLine>[0]);
  const reception = String(ev.reception_time ?? "").trim();
  const day = eventDay(String(ev.date ?? ""));
  if (!couple || !venueName || !reception || !day) throw new Error("חסרים פרטי אירוע");
  const chuppah = String(ev.chuppah_time ?? "").trim().slice(0, 5);
  const receptionLine = chuppah
    ? `קבלת פנים ${reception.slice(0, 5)} · חופה ${chuppah}`
    : `קבלת פנים ${reception.slice(0, 5)}`;
  const nav = wazeLink(ev as Parameters<typeof wazeLink>[0]);
  const venue = nav ? `${venueName} · ${nav}` : venueName;
  const dateText = day.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

  const { data: tbls } = await sb.from("seating_tables").select("id, name").eq("event_id", eventId);
  const named = (tbls ?? []).filter(t => !/^\d{1,3}$/.test(String(t.name ?? "").trim()));
  if (named.length) throw new Error(`לשולחנות אין מספרים: ${named.slice(0, 3).map(t => t.name).join(", ")}`);
  const tableName = new Map((tbls ?? []).map(t => [t.id as string, String(t.name).trim()]));

  const { data: seats } = await sb.from("seating_assignments")
    .select("guest_id, table_id").eq("event_id", eventId);
  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, category, do_not_contact").eq("event_id", eventId);
  const byId = new Map((guests ?? []).map(g => [g.id as string, g]));

  const ids = [...new Set((seats ?? []).map(s => s.guest_id as string))];
  const already = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from("guest_events")
      .select("guest_id").eq("event_type", "table_number_sent").in("guest_id", ids.slice(i, i + 100));
    (data ?? []).forEach(r => r.guest_id && already.add(r.guest_id as string));
  }

  const todo = (seats ?? [])
    .map(s => ({ s, g: byId.get(s.guest_id as string) }))
    .filter(x => x.g && x.g.category !== "demo" && !x.g.do_not_contact
      && String(x.g.phone ?? "").trim() && !already.has(x.g.id as string)
      && tableName.has(x.s.table_id as string))
    .slice(0, Number.isFinite(limit) ? limit : undefined);

  /* The ceiling as the account reports it, not as anyone remembers it — the
     same source wa-send reads. Passed explicitly: rollingWindowUsage takes the
     cap as a number, and handing it the config silently produced a NaN
     remaining, which made the guard below always false. */
  const { data: lastRun } = await sb.from("wa_runs")
    .select("cap, tier").not("tier", "is", null)
    .order("created_at", { ascending: false }).limit(1);
  const cap = Number(lastRun?.[0]?.cap ?? lastRun?.[0]?.tier ?? 250);
  const usage = await rollingWindowUsage(sb, cap).catch(() => null);
  console.log(`\n🎎 ${couple} · ${ev.date}`);
  console.log(`   ממתינים: ${todo.length}`);
  if (usage) console.log(`   חלון מתגלגל: ${usage.recipients} בשימוש · ${usage.remaining} פנויים (תקרה ${cap})`);
  console.log(`   זמן משוער: ~${Math.ceil(todo.length / SEND_CONCURRENCY * SECONDS_PER_MESSAGE)} שניות`);
  console.log(`\n   ההודעה:\n     🗓 ${dateText}\n     📍 ${venue.slice(0, 70)}…\n     🥂 ${receptionLine}\n     🪑 שולחן <מספר אישי>`);

  if (!usage || !Number.isFinite(usage.remaining)) {
    console.error("\n✗ לא הצלחתי לקרוא את החלון המתגלגל — לא שולח בלי לדעת כמה מקום יש.");
    process.exit(1);
  }
  if (usage.remaining < todo.length) {
    console.error(`\n✗ החלון לא מכיל ${todo.length} — נשארו ${usage.remaining}. לא שולח חצי משלוח.`);
    process.exit(1);
  }
  if (!commit) { console.log(`\n🔒 הרצה יבשה. להרצה אמיתית: --commit\n`); return; }

  let ok = 0, bad = 0;
  for (let i = 0; i < todo.length; i += SEND_CONCURRENCY) {
    const batch = await Promise.all(todo.slice(i, i + SEND_CONCURRENCY).map(async x => ({
      x, res: await sendTableNumber(cfg, String(x.g!.phone), couple, dateText, venue,
        receptionLine, tableName.get(x.s.table_id as string)!),
    })));
    for (const { x, res } of batch) {
      const gid = x.g!.id as string;
      if (!res.ok) {
        bad++;
        console.error(`   ✗ ${x.g!.name}: ${res.error}`);
        await sb.from("wa_messages").insert({
          event_id: eventId, guest_id: gid, wa_phone: toE164(String(x.g!.phone)) ?? "",
          direction: "out", body: "מספר שולחן (תבנית)", status: "failed",
          error: String(res.error ?? "").slice(0, 300),
        }).then(() => {}, () => {});
        continue;
      }
      ok++;
      /* Both markers, exactly as the cron does — this message IS the card. */
      for (const t of ["table_number_sent", "day_before_sent"]) {
        await sb.from("guest_events").insert({ guest_id: gid, event_type: t }).then(() => {}, () => {});
      }
      if (res.messageId) {
        await sb.from("wa_messages").insert({
          event_id: eventId, guest_id: gid, wa_phone: toE164(String(x.g!.phone)) ?? "",
          direction: "out", body: "מספר שולחן (תבנית)",
          wamid: res.messageId, status: "accepted",
        }).then(() => {}, () => {});
      }
    }
    console.log(`   … ${Math.min(i + SEND_CONCURRENCY, todo.length)}/${todo.length}`);
  }
  console.log(`\n✓ ${ok} נשלחו · ${bad} נכשלו\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
