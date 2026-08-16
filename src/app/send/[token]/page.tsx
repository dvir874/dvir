"use client";

import { use, useCallback, useEffect, useState } from "react";
import { coupleName } from "@/lib/couple-name";
import { eventTimes } from "@/lib/event-times";

/* The helper's screen — one guest at a time, from a phone.
 *
 * Visual language is taken from /admin/send rather than invented: same ivory
 * ground, same gold, same card shape, same one-guest-at-a-time queue. The
 * difference is scope, not style — this page can send and mark, and nothing
 * else.
 *
 * The confirmation step is the whole point. Opening WhatsApp is not sending:
 * WhatsApp Web logs out and shows a QR screen, phones lose signal, people
 * change their mind mid-message. Marking on the attempt is how a guest ends up
 * recorded as invited having received nothing, and with no delivery report on a
 * hand-sent message nothing downstream would ever catch it.
 */

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4",
  green: "#25D366",
};

interface Guest { id: string; name: string; phone: string; rsvp_token: string; group: string | null }
interface Data {
  /* Everything past `name` is optional on purpose: the fields arrived after
     helpers were already sending, and a link opened against an older response
     must still build a message rather than render nothing. */
  event: {
    name: string; couple_names?: string | null;
    date: string; address: string | null; venue_name: string | null;
    reception_time?: string | null; chuppah_time?: string | null;
  };
  todo: Guest[]; done: number; total: number;
}

