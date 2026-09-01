"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Calculator } from "lucide-react";
import { recordsFromGuests, PEOPLE_PER_RECORD, PER_RECORD_BASIC, MIN_CHARGE_BASIC } from "@/lib/pricing";

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
/* From pricing.ts, which the header of that file already calls the single
   source of truth and which this screen was quietly contradicting: it carried
   1.20 and a 250 floor while the approved per-record model is 1.00 and 290.
   Two floors in one business is not a choice, it is a bug — a couple quoted
   from here and a couple quoted from /pricing were being told different
   numbers for the same wedding. */
const PRICE_LAUNCH   = PER_RECORD_BASIC;
const MIN_CHARGE     = MIN_CHARGE_BASIC;
/* Per RECORD — per phone number, which is what actually receives a message.
   Measured at 3.45 outbound per record on שחר before her day-before had even
   gone out, at the MARKETING rate; 0.42 leaves room for resends and bad
   numbers. It was named COST_PER_GUEST and multiplied by the guest count,
   which double-counted every household.

   Covers the full lifecycle per record: invitation, reminder to non-responders,
   day-before (Utility), gallery to opt-ins, and — from the next couple on — a
   thank-you to everyone who attended. That last one is the message that
   carries the referral line to every guest the morning after, which is worth
   more than the ~5 agorot per guest it costs. */
const COST_PER_RECORD = 0.42;

const DESIGN_LIST    = 450;
const DESIGN_LAUNCH  = 350;
const DESIGN_COST    = 40;   // AI credits + fonts; the rest is our own time

const PRINT_PRICE    = 200;  // print-ready 300dpi files, bleed + CMYK
const PRINT_COST     = 0;

const CALL_PRICE     = 3;
const CALL_COST      = 2;    // outsourced caller

const ils = (n: number) => `₪${Math.round(n).toLocaleString("he-IL")}`;

/* A live wedding beats any mock-up: a couple who taps this sees the real
   invitation of a real event being run right now, not a demo of one. The token
   belongs to a category='demo' guest with no phone — it is filtered out of every
   count and every send, and it resets itself on each open, so it can be handed
   to any number of prospects. Replace it when לאל וטל is over: create another
   demo guest on a current event and paste the new token here. */
const DEMO_LINK = "https://regalifnei.vercel.app/rsvp/1831aeb5-a913-4dfc-ac62-b840684ad66a";

type Pack = "rsvp" | "design";

