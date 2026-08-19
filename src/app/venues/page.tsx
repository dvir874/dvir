import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מערכת אישורי הגעה לאולמות ומפיקי אירועים",
  description:
    "3% מהאורחים לא מקבלים את ההזמנה בוואטסאפ — ואף אחד לא יודע מי הם. רגע לפני מציגה אותם בשמם, ומעבירה לאולם דוח מנות שמבוסס על מי שבאמת אישר. שיתופי פעולה לאולמות ומפיקים.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", olive: "#6B7B5A" };

/* Every number on this page is measured from the system on 20/08/2026, not
   estimated. 970 guests across three weddings; 29 of them cannot receive a
   WhatsApp template at all. If these change, change them here — a page that
   quotes a stale number is worse than a page that quotes none. */
const MEASURED = { guests: 970, weddings: 3, messages: 900, unreachable: 29, unreachablePct: "3%" };

const BENEFITS = [
  { emoji: "🍽️", title: "דוח מנות שמבוסס על מי שבאמת אישר",
    desc: "פירוט המנות מגיע מהאישורים עצמם, והמערכת בודקת שסכום המנות של כל משפחה מסתדר עם מספר האורחים שלה. אי-התאמה מסומנת לפני שהמספר מגיע אליכם." },
  { emoji: "📵", title: "האורחים שההזמנה לא הגיעה אליהם — בשמם",
    desc: `${MEASURED.unreachablePct} מהאורחים לא מקבלים הודעת וואטסאפ עסקית: אין להם חשבון, או שמטא חוסמת אליהם תבניות. אצל רוב הספקים הם נספרים כ"לא ענו". אצלנו הם רשימה נפרדת עם הסיבה.` },
  { emoji: "📊", title: "דוח מסירה לכל אורח",
    desc: "נמסר · נקרא · נכשל — לכל אורח בנפרד, עם קוד השגיאה של מטא. אפשר לענות לזוג ששואל \"למה דודה שלי לא קיבלה\" בתשובה אמיתית." },
  { emoji: "💼", title: "אפס עבודה לצוות שלכם",
    desc: "הליווי של הזוג הוא עלינו, מהייבוא הראשון ועד ההודעה של הבוקר שאחרי. האולם מקבל את המספרים." },
];

const FAQ = [
  { q: "כמה זמן לוקח להקים אירוע?",
    a: "הזוג שולח רשימת אורחים ותמונת הזמנה, ואנחנו מקימים. אין שום דבר שהאולם צריך לעשות." },
  { q: "מה קורה לאורחים שאין להם וואטסאפ?",
    a: `הם מופיעים ברשימה נפרדת עם הסיבה, ולכל אחד נבנית הודעת SMS מוכנה עם ההזמנה המלאה והקישור האישי. מתוך ${MEASURED.guests} אורחים בשלוש חתונות, ${MEASURED.unreachable} היו כאלה — כלומר בחתונה ממוצעת מדובר בעשרה אנשים שצריך להשיג אחרת.` },
  { q: "מתי מתקבל דוח המנות?",
    a: "הוא מתעדכן בזמן אמת, כך שאפשר לראות את המגמה שבועיים מראש ולא רק בסוף. המספר הסופי נסגר יחד איתכם." },
  { q: "האם המערכת שולחת משהו ביום האירוע?",
    a: "בבוקר שלפני, כל מי שאישר מקבל הודעה עם שעת קבלת הפנים, שעת החופה והמקום. זה מוריד חלק גדול מהטלפונים שמגיעים אליכם באותו בוקר." },
  { q: "איך נראה שיתוף פעולה?",
    a: "שלושה מודלים: הפניה תמורת עמלה, חבילה מסובסדת לזוגות שסוגרים אצלכם, או מערכת ממותגת בשם האולם. נתאים יחד." },
];

