"use client";

import { useEffect, useState } from "react";

/* ── Design constants ─────────────────────────────────── */
const GOLD   = "#C5A46D";
const OLIVE  = "#6B7B5A";
const DARK   = "#1C1008";
const CREAM  = "#F2EDE3";
const FRANK  = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO  = { fontFamily: "Heebo, sans-serif" };
const CARD   = { background: "rgba(255,255,255,0.82)", border: "1px solid rgba(197,164,109,0.18)", boxShadow: "0 2px 16px rgba(28,16,8,0.07)" };
const HEADER_GRAD = "linear-gradient(150deg, #C5954A 0%, #9B6E2C 50%, #7A5020 100%)";

/* ── Fake data ────────────────────────────────────────── */
const DEMO_EVENT  = { name: "נועה ויוני", date: "2025-09-15", daysLeft: 84 };
const DEMO_STATS  = { total: 180, confirmed: 112, declined: 18, pending: 50, attendees: 142 };
const DEMO_TASKS  = [
  { id: "1", title: "לסגור עם הצלם",   category: "photographer", completed: false, due_date: "2025-07-01" },
  { id: "2", title: "לבחור תפריט",     category: "catering",     completed: false, due_date: "2025-07-15" },
  { id: "3", title: "לשלוח הזמנות",   category: "invitations",  completed: true,  due_date: null },
  { id: "4", title: "לאשר פרחים",      category: "flowers",      completed: false, due_date: null },
];
const DEMO_BUDGET = [
  { id: "1", category: "venue",        description: "אולם האירועים",  planned_amount: 28000, color: "#C5A46D" },
  { id: "2", category: "catering",     description: "קייטרינג",       planned_amount: 22000, color: "#8B6914" },
  { id: "3", category: "photographer", description: "צלם וצלמת",      planned_amount: 12000, color: "#6B7B5A" },
  { id: "4", category: "dj",           description: "DJ",             planned_amount:  6000, color: "#7C6A52" },
];
const DEMO_GIFTS = [
  { id: "1", guest_name: "משפחת כהן",      amount: 1500 },
  { id: "2", guest_name: "דוד וסימה",       amount:  800 },
  { id: "3", guest_name: "חברות מהצבא",    amount:  600 },
];
const DEMO_TIMELINE = [
  { time: "17:00", label: "קבלת פנים"    },
  { time: "19:00", label: "חופה וקידושין" },
  { time: "20:00", label: "ארוחה וריקודים" },
  { time: "23:30", label: "סיום האירוע"  },
];

const WA_LINK = "https://wa.me/972533318177?text=שלום+דביר%2C+ראיתי+את+ההדגמה+ורוצה+לשמוע+פרטים+על+המערכת";
const TOTAL_BUDGET = DEMO_BUDGET.reduce((s, b) => s + b.planned_amount, 0);
const TOTAL_GIFTS  = DEMO_GIFTS.reduce((s, g) => s + g.amount, 0);

/* ── Countdown hook ───────────────────────────────────── */
function useCountdown(target: Date) {
  const [time, setTime]       = useState({ d: 84, h: 5, m: 22, s: 11 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff / 3_600_000) % 24),
        m: Math.floor((diff / 60_000)    % 60),
        s: Math.floor((diff / 1_000)     % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);
  return { time, mounted };
}

