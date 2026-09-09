import type { SupabaseClient } from "@supabase/supabase-js";
import { parseAdminCommand, matchEvent } from "./admin-command";
import { classifyManualWork, manualWorkMessage, type LastContact } from "./manual-work";
import { coupleName } from "./couple-name";
import { isRsvpMessage, didArrive } from "./rsvp-contact";
import { whatsappInviteLink } from "./phone";
import { getWhatsAppConfig, toE164 } from "./whatsapp";
import { sendText, sendButtons, sendList } from "./wa-interactive";
import { parseMenuId, menuId, asksForMenu, LABEL, ROOT_TEXT, type MenuAction } from "./admin-menu";
import { askIntent, stripPrefixes } from "./admin-ask";
import { askAssistant, type AssistantFacts } from "./ai/assistant";
import { APP_URL } from "./app-url";
import { shabbatBlock } from "./shabbat";

/* Executing what the admin typed into his phone — see admin-command.ts for the
 * grammar and why it is deliberately small.
 *
 * Everything here answers on the same thread he wrote on, so the phone reads
 * like a conversation with the business rather than a control panel. And every
 * action confirms what it did by name: "נשלח לנעם חדד ✓" is the difference
 * between a tool he trusts from a moving car and one he checks afterwards.
 */

type Sb = SupabaseClient;

/** Remember who an alert was about, so a plain reply reaches them. */
export async function pointAdminAt(sb: Sb, guestId: string): Promise<void> {
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (!admin) return;
  try {
    await sb.from("admin_context").upsert(
      { admin_phone: toE164(admin) ?? admin, guest_id: guestId, set_at: new Date().toISOString() },
      { onConflict: "admin_phone" });
  } catch { /* the table arrives with 20260904_admin_console.sql */ }
}

/** True when this inbound message came from the admin's own phone. */
export function isAdminPhone(from: string): boolean {
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (!admin) return false;
  const a = toE164(admin), b = toE164(from);
  return !!a && a === b;
}

/**
 * Handle one message from the admin. Returns false when the feature is off, so
 * the caller can fall through to treating him as an ordinary guest — he is on
 * his own guest lists.
 */