export default function QuoteBuilder() {
  const [pack, setPack]     = useState<Pack>("rsvp");
  const [names, setNames]   = useState("");
  const [guests, setGuests] = useState(300);
  /* What Dvir is typing into the box above.
   *
   * A couple asked "כמה מוזמנים?" answers in people, and this system bills
   * phone numbers — a household is one message and several guests. The screen
   * multiplied the answer straight by the rate, so אמיר's "כ־430 מוזמנים" was
   * quoted 420 ₪, the price of an eight-hundred-person wedding, and he replied
   * "לצערי זה יקר לי מידי".
   *
   * Two modes because both numbers are real: before the list arrives all we
   * have is the couple's estimate in people, and after it arrives we can count
   * the numbers exactly. */
  const [unit, setUnit] = useState<"guests" | "records">("guests");
  const [date, setDate]     = useState("");
  const [launch, setLaunch] = useState(true);
  const [print, setPrint]   = useState(false);
  const [calls, setCalls]   = useState(0);
  const [copied, setCopied] = useState(false);
  /* The calculator prices by the per-guest rate above. Every deal actually
     closed so far was negotiated to a round number instead — שחר 260, שלמה 300,
     אמיר 420 — so the figure that reaches the couple has to be typeable.
     Empty means "use the calculated total". */
  const [override, setOverride] = useState("");

  const withDesign = pack === "design";

  /* The number every price on this screen is built from. */
  const records = unit === "guests" ? recordsFromGuests(guests) : guests;

  const q = useMemo(() => {
    const rate = launch ? PRICE_LAUNCH : PRICE_LIST;
    const base = records * rate;
    /* Small weddings don't cover setup time — the minimum protects that */
    const belowMin = base < MIN_CHARGE;
    const guestTotal = belowMin ? MIN_CHARGE : base;

    const designTotal = withDesign ? (launch ? DESIGN_LAUNCH : DESIGN_LIST) : 0;
    const printTotal  = withDesign && print ? PRINT_PRICE : 0;
    const callTotal   = calls * CALL_PRICE;
    const total = guestTotal + designTotal + printTotal + callTotal;

    const cost = records * COST_PER_RECORD
               + (withDesign ? DESIGN_COST : 0)
               + (withDesign && print ? PRINT_COST : 0)
               + calls * CALL_COST;

    const profit = total - cost;
    return { rate, base, belowMin, guestTotal, designTotal, printTotal, callTotal,
             total, cost, profit, margin: total > 0 ? (profit / total) * 100 : 0 };
  }, [records, launch, calls, withDesign, print]);

  const message = useMemo(() => {
    const who  = names.trim() || "[שמות]";
    const when = date.trim() ? `\nהחתונה שלכם: ${date.trim()}\n` : "\n";

    const designBlock = withDesign ? `🎨 *עיצוב ההזמנה שלכם* — הזמנה מקורית שנבנית מאפס סביב הסיפור שלכם, עם סבבי תיקונים עד שאתם מאושרים${print ? "\n🖨 *קבצים מוכנים לדפוס* — 300dpi, שוליים וחיתוך, מוכנים להעברה לבית הדפוס" : ""}\n` : "";

    /* Priced per phone number, and it says so. A couple reading "430 מוזמנים
       × 1.20" and a couple reading "230 מספרים × 1.20" are being told two
       different things about what they are buying, and only the second is
       true. The unit is explained rather than assumed — nobody outside this
       business thinks in records. */
    const rateLine = q.belowMin
      ? `אישורי הגעה — מחיר מינימום לאירוע: ${ils(MIN_CHARGE)}`
      : `אישורי הגעה — ${records} מספרי טלפון × ${q.rate.toFixed(2)} ₪ = ${ils(q.base)}`;

    const lines = [rateLine];
    if (q.designTotal) lines.push(`עיצוב ההזמנה: ${ils(q.designTotal)}`);
    if (q.printTotal)  lines.push(`קבצים לדפוס: ${ils(q.printTotal)}`);
    if (q.callTotal)   lines.push(`שיחות טלפון: ${calls} × ${CALL_PRICE} ₪ = ${ils(q.callTotal)}`);

    const priced = override.trim() ? `₪${override.trim()}` : ils(q.total);
    const timing = date.trim()
      ? `${date.trim()} — יש לנו מספיק זמן לוודא שכל האורחים שלך יגיעו, ולשלוח הזמנות בנחת.\n\n`
      : "";

    return `היי ${who} 🤍

${timing}מה שאתה מקבל ממני:

📩 *הזמנה דיגיטלית מעוצבת* — לא תמונה, חוויה שנפתחת בטלפון
✅ *קישור אישי לכל מוזמן*, עם ספירת אורחים מדויקת
🔔 *תזכורות אוטומטיות* רק למי שעדיין לא ענה
🚗 *תזכורת ביום האירוע* עם ניווט Waze ישיר לאולם
📸 *גלריה משותפת* — האורחים מעלים את התמונות שצילמו
📊 *לוח בקרה בזמן אמת* — מי אישר, מי עוד לא, כמה מגיעים
📋 *רשימה מסודרת* לקראת האירוע
💬 *אורח שכותב שאלה — אני עונה לו*, לא אתה
${designBlock}
אתה בעצם לא נוגע בשום דבר מזה. רק מסתכל על המספרים — מי אישר ומי עדיין לא.

את כל זה אתה מקבל ב-*${priced}*.

אני מתמחר לפי מספרי טלפון ולא לפי אורחים — משפחה שלמה מקבלת הודעה אחת, לא אחת לכל אדם.${unit === "guests" ? ` אצל ${guests} מוזמנים זה יוצא בערך ${records} מספרים.` : ` אצלכם זה ${records} מספרים.`}

רוצה לראות בדיוק איך זה נראה? הנה חתונה אמיתית שאני מנהל עכשיו — לחץ ותראה מה האורח מקבל:
${DEMO_LINK}

ההודעות נשלחות בערוץ הרשמי של וואטסאפ לעסקים — יש דוחות מסירה אמיתיים, והמספר האישי שלך לא נחשף ולא בסיכון חסימה.

במידה ואתה מעוניין, בשמחה. מה שנשאר: תשלח לי את רשימת המוזמנים, שם האולם והכתובת, ושעת החופה. משם אני מתחיל לעבוד 🙏

דביר · רגע לפני`;
  }, [names, date, guests, records, unit, override, withDesign, print, q]);

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
              <label style={label}>
                {unit === "guests" ? "מספר מוזמנים (מה שהלקוח אמר)" : "מספר רשומות (מהרשימה)"}
              </label>
              <input style={input} type="number" min={0} value={guests}
                onChange={e => setGuests(Math.max(0, Number(e.target.value) || 0))} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {([["guests", "מוזמנים"], ["records", "רשומות"]] as const).map(([u, l]) => (
                  <button key={u} onClick={() => setUnit(u)} style={{
                    flex: 1, padding: "7px 0", borderRadius: 10, cursor: "pointer",
                    fontFamily: "Heebo, sans-serif", fontSize: 13,
                    border: `1px solid ${unit === u ? C.gold : C.border}`,
                    background: unit === u ? "rgba(197,164,109,0.14)" : "#fff",
                    color: unit === u ? C.goldT : C.muted,
                    fontWeight: unit === u ? 600 : 400,
                  }}>{l}</button>
                ))}
              </div>
              {unit === "guests" && (
                <div style={{ marginTop: 8, fontSize: 13, color: C.goldT }}>
                  {guests} מוזמנים ≈ <b>{records} מספרי טלפון</b> — וזה מה שמתומחר
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {PEOPLE_PER_RECORD} אנשים למספר, נמדד על שחר, לאל ותהל. הרשימה עצמה מדויקת יותר.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={label}>מחיר סופי (ריק = לפי החישוב)</label>
              <input style={input} type="number" min={0} value={override}
                placeholder={String(Math.round(q.total))}
                onChange={e => setOverride(e.target.value)} />
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
                  ⚠️ {records} רשומות = {ils(q.base)} בלבד — הוחל מינימום של {ils(MIN_CHARGE)}.
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
