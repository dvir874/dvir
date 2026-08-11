"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Calculator } from "lucide-react";

/* Internal quoting tool — builds a ready-to-send price proposal for a couple.
   Not linked from the public site; this is Dvir's own sales aid.

   Pricing model (decided 2026-08-06, benchmarked against a competitor who
   charges ₪1.60/record for WhatsApp+SMS+calls):
   - List price stays 1.60 so the launch discount is a discount, not a lower
     list price we can never raise.
   - Real per-guest message cost is ~₪0.30 across the full lifecycle
     (invite + reminder + day-before + thank-you); 0.35 leaves headroom for
     resends and bad numbers.
   - Invitation design is a flat add-on: it is bounded work, so pricing it
     per-guest would punish small weddings and under-charge large ones. */

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
};

const PRICE_LIST     = 1.6;
const PRICE_LAUNCH   = 1.2;
const MIN_CHARGE     = 250;
/* Covers the full lifecycle per guest: invitation, reminder to non-responders,
   day-before (Utility), gallery to opt-ins, and — from the next couple on — a
   thank-you to everyone who attended. That last one is the message that
   carries the referral line to every guest the morning after, which is worth
   more than the ~5 agorot per guest it costs. */
const COST_PER_GUEST = 0.42;

const DESIGN_LIST    = 450;
const DESIGN_LAUNCH  = 350;
const DESIGN_COST    = 40;   // AI credits + fonts; the rest is our own time

const PRINT_PRICE    = 200;  // print-ready 300dpi files, bleed + CMYK
const PRINT_COST     = 0;

const CALL_PRICE     = 3;
const CALL_COST      = 2;    // outsourced caller

const ils = (n: number) => `₪${Math.round(n).toLocaleString("he-IL")}`;

type Pack = "rsvp" | "design";