export async function handleAdminMessage(
  sb: Sb, from: string, said: string,
  kind: "text" | "media" = "text",
  /* The id behind a tap. A menu row carries "m:wed:<uuid>"; a typed sentence
     carries nothing. This is the whole difference between an instruction and
     a guess — see admin-menu.ts. */
  replyId: string | null = null,
): Promise<boolean> {
  const cfg = getWhatsAppConfig();
  if (!cfg) return false;
  const to = toE164(from) ?? from;
  const say = (body: string) => sendText(cfg, to, body);

  let target: { id: string; name: string; phone: string } | null = null;
  /* Free text reaches a guest only while a reply is ARMED — that is, only
     after Dvir tapped "לענות לאורח" and then tapped a name, within the last
     half hour. It used to be enough that a pointer existed, and a pointer
     exists after every distress alert, which is how "אוקי" and "איזה אורחים
     לא יודעי" were sent to עירית סבן.
  
     Before 20260909_admin_console_mode.sql runs, `mode` is undefined and this
     is false: deploying ahead of the migration makes the console safer rather
     than broken. */
  let armed = false;
  try {
    const { data } = await sb.from("admin_context")
      .select("guest_id, mode, mode_at").eq("admin_phone", to).maybeSingle();
    const ctx = data as { guest_id?: string; mode?: string | null; mode_at?: string | null } | null;
    const gid = ctx?.guest_id;
    armed = ctx?.mode === "reply"
      && !!ctx?.mode_at
      && Date.now() - new Date(ctx.mode_at).getTime() < 30 * 60_000;
    if (gid) {
      const { data: g } = await sb.from("guests")
        .select("id, name, phone, do_not_contact").eq("id", gid).maybeSingle();
      /* A guest who has asked us to stop is never a target.
       *
       * The distress branch in wa-conversation used to call pointAdminAt on
       * whoever wrote in — so the system's response to עירית סבן's "אל תחזרו"
       * was to aim Dvir's next message at her, and four messages he typed went
       * that way. opt-out.ts now returns before that branch is reached, but
       * this is the second lock: a pointer set before today, or by any path
       * added later, still cannot reach somebody who opted out. */
      if (g && !g.do_not_contact)
        target = { id: g.id as string, name: String(g.name ?? ""), phone: String(g.phone ?? "") };
    }
  } catch { /* migration not run — no target, free text is refused below */ }

  /* A tap is unambiguous and is answered before anything is parsed. */
  const tap = parseMenuId(replyId);
  if (tap) { await renderScreen(sb, cfg, to, tap); return true; }

  /* And a word that means "show me what I can do" opens the same thing. */
  if (asksForMenu(said)) { await renderScreen(sb, cfg, to, { screen: "root" }); return true; }

  const cmd = parseAdminCommand(said, armed && !!target, kind);

  switch (cmd.kind) {
    case "help":
      await renderScreen(sb, cfg, to, { screen: "root" });
      return true;

    case "status":
      await say(await statusText(sb));
      return true;

    case "work":
      await say(await waitingText(sb));
      return true;

    case "missing":
      await say(await missingText(sb, { name: cmd.event }));
      return true;

    case "pause":
    case "resume":
      await say(await pauseText(sb, { name: cmd.event }, cmd.kind === "pause"));
      return true;

    case "reply":
    case "reply_last": {
      const phone = cmd.kind === "reply" ? cmd.phone : target!.phone;
      const name  = cmd.kind === "reply" ? null : target!.name;
      const dest  = toE164(phone);
      if (!dest) { await say("המספר לא תקין."); return true; }

      const res = await sendText(cfg, dest, cmd.text);
      if (!res.ok) {
        /* Meta only allows free text inside 24 hours of the guest's own last
           message. Saying which rule stopped it is the difference between a
           system he trusts and one he retries at. */
        await say(`❌ לא נשלח${name ? ` ל${name}` : ""}: ${res.error ?? "שגיאה"}. `
          + `אפשר לענות בטקסט חופשי רק עד 24 שעות אחרי ההודעה שלהם.`);
        return true;
      }

      /* Logged like any other outbound so it appears in the thread — and NOT
         as status "auto", because a person really did answer. */
      try {
        const { data: g } = await sb.from("guests")
          .select("id, event_id, name").eq("phone", toLocal(phone)).maybeSingle();
        await sb.from("wa_messages").insert({
          event_id: (g as { event_id?: string } | null)?.event_id ?? null,
          guest_id: (g as { id?: string } | null)?.id ?? null,
          wa_phone: dest, direction: "out", body: cmd.text,
          wamid: res.messageId ?? null, status: "sent",
        });
      } catch { /* the message went out; the log is a nicety */ }

      /* One tap, one reply. Leaving it armed would mean the next thing he
         types — a question to the system, a note to himself — goes to the same
         guest, which is the failure this whole change exists to remove. */
      await disarm(sb, to);
      await say(`✓ נשלח${name ? ` ל${name}` : ` ל-${phone}`}`);
      return true;
    }

    default: {
      /* Before the menu: was that a question?
       *
       * "אני חושב שעדיין אין מספיק הדדיות בינינו" — 09/09, about this thread.
       * A menu answers "what can I do"; it does not answer "כמה אישרו לשלמה",
       * which the console has always been two queries away from knowing. See
       * admin-ask.ts. Nothing here can address a person: the worst outcome is
       * a screen he did not want. */
      if (kind === "text" && await answerAsk(sb, cfg, to, said)) return true;

      /* And then the part that is not a screen at all.
       *
       * "בכל עניין של רגע לפני" is a bigger promise than six intents. The
       * facts are gathered here, in code, and the sentence is written by a
       * model that can only read them — it cannot send, cannot write, and
       * never sees a word a guest typed. When it has nothing, the menu
       * follows, exactly as before. See ai/assistant.ts. */
      if (kind === "text" && said.trim().length > 2) {
        try {
          const answer = await askAssistant(said, await assistantFacts(sb));
          if (answer) { await say(answer); return true; }
        } catch { /* the menu is always a valid answer */ }
      }

      /* Not understood is a menu, not a message to a stranger.
       *
       * This said ADMIN_HELP, which was correct, but only ever reached when
       * the blocklist happened to catch the phrasing. Everything it missed
       * fell through to reply_last instead. With the fallthrough gone, this is
       * where every unrecognised sentence lands — so it should be the thing he
       * actually wanted, which is the list of what he can do. */
      await renderScreen(sb, cfg, to, { screen: "root" });
      return true;
    }
  }
}

/* One question, in his own words, answered with the screen that already knows.
   Returns false when there was no question in it, and the menu follows. */