export default function VenuesPage() {
  const wa = `https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! אני מאולם/הפקה ומעניין אותי לשמוע על שיתוף פעולה 🏛️")}`;
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: 16, color: C.goldT }}>לאולמות ומפיקים</span>
        <div style={{ width: 60 }} />
      </div>

      <section style={{ textAlign: "center", padding: "56px 20px 40px", maxWidth: 680, margin: "0 auto" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏛️</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,6vw,38px)", fontWeight: 900, lineHeight: 1.3, margin: "0 0 14px" }}>
          שלושה אחוזים מהאורחים<br />
          <span style={{ color: C.goldT }}>לא מקבלים את ההזמנה בכלל</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
          ואף אחד לא יודע מי הם. הם נספרים כ&ldquo;לא ענו&rdquo;, הזוג רודף אחריהם שבועיים,
          והמספר שמגיע אליכם לקייטרינג מבוסס על רשימה שחסרים בה אנשים.
          <br /><br />
          אנחנו מציגים אותם בשמם, עם הסיבה, ובונים לכל אחד דרך אחרת להגיע אליו.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "16px 36px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(197,164,109,0.35)" }}>
          בואו נדבר 💬
        </a>
      </section>

      {/* The measurement, stated plainly. It is the whole argument. */}
      <section style={{ background: "#fff", padding: "40px 20px", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, margin: "0 0 8px", textAlign: "center" }}>
            המספרים כאן נמדדו, לא הוערכו
          </h2>
          <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.85, margin: "0 0 22px", textAlign: "center" }}>
            שלוש חתונות אמיתיות שרצו במערכת, {MEASURED.guests} אורחים, מעל {MEASURED.messages} הודעות.
            אלה לא הדגמות.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            {[
              { n: MEASURED.unreachablePct, l: "מהאורחים לא מקבלים וואטסאפ עסקי" },
              { n: `${MEASURED.unreachable}`, l: `אורחים כאלה מתוך ${MEASURED.guests}` },
              { n: "97%", l: "הגעה בפועל בחתונה האחרונה" },
            ].map(s => (
              <div key={s.l} style={{ background: C.ivory, borderRadius: 16, padding: "20px 16px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, margin: 0, color: C.goldT }}>{s.n}</p>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "6px 0 0" }}>{s.l}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8, margin: "20px 0 0", textAlign: "center" }}>
            שני מקורות לכשל: אורח שאין לו חשבון וואטסאפ על המספר שנתן, ואורח שמטא
            הכניסה לקבוצת ביקורת ולא מעבירה אליו תבניות. אף אחד מהשניים לא נפתר
            בשליחה חוזרת — ולכן חשוב לדעת עליהם מראש ולא ביום האירוע.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{ background: "#fff", borderRadius: 18, padding: "22px 20px", border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 30, margin: "0 0 10px" }}>{b.emoji}</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Saying what it is not. A venue has been promised everything before. */}
      <section style={{ background: C.cream, padding: "40px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 900, margin: "0 0 12px" }}>
            ומה שזה לא
          </h2>
          <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.9, margin: 0 }}>
            זו לא מערכת שמחליפה את הצוות שלכם ולא תוכנת ניהול אולם. היא עושה דבר אחד:
            מביאה את ההזמנה לאורח, אוספת את התשובה, ומראה בדיוק מה קרה לכל הודעה.
            אנחנו עסק צעיר — שלוש חתונות עד היום — וזו בדיוק הסיבה שכל זוג מקבל
            ליווי אישי ולא טופס.
          </p>
        </div>
      </section>

      <section style={{ padding: "48px 20px", maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, margin: "0 0 20px", textAlign: "center" }}>שאלות שאולמות שואלים</h2>
        {FAQ.map(f => (
          <div key={f.q} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, margin: "0 0 7px" }}>{f.q}</h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </section>

      <section style={{ textAlign: "center", padding: "8px 20px 72px", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>מודלים לשיתוף פעולה</h2>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9, margin: "0 0 24px" }}>
          הפניה תמורת עמלה · חבילה מסובסדת לזוגות האולם ·<br />
          או מערכת ממותגת בשם האולם שלכם — נתאים יחד את המודל.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: "none", color: C.goldT, border: `2px solid ${C.gold}`, borderRadius: 9999, padding: "13px 32px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          קבעו שיחת היכרות
        </a>
      </section>
    </div>
  );
}
