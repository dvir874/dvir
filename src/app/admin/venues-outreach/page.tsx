"use client";

import { useState } from "react";
import { waPrefill } from "@/lib/wa-prefill";

/* פנייה לאולמות — one tap per venue, Dvir sends.
 *
 * A venue does 40-60 weddings a year, so one partnership is worth more than a
 * month of posting in groups. What stopped it was not the pitch — it was that
 * every send meant finding the number, writing the message, and remembering
 * who had already been contacted.
 *
 * Numbers are PUBLISHED business numbers with the source recorded on each row.
 * Nothing here is guessed: a venue with no number found appears with none,
 * because a wrong number means a business message to a private person.
 *
 * The two at the top are not cold. Real weddings run on this system happened
 * in those halls, and they can be sent something no competitor can produce —
 * the meal report from an event in their own venue. */

const T = { page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4", dark: "#1C1008",
            muted: "rgba(28,16,8,0.6)", gold: "#C5A46D", olive: "#6B7B5A" };

type Venue = {
  name: string; city: string; phones: string[]; source: string;
  warm?: string;              /* the wedding of ours that happened there */
};

/* WhatsApp or a phone call — and the difference is not cosmetic.
 *
 * Every number on this page used to become a wa.me link. Three of the five
 * already here cannot receive WhatsApp at all: 04-6226623 is a switchboard,
 * and 072-3300736 and 072-2136677 are virtual numbers — דפי זהב says so in
 * its own terms. Tapping them opened WhatsApp on "this number is not
 * registered", which reads as a broken product rather than a wrong number,
 * and costs the one attempt a venue gives you.
 *
 * Israeli directories publish tracking numbers by design. That is a fact
 * about the source, not a gap in the research, so the fix is to route by
 * prefix rather than to keep hunting: 05x opens WhatsApp, everything else
 * places a call. */
const isMobile = (p: string) => /^05\d/.test(p.replace(/\D/g, ""));

