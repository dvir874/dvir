import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "תנאי שירות — רגע לפני",
  description: "תנאי השירות של מערכת רגע לפני לניהול חתונות ואירועים",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. השירות",
    body: [
      "\"רגע לפני\" מספקת מערכת דיגיטלית לניהול אירועים: אישורי הגעה, ניהול מוזמנים, סידורי הושבה, גלריית תמונות ושירותים נלווים, בהתאם לחבילה שנרכשה.",
      "השירות ניתן לאירוע אחד, מרגע ההקמה ועד 30 יום לאחר מועד האירוע.",
    ],
  },
  {
    title: "2. תשלום",
    body: [
      "התשלום הוא חד-פעמי, בהתאם להצעת המחיר שסוכמה מראש. אין דמי מנוי חודשיים.",
      "השירות יופעל לאחר קבלת התשלום המלא, אלא אם סוכם אחרת.",
    ],
  },
  {
    title: "3. ביטולים",
    body: [
      "ביטול עד 14 יום ממועד הרכישה ולפני שליחת הזמנות לאורחים — החזר מלא.",
      "לאחר שליחת הזמנות לאורחים — החזר של 50% מהסכום ששולם.",
      "במקרה של דחיית האירוע — השירות יועבר למועד החדש ללא עלות נוספת.",
    ],
  },
  {
    title: "4. אחריות ושימוש",
    body: [
      "אנו עושים כל מאמץ שהמערכת תהיה זמינה בכל עת, אך איננו אחראים לתקלות שמקורן בצדדים שלישיים (וואטסאפ, ספקי תקשורת, שירותי ענן).",
      "האחריות על נכונות פרטי האורחים ותוכן ההודעות היא על הלקוח.",
      "אין להשתמש במערכת לשליחת תוכן פוגעני או דואר זבל.",
    ],
  },
  {
    title: "5. פרטיות",
    body: [
      "פרטי האורחים (שמות, טלפונים, העדפות) משמשים אך ורק לצורך ניהול האירוע ואינם מועברים לגורם שלישי.",
      "לאחר 90 יום ממועד האירוע ניתן לבקש מחיקה מלאה של כל נתוני האירוע.",
    ],
  },
  {
    title: "6. יצירת קשר",
    body: [
      "לכל שאלה: דביר — 053-3318177 (וואטסאפ).",
    ],
  },
];

export default function TermsPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#FDFAF5", fontFamily: "Heebo, sans-serif", color: "#1C1008" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/" style={{ color: "#8B6914", textDecoration: "none", fontSize: 14 }}>← חזרה לאתר</Link>

        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, margin: "24px 0 8px" }}>
          תנאי שירות
        </h1>
        <p style={{ color: "rgba(28,16,8,0.5)", fontSize: 13, marginBottom: 40 }}>
          עודכן לאחרונה: יולי 2026
        </p>

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
      </div>
    </div>
  );
}
