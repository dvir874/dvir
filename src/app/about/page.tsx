import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* אודות — implementation of the approved Stitch screen "אודות - הפקה עורכית".

   Editorial rather than promotional: one long column of prose beside a dark
   preview of the product, because the page's job is to explain why the thing
   exists, not to sell a feature list. Copy is the designer's, unchanged.

   A server component on purpose — there is nothing here that needs to run in a
   browser, and a marketing page that ships JavaScript to render static prose
   is slower for no reason. The one thing that would have needed it, a live
   countdown, is deliberately static and labelled as a preview: an invented
   number that ticks reads as a real couple's data, and this is a mockup. */

export const metadata: Metadata = {
  /* Just "אודות" — the root layout's template already appends "| רגע לפני",
     and spelling it out here produced "אודות | רגע לפני | רגע לפני" in the
     browser tab and, more to the point, in Google's results. */
  title: "אודות",
  description:
    "רגע לפני נולד מתוך הבנה של מה שזוגות באמת עוברים בתכנון חתונה — " +
    "כל הכלים במקום אחד, כדי שתוכלו להתרכז באהבה.",
};

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.62)", border: "#E8E0D4",
  olive: "#6B7B5A",
};

const BENEFITS = [
  "הכל במקום אחד — ללא אקסל ווואטסאפ",
  "תכנון הושבה ללא כאב ראש",
  "לוח בקרה משותף לשניכם",
  "אישורי הגעה אוטומטיים ועם מעקב",
  "מעקב תקציב ומתנות בזמן אמת",
  "ליווי אישי לאורך כל הדרך",
];

const PILLARS = [
  { title: "ליווי אישי תמיד", sub: "לאורך כל הדרך" },
  { title: "עדכון בזמן אמת", sub: "לשני בני הזוג" },
  { title: "מותאם אישית", sub: "לכל אירוע" },
  { title: "100% יחס אישי", sub: "לכל לקוח" },
];