async function answerAsk(sb: Sb, cfg: Cfg, to: string, said: string): Promise<boolean> {
  const ask = askIntent(said);
  if (!ask) return false;

  switch (ask.kind) {
    case "today":    await renderScreen(sb, cfg, to, { screen: "today" });    return true;
    case "money":    await renderScreen(sb, cfg, to, { screen: "money" });    return true;
    case "waiting":  await renderScreen(sb, cfg, to, { screen: "waiting" });  return true;
    case "weddings": await renderScreen(sb, cfg, to, { screen: "weddings" }); return true;

    case "missing":
    case "wedding": {
      const evs = await upcoming(sb, 20);
      const needle = "needle" in ask ? ask.needle : undefined;
      if (!needle) { await renderScreen(sb, cfg, to, { screen: "missing" }); return true; }

      /* As he wrote it first, then without the Hebrew preposition glued to the
         front. "לשלמה" only becomes "שלמה" on the second attempt, because
         doing it on the first turns "שלמה" itself into "למה". */
      let m = matchEvent(needle, evs);
      if ("none" in m) m = matchEvent(stripPrefixes(needle), evs);

      if ("event" in m) {
        await renderScreen(sb, cfg, to,
          ask.kind === "missing"
            ? { screen: "missing", id: m.event.id }
            : { screen: "wedding", id: m.event.id });
        return true;
      }
      if ("ambiguous" in m) {
        await sendList(cfg, to, `"${needle}" מתאים ליותר מאחת — איזו?`, "בחר חתונה",
          m.ambiguous.slice(0, 9).map(e => ({
            id: menuId({ screen: "wedding", id: e.id }), title: fit(titleOf(e), 24) })));
        return true;
      }
      /* A name that matches nothing is not a question we answered. The
         assistant gets it before the menu does — "איזו חתונה הכי בסכנה" reads
         like a wedding name to the router and is a real question to a person. */
      return false;
    }
  }
}

/* Everything the assistant is allowed to know, assembled from queries.
 *
 * Structured facts only — names, counts, dates, money. No guest message text
 * ever enters this object: a guest can write anything into this system, and
 * what a guest wrote is not going to end up inside a prompt. See ai/assistant.ts. */
async function assistantFacts(sb: Sb): Promise<AssistantFacts> {
  const block = shabbatBlock();
  const day = israelDay();

  const { data: out } = await sb.from("wa_messages")
    .select("id").eq("direction", "out").gte("created_at", `${day}T00:00:00Z`).limit(2000);
  const { data: run } = await sb.from("wa_runs")
    .select("tier, cap").not("tier", "is", null)
    .order("created_at", { ascending: false }).limit(1);

  const evs = await upcoming(sb, 12);
  const weddings: AssistantFacts["weddings"] = [];
  for (const e of evs) {
    const { data: gs } = await sb.from("guests")
      .select("status, guest_count, category, do_not_contact").eq("event_id", e.id).limit(900);
    const real = (gs ?? []).filter(g => g.category !== "demo" && !g.do_not_contact);
    const { data: money } = await sb.from("events")
      .select("price_charged, paid_at").eq("id", e.id).maybeSingle();
    weddings.push({
      couple: titleOf(e),
      date: String(e.date),
      daysAway: Math.max(0, Math.ceil((new Date(String(e.date)).getTime() - Date.now()) / 86_400_000)),
      total: real.length,
      confirmed: real.filter(g => g.status === "confirmed").length,
      declined: real.filter(g => g.status === "declined").length,
      pending: real.filter(g => g.status === "pending").length,
      attendees: real.filter(g => g.status === "confirmed")
        .reduce((n, g) => n + (Number(g.guest_count) || 1), 0),
      paused: !!e.send_paused_until && new Date(e.send_paused_until).getTime() > Date.now(),
      priceCharged: (money as { price_charged?: number | null } | null)?.price_charged ?? null,
      paid: !!(money as { paid_at?: string | null } | null)?.paid_at,
    });
  }

  const { data: muted } = await sb.from("guests")
    .select("id").eq("do_not_contact", true).limit(500);

  return {
    today: day,
    blocked: block.blocked ? (block.reason ?? "blocked") : null,
    sentToday: (out ?? []).length,
    cap: Number((run ?? [])[0]?.cap ?? (run ?? [])[0]?.tier ?? 250),
    weddings,
    optedOut: (muted ?? []).length,
  };
}