const VENUES: Venue[] = [
  { name: "אולמי גאיה", city: "האומן 12, חדרה",
    phones: ["04-6226623", "053-9345038", "072-3300736"],
    source: "דפי זהב · easy.co.il · walla",
    warm: "החתונה שלך, 24/08" },
  { name: "סקיי גארדן", city: "היוזמה 6, יקנעם עילית",
    phones: ["04-8304444", "072-2136677"],
    source: "דפי זהב · sky-garden.co.il",
    warm: "לאל וטל, 22/09" },

  /* The two halls that hosted a client's wedding and were missing from here.
     Each can be sent something no competitor can produce: the meal report from
     an event that took place in their own hall. */
  { name: "חוות ארץ האיילים", city: "כפר עציון, גוש עציון",
    phones: ["072-3134802"],
    source: "דפי זהב (מספר וירטואלי — מרכזייה, לא הנייד של האולם)",
    warm: "שחר ואורי, 08/09" },
  { name: "ארץ — בית לאירועים", city: "מושב עגור",
    phones: ["050-5185518"],
    source: "דפי זהב",
    warm: "תהל ואביב, 22/09" },

  /* Cold, and every number below is a directory switchboard rather than a
     person. They are worth a call, not a WhatsApp. */
  { name: "White", city: "פרדס חנה-כרכור",
    phones: ["072-2160297"], source: "walla mazaltov" },
  { name: "דונה אירועי בוטיק", city: "המטלל 10, חדרה",
    phones: ["076-8006832"], source: "b144 (מספר מעקב)" },
  { name: "אלריה — אולם לאירועי בוטיק", city: "יהודי פקיעין 1, חדרה",
    phones: ["076-8108873"], source: "b144 (מספר מעקב)" },
  { name: "אואזיס", city: "הזגג 22, חדרה",
    phones: ["076-8105756"], source: "b144 (מספר מעקב)" },
  { name: "בראשית אירועים", city: "אזור עגור",
    phones: ["076-8017147"], source: "b144 (מספר מעקב)" },
  { name: "ארמונות אור", city: "אזור עגור",
    phones: ["076-8885493"], source: "b144 (מספר מעקב)" },

  /* Found by reading the venues' own sites instead of the directories, 31/08.
     The directories were the bottleneck: b144 and דפי זהב publish 076/072
     tracking numbers by design, so ten searches produce ten switchboards.
     A venue's own contact page has no reason to hide the number.

     One trap worth naming: hafakot.co.il lists 03-3035060 as the phone for
     both גוונא and היער. It is hafakot's own switchboard, not either venue's,
     and a number that appears under two businesses is never either of them. */
  { name: "בית הברכה", city: "צומת גוש עציון",
    phones: ["050-2041212"],
    source: "דפי זהב — נייד אמיתי, לא מספר מעקב" },
  { name: "כרם תמר — יקב גוש עציון", city: "צומת גוש עציון",
    phones: ["02-9309220"],
    source: "gushetzion-winery.co.il (האתר שלהם)" },
  { name: "ויה קסליו", city: "הזגג 19, חדרה",
    phones: ["077-8048129", "077-8048917"],
    source: "viacaselio.co.il (האתר שלהם)" },

  /* The fifth hall that hosts a client of ours, and the one that was missing.
     ירון ואיילת are at פאלאסיו on 14/10 — every warm venue but this one was
     already here, so the single hall with a live event coming was the one
     being approached as a stranger. */
  { name: "אולמי פאלאסיו", city: "הבנאים 23, אופקים",
    phones: ["053-7102333", "08-8600661", "*6723"],
    source: "palacio.co.il + דפי זהב",
    warm: "ירון ואיילת, 14/10" },

  /* Cold, but each number below was read off the venue's own site. */
  { name: "88 גן אירועים", city: "נחל אלכסנדר 26, עמק חפר",
    phones: ["055-4539653"],
    source: "8eighty.co.il (האתר שלהם) — נייד" },
  { name: "WIDE OPEN", city: "אזור התעסוקה, רמת ישי",
    phones: ["053-6130772"],
    source: "wideopen-events.co.il (האתר שלהם) — נייד" },
  { name: "חוות עמק איילון", city: "מבוא חורון",
    phones: ["03-3818975", "03-3818958"],
    source: "ayalonevent.co.il (האתר שלהם)" },
  /* Their own site says 077-2305244; mit4mit prints 077-2305479 for the same
     business. Two numbers for one venue across two sources is the signature of
     a directory tracking line, so the one on their own site is the one kept. */
  { name: "סרה — SERA", city: "עמק האלה, בית שמש",
    phones: ["077-2305244"],
    source: "sera-events.co.il (האתר שלהם)" },
  /* עגור again, and possibly the same business as "ארץ — בית לאירועים" above
     under a second name. Worth one look before dialling: approaching תהל's own
     hall as a stranger, after already writing to it as a hall that hosted us,
     is worse than not writing at all. */
  { name: "ארץ קדם", city: "עגור, ד.נ האלה",
    phones: ["02-9912450"],
    source: "דפי זהב — ⚠ ייתכן שזה אותו עסק כמו \"ארץ — בית לאירועים\", לבדוק לפני שליחה" },
];

/* Two messages, because a hall that hosted you is not a stranger.
 *
 * Both go out through waPrefill. They contain an em dash, which is three UTF-8
 * bytes, and WhatsApp Desktop mangles anything past two on the way into the
 * compose box — so the sharpest sentence in the pitch was arriving with a
 * replacement character in the middle of it, on a first approach to a business
 * that gives you exactly one.
 */
function warmMsg(v: Venue) {
  return waPrefill(`שלום, כאן דביר מ"רגע לפני".
${v.warm ? `${v.warm.split(",")[0]} התקיימה אצלכם, ` : ""}ואת אישורי ההגעה שלה ניהלנו במערכת שבנינו.

משהו שאולי יעניין אתכם: בערך 3% מהאורחים לא מקבלים הודעת וואטסאפ עסקית בכלל - אין להם חשבון, או שמטא חוסמת אליהם. בחתונה של 300 איש זה כעשרה אנשים שנספרים כ"לא ענו", והמספר שאתם מחייבים לפיו חסר אותם.

אנחנו מזהים אותם בשמם, ופונים לזוג לבדוק את המספר. וגם: מנות ילדים נספרות בנפרד ממבוגרים, כך שהמספר שמגיע אליכם הוא מה שבאמת יוגש.

אשמח לשלוח לכם את דוח המנות של אותו אירוע כדוגמה, בלי שום התחייבות.`);
}

