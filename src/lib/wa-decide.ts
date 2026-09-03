/* What should happen when a guest writes to us.
 *
 * wa-conversation.ts is the file that decides whether somebody is recorded as
 * attending, and how many meals the caterer is told to make. It is 365 lines
 * and it had no tests, because everything in it imports through the @/lib
 * alias and the test runner cannot resolve that — the same reason
 * phone-validate.ts and guest-count.ts are import-free files.
 *
 * So the decision is here, on its own, as a value: given what we know about a
 * guest and what they just sent, which branch applies. wa-conversation keeps
 * every effect — the sends, the writes, the state — and takes the branch from
 * here.
 *
 * The order below is the order that file already had, and the order matters
 * more than any individual rule:
 *
 *   1. mid-exchange, when a question of ours is open
 *   2. a button, or the words a button produces
 *   3. a list selection, even with no state
 *   4. an unprompted number from somebody who has not answered
 *   5. a number from somebody who has
 *   6. a broken link
 *   7. a lift
 *   8. nothing we understand — a person reads it
 *
 * A message matching two rules is not ambiguous: the earlier one wins, because
 * an open question is more specific than a guess about free text.
 */

export type Kind =
  | "decline_confirm_ask"    /* they tapped "not coming" while we asked how many */
  | "count_ask_again"        /* mid-count, and we could not read a number */
  | "count_recorded"         /* mid-count, and we could */
  | "count_with_kids"        /* mid-count, and they told us the split too */
  | "change_yes"             /* they confirmed a headcount change we proposed */
  | "change_no"              /* they did not */
  | "decline_recorded"       /* they confirmed they are not coming */
  | "decline_cancelled"      /* they took the decline back */
  | "yes_first_tap"          /* "coming" from a guest we had not asked */
  | "no_first_tap"           /* "not coming", which we always double-check */
  | "list_pick"              /* count_N, even with no state */
  | "unprompted_count"       /* a bare number from somebody still pending */
  | "unprompted_composite"   /* "1 + 2 ילדים" from somebody still pending */
  | "change_proposed"        /* a number from somebody who already answered */
  | "change_same"            /* ...that matches what they already said */
  | "link_resend"            /* "הקישור לא עובד" */
  | "ride"                   /* an offer or a request, in words */
  | "human";                 /* nothing we understand */

export interface Decision {
  kind: Kind;
  /** Headcount, where the branch carries one. */
  count?: number;
  /** How many of `count` are children. */
  kids?: number;
  /** Town and role, for a lift. */
  ride?: { area: string; role: "offer" | "seek" };
}

export const ASK_COUNT = "awaiting_count";
export const ASK_DECLINE = "awaiting_decline_confirm";
export const ASK_CHANGE = "awaiting_count_change";

export interface GuestView {
  status: "pending" | "confirmed" | "declined";
  guestCount: number;
  /** null when no question of ours is open, or when it has expired. */
  liveState: string | null;
  hasToken: boolean;
}

/** The parsers wa-conversation already uses, passed in rather than imported. */
export interface Parsers {
  /** Generous — right only when a question is open. */
  promptedCount: (s: string) => number | null;
  /** Strict — for a message nobody asked for. */
  unpromptedCount: (s: string) => number | null;
  /** "1 + 2 ילדים" → { total, kids }. */
  composite: (s: string) => { total: number; kids: number } | null;
  /** A bare number from somebody who has already answered. */
  bare: (s: string) => number | null;
  /** "נעדכן ל-4" — a change asked for in words. */
  changeIntent: (s: string) => number | null;
  ride: (s: string) => { area: string; role: "offer" | "seek" } | null;
}

const YES = /^rsvp_yes$/;
const NO = /^rsvp_no$/;
const LIST_PICK = /^count_(\d{1,2})$/;
/* "לא עובד" appears inside answers that are not about the link at all, so both
   halves must be present and this is checked last. */