/** Israel's calendar date, which is the only date this business runs on. */
function israelDay(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

/* ── The menu ──────────────────────────────────────────────────────────────
 *
 * Dvir asked for "תפריט אופציות מה לעשות ממש מסודר מקצה לקצה והכול בפלאפון",
 * and the safety argument is the same as the convenience one: a tap carries an
 * id we issued, a sentence carries whatever a person happened to type. See
 * admin-menu.ts.
 *
 * Everything here is a free-form WhatsApp message, which Meta allows only
 * inside 24 hours of HIS last message to the business number. That is not a
 * limitation in practice — the menu only ever appears in answer to something
 * he just sent — but it is why alerts remain templates.
 */

type Cfg = NonNullable<ReturnType<typeof getWhatsAppConfig>>;

/** Upcoming weddings, newest deadline first, without the demo rows. */
async function upcoming(sb: Sb, limit = 9) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  const { data } = await sb.from("events")
    .select("id, name, couple_names, date, send_paused_until")
    .gte("date", today).order("date").limit(limit);
  return (data ?? []) as {
    id: string; name?: string | null; couple_names?: string | null;
    date: string; send_paused_until?: string | null;
  }[];
}

function titleOf(e: { name?: string | null; couple_names?: string | null }): string {
  return String(coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name ?? "חתונה");
}

/** WhatsApp truncates silently: 24 for a list row, 20 for a button. */
function fit(text: string, n: number): string {
  const c = [...text];
  return c.length <= n ? text : c.slice(0, n - 1).join("") + "…";
}

async function disarm(sb: Sb, adminPhone: string): Promise<void> {
  try {
    await sb.from("admin_context")
      .update({ mode: null, mode_at: null }).eq("admin_phone", adminPhone);
  } catch { /* the columns arrive with 20260909_admin_console_mode.sql */ }
}