export default function AboutPage() {
  const serif = "'Frank Ruhl Libre', serif";

  return (
    <main dir="rtl">
      <Header />

      <div style={{ background: C.ivory, paddingTop: 96, paddingBottom: 72 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>

          <p style={{
            display: "inline-block", background: C.cream, color: C.goldT,
            borderRadius: 99, padding: "6px 16px", fontSize: 13, fontWeight: 700,
            margin: "0 0 22px",
          }}>
            למה רגע לפני
          </p>

          <h1 style={{
            fontFamily: serif, fontWeight: 900, color: C.dark,
            fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.15, margin: 0,
          }}>
            תכנון חתונה —<br />בלי כאב ראש
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 18, color: C.muted }}>
            כל מה שצריך, במקום אחד
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 48, alignItems: "start", marginTop: 48,
          }}>

            {/* the argument */}
            <div>
              <p style={p}>
                תכנון חתונה יכול להיות חוויה מדהימה, אבל בדרך כלל הוא הופך למשימה
                מתישה. ניהול רשימות מוזמנים באקסל, מעקב אחרי אישורי הגעה בהודעות
                וואטסאפ, חישוב תקציב וחלוקת מתנות — כל אלה גוזלים זמן, אנרגיה,
                ויוצרים לחץ מיותר בתקופה שאמורה להיות המרגשת בחייכם.
              </p>

              <blockquote style={{
                background: C.cream, borderRight: `3px solid ${C.gold}`,
                borderRadius: 14, padding: "22px 24px", margin: "28px 0",
              }}>
                <p style={{
                  margin: 0, fontFamily: serif, fontWeight: 700,
                  fontSize: 20, lineHeight: 1.65, color: C.dark,
                }}>
                  המטרה שלנו היא לאפשר לכם להתרכז באהבה, בזמן שאנחנו דואגים לכל
                  הפרטים הקטנים שמסביב.
                </p>
              </blockquote>

              <p style={p}>
                הקמנו את ״רגע לפני״ מתוך הבנה עמוקה של האתגרים שעומדים בפני זוגות
                מתחתנים. המערכת שלנו פותחה במיוחד כדי לרכז את כל הכלים הדרושים
                במקום אחד אינטואיטיבי, מעוצב ונוח לשימוש, שמותאם אישית לצרכים
                הייחודיים של כל זוג.
              </p>
              <p style={p}>
                אנחנו מאמינים שהטכנולוגיה צריכה לשרת אתכם, ולא ההפך. לכן יצרנו
                פלטפורמה שמנהלת את התהליך בצורה חכמה ואוטומטית, ומעניקה לכם שקט
                נפשי וביטחון שהכל מתנהל כשורה — מרגע ההצעה ועד אחרון האורחים.
              </p>
              <p style={p}>
                ב״רגע לפני״ אנחנו לא רק מספקים תוכנה — אנחנו מעניקים חוויית תכנון
                אלגנטית, מסודרת ונטולת סטרס, כי מגיע לכם להגיע ליום המיוחד שלכם
                רגועים, מחויכים ומוכנים לחגוג.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
                <Link href="/quote" style={{
                  background: C.gold, color: "#fff", borderRadius: 99,
                  padding: "14px 30px", fontSize: 15, fontWeight: 700,
                  minHeight: 44, display: "inline-flex", alignItems: "center",
                }}>
                  בואו נעבוד יחד
                </Link>
                <Link href="/demo" style={{
                  background: "transparent", color: C.goldT,
                  border: `1.5px solid ${C.gold}`, borderRadius: 99,
                  padding: "14px 30px", fontSize: 15, fontWeight: 700,
                  minHeight: 44, display: "inline-flex", alignItems: "center",
                }}>
                  צפו בדוגמאות
                </Link>
              </div>
            </div>

            {/* the product, shown rather than described */}
            <div style={{
              background: C.dark, borderRadius: 22, padding: "30px 26px",
              boxShadow: "0 24px 60px rgba(28,16,8,0.18)",
            }}>
              <p style={{
                margin: "0 0 20px", fontFamily: serif, fontWeight: 800,
                fontSize: 19, color: C.gold,
              }}>
                ✦ מה מקבלים איתנו
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
                {BENEFITS.map(b => (
                  <li key={b} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.09)",
                    color: "rgba(255,255,255,0.90)", fontSize: 14.5, lineHeight: 1.55,
                  }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Labelled a preview because it is one. Numbers that look like a
                  real couple's, on a page about trust, must say what they are. */}
              <p style={{
                margin: "0 0 10px", fontSize: 12.5,
                color: "rgba(255,255,255,0.42)", letterSpacing: ".04em",
              }}>
                תצוגה מתוך המערכת
              </p>

              <div style={{
                background: "rgba(255,255,255,0.06)", borderRadius: 14,
                padding: "16px 18px", marginBottom: 12,
              }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "rgba(255,255,255,0.62)" }}>
                  החתונה מתקרבת
                </p>
                <div style={{ display: "flex", gap: 20, direction: "ltr", justifyContent: "flex-end" }}>
                  {[["47", "ימים"], ["08", "שעות"], ["23", "דק׳"]].map(([n, l]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <p style={{ margin: 0, fontFamily: serif, fontWeight: 800, fontSize: 26, color: "#fff" }}>{n}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.48)" }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["מוזמנים", "180"], ["אישרו", "143"], ["שולחנות", "12"], ["תקציב", "48.2k"]].map(([l, v]) => (
                  <div key={l} style={{
                    background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px",
                  }}>
                    <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>{l}</p>
                    <p style={{
                      margin: 0, fontFamily: serif, fontWeight: 800, fontSize: 21,
                      color: C.gold, direction: "ltr", textAlign: "right",
                    }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* pillars */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 14, marginTop: 60,
          }}>
            {PILLARS.map(x => (
              <div key={x.title} style={{
                background: "#fff", border: `1px solid ${C.border}`,
                borderRadius: 16, padding: "22px 20px",
              }}>
                <p style={{
                  margin: 0, fontFamily: serif, fontWeight: 800,
                  fontSize: 17, color: C.dark,
                }}>{x.title}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: C.muted }}>{x.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}

const p: React.CSSProperties = {
  margin: "0 0 18px", fontSize: 16.5, lineHeight: 1.9, color: "rgba(28,16,8,0.72)",
};