export default function HelperSendPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  /* Read straight off the URL rather than through useSearchParams, which needs
     a Suspense boundary this page deliberately does not have — see the note by
     the fetch below. Read once, in an effect, so the server and the first
     client render agree and hydration does not mismatch. */
  /* null = not read yet. The distinction matters: mode used to start as "" and
     that is a real value, so the first render fired a fetch with no mode at all
     — the FIRST-round question — and a second one followed a tick later with
     mode=reminder. Two requests in flight, and whichever answered last won.
     Oriya's screen kept the empty first-round answer over the eleven guests the
     reminder query was returning at the same moment.
     Nothing loads until this is resolved, so exactly one request is ever sent. */
  const [mode, setMode] = useState<string | null>(null);
  useEffect(() => {
    setMode(new URLSearchParams(window.location.search).get("mode") ?? "");
  }, []);
  const [data, setData]   = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [awaiting, setAwaitingState] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Opening WhatsApp on a phone leaves this page entirely — the browser may
     unload it and rebuild it from scratch on the way back. React state does not
     survive that, so the helper sent a message, returned, and found the screen
     exactly as she left it: no confirmation, no progress, the same guest. The
     pending confirmation has to live somewhere that outlives the page. */
  const AWAIT_KEY = `helper_awaiting_${token}`;
  const setAwaiting = useCallback((id: string | null) => {
    setAwaitingState(id);
    try {
      if (id) localStorage.setItem(AWAIT_KEY, id);
      else localStorage.removeItem(AWAIT_KEY);
    } catch { /* private mode — the in-memory state still works */ }
  }, [AWAIT_KEY]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AWAIT_KEY);
      if (saved) setAwaitingState(saved);
    } catch { /* ignore */ }
  }, [AWAIT_KEY]);

  /* "נשלחו על ידך" has to outlive the trip to WhatsApp, for the same reason the
     pending confirmation does — and it did not.

     The count lived only in React state, so every return from WhatsApp that
     rebuilt the page reset it to zero while the server went on recording
     correctly. Oriya finished nine guests and her screen said seven, which is
     how a helper concludes she has more to do, or that the tool is losing her
     work. The server was right the whole time; only the number she could see
     was wrong, and that is the version of this bug that erodes trust fastest. */
  /* Scoped by mode as well as token.
     
     It was keyed on the token alone, so the guests marked sent in the first
     round were still in localStorage and were filtered straight out of the
     reminder queue. Oriya opened her link, the server had someone waiting for
     her, and the page showed 🎉 "סיימת! תודה רבה" over an empty list — a guest
     hidden by a browser, on a screen that said the work was done. */
  const SENT_KEY = `helper_sent_${token}${mode ? "_" + mode : ""}`;
  useEffect(() => {
    if (mode === null) return;   /* would read round one's key and its names */
    try {
      const saved = JSON.parse(localStorage.getItem(SENT_KEY) ?? "[]");
      /* Assign, never merge. mode is "" on the first render and becomes
         "reminder" a tick later, so this effect runs twice with two different
         keys: first the old round-one list, then the reminder's own. Guarding
         on `saved.length` meant the second run — correctly finding nothing —
         left round one's names in place, and the queue emptied itself again.
         Scoping the key was only half the fix; this is the other half. */
      setSentIds(new Set(Array.isArray(saved) ? saved : []));
    } catch { /* private mode — the in-session count still works */ }
  }, [SENT_KEY, mode]);

  const load = useCallback(async () => {
    if (mode === null) return;   /* see above — one request, with the right mode */
    try {
      /* ?h=noya narrows the queue to the guests assigned to this helper, so two
         family members working at the same time never land on the same person.
         Read from the URL rather than through useSearchParams to keep this a
         plain client component with no Suspense boundary; the token in the path
         is still the only thing that grants access, and h only chooses a slice
         of what that token already allows. */
      const who = new URLSearchParams(window.location.search).get("h") ?? "";
      /* The mode has to reach the server too. The page alone only changes the
         wording; who the wording is for is the server's question, and asking it
         the first-round question while showing second-round text is how you get
         an empty list and no idea why. */
      const p = new URLSearchParams();
      if (who) p.set("h", who);
      if (mode) p.set("mode", mode);
      const qs = p.toString() ? `?${p}` : "";
      const r = await fetch(`/api/helper/${token}${qs}`, { signal: AbortSignal.timeout(15_000) });
      if (!r.ok) { setError(r.status === 404 ? "הקישור אינו תקין" : "לא הצלחנו לטעון את הרשימה"); return; }
      setData(await r.json());
    } catch { setError("לא הצלחנו לטעון את הרשימה"); }
    /* mode belongs here. It is read from the URL in an effect, so it is "" on
       the first render and only becomes "reminder" afterwards — without this
       dependency the list is fetched once, with the first-round question, and
       never asked again. */
  }, [token, mode]);

  useEffect(() => { load(); }, [load]);

  const queue = (data?.todo ?? []).filter(g => !sentIds.has(g.id) && !skipped.has(g.id));
  /* A pending confirmation outranks queue order. After the trip to WhatsApp the
     list is fetched again and may come back in a different order; landing on a
     different guest would mean the one just messaged is never confirmed, and
     the next helper session shows them as still needing an invitation. */
  const current = (awaiting ? queue.find(g => g.id === awaiting) : null) ?? queue[0] ?? null;

  /* ?mode=reminder sends the second-round text instead of the invitation.
   *
   * A guest who has already had the invitation does not need to be introduced
   * to the wedding again — they need one short line and the same link. Sending
   * the full invitation twice reads as a mistake and teaches people that our
   * messages repeat, which is how a reminder stops being read at all.
   *
   * A query parameter rather than a second page or a toggle: the link a helper
   * receives already decides what she is doing that afternoon, and the plain
   * /send/<token> link keeps behaving exactly as it does today, so nothing
   * anyone is already holding changes. */
  const reminder = mode === "reminder";

  function message(g: Guest) {
    const ev = data!.event;
    const when = ev.date
      ? new Date(ev.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "";
    const where = [ev.venue_name, ev.address].filter(Boolean).join(", ");

    /* The name the guest reads, not the label the dashboard shows. events.name
       is a title — "חתונת אורי ושחר" — and dropped into the sentence below it
       produced "בעזרת ה׳ חתונת אורי ושחר מתחתנים". couple_names is the real
       field; coupleName falls back to the title for an event created before
       that column existed, exactly as this page behaved yesterday. */
    const couple = coupleName(ev) ?? ev.name;

    /* Was the constant "קבלת פנים 19:00 | חופה וקידושין 20:00", written when
       there was one wedding in the system. אורי ✧ שחר receive at 17:30 and
       stand under the chuppah at 18:15, set before sunset on purpose, so that
       line would have put guests in the car during their own chuppah.
       Missing times drop the line rather than guess one: a wedding with no
       hour stated still gets its date, its place and its link, and a wrong
       hour is a valid string that nothing downstream would ever flag. */
    const times = eventTimes(ev);
    const details = [
      when  ? `🗓 ${when}`  : null,
      where ? `📍 ${where}` : null,
      times ? `🥂 ${times}` : null,
    ].filter(Boolean).join("\n");

    if (reminder) {
      /* Opens with the same line every template in the system opens with —
         see DEC-007. The couple's names come after it, never before. */
      return `💍 משפחה וחברים יקרים!

רק תזכורת קטנה 🤍
*${couple}* מתחתנים ב-${when}, ועדיין לא קיבלנו מכם תשובה.

זה לוקח שנייה, ועוזר להם מאוד לסגור מספרים מול האולם:

👇 לחצו כאן לאישור הגעה 👇
${location.origin}/rsvp/${g.rsvp_token}

${details}

תודה רבה! מחכים לחגוג איתכם 🤍

_(הודעה זו נשלחה באמצעות שירות רגע לפני)_`;
    }
    /* Sent in the service's voice, not the couple's and not the helper's.
       A guest reading "אנחנו שמחים להזמין" from a number that is neither bride
       nor groom is being told something that is not true of the sender; the
       closing line is what makes the message honest about where it came from,
       and it matches every other template in the system. */
    return `💍 משפחה וחברים יקרים!

בעזרת ה׳ *${couple}* מתחתנים! 🤍
והם שמחים להזמין אתכם לחגוג איתם:

${details}

👇 לחצו כאן לצפייה בהזמנה המלאה ואישור הגעה 👇
${location.origin}/rsvp/${g.rsvp_token}

מחכים לחגוג איתכם ביום המאושר שלהם! 🤍

_(הודעה זו נשלחה באמצעות שירות רגע לפני)_`;
  }

  function openWhatsApp(g: Guest) {
    const phone = g.phone.replace(/\D/g, "").replace(/^0/, "972");
    const text = encodeURIComponent(message(g));
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    window.open(
      isMobile ? `https://wa.me/${phone}?text=${text}`
               : `https://web.whatsapp.com/send?phone=${phone}&text=${text}`,
      "_blank",
    );
    setAwaiting(g.id);
  }

  async function confirm(g: Guest) {
    setBusy(true);
    try {
      const r = await fetch(`/api/helper/${token}`, {
        signal: AbortSignal.timeout(15_000),
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_id: g.id }),
      });
      if (r.ok) {
        setSentIds(prev => {
          const next = new Set(prev).add(g.id);
          /* Written the moment the server confirms, not on unload: a phone
             switching to WhatsApp may never run another line of this page. */
          try { localStorage.setItem(SENT_KEY, JSON.stringify([...next])); } catch {}
          return next;
        });
        setAwaiting(null);
        await load();
      }
      else alert("לא הצלחנו לשמור. נסו שוב.");
    } catch { alert("לא הצלחנו לשמור. בדקו חיבור לאינטרנט."); }
    setBusy(false);
  }

  const box: React.CSSProperties = {
    background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 18,
    padding: "24px 20px", textAlign: "center",
  };

  if (error) return (
    <Shell><div style={box}><p style={{ color: C.muted, fontSize: 15 }}>{error}</p></div></Shell>
  );
  if (!data) return (
    <Shell><p style={{ color: C.muted, fontSize: 14, textAlign: "center" }}>טוען…</p></Shell>
  );

  const sentNow = sentIds.size;
  const left = queue.length;
  const pct = data.total ? Math.round(((data.done + sentNow) / data.total) * 100) : 0;

  return (
    <Shell>
      <p style={{ fontSize: 13, color: C.muted, margin: "0 0 4px" }}>עוזרים לשלוח הזמנות</p>
      <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 800, color: C.dark, margin: "0 0 18px" }}>
        {data.event.name}
      </h1>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 6 }}>
        <span>נשלחו על ידך: {sentNow}</span>
        <span>נותרו: {left}</span>
      </div>
      <div style={{ height: 8, background: C.cream, borderRadius: 99, overflow: "hidden", marginBottom: 22 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: C.gold, transition: "width .3s" }} />
      </div>

      {!current ? (
        <div style={{ ...box, background: "rgba(74,124,89,0.08)", border: "1.5px solid rgba(74,124,89,0.3)" }}>
          <p style={{ fontSize: 34, margin: "0 0 8px" }}>🎉</p>
          <p style={{ fontWeight: 700, color: "#4A7C59", margin: 0 }}>סיימת! תודה רבה 🤍</p>
        </div>
      ) : (
        <div style={box}>
          <p style={{ fontSize: 12, color: C.muted, margin: "0 0 6px" }}>הבא בתור</p>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 800, color: C.dark, margin: "0 0 2px" }}>
            {current.name}
          </p>
          <p style={{ fontSize: 14, color: C.muted, margin: "0 0 18px", direction: "ltr" }}>{current.phone}</p>

          <button
            onClick={() => openWhatsApp(current)}
            style={{ width: "100%", padding: 16, background: C.green, color: "#fff", border: "none",
              borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer",
              fontFamily: "Heebo, sans-serif", minHeight: 52 }}
          >
            💬 פתחו וואטסאפ ושלחו ←
          </button>

          {awaiting === current.id && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(197,164,109,0.10)",
              border: `1.5px solid ${C.gold}`, borderRadius: 14, textAlign: "right" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.dark, margin: "0 0 4px" }}>
                ההודעה נשלחה ל{current.name}?
              </p>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 12px", lineHeight: 1.6 }}>
                אם וואטסאפ ביקש לסרוק קוד QR — ההודעה לא נשלחה. בחרו &quot;לא&quot;.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => confirm(current)} disabled={busy}
                  style={{ flex: 1, padding: 13, background: busy ? C.border : C.green, color: "#fff",
                    border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                    cursor: busy ? "wait" : "pointer", fontFamily: "Heebo, sans-serif", minHeight: 46 }}>
                  ✓ כן, נשלחה
                </button>
                <button onClick={() => setAwaiting(null)}
                  style={{ flex: 1, padding: 13, background: "#fff", color: C.dark,
                    border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 15, fontWeight: 600,
                    cursor: "pointer", fontFamily: "Heebo, sans-serif", minHeight: 46 }}>
                  ✗ לא
                </button>
              </div>
            </div>
          )}

          {/* Local to this session — a guest passed over now comes back on the
              next load rather than disappearing from everyone's list. */}
          <button onClick={() => { setSkipped(p => new Set(p).add(current.id)); setAwaiting(null); }}
            style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer",
              color: C.muted, fontSize: 13, fontFamily: "Heebo, sans-serif", minHeight: 44 }}>
            דלגו על אורח זה
          </button>
        </div>
      )}

      <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 22, lineHeight: 1.7 }}>
        כל אורח מקבל קישור אישי משלו — אל תעתיקו הודעה מאורח אחד לאחר.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "32px 20px 60px" }}>{children}</div>
    </div>
  );
}