async function renderScreen(sb: Sb, cfg: Cfg, to: string, a: MenuAction): Promise<void> {
  const say = (body: string) => sendText(cfg, to, body);
  const back = { id: menuId({ screen: "root" }), title: LABEL.back };

  switch (a.screen) {
    case "root":
    case "help":
      /* Leaving the menu disarms any half-finished reply: going back to the
         top is how a person says "not that". */
      await disarm(sb, to);
      await sendList(cfg, to, ROOT_TEXT, "בחר", [
        { id: menuId({ screen: "weddings" }),   title: LABEL.weddings },
        { id: menuId({ screen: "waiting" }),    title: LABEL.waiting },
        { id: menuId({ screen: "missing" }),    title: LABEL.missing },
        { id: menuId({ screen: "pick_reply" }), title: LABEL.pickReply },
        { id: menuId({ screen: "today" }),      title: LABEL.today },
        { id: menuId({ screen: "money" }),      title: LABEL.money },
      ]);
      return;

    case "weddings": {
      const evs = await upcoming(sb);
      if (!evs.length) { await say("אין חתונות קרובות."); return; }
      await sendList(cfg, to, "איזו חתונה?", "בחר חתונה",
        evs.map(e => ({ id: menuId({ screen: "wedding", id: e.id }), title: fit(titleOf(e), 24) })));
      return;
    }

    case "wedding": {
      const evs = await upcoming(sb, 20);
      const e = evs.find(x => x.id === a.id);
      if (!e) { await say("החתונה הזאת כבר לא ברשימה."); return; }

      const { data: gs } = await sb.from("guests")
        .select("status, category").eq("event_id", e.id).limit(900);
      const real = (gs ?? []).filter(g => g.category !== "demo");
      const days = Math.max(0, Math.ceil(
        (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
      const paused = !!e.send_paused_until
        && new Date(e.send_paused_until).getTime() > Date.now();

      const text = `${titleOf(e)}\n${days} ימים\n`
        + `${real.filter(g => g.status === "confirmed").length} מגיעים · `
        + `${real.filter(g => g.status === "declined").length} לא מגיעים · `
        + `${real.filter(g => g.status === "pending").length} ממתינים`
        + (paused ? "\n\n⏸ השליחה מושהית" : "");

      await sendButtons(cfg, to, text, [
        paused
          ? { id: menuId({ screen: "resume", id: e.id }), title: LABEL.resume }
          : { id: menuId({ screen: "pause",  id: e.id }), title: LABEL.pause },
        { id: menuId({ screen: "missing", id: e.id }), title: LABEL.missing },
        back,
      ]);
      return;
    }

    case "pause":
    case "resume":
      await say(await pauseText(sb, { id: a.id }, a.screen === "pause"));
      await renderScreen(sb, cfg, to, { screen: "wedding", id: a.id });
      return;

    case "missing":
      await say(await missingText(sb, a.id ? { id: a.id } : undefined));
      await sendButtons(cfg, to, "עוד משהו?", [back]);
      return;

    case "waiting":
      await say(await waitingText(sb));
      await sendButtons(cfg, to, "עוד משהו?", [back]);
      return;

    case "pick_reply": {
      /* Only guests whose own last message is inside Meta's 24-hour window.
         Offering a name we cannot actually write to would produce a reply he
         typed, an error he then has to read, and a guest who heard nothing. */
      const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
      const { data: ms } = await sb.from("wa_messages")
        .select("guest_id, created_at").eq("direction", "in")
        .gte("created_at", since).order("created_at", { ascending: false }).limit(200);
      const seen = new Set<string>();
      const ids: string[] = [];
      for (const m of ms ?? []) {
        const id = m.guest_id as string | null;
        if (!id || seen.has(id)) continue;
        seen.add(id); ids.push(id);
        if (ids.length >= 10) break;
      }
      if (!ids.length) {
        await say("אף אורח לא כתב ב-24 השעות האחרונות, ומטא מרשה טקסט חופשי רק בחלון הזה.\n\n"
          + "אפשר לפנות אליהם מהוואטסאפ הפרטי שלך — התפריט ← 📵 לא קיבלו הזמנה נותן קישור מוכן לכל אחד.");
        await sendButtons(cfg, to, "עוד משהו?", [back]);
        return;
      }
      const { data: gs } = await sb.from("guests")
        .select("id, name, phone, do_not_contact").in("id", ids);
      const rows = ids
        .map(id => (gs ?? []).find(g => g.id === id))
        .filter((g): g is NonNullable<typeof g> => !!g && !g.do_not_contact)
        .map(g => ({ id: menuId({ screen: "reply_to", id: g.id as string }),
                     title: fit(String(g.name ?? g.phone ?? "אורח"), 24) }));
      if (!rows.length) { await say("אין אף אחד שאפשר לענות לו עכשיו."); return; }
      await sendList(cfg, to, "למי לענות?", "בחר אורח", rows);
      return;
    }

    case "reply_to": {
      const { data: g } = await sb.from("guests")
        .select("id, name, phone, do_not_contact").eq("id", a.id).maybeSingle();
      if (!g) { await say("לא מצאתי את האורח."); return; }
      if (g.do_not_contact) { await say("האורח הזה ביקש שלא נפנה אליו יותר."); return; }
      try {
        await sb.from("admin_context").upsert(
          { admin_phone: to, guest_id: g.id, mode: "reply", mode_at: new Date().toISOString(),
            set_at: new Date().toISOString() },
          { onConflict: "admin_phone" });
      } catch {
        await say("צריך להריץ את המיגרציה 20260909_admin_console_mode.sql כדי לענות מהתפריט.");
        return;
      }
      await sendButtons(cfg, to,
        `כתוב עכשיו את ההודעה ל${g.name} ${g.phone} — מה שתשלח בהודעה הבאה יגיע אליו.`,
        [{ id: menuId({ screen: "mute", id: g.id as string }), title: LABEL.mute }, back]);
      return;
    }

    case "today":
      await say(await todayText(sb));
      await sendButtons(cfg, to, "עוד משהו?", [back]);
      return;

    case "money": {
      const { text, unpaid } = await moneyText(sb);
      await say(text);
      if (unpaid.length) {
        await sendList(cfg, to, "לסמן חתונה כשולמה?", "בחר חתונה",
          unpaid.slice(0, 9).map(e => ({
            id: menuId({ screen: "mark_paid", id: e.id }), title: fit(e.title, 24) })));
      } else {
        await sendButtons(cfg, to, "עוד משהו?", [back]);
      }
      return;
    }

    case "mark_paid": {
      const { data: e } = await sb.from("events")
        .select("id, name, couple_names, price_charged, paid_at").eq("id", a.id).maybeSingle();
      if (!e) { await say("לא מצאתי את החתונה."); return; }
      if (e.paid_at) { await say(`${titleOf(e)} כבר מסומנת כשולמה.`); return; }
      await sb.from("events").update({
        paid_at: new Date().toISOString(),
        payment_method: "ידני",
      }).eq("id", e.id);
      /* Said out loud because it is not only bookkeeping: after-wedding.ts
         asks for payment before it asks for a referral, so marking this is
         what releases the recommendation request for a wedding that is over. */
      await say(`💰 ${titleOf(e)} — ₪${e.price_charged ?? "?"} סומן כשולם.\n\n`
        + `אחרי חתונה שהסתיימה, זה גם מה שמשחרר את בקשת ההמלצה לזוג.`);
      await sendButtons(cfg, to, "עוד משהו?", [back]);
      return;
    }

    case "mute": {
      const { data: g } = await sb.from("guests")
        .select("id, name, phone").eq("id", a.id).maybeSingle();
      if (!g) { await say("לא מצאתי את האורח."); return; }
      await sb.from("guests").update({
        do_not_contact: true,
        do_not_contact_at: new Date().toISOString(),
        do_not_contact_note: "הוסר ידנית על ידי דביר מהתפריט בוואטסאפ",
      }).eq("id", g.id);
      await disarm(sb, to);
      await say(`🔕 ${g.name} הוסר/ה. לא תישלח אליו/ה שום הודעה נוספת.`);
      await sendButtons(cfg, to, "עוד משהו?", [back]);
      return;
    }
  }
}

/* Each screen below answers with a string rather than sending it, so the same
   text serves a typed command and a tapped menu row. They were the bodies of
   the switch above until the menu needed to reach them too. */

async function statusText(sb: Sb): Promise<string> {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date, send_paused_until")
        .gte("date", today).order("date").limit(5);
      const lines: string[] = [];
      for (const e of evs ?? []) {
        const { data: gs } = await sb.from("guests")
          .select("status, category").eq("event_id", e.id as string).limit(900);
        const real = (gs ?? []).filter(g => g.category !== "demo");
        if (!real.length) continue;
        const days = Math.max(0, Math.ceil(
          (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
        const paused = e.send_paused_until
          && new Date(e.send_paused_until as string).getTime() > Date.now();
        lines.push(`${coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name} · ${days} ימים · `
          + `${real.filter(g => g.status === "confirmed").length} מגיעים · `
          + `${real.filter(g => g.status === "pending").length} ממתינים${paused ? " · מושהה" : ""}`);
      }
  return lines.length ? lines.join("\n") : "אין חתונות פעילות.";
}

async function waitingText(sb: Sb): Promise<string> {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).order("date").limit(4);
      const out: string[] = [];
      for (const e of evs ?? []) {
        const { data: gs } = await sb.from("guests")
          .select("id, name, phone, status, category, do_not_contact, rsvp_token")
          .eq("event_id", e.id as string).limit(900);
        const real = (gs ?? []).filter(g => g.category !== "demo");
        if (!real.length) continue;
        const ids = real.map(g => g.id as string);
        const contact = new Map<string, LastContact>();
        for (let i = 0; i < ids.length; i += 100) {
          const { data: ms } = await sb.from("wa_messages")
            .select("guest_id, direction, status, error_code, created_at")
            .in("guest_id", ids.slice(i, i + 100));
          for (const m of ms ?? []) {
            const id = m.guest_id as string;
            if (!id) continue;
            const at = m.created_at as string;
            const cur = contact.get(id) ?? {};
            if (m.direction === "in") {
              if (!cur.lastInAt || at > cur.lastInAt) cur.lastInAt = at;
            } else {
              if (["delivered", "read"].includes(m.status as string)) cur.arrived = true;
              if (!cur.lastOutAt || at > cur.lastOutAt) {
                cur.lastOutAt = at;
                cur.lastCode = (m.error_code as number | null) ?? null;
              }
            }
            contact.set(id, cur);
          }
        }
        const days = Math.max(0, Math.ceil(
          (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
        const body = manualWorkMessage(
          coupleName(e as Parameters<typeof coupleName>[0]) ?? String(e.name ?? ""),
          days, classifyManualWork(real as Parameters<typeof classifyManualWork>[0], contact, days),
          6, APP_URL);
        if (body) out.push(body);
      }
  return out.length ? out.join("\n\n") : "אין כלום שמחכה לך 🤍";
}

async function missingText(sb: Sb, only?: { name?: string; id?: string }): Promise<string> {
      /* The guests with no invitation, each with a link that opens WhatsApp
         with their own personal RSVP address already written.
         
         "בדיוק כמו שזה נותן לי לשלוח באדמין" — the admin has had this button
         since the start; it just lived on a screen. Sent from his own number
         rather than the business one, which is why it works at all: the
         business number is bound by Meta's 24-hour rule and his is not, and a
         guest who never received anything has no window open. */
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).order("date").limit(12);
      let list = (evs ?? []) as { id: string; name?: string | null; couple_names?: string | null }[];
      if (only?.id) {
        const hit = list.find(e => e.id === only.id);
        if (!hit) return "החתונה הזאת כבר לא ברשימה.";
        list = [hit];
      } else if (only?.name) {
        const m = matchEvent(only.name, list);
        if ("none" in m) return `לא מצאתי חתונה בשם "${only.name}".`;
        if ("ambiguous" in m) return `"${only.name}" מתאים ליותר מאחת. תכתוב שם מדויק יותר.`;
        list = [m.event];
      }

      const out: string[] = [];
      for (const e of list) {
        const { data: gs } = await sb.from("guests")
          .select("id, name, phone, rsvp_token, status, category, do_not_contact")
          .eq("event_id", e.id).eq("status", "pending").limit(900);
        const real = (gs ?? []).filter(g =>
          g.category !== "demo" && !g.do_not_contact
          && String(g.phone ?? "").trim() && g.rsvp_token);
        if (!real.length) continue;

        const ids = real.map(g => g.id as string);
        const reached = new Set<string>();
        for (let i = 0; i < ids.length; i += 100) {
          const { data: ms } = await sb.from("wa_messages")
            .select("guest_id, status, body").eq("direction", "out")
            .in("guest_id", ids.slice(i, i + 100));
          for (const m of ms ?? []) {
            /* The sixth site of the same predicate. This command exists to find
               exactly the guest the bug hides, and counted the rides-board
               notice as an invitation — so it would have answered
               "כולם קיבלו 🤍" while אשר כהן sat with nothing. */
            if (m.guest_id && didArrive(m.status as string) && isRsvpMessage(m.body as string)) {
              reached.add(m.guest_id as string);
            }
          }
        }
        const missing = real.filter(g => !reached.has(g.id as string));
        if (!missing.length) continue;

        const who = coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name;
        /* Ten at a time. A message with sixty links is one nobody works
           through, and the rest are one "לא קיבלו" away. */
        const shown = missing.slice(0, 10);
        out.push(`${who} — ${missing.length} לא קיבלו:\n` + shown.map(g =>
          `${g.name} ${g.phone}\n${whatsappInviteLink(String(g.phone), String(g.name), String(g.rsvp_token))}`
        ).join("\n\n") + (missing.length > 10 ? `\n\nועוד ${missing.length - 10} — כתוב "לא קיבלו" שוב` : ""));
      }

  return out.length
    ? out.join("\n\n———\n\n") + "\n\nלחיצה על קישור פותחת וואטסאפ עם ההזמנה שלהם מוכנה. נשלח ממך, לא מהמספר העסקי."
    : "כולם קיבלו 🤍";
}

async function pauseText(sb: Sb, which: { name?: string; id?: string }, pause: boolean): Promise<string> {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).limit(12);
      const list = (evs ?? []) as { id: string; name?: string | null; couple_names?: string | null }[];
      let chosen: (typeof list)[number] | undefined;
      if (which.id) {
        chosen = list.find(e => e.id === which.id);
        if (!chosen) return "החתונה הזאת כבר לא ברשימה.";
      } else {
        const m = matchEvent(which.name ?? "", list);
        if ("none" in m) return `לא מצאתי חתונה בשם "${which.name}".`;
        if ("ambiguous" in m)
          return `"${which.name}" מתאים ליותר מאחת: `
            + m.ambiguous.map(e => coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name).join(" · ")
            + ". תכתוב שם מדויק יותר.";
        chosen = m.event;
      }
      const m = { event: chosen };
      /* A week, not for ever. A pause nobody remembers to lift is a wedding
         that quietly stops being served — and this one is set from a phone,
         where it is easiest to forget. */
      const until = pause
        ? new Date(Date.now() + 7 * 86_400_000).toISOString() : null;
      await sb.from("events").update({ send_paused_until: until }).eq("id", m.event.id);
      const who = coupleName(m.event as Parameters<typeof coupleName>[0]) ?? m.event.name;
  return pause
    ? `⏸ ${who} מושהית לשבוע. אפשר להחזיר מיד מהתפריט.`
    : `▶️ ${who} חזרה לשליחה.`;
}

/* "מה יוצא היום" — the question he asked four separate times this week, each
   time by asking me to go and look. Nothing here sends anything; it is the
   day, stated. */
export async function todayText(sb: Sb): Promise<string> {
  const lines: string[] = [];

  /* Whether the day is open at all comes first, because on a blocked day
     everything below it is moot and the silence would otherwise look like a
     fault. See shabbat.ts — it now knows about חגים as well. */
  const block = shabbatBlock();
  if (block.blocked) {
    lines.push(block.reason === "yom_tov" ? "🕯️ היום חג — לא נשלחת שום הודעה."
      : block.reason === "yom_tov_eve" ? "🕯️ ערב חג — השליחה נעצרה מהצהריים."
      : block.reason === "shabbat_eve" ? "🕯️ ערב שבת — השליחה נעצרה מהצהריים."
      : "🕯️ שבת — לא נשלחת שום הודעה.");
  }

  const since = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  const { data: out } = await sb.from("wa_messages")
    .select("status, error_code").eq("direction", "out")
    .gte("created_at", `${since}T00:00:00Z`).limit(2000);
  const sent = (out ?? []).length;
  const failed = (out ?? []).filter(m => m.error_code).length;

  /* The ceiling as the account actually reports it, not as we remember it. */
  const { data: run } = await sb.from("wa_runs")
    .select("tier, cap").not("tier", "is", null)
    .order("created_at", { ascending: false }).limit(1);
  const cap = Number((run ?? [])[0]?.cap ?? (run ?? [])[0]?.tier ?? 250);

  lines.push(`נשלחו היום ${sent}${failed ? ` · ${failed} נכשלו` : ""} מתוך ${cap}`);
  if (sent >= cap) lines.push("התקרה נגמרה להיום.");

  for (const e of await upcoming(sb, 8)) {
    const { data: gs } = await sb.from("guests")
      .select("status, category, do_not_contact").eq("event_id", e.id).limit(900);
    const real = (gs ?? []).filter(g => g.category !== "demo" && !g.do_not_contact);
    if (!real.length) continue;
    const pending = real.filter(g => g.status === "pending").length;
    const days = Math.max(0, Math.ceil(
      (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
    const paused = !!e.send_paused_until
      && new Date(e.send_paused_until).getTime() > Date.now();
    const note = paused ? "מושהית"
      : days === 0 ? "היום החתונה"
      : days === 1 ? "מחר החתונה"
      : pending ? `${pending} ממתינים` : "כולם ענו";
    lines.push(`${titleOf(e)} · ${days} ימים · ${note}`);
  }

  return lines.join("\n");
}

/* Money, which had no screen at all until today — /api/manager/overview asked
   for two columns that do not exist and answered 500 on every call, so the
   dashboard showed zero. ₪779 was outstanding and invisible. */
export async function moneyText(sb: Sb): Promise<{ text: string; unpaid: { id: string; title: string }[] }> {
  const { data } = await sb.from("events")
    .select("id, name, couple_names, date, price_charged, paid_at, status")
    .not("price_charged", "is", null).order("date").limit(30);
  const rows = (data ?? []) as {
    id: string; name?: string | null; couple_names?: string | null;
    date: string; price_charged?: number | null; paid_at?: string | null; status?: string | null;
  }[];
  if (!rows.length) return { text: "אין עדיין חתונות עם מחיר.", unpaid: [] };

  const paid = rows.filter(r => r.paid_at);
  const owed = rows.filter(r => !r.paid_at);
  const sum = (xs: typeof rows) => xs.reduce((n, r) => n + (r.price_charged ?? 0), 0);

  const lines = [
    `נגבה: ₪${sum(paid)}`,
    `פתוח: ₪${sum(owed)}`,
    "",
    ...rows.map(r => `${r.paid_at ? "✓" : "○"} ${titleOf(r)} · ₪${r.price_charged}`
      + (r.paid_at ? "" : "  ← לא שולם")),
  ];
  return {
    text: lines.join("\n"),
    unpaid: owed.map(r => ({ id: r.id, title: titleOf(r) })),
  };
}

/* Storage form, matching every other path that writes a guest. */
function toLocal(raw: string): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) return "0" + d.slice(3);
  if (d.startsWith("0")) return d;
  return d.length === 9 ? "0" + d : d;
}