const LINK_WORD = /(קישור|לינק|כפתור)/;
const LINK_BROKEN = /(לא עובד|לא נפתח|נכשל|לא מגיב|לא עובדים|לא מגיבים|שוב|מחדש|שולח)/;
/* A message that is nothing but "it failed" — "היי זה נכשל לי", "לא עובד לי".
   By the time this is reached every other parse has declined it, and the only
   thing we ever hand a guest is a link, so there is nothing else it could be
   about. Length-capped because a long message saying something failed is
   usually saying more than that, and belongs with a person. */
const LINK_BARE_FAIL = /^(?=.{0,45}$)[^?]*?(לא עובד|לא נפתח|נכשל|לא מצליח|לא נכנס)[^?]*$/;

export function decide(guest: GuestView, said: string, p: Parsers): Decision {
  const t = String(said ?? "").trim();

  /* ── 1 · a question of ours is open ─────────────────────────────── */
  if (guest.liveState === ASK_COUNT) {
    /* A button is never an answer to "how many". דור ענף tapped מגיע and
       לא מגיע in the same second; the second reached the number parser and
       came back as a complaint about arithmetic while he stayed recorded as
       attending. */
    if (NO.test(t) || t === "לא מגיע") return { kind: "decline_confirm_ask" };
    if (YES.test(t) || t === "מגיע") return { kind: "count_ask_again" };

    const parts = p.composite(t);
    if (parts) return { kind: "count_with_kids", count: parts.total, kids: parts.kids };

    const n = p.promptedCount(t);
    if (n === null) return { kind: "count_ask_again" };
    return { kind: "count_recorded", count: n };
  }

  if (guest.liveState?.startsWith(`${ASK_CHANGE}:`)) {
    const proposed = parseInt(guest.liveState.split(":")[1] ?? "", 10);
    if (/^(yes_change|כן)/.test(t) && Number.isFinite(proposed)) {
      return { kind: "change_yes", count: proposed };
    }
    /* Anything that is not a clear yes leaves the existing answer alone. */
    return { kind: "change_no" };
  }

  if (guest.liveState === ASK_DECLINE) {
    if (/^(yes_decline|כן)/.test(t)) return { kind: "decline_recorded" };
    return { kind: "decline_cancelled" };
  }

  /* ── 2 · a first tap ────────────────────────────────────────────── */
  if (YES.test(t) || t === "מגיע") return { kind: "yes_first_tap" };
  /* Always double-checked. A tap is instant and cannot be taken back, and a
     guest who declines by accident is removed from a wedding they meant to
     attend. A stray "מגיע" merely goes unanswered at the next question. */
  if (NO.test(t) || t === "לא מגיע") return { kind: "no_first_tap" };

  /* ── 3 · a list selection with no state ─────────────────────────── */
  const pick = LIST_PICK.exec(t);
  if (pick) return { kind: "list_pick", count: parseInt(pick[1], 10) };

  /* ── 4 · an unprompted number from somebody still waiting ───────── */
  if (guest.status === "pending") {
    const parts = p.composite(t);
    if (parts) return { kind: "unprompted_composite", count: parts.total, kids: parts.kids };
    const n = p.unpromptedCount(t);
    if (n !== null) return { kind: "unprompted_count", count: n };
  }

  /* ── 5 · a number from somebody who has already answered ────────── */
  if (guest.status === "confirmed" || guest.status === "declined") {
    const n = p.bare(t) ?? p.changeIntent(t);
    if (n !== null) {
      if (guest.status === "confirmed" && n === guest.guestCount) {
        return { kind: "change_same", count: n };
      }
      return { kind: "change_proposed", count: n };
    }
  }

  /* ── 6 · the link is broken ─────────────────────────────────────── */
  if (guest.hasToken
      && ((LINK_WORD.test(t) && LINK_BROKEN.test(t)) || LINK_BARE_FAIL.test(t))) {
    return { kind: "link_resend" };
  }

  /* ── 7 · a lift, in ordinary words ──────────────────────────────── */
  const ride = p.ride(t);
  if (ride) return { kind: "ride", ride };

  /* ── 8 · a person reads it ──────────────────────────────────────── */
  return { kind: "human" };
}
