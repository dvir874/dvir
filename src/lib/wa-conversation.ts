import type { SupabaseClient } from "@supabase/supabase-js";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { sendButtons, sendList, sendText, parseGuestCount } from "@/lib/wa-interactive";
import { detectRideIntent } from "@/lib/rides";
import { stateIsLive } from "@/lib/chat-state";
import { bareCount, changeIntent, unpromptedCount, compositeCount} from "@/lib/guest-count";
import { decide, type Kind, type GuestView } from "@/lib/wa-decide";
import { needsHuman, saysNotComing, HUMAN_REASON_TEXT } from "@/lib/needs-human";
import { optOutRequest, OPT_OUT_REPLY } from "@/lib/opt-out";
import { answerQuestion, type FaqFacts } from "@/lib/guest-faq";
import { coupleName } from "@/lib/couple-name";
import { eventDay } from "@/lib/event-times";
import { venueLine, wazeLink } from "@/lib/venue";
import { pointAdminAt } from "@/lib/admin-console";
import { sendRunSummary } from "@/lib/whatsapp";
import { APP_URL } from "@/lib/app-url";

/* Answering an invitation without leaving WhatsApp.
 *
 *   template  "מגיע" / "לא מגיע"
 *     ├─ מגיע     → "כמה אתם?"  → count → confirmed
 *     └─ לא מגיע  → "רק לוודא"  → yes   → declined
 *                                 no    → back to the first question
 *
 * The confirmation on "לא מגיע" is not symmetry for its own sake. A tap is
 * instant and cannot be taken back, and a guest who declines by accident is
 * removed from a wedding they meant to attend. In the other direction a stray
 * "מגיע" simply goes unanswered at the next question, which costs nothing.
 *
 * Every step writes the same columns the web form writes, so a guest who
 * answers here is indistinguishable downstream from one who answered on the
 * page — the caterer's number, the couple's report and the delivery screens all
 * keep working without knowing this exists.
 */

/* Untyped schema on purpose. Pinning the Database generic to `never` — as this
   line used to — resolves every .update()/.insert() argument to `never`, so the
   three writes below could not compile at all. The client this receives is
   createServerClient()'s, which carries no generated types either way. */
type Sb = SupabaseClient;

interface Guest {
  id: string; name: string; phone: string;
  status: string; guest_count: number | null;
  chat_state: string | null; chat_state_at: string | null;
  /* Read as well as written here since 09/09 — see opt-out.ts. Selected
     explicitly above; a column named in the type and missing from the select
     is undefined at runtime and reads as "not opted out", which is the wrong
     direction to be wrong in. */
  do_not_contact?: boolean | null;
}

const ASK_COUNT   = "awaiting_count";
const ASK_DECLINE = "awaiting_decline_confirm";
/* Stored as `awaiting_count_change:4` — the proposed number rides along in the
   state, because there is nowhere else to keep it between two messages. */
const ASK_CHANGE  = "awaiting_count_change";

async function setState(sb: Sb, id: string, state: string | null) {
  await sb.from("guests")
    .update({ chat_state: state, chat_state_at: state ? new Date().toISOString() : null })
    .eq("id", id);
}

/* Returns false when the answer was NOT recorded.
 *
 * This ignored the result, and every caller then told the guest "רשמנו 2 🤍"
 * regardless. A write that failed — a dropped connection, a constraint, a
 * momentary Supabase fault — produced a guest who believes they have answered,
 * a couple whose count is wrong, and no trace anywhere. It is the one write in
 * this file that a person acts on, and it was the one nobody checked. */
