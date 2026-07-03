import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "סידורי הושבה לחתונה — המדריך המלא לזוגות (2026) — רגע לפני",
  description: "איך מסדרים הושבה לחתונה בלי לריב: מתי מתחילים, איך מחלקים שולחנות, מה עושים עם רזרבות, ואיך האורחים יודעים איפה לשבת.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4" };
const H2: React.CSSProperties = { fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 700, color: C.goldT, margin: "36px 0 12px" };
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.9, color: "#333", margin: "0 0 14px" };

export default function SeatingGuide() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <Link href="/pricing" style={{ color: C.goldT, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>למחשבון המחיר ←</Link>
      </div>

      <article style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, lineHeight: 1.3, margin: "0 0 20px" }}>
          סידורי הושבה לחתונה — המדריך שיחסוך לכם את הריב
        </h1>
        <p style={P}>
          ההושבה היא המשימה שהכי הרבה זוגות דוחים — ובצדק: לשבץ 300 איש שחלקם לא מדברים זה עם זה
          זו משימה רגישה. הנה השיטה שעובדת, שלב-שלב.
        </p>

        <h2 style={H2}>מתי מתחילים?</h2>
        <p style={P}>
          לא לפני שיש לכם לפחות 70% אישורי הגעה — אחרת תסדרו הכל פעמיים. ברוב החתונות זה אומר
          שבועיים-שלושה לפני האירוע. את הגרסה הסופית סוגרים 4–5 ימים לפני, אחרי סבב התזכורות האחרון.
        </p>

        <h2 style={H2}>שיטת העבודה: עיגולים, לא שמות</h2>
        <p style={P}>
          אל תתחילו משיבוץ אנשים — תתחילו מקבוצות: משפחת הכלה, משפחת החתן, חברים מהצבא, עבודה, שכנים.
          קודם מחליטים כמה שולחנות לכל קבוצה, ורק אז נכנסים לשמות. ככה רוב ההחלטות הרגישות נפתרות ברמת הקבוצה.
        </p>

        <h2 style={H2}>כמה כללי זהב</h2>
        <p style={P}>1. <strong>שולחן רזרבה</strong> — תמיד תשאירו שולחן אחד ריק ליד הכניסה. מישהו שסימן &quot;לא מגיע&quot; יגיע. תמיד.</p>
        <p style={P}>2. <strong>אל תפצלו משפחה גרעינית</strong> — גם אם השולחן מתפוצץ. עדיף כיסא נוסף מדוחק מדודה נעלבת.</p>
        <p style={P}>3. <strong>מבוגרים רחוק מהרמקולים</strong> — הם יודו לכם למחרת.</p>
        <p style={P}>4. <strong>ילדים ליד ההורים או שולחן ילדים</strong> — אבל לא באמצע, כדי שיוכלו לצאת לרחבה.</p>

        <h2 style={H2}>ואיך האורחים יודעים איפה לשבת?</h2>
        <p style={P}>
          בישראל לא נהוג להדפיס כרטיס לכל אורח — השיטה היא מספרי שולחנות + עמדת קבלה בכניסה.
          במערכת דיגיטלית טובה, האורח מקבל את מספר השולחן שלו <strong>בוואטסאפ עוד לפני האירוע</strong>,
          וגם רואה אותו בקישור האישי שלו. ככה 70% מהאורחים נכנסים ישר לשולחן, והתור בכניסה נעלם.
        </p>

        <h2 style={H2}>הושבה דיגיטלית ברגע לפני</h2>
        <p style={P}>
          אצלנו ההושבה היא גרירה-ושחרור פשוטה מהטלפון: יוצרים שולחנות, גוררים אורחים, והמערכת מתריעה
          על חריגות. בלחיצה אחת כל אורח מקבל את מספר השולחן שלו בוואטסאפ. ואם תרצו — דביר מגיע ביום
          החתונה עם עמדת קבלה דיגיטלית ומכוון כל אורח למקומו.
        </p>

        <div style={{ background: C.cream, borderRadius: 16, padding: "24px", border: `1px solid ${C.border}`, marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>רוצים הושבה בלי כאב ראש?</p>
          <a href={`https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! קראתי את מדריך ההושבה — אשמח לשמוע עוד 🙂")}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            דברו איתי 💬
          </a>
        </div>
      </article>
    </div>
  );
}