function coldMsg() {
  return waPrefill(`שלום, כאן דביר מ"רגע לפני".
אנחנו מנהלים אישורי הגעה בוואטסאפ לזוגות. עד היום 922 אורחים בחמש חתונות.

הסיבה שאני פונה: מצאנו ש-3% מהאורחים לא מקבלים הודעה עסקית בוואטסאפ בכלל. בחתונה של 300 איש זה כעשרה אנשים שנספרים כ"לא ענו", והמספר שמגיע אליכם לקייטרינג חסר אותם. אנחנו מזהים אותם בשמם ופונים לזוג לבדוק.

בנוסף: מנות ילדים נספרות בנפרד, וכל אורח מקבל את מספר השולחן שלו בוואטסאפ בערב שלפני - כך שאין תור בכניסה.

עמוד קצר: regalifnei.vercel.app/venues
אשמח לשיחה של עשר דקות.`);
}

export default function VenuesOutreach() {
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const wa = (phone: string, msg: string) =>
    `https://wa.me/972${phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(msg)}`;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.page, padding: "32px 16px 70px",
                            fontFamily: "Heebo, -apple-system, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 26, fontWeight: 900,
                     color: T.dark, margin: "0 0 8px", textAlign: "center" }}>
          🏛️ פנייה לאולמות
        </h1>
        <p style={{ fontSize: 13.5, color: T.muted, textAlign: "center", margin: "0 0 22px", lineHeight: 1.75 }}>
          אולם אחד עושה 40–60 חתונות בשנה.<br />
          לחיצה פותחת וואטסאפ עם ההודעה מוכנה — אתה שולח.
        </p>

        {VENUES.map(v => {
          const msg = v.warm ? warmMsg(v) : coldMsg();
          const done = sent[v.name];
          return (
            <div key={v.name} style={{
              background: done ? "#F3F1EA" : T.card,
              border: `1px solid ${done ? T.border : (v.warm ? T.gold : T.border)}`,
              borderRadius: 14, padding: "16px 18px", marginBottom: 12, opacity: done ? 0.72 : 1,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 16.5, fontWeight: 700, color: T.dark }}>{v.name}</span>
                {v.warm && <span style={{ fontSize: 12, fontWeight: 700, color: T.olive }}>🔥 {v.warm}</span>}
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{v.city}</div>

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {v.phones.map(ph => {
                  const mob = isMobile(ph);
                  return (
                    <a key={ph} href={mob ? wa(ph, msg) : `tel:${ph.replace(/\D/g, "")}`}
                       target={mob ? "_blank" : undefined} rel="noreferrer"
                       onClick={() => setSent(s => ({ ...s, [v.name]: true }))}
                       style={{ flex: "1 1 130px", textAlign: "center",
                                background: done ? "none" : (mob ? T.gold : "none"),
                                color: done ? T.gold : (mob ? "#fff" : T.olive),
                                border: `1px solid ${mob ? T.gold : T.olive}`,
                                borderRadius: 9999, padding: "10px 12px", fontSize: 13.5, fontWeight: 700,
                                textDecoration: "none", minHeight: 42, lineHeight: "22px" }} dir="ltr">
                      {mob ? "💬 " : "📞 "}{ph}
                    </a>
                  );
                })}
              </div>

              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: 12.5, color: T.muted, cursor: "pointer" }}>
                  ההודעה שתישלח · מקור המספר
                </summary>
                <p style={{ fontSize: 12.5, color: T.muted, whiteSpace: "pre-wrap", margin: "8px 0 6px", lineHeight: 1.7 }}>{msg}</p>
                <p style={{ fontSize: 11.5, color: T.muted, margin: 0 }}>מקור: {v.source}</p>
              </details>
            </div>
          );
        })}

        <p style={{ fontSize: 12, color: T.muted, textAlign: "center", marginTop: 22, lineHeight: 1.8 }}>
          כל מספר כאן הוא מספר עסקי פומבי, עם המקור שלו.<br />
          אולם שלא נמצא לו מספר — לא מופיע עם ניחוש.<br />
          <strong>💬 נייד — נפתח בוואטסאפ עם ההודעה. 📞 מרכזייה — שיחה בלבד.</strong>
        </p>
      </div>
    </div>
  );
}
