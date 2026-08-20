"use client";

import { useState } from "react";

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

const VENUES: Venue[] = [
  { name: "אולמי גאיה", city: "האומן 12, חדרה",
    phones: ["04-6226623", "053-9345038", "072-3300736"],
    source: "דפי זהב · easy.co.il · walla",
    warm: "החתונה שלך, 24/08" },
  { name: "סקיי גארדן", city: "היוזמה 6, יקנעם עילית",
    phones: ["04-8304444", "072-2136677"],
    source: "דפי זהב · sky-garden.co.il",
    warm: "לאל וטל, 22/09" },
];

/* Two messages, because a hall that hosted you is not a stranger. */
function warmMsg(v: Venue) {
  return `שלום, כאן דביר מ"רגע לפני".
${v.warm ? `${v.warm.split(",")[0]} התקיימה אצלכם, ` : ""}ואת אישורי ההגעה שלה ניהלנו במערכת שבנינו.

משהו שאולי יעניין אתכם: בערך 3% מהאורחים לא מקבלים הודעת וואטסאפ עסקית בכלל — אין להם חשבון, או שמטא חוסמת אליהם. בחתונה של 300 איש זה כעשרה אנשים שנספרים כ"לא ענו", והמספר שאתם מחייבים לפיו חסר אותם.

אנחנו מזהים אותם בשמם. אשמח לשלוח לכם את דוח המנות של אותו אירוע כדוגמה, בלי שום התחייבות.`;
}

function coldMsg() {
  return `שלום, כאן דביר מ"רגע לפני".
אנחנו מנהלים אישורי הגעה בוואטסאפ לזוגות. עד היום 970 אורחים בארבע חתונות.

הסיבה שאני פונה: מצאנו ש-3% מהאורחים לא מקבלים הודעה עסקית בוואטסאפ בכלל. בחתונה של 300 איש זה כעשרה אנשים שנספרים כ"לא ענו" — והמספר שמגיע אליכם לקייטרינג חסר אותם. אנחנו מציגים אותם בשמם.

עמוד קצר: regalifnei.vercel.app/venues
אשמח לשיחה של עשר דקות.`;
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
                {v.phones.map(ph => (
                  <a key={ph} href={wa(ph, msg)} target="_blank" rel="noreferrer"
                     onClick={() => setSent(s => ({ ...s, [v.name]: true }))}
                     style={{ flex: "1 1 130px", textAlign: "center", background: done ? "none" : T.gold,
                              color: done ? T.gold : "#fff", border: `1px solid ${T.gold}`,
                              borderRadius: 9999, padding: "10px 12px", fontSize: 13.5, fontWeight: 700,
                              textDecoration: "none", minHeight: 42, lineHeight: "22px" }} dir="ltr">
                    {ph}
                  </a>
                ))}
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
          אולם שלא נמצא לו מספר — לא מופיע עם ניחוש.
        </p>
      </div>
    </div>
  );
}