/* ── SVG Donut Chart ──────────────────────────────────── */
function DonutChart() {
  const r = 70; const cx = 90; const cy = 90;
  const circ = 2 * Math.PI * r;
  let cumulative = 0;
  const slices = DEMO_BUDGET.map((b) => {
    const pct = b.planned_amount / TOTAL_BUDGET;
    const dash = pct * circ;
    const offset = circ - cumulative * circ;
    cumulative += pct;
    return { ...b, dash, offset };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        {slices.map((s) => (
          <circle
            key={s.id}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={24}
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={s.offset}
            style={{ transition: "stroke-dasharray 0.4s" }}
          />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ ...FRANK, fontSize: 15, fill: DARK, fontWeight: 700 }}>
          ₪{TOTAL_BUDGET.toLocaleString()}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ ...HEEBO, fontSize: 10, fill: GOLD }}>
          תקציב כולל
        </text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center" }}>
        {DEMO_BUDGET.map((b) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
            <span style={{ ...HEEBO, fontSize: 12, color: DARK }}>{b.description}</span>
            <span style={{ ...HEEBO, fontSize: 11, color: GOLD }}>₪{b.planned_amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function DemoPage() {
  const eventDate = new Date(DEMO_EVENT.date + "T19:00:00");
  const { time, mounted } = useCountdown(eventDate);

  const pendingTasks = DEMO_TASKS
    .filter((t) => !t.completed)
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .slice(0, 3);

  const completedCount = DEMO_TASKS.filter((t) => t.completed).length;

  const rsvpBars = [
    { label: "אישרו",  value: DEMO_STATS.confirmed, color: OLIVE,   max: DEMO_STATS.total },
    { label: "סירבו",  value: DEMO_STATS.declined,  color: "#C0392B", max: DEMO_STATS.total },
    { label: "ממתינים", value: DEMO_STATS.pending,   color: GOLD,    max: DEMO_STATS.total },
  ];

  return (
    <div dir="rtl" lang="he" style={{ minHeight: "100vh", background: CREAM, ...HEEBO }}>

      {/* ── Demo banner (sticky) ─────────────────────────── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: GOLD,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px",
        boxShadow: "0 2px 12px rgba(197,164,109,0.4)",
      }}>
        <span style={{ ...HEEBO, fontSize: 13, color: DARK, fontWeight: 600 }}>
          זוהי הדגמה בלבד · רוצים כזה לחתונה שלכם?
        </span>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...HEEBO, fontSize: 13, fontWeight: 700,
            background: DARK, color: "#fff",
            padding: "6px 16px", borderRadius: 20,
            textDecoration: "none", whiteSpace: "nowrap",
          }}
        >
          דברו איתנו ←
        </a>
      </div>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ background: HEADER_GRAD, padding: "28px 20px 24px", color: "#fff" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ ...FRANK, fontSize: 26, fontWeight: 700 }}>
              ערב טוב, {DEMO_EVENT.name} 💛
            </span>
            <span style={{
              ...HEEBO, fontSize: 11, fontWeight: 600,
              background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)",
              padding: "3px 10px", borderRadius: 20,
            }}>
              תכנון ראשוני
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {[
              `${DEMO_STATS.confirmed}/${DEMO_STATS.total} ענו`,
              `${completedCount}/${DEMO_TASKS.length} משימות`,
              `${DEMO_EVENT.daysLeft} ימים`,
            ].map((pill) => (
              <span key={pill} style={{
                ...HEEBO, fontSize: 12, fontWeight: 600,
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                padding: "4px 12px", borderRadius: 20, color: "#fff",
              }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* ── Countdown ───────────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "24px 20px", marginBottom: 16, textAlign: "center" }}>
          <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>
            ✦ עד החתונה נותרו
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {(mounted
              ? [{ v: time.d, l: "ימים" }, { v: time.h, l: "שעות" }, { v: time.m, l: "דקות" }, { v: time.s, l: "שניות" }]
              : [{ v: 84, l: "ימים" }, { v: 5, l: "שעות" }, { v: 22, l: "דקות" }, { v: 11, l: "שניות" }]
            ).map(({ v, l }) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 14,
                  background: "rgba(197,164,109,0.1)", border: `1px solid rgba(197,164,109,0.25)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ ...FRANK, fontSize: 26, fontWeight: 700, color: DARK }}>
                    {String(v).padStart(2, "0")}
                  </span>
                </div>
                <span style={{ ...HEEBO, fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recommendations ─────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
          <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>
            ✦ משימות לטיפול
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingTasks.map((t) => {
              const urgent = t.due_date && new Date(t.due_date) < new Date("2025-07-10");
              return (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", borderRadius: 12,
                  background: urgent ? "rgba(197,164,109,0.08)" : "rgba(107,123,90,0.06)",
                  border: `1px solid ${urgent ? "rgba(197,164,109,0.25)" : "rgba(107,123,90,0.15)"}`,
                }}>
                  <span style={{ ...HEEBO, fontSize: 14, color: DARK }}>{t.title}</span>
                  {t.due_date && (
                    <span style={{
                      ...HEEBO, fontSize: 11, fontWeight: 600,
                      color: urgent ? "#fff" : OLIVE,
                      background: urgent ? "#C5954A" : "rgba(107,123,90,0.15)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {urgent ? "⚡ דחוף" : t.due_date.slice(5).replace("-", "/")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RSVP Counter ────────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
          <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
            ✦ סטטוס הזמנות
          </p>
          <p style={{ ...HEEBO, fontSize: 13, color: DARK, marginBottom: 16 }}>
            <strong>{DEMO_STATS.attendees}</strong> מגיעים · {DEMO_STATS.total} מוזמנים סה״כ
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rsvpBars.map((bar) => (
              <div key={bar.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ ...HEEBO, fontSize: 13, color: DARK }}>{bar.label}</span>
                  <span style={{ ...HEEBO, fontSize: 13, fontWeight: 700, color: bar.color }}>{bar.value}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(28,16,8,0.06)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${(bar.value / bar.max) * 100}%`,
                    background: bar.color,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Budget Donut ─────────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
          <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            ✦ תקציב
          </p>
          <DonutChart />
        </div>

        {/* ── Gifts ────────────────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              ✦ מתנות
            </p>
            <span style={{ ...HEEBO, fontSize: 13, fontWeight: 700, color: OLIVE }}>
              סה״כ ₪{TOTAL_GIFTS.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_GIFTS.map((g) => (
              <div key={g.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 12px", borderRadius: 10,
                background: "rgba(107,123,90,0.06)", border: "1px solid rgba(107,123,90,0.1)",
              }}>
                <span style={{ ...HEEBO, fontSize: 13, color: DARK }}>{g.guest_name}</span>
                <span style={{ ...HEEBO, fontSize: 13, fontWeight: 700, color: OLIVE }}>₪{g.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline ─────────────────────────────────── */}
        <div style={{ ...CARD, borderRadius: 16, padding: "20px", marginBottom: 16 }}>
          <p style={{ ...HEEBO, fontSize: 11, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            ✦ לוח זמנים
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {DEMO_TIMELINE.map((item, i) => (
              <div key={item.time} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: GOLD, border: "2px solid rgba(197,164,109,0.3)",
                    marginTop: 4, flexShrink: 0,
                  }} />
                  {i < DEMO_TIMELINE.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(197,164,109,0.2)", minHeight: 24 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 16 }}>
                  <span style={{ ...HEEBO, fontSize: 12, color: GOLD, fontWeight: 700 }}>{item.time}</span>
                  <span style={{ ...HEEBO, fontSize: 14, color: DARK, marginRight: 8 }}>{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ───────────────────────────────── */}
        <div style={{
          background: HEADER_GRAD, borderRadius: 20,
          padding: "32px 24px", textAlign: "center", marginBottom: 20,
          boxShadow: "0 8px 32px rgba(197,164,109,0.3)",
        }}>
          <p style={{ ...FRANK, fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
            רוצים מערכת כזו לחתונה שלכם?
          </p>
          <p style={{ ...HEEBO, fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>
            ניהול מוזמנים, תקציב, משימות, מתנות — הכל במקום אחד
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: DARK,
              ...HEEBO, fontSize: 15, fontWeight: 700,
              padding: "12px 28px", borderRadius: 30,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            💬 דברו איתנו בוואטסאפ
          </a>
        </div>

        {/* ── Disclaimer ───────────────────────────────── */}
        <p style={{ ...HEEBO, textAlign: "center", fontSize: 11, color: "rgba(28,16,8,0.35)", marginTop: 8 }}>
          הדגמה בלבד — הנתונים אינם אמיתיים
        </p>
      </div>
    </div>
  );
}