export default function QuoteBuilder() {
  const [pack, setPack]     = useState<Pack>("rsvp");
  const [names, setNames]   = useState("");
  const [guests, setGuests] = useState(300);
  const [date, setDate]     = useState("");
  const [launch, setLaunch] = useState(true);
  const [print, setPrint]   = useState(false);
  const [calls, setCalls]   = useState(0);
  const [copied, setCopied] = useState(false);

  const withDesign = pack === "design";

  const q = useMemo(() => {
    const rate = launch ? PRICE_LAUNCH : PRICE_LIST;
    const base = guests * rate;
    /* Small weddings don't cover setup time — the minimum protects that */
    const belowMin = base < MIN_CHARGE;
    const guestTotal = belowMin ? MIN_CHARGE : base;

    const designTotal = withDesign ? (launch ? DESIGN_LAUNCH : DESIGN_LIST) : 0;
    const printTotal  = withDesign && print ? PRINT_PRICE : 0;
    const callTotal   = calls * CALL_PRICE;
    const total = guestTotal + designTotal + printTotal + callTotal;

    const cost = guests * COST_PER_GUEST
               + (withDesign ? DESIGN_COST : 0)
               + (withDesign && print ? PRINT_COST : 0)
               + calls * CALL_COST;

    const profit = total - cost;
    return { rate, base, belowMin, guestTotal, designTotal, printTotal, callTotal,
             total, cost, profit, margin: total > 0 ? (profit / total) * 100 : 0 };
  }, [guests, launch, calls, withDesign, print]);

  const message = useMemo(() => {
    const who  = names.trim() || "[שמות]";
    const when = date.trim() ? `\nהחתונה שלכם: ${date.trim()}\n` : "\n";

    const designBlock = withDesign ? `🎨 *עיצוב ההזמנה שלכם* — הזמנה מקורית שנבנית מאפס סביב הסיפור שלכם, עם סבבי תיקונים עד שאתם מאושרים${print ? "\n🖨 *קבצים מוכנים לדפוס* — 300dpi, שוליים וחיתוך, מוכנים להעברה לבית הדפוס" : ""}\n` : "";

    const rateLine = q.belowMin
      ? `אישורי הגעה — מחיר מינימום לאירוע: ${ils(MIN_CHARGE)}`
      : `אישורי הגעה — ${guests} מוזמנים × ${q.rate.toFixed(2)} ₪ = ${ils(q.base)}`;

    const lines = [rateLine];
    if (q.designTotal) lines.push(`עיצוב ההזמנה: ${ils(q.designTotal)}`);
    if (q.printTotal)  lines.push(`קבצים לדפוס: ${ils(q.printTotal)}`);
    if (q.callTotal)   lines.push(`שיחות טלפון: ${calls} × ${CALL_PRICE} ₪ = ${ils(q.callTotal)}`);

    return `היי ${who} 🤍
${when}
שמחתי שפניתם! הנה בדיוק מה שאתם מקבלים ברגע לפני:

${designBlock}📩 *הזמנה דיגיטלית* — לא תמונה, חוויה שנפתחת בטלפון
✅ *אישורי הגעה אוטומטיים* — כל אורח עם קישור אישי, בלי בלבול
🔔 *תזכורות חכמות* — רק למי שעדיין לא ענה
🚗 *תזכורת ביום האירוע* עם ניווט Waze ישיר לאולם
📊 *דשבורד ניהול* — כמה אישרו, מי מגיע, הסעות, הכול בזמן אמת
📸 *גלריה משותפת* — האורחים מעלים את התמונות שצילמו
🤍 *הודעת תודה* לכל האורחים למחרת

*המחיר*
${lines.join("\n")}
━━━━━━━━━━━━━
*סה״כ: ${ils(q.total)}* — הכול כלול, בלי הפתעות
${launch ? `\n🎉 זהו *מחיר השקה* לזוגות הראשונים. המחיר המלא: ${PRICE_LIST.toFixed(2)} ₪ למוזמן${withDesign ? ` ו-${ils(DESIGN_LIST)} על העיצוב` : ""}.\n` : ""}
ההודעות נשלחות בערוץ הרשמי של וואטסאפ לעסקים — תמונת ההזמנה שלכם מופיעה בכל הודעה, יש דוחות מסירה אמיתיים, והמספר האישי שלכם לא נחשף ולא בסיכון חסימה.

אשמח להראות לכם הדגמה חיה לפני שתחליטו 🙂

דביר · רגע לפני`;
  }, [names, date, guests, calls, launch, withDesign, print, q]);

  const copy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const label: React.CSSProperties = {
    display: "block", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500 };
  const input: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 15,
    border: `1px solid ${C.border}`, background: "#fff", color: C.dark,
    fontFamily: "inherit", outline: "none" };

  const toggle = (on: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 15px", borderRadius: 10, cursor: "pointer", width: "100%",
    border: `1px solid ${on ? C.gold : C.border}`,
    background: on ? C.cream : "#fff", color: C.dark,
    fontFamily: "inherit", fontSize: 14, fontWeight: 600, textAlign: "right" });

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, color: C.dark,
      fontFamily: "Heebo, system-ui, sans-serif", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30,
            fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Calculator size={26} style={{ color: C.gold }} /> בונה הצעות מחיר
          </h1>
          <p style={{ color: C.muted, margin: "6px 0 0", fontSize: 14 }}>
            ממלאים פרטים, מעתיקים את ההודעה ושולחים בוואטסאפ.
          </p>
        </header>

        {/* ---------- package picker ---------- */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
          marginBottom: 24 }}>
          {([
            { id: "rsvp"   as Pack, t: "אישורי הגעה",
              d: "הזמנה דיגיטלית מהעיצוב שלהם + כל מערכת האישורים",
              p: `מ-${ils(MIN_CHARGE)}` },
            { id: "design" as Pack, t: "עיצוב הזמנה + אישורי הגעה",
              d: "אנחנו מעצבים את ההזמנה מאפס, ואז הכול מחובר",
              p: `+ ${ils(launch ? DESIGN_LAUNCH : DESIGN_LIST)}` },
          ]).map(o => {
            const on = pack === o.id;
            return (
              <button key={o.id} onClick={() => setPack(o.id)}
                style={{ padding: "18px 20px", borderRadius: 14, cursor: "pointer",
                  textAlign: "right", fontFamily: "inherit",
                  border: `1.5px solid ${on ? C.gold : C.border}`,
                  background: on ? C.cream : "#fff", color: C.dark }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 17, fontWeight: 700,
                    fontFamily: "'Frank Ruhl Libre', serif" }}>{o.t}</span>
                  <span style={{ fontSize: 13, color: on ? C.goldT : C.muted,
                    whiteSpace: "nowrap" }}>{o.p}</span>
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>{o.d}</div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24,
          alignItems: "start" }}>

          {/* ---------- inputs ---------- */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`,
            borderRadius: 16, padding: 22, display: "grid", gap: 18 }}>

            <div>
              <label style={label}>שמות בני הזוג</label>
              <input style={input} value={names} placeholder="יוסי ורונית"
                onChange={e => setNames(e.target.value)} />
            </div>

            <div>
              <label style={label}>תאריך החתונה (אופציונלי)</label>
              <input style={input} value={date} placeholder="12.03.2027"
                onChange={e => setDate(e.target.value)} />
            </div>

            <div>
              <label style={label}>מספר מוזמנים</label>
              <input style={input} type="number" min={0} value={guests}
                onChange={e => setGuests(Math.max(0, Number(e.target.value) || 0))} />
            </div>

            <div>
              <label style={label}>שיחות טלפון (למי שאין וואטסאפ)</label>
              <input style={input} type="number" min={0} value={calls}
                onChange={e => setCalls(Math.max(0, Number(e.target.value) || 0))} />
            </div>

            {withDesign && (
              <button onClick={() => setPrint(v => !v)} style={toggle(print)}>
                <span>🖨 קבצים מוכנים לדפוס</span>
                <span style={{ fontSize: 12, color: print ? C.goldT : C.muted }}>
                  {print ? ils(PRINT_PRICE) : `+ ${ils(PRINT_PRICE)}`}
                </span>
              </button>
            )}

            <button onClick={() => setLaunch(v => !v)} style={toggle(launch)}>
              <span>🎉 מחיר השקה</span>
              <span style={{ fontSize: 12, color: launch ? C.goldT : C.muted }}>
                {launch ? `${PRICE_LAUNCH.toFixed(2)} ₪` : `מלא ${PRICE_LIST.toFixed(2)} ₪`}
              </span>
            </button>
          </div>

          {/* ---------- output ---------- */}
          <div style={{ display: "grid", gap: 18 }}>

            {/* Internal figures — never part of the message the couple sees */}
            <div style={{ background: C.cream, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "18px 22px" }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12,
                letterSpacing: .4 }}>לעיניך בלבד — לא נכנס להודעה</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                  { k: "מחיר ללקוח", v: ils(q.total), c: C.dark },
                  { k: "עלות ישירה", v: ils(q.cost), c: C.muted },
                  { k: "רווח", v: ils(q.profit), c: C.green },
                  { k: "שיעור רווח", v: `${Math.round(q.margin)}%`, c: C.goldT },
                ].map(x => (
                  <div key={x.k}>
                    <div style={{ fontSize: 12, color: C.muted }}>{x.k}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: x.c,
                      fontFamily: "'Frank Ruhl Libre', serif" }}>{x.v}</div>
                  </div>
                ))}
              </div>
              {q.belowMin && (
                <div style={{ marginTop: 12, fontSize: 13, color: C.goldT }}>
                  ⚠️ {guests} מוזמנים = {ils(q.base)} בלבד — הוחל מינימום של {ils(MIN_CHARGE)}.
                </div>
              )}
              {withDesign && (
                <div style={{ marginTop: 10, fontSize: 13, color: C.muted }}>
                  שים לב: העלות לא כוללת את שעות העיצוב שלך — רק קרדיטים וכלים.
                </div>
              )}
            </div>

            <div style={{ background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>ההודעה לשליחה</span>
                <button onClick={copy}
                  style={{ display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", borderRadius: 9, cursor: "pointer", border: "none",
                    background: copied ? C.green : C.gold, color: "#fff",
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "הועתק" : "העתקה"}
                </button>
              </div>
              <pre style={{ margin: 0, padding: "20px 22px", whiteSpace: "pre-wrap",
                fontFamily: "inherit", fontSize: 14.5, lineHeight: 1.75, color: C.dark }}>
                {message}
              </pre>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
