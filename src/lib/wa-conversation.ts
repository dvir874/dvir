import type { SupabaseClient } from "@supabase/supabase-js";
import { getWhatsAppConfig } from "@/lib/whatsapp";
import { sendButtons, sendList, sendText, parseGuestCount } from "@/lib/wa-interactive";
import { detectRideIntent } from "@/lib/rides";
import { stateIsLive } from "@/lib/chat-state";
import { bareCount, changeIntent, unpromptedCount} from "@/lib/guest-count";

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

async function record(sb: Sb, g: Guest, status: "confirmed" | "declined", count?: number) {
  await sb.from("guests").update({
    status,
    ...(count !== undefined ? { guest_count: count } : {}),
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

  /* Same event the web form logs, so the timeline reads the same either way.
     Only when the answer actually changed, though: an attendance is now
     recorded on the first tap and again when the count arrives, and a timeline
     that says a guest answered twice is a timeline nobody can read. */
  if (g.status !== status) {
    await sb.from("guest_events").insert({ guest_id: g.id, event_type: "rsvp_submitted" });
  }
}

/** Returns true when the message was part of an RSVP exchange and handled. */
export async function handleGuestReply(
  sb: Sb, guestId: string, phone: string, text: string, buttonId?: string,
): Promise<boolean> {
  const cfg = getWhatsAppConfig();
  if (!cfg) return false;

  const { data: g } = await sb.from("guests")
    .select("id, name, phone, status, guest_count, chat_state, chat_state_at")
    .eq("id", guestId).maybeSingle();
  if (!g) return false;

  const guest = g as Guest;
  const to = phone.replace(/\D/g, "");
  const said = (buttonId ?? text ?? "").trim();

  /* ── mid-exchange ────────────────────────────────────────────── */
  const live = stateIsLive(guest);
  if (live && guest.chat_state === ASK_COUNT) {
    /* Changing their mind while the headcount question is open.
       דור ענף tapped מגיע and לא מגיע in the same second on 12/08. The second
       tap arrived here, was handed to the number parser, and came back as
       "לא הצלחנו להבין את המספר" — so a guest saying he was not coming was
       answered with a complaint about arithmetic, and stayed recorded as
       attending. A button is never an answer to "how many". */
    if (/^rsvp_no$/.test(said) || said === "לא מגיע") {
      await setState(sb, guest.id, ASK_DECLINE);
      /* The one send whose failure has to be handled.
         The state above says "waiting for them to confirm the decline", and it
         is only true if the question actually left. If it did not, the guest is
         parked forever waiting to answer something they never received, and
         their next tap of "לא מגיע" is read as an answer to a missing question.
         Roll the state back so the next thing they say starts cleanly. */
      const asked = await sendButtons(cfg, to, "רק לוודא — לא תוכלו להגיע?", [
        { id: "yes_decline", title: "כן, לא נוכל" },
        { id: "no_mistake",  title: "רגע, טעיתי" },
      ]);
      if (!asked.ok) await setState(sb, guest.id, null);
      return true;
    }
    if (/^rsvp_yes$/.test(said) || said === "מגיע") {
      /* Already recorded as attending; just ask the count again. */
      await sendList(cfg, to, `${guest.name}, כמה אתם מגיעים?`, "בחרו מספר",
        [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `count_${n}`, title: String(n) })));
      return true;
    }

    const n = parseGuestCount(said);
    if (n === null) {
      await sendText(cfg, to,
        "לא הצלחנו להבין את המספר 🙏\nכתבו בבקשה מספר בלבד — למשל 2");
      return true;
    }
    await record(sb, guest, "confirmed", n);
    await sendText(cfg, to,
      `מעולה, רשמנו ${n} 🤍\nמחכים לראותכם בשמחה!\n\n` +
      `רוצים לשנות? פשוט כתבו לנו כאן.`);
    return true;
  }

  if (live && guest.chat_state?.startsWith(`${ASK_CHANGE}:`)) {
    const proposed = parseInt(guest.chat_state.split(":")[1] ?? "", 10);
    if (/^(yes_change|כן)/.test(said) && Number.isFinite(proposed)) {
      await record(sb, guest, "confirmed", proposed);
      await sendText(cfg, to, `עודכן ל-${proposed} 🤍 מחכים לראותכם!`);
      return true;
    }
    /* Anything that is not a clear yes leaves the existing answer alone. */
    await setState(sb, guest.id, null);
    await sendText(cfg, to,
      `בסדר גמור — השארנו ${guest.guest_count ?? 1}.\nאם תרצו לשנות, כתבו לנו כאן 🙏`);
    return true;
  }

  if (live && guest.chat_state === ASK_DECLINE) {
    if (/^(yes_decline|כן)/.test(said)) {
      await record(sb, guest, "declined");
      await sendText(cfg, to, "תודה שעדכנתם 🤍 נתגעגע!\nאם משהו ישתנה — כתבו לנו כאן.");
      return true;
    }
    /* Anything that is not a clear yes returns them to the start rather than
       being read as a decline. */
    await setState(sb, guest.id, null);
    await sendButtons(cfg, to, "אין בעיה! אז מה נאמר?", [
      { id: "rsvp_yes", title: "מגיע" },
      { id: "rsvp_no",  title: "לא מגיע" },
    ]);
    return true;
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
    await record(sb, guest, "confirmed", guest.guest_count ?? 1);
    await setState(sb, guest.id, ASK_COUNT);   /* after record(), which clears it */
    await sendList(cfg, to, `${guest.name}, נהדר! כמה אתם מגיעים?`, "בחרו מספר",
      [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ id: `count_${n}`, title: String(n) })));
    return true;
  }

  if (/^rsvp_no$/.test(said) || said === "לא מגיע") {
    await setState(sb, guest.id, ASK_DECLINE);
    await sendButtons(cfg, to, "רק לוודא — לא תוכלו להגיע?", [
      { id: "yes_decline", title: "כן, לא נוכל" },
      { id: "no_mistake",  title: "רגע, טעיתי" },
    ]);
    return true;
  }

  /* A list selection arrives as count_N even without chat_state — for instance
     if the guest answered twice. Honour it rather than drop it. */
  const m = said.match(/^count_(\d+)$/);
  if (m) {
    await record(sb, guest, "confirmed", parseInt(m[1], 10));
    await sendText(cfg, to, `רשמנו ${m[1]} 🤍 מחכים לראותכם!`);
    return true;
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
    const n = unpromptedCount(said);
    if (n !== null) {
      await record(sb, guest, "confirmed", n);
      await sendText(cfg, to,
        `רשמנו ${n} 🤍 מחכים לראותכם!\nאם התכוונתם למשהו אחר — כתבו לנו כאן ונתקן.`);
      return true;
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
        await sendText(cfg, to, `רשום אצלנו ${current} — הכול מעודכן 🤍`);
        return true;
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
      return true;
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
    await sendText(cfg, to, ride.role === "offer"
      ? `רשמנו שיש לכם מקום ברכב מ${ride.area} 🚗\nאם מישהו משם מחפש טרמפ — נחבר ביניכם.`
      : `רשמנו שאתם מחפשים טרמפ מ${ride.area} 🚗\nאם מישהו משם נוסע — נחבר ביניכם.`);
    return true;
  }

  return false;
}
