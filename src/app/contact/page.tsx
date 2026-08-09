import type { Metadata } from "next";
import Link from "next/link";

/* Contact and business details.

   Meta's Business Verification reviewer opens the website before approving,
   and looks for evidence that a real, reachable business stands behind the
   WhatsApp account: a legal name, a way to reach a human, and details that
   match what was submitted in the verification form. The site had /privacy
   and /terms but no contact page at all — a 404 where the reviewer looks
   first.

   Every field here must match the VAT registration certificate character for
   character. A sole proprietorship (עוסק פטור) is registered to a person, so
   the legal name is "דביר בן ברוך" and "רגע לפני" is the trade name — the
   same split Meta asks for between Legal business name and Doing business as.
   Entering the trade name in the legal field is the most common rejection. */

export const metadata: Metadata = {
  title: "צור קשר — רגע לפני",
  description: "פרטי העסק ודרכי יצירת קשר עם רגע לפני — מערכת אישורי הגעה לחתונות ואירועים",
};

/* BUSINESS_ID stays null until the VAT certificate exists. Rendering a
   placeholder number would be worse than rendering nothing: the reviewer
   compares it against the document, and a mismatch reads as fabrication. */
const BUSINESS_ID: string | null = null;

const DETAILS: { label: string; value: string; href?: string }[] = [
  { label: "שם העסק", value: "רגע לפני" },
  { label: "בעל העסק", value: "דביר בן ברוך" },
  ...(BUSINESS_ID ? [{ label: "מספר עוסק", value: BUSINESS_ID }] : []),
  { label: "טלפון ווואטסאפ", value: "053-3318177", href: "https://wa.me/972533318177" },
  { label: "דוא״ל", value: "dvir874@gmail.com", href: "mailto:dvir874@gmail.com" },
  { label: "אזור פעילות", value: "ישראל" },
];

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "מה אנחנו עושים",
    body: [
      "\"רגע לפני\" היא מערכת לניהול אירועים: הזמנה דיגיטלית, אישורי הגעה, תזכורות, ניהול רשימת המוזמנים וגלריית תמונות משותפת.",
      "הזוג מעלה את רשימת המוזמנים שלו, וכל אורח מקבל קישור אישי לאישור הגעה. ההודעות נשלחות בשם הזוג ולמוזמניו בלבד.",
    ],
  },
  {
    title: "זמני מענה",
    body: [
      "פניות בוואטסאפ ובדוא״ל — מענה תוך יום עסקים אחד.",
      "בקשות בנושא פרטיות או הסרה מרשימת דיוור — טיפול תוך 14 ימי עסקים.",
    ],
  },
  {
    title: "הפסקת קבלת הודעות",
    body: [
      "אורח שאינו מעוניין לקבל הודעות נוספות יכול להשיב \"הסר\" להודעה עצמה, או לפנות אלינו בכל אחת מהדרכים שלמעלה. הבקשה נכנסת לתוקף מיד ותקפה לכלל האירועים במערכת.",
    ],
  },
];

export default function ContactPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#FDFAF5", fontFamily: "Heebo, sans-serif", color: "#1C1008" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/" style={{ color: "#8B6914", textDecoration: "none", fontSize: 14 }}>← חזרה לאתר</Link>

        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, margin: "24px 0 8px" }}>
          צור קשר
        </h1>
        <p style={{ color: "rgba(28,16,8,0.5)", fontSize: 13, marginBottom: 40 }}>
          פרטי העסק ודרכי התקשרות
        </p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: "#8B6914", marginBottom: 16 }}>
            פרטי העסק
          </h2>
          <dl style={{ margin: 0 }}>
            {DETAILS.map((d) => (
              <div
                key={d.label}
                style={{
                  display: "flex", flexWrap: "wrap", gap: 8,
                  padding: "10px 0", borderBottom: "1px solid rgba(28,16,8,0.08)",
                }}
              >
                <dt style={{ minWidth: 130, fontSize: 14, color: "rgba(28,16,8,0.55)" }}>{d.label}</dt>
                <dd style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>
                  {d.href
                    ? <a href={d.href} style={{ color: "#8B6914", textDecoration: "none" }}>{d.value}</a>
                    : d.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {SECTIONS.map((s) => (
          <section key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: "#8B6914", marginBottom: 12 }}>
              {s.title}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: "#333", marginBottom: 8 }}>{p}</p>
            ))}
          </section>
        ))}

        <p style={{ fontSize: 13, color: "rgba(28,16,8,0.5)", marginTop: 40 }}>
          ראו גם:{" "}
          <Link href="/privacy" style={{ color: "#8B6914" }}>מדיניות פרטיות</Link>
          {" · "}
          <Link href="/terms" style={{ color: "#8B6914" }}>תנאי שירות</Link>
        </p>
      </div>
    </div>
  );
}
