import type { Metadata } from "next";
import Link from "next/link";

/* Privacy policy — required by Meta before a developer app can be published,
   and publishing is what turns on production WhatsApp delivery webhooks.
   Written to describe what the system actually does, not boilerplate:
   couples upload a guest list, we send WhatsApp templates through Meta's
   Cloud API, and guests answer through a personal link. */

export const metadata: Metadata = {
  title: "מדיניות פרטיות — רגע לפני",
  description: "כיצד רגע לפני אוספת, משתמשת ושומרת מידע אישי של זוגות ואורחים",
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. מי אנחנו",
    body: [
      "\"רגע לפני\" היא מערכת לניהול אירועים — הזמנות דיגיטליות, אישורי הגעה וניהול רשימת מוזמנים. המסמך מסביר איזה מידע נאסף, למה, ומה הזכויות שלכם לגביו.",
      "המסמך חל על האתר regalifnei.vercel.app, על דפי אישור ההגעה האישיים, ועל ההודעות שנשלחות בוואטסאפ.",
    ],
  },
  {
    title: "2. איזה מידע נאסף",
    body: [
      "מהזוג המזמין: שם, טלפון, כתובת דוא״ל, פרטי האירוע (תאריך, מקום, שעות), ורשימת המוזמנים שהוא מעלה למערכת.",
      "מהאורחים: שם ומספר טלפון — כפי שנמסרו על ידי הזוג ולא על ידי האורח; ובנוסף התשובות שהאורח עצמו מוסר בדף אישור ההגעה: האם מגיע, כמה אורחים, בקשות מיוחדות, וברכה לזוג אם בחר לכתוב.",
      "מידע טכני מינימלי: מועד פתיחת הקישור האישי ומועד מסירת התשובה. איננו אוספים מיקום, איננו משתמשים בעוגיות מעקב ואיננו מפעילים כלי פרסום או ניתוח של צד שלישי בדפי האורחים.",
    ],
  },
  {
    title: "3. למה משתמשים במידע",
    body: [
      "לשליחת ההזמנה ואישור ההגעה לאורח, ולתזכורות לפני האירוע.",
      "להצגת תמונת מצב לזוג: מי אישר, כמה אורחים צפויים, מי טרם ענה.",
      "אין שימוש במידע לפרסום, אין מכירה של נתונים, ואין העברה לגורם שלישי לצרכיו שלו.",
    ],
  },
  {
    title: "4. הודעות וואטסאפ",
    body: [
      "ההודעות נשלחות דרך WhatsApp Business Platform של Meta. לצורך המסירה מועבר ל-Meta מספר הטלפון של הנמען ותוכן ההודעה, בהתאם למדיניות הפרטיות של Meta.",
      "כל הודעה נשלחת בשם הזוג המזמין ולמוזמניו בלבד. אין שליחה לרשימות שנרכשו ואין דיוור המוני למי שאינו מוזמן לאירוע.",
      "אפשר לבקש הפסקת קבלת הודעות בכל רגע — בתשובה להודעה עצמה או בפנייה אלינו.",
    ],
  },
  {
    title: "5. אבטחה ושמירה",
    body: [
      "הנתונים נשמרים בשרתי Supabase ו-Vercel, בהצפנה במעבר ובמנוחה. הגישה מוגבלת לבעלי הרשאה בלבד.",
      "כל אורח מקבל קישור אישי עם מזהה אקראי. הקישור אינו ניתן לניחוש, ואינו חושף את שאר רשימת המוזמנים.",
      "נתוני אירוע נשמרים עד 90 יום לאחר מועדו, ולאחר מכן ניתן לבקש את מחיקתם המלאה.",
    ],
  },
  {
    title: "6. הזכויות שלכם",
    body: [
      "לעיין במידע שנשמר עליכם, לתקן אותו, או לבקש את מחיקתו.",
      "לבקש הפסקת קבלת הודעות.",
      "לכל בקשה — פנו אלינו בפרטים שלמטה, ונטפל בה תוך 14 ימי עסקים.",
    ],
  },
  {
    title: "7. יצירת קשר",
    body: [
      "דביר בן ברוך · רגע לפני",
      "וואטסאפ: 053-3318177 · דוא״ל: dvir874@gmail.com",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#FDFAF5", fontFamily: "Heebo, sans-serif", color: "#1C1008" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <Link href="/" style={{ color: "#8B6914", textDecoration: "none", fontSize: 14 }}>← חזרה לאתר</Link>

        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, margin: "24px 0 8px" }}>
          מדיניות פרטיות
        </h1>
        <p style={{ color: "rgba(28,16,8,0.5)", fontSize: 13, marginBottom: 40 }}>
          עודכן לאחרונה: אוגוסט 2026
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

        <p style={{ fontSize: 13, color: "rgba(28,16,8,0.5)", marginTop: 40 }}>
          ראו גם: <Link href="/terms" style={{ color: "#8B6914" }}>תנאי שירות</Link>
        </p>
      </div>
    </div>
  );
}