async function record(
  sb: Sb, g: Guest, status: "confirmed" | "declined", count?: number, kids?: number,
): Promise<boolean> {
  const { error } = await sb.from("guests").update({
    status,
    ...(count !== undefined ? { guest_count: count } : {}),
    /* The adult/child split, when the guest volunteered it. Same shape the
       admin field writes, so the venue report and the Excel already read it. */
    ...(kids !== undefined && count !== undefined && kids > 0
      ? { meal_counts: { regular: Math.max(0, count - kids), kids } }
      : {}),
    /* The web form sets this on every confirmation — unconditionally, since
       there is no checkbox behind it and never was. Answering here instead
       left it false, and the after-the-wedding photo request is gated on it:
       98 of שחר's 225 confirmed guests would never have been asked for their
       photos, for the sole reason that they tapped a WhatsApp button rather
       than opening the page. */
    ...(status === "confirmed" ? { wants_photos: true } : {}),
    response_time: new Date().toISOString(),
    chat_state: null, chat_state_at: null,
  }).eq("id", g.id);

  if (error) {
    console.error(`[rsvp] ${g.name} ${g.phone}: ${error.message}`);
    return false;
  }

  /* Same event the web form logs, so the timeline reads the same either way.
     Only when the answer actually changed, though: an attendance is now
     recorded on the first tap and again when the count arrives, and a timeline
     that says a guest answered twice is a timeline nobody can read. */
  if (g.status !== status) {
    await sb.from("guest_events").insert({ guest_id: g.id, event_type: "rsvp_submitted" });
  }
  return true;
}

/* What a guest is told when their answer did not save.
 *
 * Never "רשמנו 2 🤍" — a guest who believes they answered stops answering, and
 * the couple's count is wrong with nothing anywhere to show it. Saying so
 * plainly costs one honest message and keeps them in the conversation. */
const RECORD_FAILED = "משהו אצלנו נתקע ולא הצלחנו לשמור את התשובה 🙏\nתכתבו שוב בבקשה, ואם זה חוזר — נחזור אליכם.";

/* What the bot may tell a guest about their own wedding.
 *
 * Loaded lazily and only when a question was actually asked, because every
 * message this file handles would otherwise pay for a query that almost none
 * of them need. See guest-faq.ts for what is answered and what deliberately is
 * not. */
async function factsFor(sb: Sb, eventId: string | null | undefined): Promise<FaqFacts | null> {
  if (!eventId) return null;
  const { data } = await sb.from("events")
    .select("couple_names, name, date, venue_name, address, reception_time, chuppah_time, "
          + "dress_code, parking_info, rides_group_url, bit_phone, paybox_link, custom_gift_link, easy2give_link")
    .eq("id", eventId).maybeSingle();
  if (!data) return null;
  const ev = data as unknown as Record<string, unknown>;
  const day = eventDay(ev.date as string | null);
  return {
    couple: coupleName(ev as Parameters<typeof coupleName>[0]) ?? (ev.name as string | null),
    dateText: day
      ? day.toLocaleDateString("he-IL",
          { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : null,
    reception: (ev.reception_time as string | null)?.slice(0, 5) ?? null,
    chuppah: (ev.chuppah_time as string | null)?.slice(0, 5) ?? null,
    venue: venueLine(ev as Parameters<typeof venueLine>[0]),
    wazeUrl: wazeLink(ev as Parameters<typeof wazeLink>[0]),
    dressCode: (ev.dress_code as string | null) ?? null,
    parking: (ev.parking_info as string | null) ?? null,
    ridesUrl: (ev.rides_group_url as string | null) ?? null,
    /* First link the couple actually set. Bit travels separately because it
       is a phone number and not something a guest can tap. */
    giftUrl: [ev.paybox_link, ev.easy2give_link, ev.custom_gift_link]
      .map(v => (typeof v === "string" ? v.trim() : "")).find(Boolean) ?? null,
    bitPhone: (ev.bit_phone as string | null) ?? null,
  };
}

/** Returns true when the message was part of an RSVP exchange and handled. */
export async function handleGuestReply(
  sb: Sb, guestId: string, phone: string, text: string, buttonId?: string,
): Promise<boolean> {
  const cfg = getWhatsAppConfig();
  if (!cfg) return false;

  const { data: g } = await sb.from("guests")
    .select("id, name, phone, status, guest_count, chat_state, chat_state_at, event_id, rsvp_token, do_not_contact")
    .eq("id", guestId).maybeSingle();
  if (!g) return false;

  const guest = g as Guest;
  const to = phone.replace(/\D/g, "");
  const said = (buttonId ?? text ?? "").trim();

  /* Every automatic reply, written down.
   *
   * sendText and sendButtons talk to Meta and nothing else, so "רשמנו 2 🤍",
   * "רק לוודא — לא תוכלו להגיע?" and every other answer this file gives left
   * no trace: not one row in wa_messages carries the word רשמנו, and the inbox
   * showed a guest's question with nothing beneath it. Seven hundred inbound
   * messages read as unanswered when nearly all had been answered in under a
   * second.
   *
   * That is not only a display problem. Dvir opens the inbox to find what needs
   * him, and an inbox where everything looks untouched is one he has to read
   * line by line — which is the opposite of what this product is for.
   *
   * Fails soft on purpose: a log row must never cost a guest their reply. */
  const logOut = async (body: string) => {
    try {
      await sb.from("wa_messages").insert({
        event_id: (guest as { event_id?: string }).event_id ?? null,
        guest_id: guest.id,
        wa_phone: to.startsWith("972") ? to : `972${to.replace(/^0/, "")}`,
        direction: "out", body, status: "auto",
      });
    } catch { /* the message went out; the record is a nicety */ }
  };
  const sayText = async (c: NonNullable<typeof cfg>, dest: string, body: string) => {
    const r = await sendText(c, dest, body);
    await logOut(body);
    return r;
  };


  /* ── they asked us to stop ───────────────────────────────────────
   *
   * Before the human-needed check, because this is not a request for a person
   * — it is a request for silence, and answering it with "מישהו יחזור אליכם"
   * is one more message to somebody who has just said they want none.
   *
   * Until today nothing in production ever wrote do_not_contact. Eleven send
   * paths read it, one admin button set it, and the button lives on a web page
   * Dvir does not open. עירית סבן wrote "אל תחזרו / לא מכירה / טעות במספר" on
   * 07/09 and was still queued for שלמה's next reminder. See opt-out.ts for
   * why this uses its own narrow list rather than the distress pattern that
   * already catches her.
   *
   * The console is deliberately NOT pointed at them. The distress branch below
   * calls pointAdminAt, which aims Dvir's next message at the guest — so the
   * system's answer to "do not come back" was to put that person under his
   * cursor. Four messages he typed have already gone out that way. */
  {
    const optOut = optOutRequest(said);
    if (optOut.optOut && !guest.do_not_contact) {
      await sb.from("guests").update({
        do_not_contact: true,
        do_not_contact_at: new Date().toISOString(),
        do_not_contact_note: `ביקש/ה בוואטסאפ: "${String(said).slice(0, 140).replace(/[\n\t]/g, " ")}"`,
      }).eq("id", guest.id);
      await setState(sb, guest.id, null);

      if (cfg) {
        await sayText(cfg, to, OPT_OUT_REPLY);
        const admin = process.env.ADMIN_ALERT_PHONE;
        if (admin) {
          try {
            await sendRunSummary(cfg, admin, {
              event: "🔕 אורח ביקש להסיר",
              sent: "0", failed: "—", left: "—",
              attention: `${guest.name} ${guest.phone} הוסר/ה אוטומטית ולא יקבל/תקבל שוב. `
                + `מה שכתב/ה: "${String(said).slice(0, 80).replace(/[\n\t]/g, " ")}" — לא צריך לעשות כלום.`,
            });
          } catch { /* an alert must never cost the removal */ }
        }
      }
      return true;
    }
    /* Already silenced and writing again — say nothing automatic, and do not
       re-alert. The flag is the answer. */
    if (guest.do_not_contact) return true;
  }

  /* ── a person is needed, and nothing automatic will do ───────────
   *
   * Checked before every branch below, because every branch below is a machine
   * answering. נעם חדד asked "יש אפשרות לדבר עם נציג אנושי??" and was sent the
   * same automatic sentence twice — the conversation had nowhere to go and no
   * way to say so.
   *
   * Two things end it: the guest asks for a person, or we have already told
   * them twice that we did not understand. Either way the guest is told a
   * person will get back to them, Dvir is told who and why, and no further
   * automatic reply goes out. */
  {
    const { data: recent } = await sb.from("wa_messages")
      .select("direction, body, created_at").eq("guest_id", guest.id)
      .order("created_at", { ascending: false }).limit(6);
    /* Our last replies, ignoring theirs.
     *
     * This broke on the first inbound row — and the webhook writes the guest's
     * message BEFORE calling this function, so the newest row is always
     * inbound and the loop stopped on its first iteration. `confused` was
     * always 0 and the escape hatch could never fire, which is the whole
     * reason it exists. My bug, from this morning.
     *
     * Their messages are skipped rather than counted: what matters is how many
     * times in a row WE said we did not understand, and a guest naturally
     * writes between our replies. */
    let confused = 0;
    for (const m of recent ?? []) {
      if (m.direction !== "out") continue;
      if (!String(m.body ?? "").includes("לא הצלחנו להבין")) break;
      confused++;
    }
    const human = needsHuman(said, confused);
    if (human.needed && cfg) {
      await sayText(cfg, to, "קיבלנו 🤍 מישהו מאיתנו יחזור אליכם בהקדם.");
      await setState(sb, guest.id, null);
      const admin = process.env.ADMIN_ALERT_PHONE;
      if (admin) {
        /* Point his phone at this guest, so his next message answers them
           without needing an address — see admin-console.ts. */
        await pointAdminAt(sb, guest.id);
        try {
          await sendRunSummary(cfg, admin, {
            event: "🙋 אורח מחכה לך",
            sent: "0", failed: "—", left: "—",
            attention: `${guest.name} ${guest.phone} — ${HUMAN_REASON_TEXT[human.reason!]}. `
              + `מה שכתב: "${String(said).slice(0, 90).replace(/[\n\t]/g, " ")}" — כתוב "תפריט" ואז ✉️ לענות לאורח.`,
          });
        } catch { /* an alert must never cost the guest their reply */ }
      }
      return true;
    }
  }

  /* ── mid-exchange ────────────────────────────────────────────── */
  const live = stateIsLive(guest);
  /* The same decision, computed in parallel and compared — nothing acted on.
   *
   * This file decides whether somebody is recorded as attending and how many
   * meals a caterer is told to make, and until today it had no tests: every
   * import here goes through the @/lib alias, which the test runner cannot
   * resolve. wa-decide.ts is that decision as a value, with twenty tests over
   * the branches this file has.
   *
   * Running it in shadow rather than swapping it in is deliberate. שחר's
   * wedding is on 08/09 and this is the path her guests answer through; a
   * re-plumbed effect order is not something to discover from a wrong meal
   * count. Every branch below declares its own name, the mirror is checked
   * against it on real traffic, and any disagreement is logged with the
   * message that caused it. When the log stays quiet through a wedding, the
   * mirror can become the decision. */
  const view: GuestView = {
    status: (guest.status as GuestView["status"]) ?? "pending",
    guestCount: guest.guest_count ?? 1,
    liveState: live ? (guest.chat_state ?? null) : null,
    hasToken: !!(guest as { rsvp_token?: string }).rsvp_token,
  };
  const shadow = decide(view, said, {
    promptedCount: parseGuestCount,
    unpromptedCount, composite: compositeCount,
    bare: bareCount, changeIntent, ride: detectRideIntent,
  });
  const done = (took: Kind): boolean => {
    if (shadow.kind !== took) {
      console.warn(`[wa-decide:shadow] took=${took} mirror=${shadow.kind} said=${JSON.stringify(said.slice(0, 60))}`);
    }
    return true;
  };
  if (live && guest.chat_state === ASK_COUNT) {
    /* Changing their mind while the headcount question is open.
       דור ענף tapped מגיע and לא מגיע in the same second on 12/08. The second
       tap arrived here, was handed to the number parser, and came back as
       "לא הצלחנו להבין את המספר" — so a guest saying he was not coming was
       answered with a complaint about arithmetic, and stayed recorded as
       attending. A button is never an answer to "how many". */
    /* saysNotComing rather than an exact match on the button's label. נעם חדד
       wrote "אני לא מגיע" on 03/09 — three characters more than the label —
       and it fell straight through to the number parser, which answered a
       guest saying he was not coming with a complaint about arithmetic. */
    /* Zero.
     *
     * מרים דיין answered the headcount question with "0" and was told we could
     * not understand the number. It is the clearest possible answer: there is
     * no reading of "0" beside "how many of you are coming" that means
     * anything else. parseGuestCount returns null for it — correctly, because
     * a party of zero is not a party — and the branch below then treated a
     * complete answer as gibberish.
     *
     * Handled here rather than inside parseGuestCount because zero means
     * "not coming" only in answer to this question. */
    const isZero = /^0+$/.test(said.trim());

    if (/^rsvp_no$/.test(said) || isZero || saysNotComing(said)) {
      await setState(sb, guest.id, ASK_DECLINE);
      /* The one send whose failure has to be handled.
         The state above says "waiting for them to confirm the decline", and it
         is only true if the question actually left. If it did not, the guest is
         parked forever waiting to answer something they never received, and
         their next tap of "לא מגיע" is read as an answer to a missing question.
         Roll the state back so the next thing they say starts cleanly. */
      await logOut("רק לוודא — לא תוכלו להגיע?");
      const asked = await sendButtons(cfg, to, "רק לוודא — לא תוכלו להגיע?", [
        { id: "yes_decline", title: "כן, לא נוכל" },
        { id: "no_mistake",  title: "רגע, טעיתי" },
      ]);
      if (!asked.ok) await setState(sb, guest.id, null);
      return done("decline_confirm_ask");
    }
    if (/^rsvp_yes$/.test(said) || said === "מגיע") {
      /* Already recorded as attending; just ask the count again. */
      await logOut(`${guest.name}, כמה אתם מגיעים?`);
      await sendList(cfg, to, `${guest.name}, כמה אתם מגיעים?`, "בחרו מספר",
        [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `count_${n}`, title: String(n) })));
      return done("count_ask_again");
    }

    /* "1+ 2 ילדים" before a plain number, because a guest who answers in parts
       is telling us more than the total: the split is what the caterer bills
       on, and it used to fall through to Dvir and be typed in by hand. */
    const parts = compositeCount(said);
    if (parts) {
      if (!await record(sb, guest, "confirmed", parts.total, parts.kids)) {
        await sayText(cfg, to, RECORD_FAILED);
        return true;
      }
      await sayText(cfg, to,
        `מעולה, רשמנו ${parts.total} 🤍 מתוכם ${parts.kids} ילדים.\n` +
        `מחכים לראותכם בשמחה!\n\nרוצים לשנות? פשוט כתבו לנו כאן.`);
      return done("count_with_kids");
    }

    const n = parseGuestCount(said);
    if (n === null) {
      /* A guest mid-headcount who asks something else is asking, not failing.
       *
       * "יש חניה?" arriving while we wait for a number used to be answered
       * with "לא הצלחנו להבין את המספר" — and twice of that is what stops the
       * automation entirely and puts them in Dvir's pocket. The question is
       * answered, the number is asked again in the same breath, and the reply
       * deliberately does NOT contain "לא הצלחנו להבין", so the counter that
       * counts our failures does not count an answer as one. */
      const facts = await factsFor(sb, (guest as { event_id?: string }).event_id);
      const answer = facts ? answerQuestion(said, facts) : null;
      if (answer) {
        await sayText(cfg, to, `${answer}\n\nורק שנדע — כמה אתם מגיעים? 🤍`);
        return true;
      }
      await sayText(cfg, to, "לא הצלחנו להבין את המספר 🙏\nכתבו בבקשה מספר בלבד — למשל 2");
      return done("count_ask_again");
    }
    if (!await record(sb, guest, "confirmed", n)) {
      await sayText(cfg, to, RECORD_FAILED);
      return true;
    }
    await sayText(cfg, to, `מעולה, רשמנו ${n} 🤍\nמחכים לראותכם בשמחה!\n\n` +
      `רוצים לשנות? פשוט כתבו לנו כאן.`);
    return done("count_recorded");
  }

  if (live && guest.chat_state?.startsWith(`${ASK_CHANGE}:`)) {
    const proposed = parseInt(guest.chat_state.split(":")[1] ?? "", 10);
    if (/^(yes_change|כן)/.test(said) && Number.isFinite(proposed)) {
      if (!await record(sb, guest, "confirmed", proposed)) {
        await sayText(cfg, to, RECORD_FAILED);
        return true;
      }
      await sayText(cfg, to, `עודכן ל-${proposed} 🤍 מחכים לראותכם!`);
      return done("change_yes");
    }
    /* Anything that is not a clear yes leaves the existing answer alone. */
    await setState(sb, guest.id, null);
    await sayText(cfg, to, `בסדר גמור — השארנו ${guest.guest_count ?? 1}.\nאם תרצו לשנות, כתבו לנו כאן 🙏`);
    return done("change_no");
  }

  if (live && guest.chat_state === ASK_DECLINE) {
    if (/^(yes_decline|כן)/.test(said)) {
      if (!await record(sb, guest, "declined")) {
        await sayText(cfg, to, RECORD_FAILED);
        return true;
      }
      await sayText(cfg, to, "תודה שעדכנתם 🤍 נתגעגע!\nאם משהו ישתנה — כתבו לנו כאן.");
      return done("decline_recorded");
    }
    /* Anything that is not a clear yes returns them to the start rather than
       being read as a decline. */
    await setState(sb, guest.id, null);
    await logOut("אין בעיה! אז מה נאמר?");
    await sendButtons(cfg, to, "אין בעיה! אז מה נאמר?", [
      { id: "rsvp_yes", title: "מגיע" },
      { id: "rsvp_no",  title: "לא מגיע" },
    ]);
    return done("decline_cancelled");
  }

  /* ── first tap ───────────────────────────────────────────────── */
  if (/^rsvp_yes$/.test(said) || said === "מגיע") {
    /* The attendance is recorded here, on the tap itself — not held until the
       guest also says how many.

       Holding it made "כמה אתם מגיעים?" a precondition for being counted, and
       that question does not always arrive: Meta blocks our follow-ups with
       "not delivered to maintain healthy ecosystem engagement", and a guest who
       taps מגיע and is never asked anything else simply stops. Two guests sat
       in awaiting_count on the morning of 12/08 having plainly said they were
       coming, and the couple's number did not know it.

       A guest who taps מגיע has told us they are coming. The headcount is a
       refinement of an answer we already have, and it arrives below. */
    if (!await record(sb, guest, "confirmed", guest.guest_count ?? 1)) {
      await sayText(cfg, to, RECORD_FAILED);
      return true;
    }
    await setState(sb, guest.id, ASK_COUNT);   /* after record(), which clears it */
    await logOut(`${guest.name}, נהדר! כמה אתם מגיעים?`);
    await sendList(cfg, to, `${guest.name}, נהדר! כמה אתם מגיעים?`, "בחרו מספר",
      [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `count_${n}`, title: String(n) })));
    return done("yes_first_tap");
  }

  if (/^rsvp_no$/.test(said) || said === "לא מגיע") {
    await setState(sb, guest.id, ASK_DECLINE);
    await logOut("רק לוודא — לא תוכלו להגיע?");
    await sendButtons(cfg, to, "רק לוודא — לא תוכלו להגיע?", [
      { id: "yes_decline", title: "כן, לא נוכל" },
      { id: "no_mistake",  title: "רגע, טעיתי" },
    ]);
    return done("no_first_tap");
  }

  /* A list selection arrives as count_N even without chat_state — for instance
     if the guest answered twice. Honour it rather than drop it. */
  const m = said.match(/^count_(\d+)$/);
  if (m) {
    if (!await record(sb, guest, "confirmed", parseInt(m[1], 10))) {
      await sayText(cfg, to, RECORD_FAILED);
      return true;
    }
    await sayText(cfg, to, `רשמנו ${m[1]} 🤍 מחכים לראותכם!`);
    return done("list_pick");
  }

  /* A bare number from someone who has not answered yet.
     נוי's RSVP link hung on the loading screen — she tried it from her
     husband's phone and from a computer — so she was asked in plain words how
     many were coming and replied "תודה רבה\n1". That is an answer. It was
     dropped because she had no chat_state, and three hours later the system
     sent her a reminder to confirm attendance she had already given.
     Only for guests still pending, and the reply below is worded so a
     misreading is easy to correct. */
  if (guest.status === "pending") {
    /* unpromptedCount, not parseGuestCount. Nothing was asked, so nothing has
       narrowed what this message can mean: parseGuestCount substring-matches
       its word table, and "מזל טוב לזוג המאושר" contains "זוג" — a
       congratulation booked two seats and answered "רשמנו 2 🤍". A refusal
       carrying a number did the same in the other direction. */
    /* The split, when they volunteer it before being asked. Handled in the
       mid-question branch since 02/09 and not here, so "1+ 2 ילדים" from a
       guest nobody had asked yet fell through to Dvir — the same sentence,
       understood or not depending only on whether a question happened to be
       open. Found by wa-decide.ts, which had it in both places. */
    const parts = compositeCount(said);
    if (parts) {
      if (!await record(sb, guest, "confirmed", parts.total, parts.kids)) {
        await sayText(cfg, to, RECORD_FAILED);
        return true;
      }
      await sayText(cfg, to,
        `רשמנו ${parts.total} 🤍 מתוכם ${parts.kids} ילדים.\n` +
        `אם התכוונתם למשהו אחר — כתבו לנו כאן ונתקן.`);
      return done("unprompted_composite");
    }

    const n = unpromptedCount(said);
    if (n !== null) {
      if (!await record(sb, guest, "confirmed", n)) {
        await sayText(cfg, to, RECORD_FAILED);
        return true;
      }
      await sayText(cfg, to, `רשמנו ${n} 🤍 מחכים לראותכם!\nאם התכוונתם למשהו אחר — כתבו לנו כאן ונתקן.`);
      return done("unprompted_count");
    }
  }

  /* A number from someone who has already answered.
   *
   * The message this system sends the moment it records a headcount ends with
   * "רוצים לשנות? פשוט כתבו לנו כאן." — and then nothing here handled it. The
   * branch above is gated on status === "pending", so a guest who had already
   * been counted fell past it, past the ride detector, and out of the function.
   *
   * משה כץ was recorded as 1 on 20/08 and sent "2" on 27/08, doing exactly
   * what he had been told to do. It was dropped in silence, and the number the
   * caterer would have been given was short by one seat at a wedding eight
   * days away. Inviting a correction and then discarding it is worse than
   * never inviting it.
   *
   * Asked rather than applied. A bare number from someone mid-question is an
   * answer; the same number from someone who finished answering a week ago
   * could be anything — a table number, a reply to a relative, a stray tap.
   * The decline path in this file already confirms before it acts, for the
   * same reason, and this follows it. */
  if (guest.status === "confirmed" || guest.status === "declined") {
    /* A bare number, or a sentence that says in words to change it. The second
       exists because the first is strict enough to have cost a real guest ten
       hours: דליה wrote "אשמח לשנות את המספר ל-5 שמגיעים" at 05:34, was not
       heard, and tried again at 15:07 with a bare "5". Both routes only ever
       propose — the confirmation below is unchanged. */
    const n = bareCount(said) ?? changeIntent(said);
    if (n !== null) {
      const current = guest.guest_count ?? 1;
      if (guest.status === "confirmed" && n === current) {
        await sayText(cfg, to, `רשום אצלנו ${current} — הכול מעודכן 🤍`);
        return done("change_same");
      }
      await setState(sb, guest.id, `${ASK_CHANGE}:${n}`);
      const asked = await sendButtons(cfg, to,
        guest.status === "declined"
          ? `רשום אצלנו שלא תוכלו להגיע. לעדכן ל-${n} מגיעים?`
          : `רשום אצלנו ${current}. לעדכן ל-${n}?`,
        [{ id: "yes_change", title: "כן, עדכנו" },
         { id: "no_change",  title: "לא, להשאיר" }]);
      /* Same rollback as the decline path: a state that says "waiting for an
         answer" is only true if the question actually left. */
      if (!asked.ok) await setState(sb, guest.id, null);
      return done("change_proposed");
    }
  }

  /* "הקישור לא עובד".
   *
   * Four guests wrote this and every one of them waited for Dvir — one for
   * fifteen hours. They are the guests who are actively trying to answer and
   * cannot, which makes them the most expensive message in the inbox: a lost
   * RSVP that wanted to be given.
   *
   * The link is per-guest and never changes, so re-sending it costs nothing
   * and cannot be wrong. Plain text inside the 24h window they opened by
   * writing to us, so no template and no quota.
   *
   * Deliberately last, after every parse above: "לא עובד" appears inside
   * answers that are not about the link at all, and a guest who said something
   * we understood must not be answered with a link instead. */
  if (/(קישור|לינק|כפתור)/.test(said)
      && /(לא עובד|לא נפתח|נכשל|לא מגיב|לא עובדים|לא מגיבים|שוב|מחדש|שולח)/.test(said)) {
    const token = (guest as { rsvp_token?: string }).rsvp_token;
    if (token) {
      const base = APP_URL;
      await sayText(cfg, to,
        `הנה הקישור האישי שלכם שוב 🤍\n${base}/rsvp/${token}\n\n` +
        `אם הוא עדיין לא נפתח — אפשר פשוט לכתוב לנו כאן כמה אתם ונרשום ידנית.`);
      return done("link_resend");
    }
  }

  /* A lift mentioned in ordinary words.
     "אני נוסע מחדרה ויש לי מקום" is an offer, and it used to reach the inbox
     and nowhere else — the rides board only ever knew what somebody typed into
     the RSVP form, which 7% of guests did. Both an intent and a town must be
     present, so a guest who merely mentions where they live is not silently
     listed as a driver. */
  const ride = detectRideIntent(said);
  if (ride) {
    await sb.from("guests")
      .update({ ride_from: ride.area, ride_role: ride.role })
      .eq("id", guest.id);
    await sayText(cfg, to, ride.role === "offer"
      ? `רשמנו שיש לכם מקום ברכב מ${ride.area} 🚗\nאם מישהו משם מחפש טרמפ — נחבר ביניכם.`
      : `רשמנו שאתם מחפשים טרמפ מ${ride.area} 🚗\nאם מישהו משם נוסע — נחבר ביניכם.`);
    return done("ride");
  }

  /* Last of all: a question about the wedding itself.
   *
   * Everything above has failed to read this as an RSVP, which is exactly the
   * condition under which "מתי זה מתחיל?" or "איך מגיעים?" arrives. The facts
   * are already in the events row the invitation was built from — the system
   * knew the answer and was replying that it did not understand.
   *
   * Placed here and nowhere else. A "2" is a headcount and an "אני לא מגיע"
   * is a decline long before this line, and that ordering is what lets the
   * patterns in guest-faq.ts be generous. */
  {
    const facts = await factsFor(sb, (guest as { event_id?: string }).event_id);
    const answer = facts ? answerQuestion(said, facts) : null;
    if (answer) {
      await sayText(cfg, to, answer);
      return true;
    }
  }

  return false;
}
