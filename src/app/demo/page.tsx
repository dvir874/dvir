"use client";

import { useEffect, useRef, useState } from "react";

/* ── Design constants ─────────────────────────────────── */
const GOLD  = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK  = "#1C1008";
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO = { fontFamily: "Heebo, sans-serif" };

const WA_LINK = "https://wa.me/972533318177?text=שלום+דביר%2C+ראיתי+את+ההדגמה+ורוצה+לשמוע+פרטים";

/* ── Fake data ─────────────────────────────────────────── */
const DEMO_STATS  = { total: 180, confirmed: 112, declined: 18, pending: 50, attendees: 142 };
const DEMO_BUDGET = [
  { id: "1", description: "אולם האירועים",  planned_amount: 28000, color: "#C5A46D" },
  { id: "2", description: "קייטרינג",       planned_amount: 22000, color: "#8B6914" },
  { id: "3", description: "צלם וצלמת",      planned_amount: 12000, color: "#6B7B5A" },
  { id: "4", description: "DJ",             planned_amount:  6000, color: "#7C6A52" },
];
const TOTAL_BUDGET = DEMO_BUDGET.reduce((s, b) => s + b.planned_amount, 0);

/* ── Countdown hook ──────────────────────────────────── */
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

/* ── Animated counter ────────────────────────────────── */
function useCountUp(target: number, duration = 2000) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          setVal(Math.round(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, started]);
  return { val, ref };
}

/* ── Scroll fade-in hook ─────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ── SVG Donut ────────────────────────────────────────── */
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
          <circle key={s.id} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
            strokeWidth={24} strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={s.offset} style={{ transition: "stroke-dasharray 0.4s" }} />
        ))}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ ...FRANK, fontSize: 15, fill: GOLD, fontWeight: 700 }}>
          ₪{TOTAL_BUDGET.toLocaleString()}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ ...HEEBO, fontSize: 10, fill: "rgba(197,164,109,0.6)" }}>
          תקציב כולל
        </text>
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center" }}>
        {DEMO_BUDGET.map((b) => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
            <span style={{ ...HEEBO, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{b.description}</span>
            <span style={{ ...HEEBO, fontSize: 11, color: GOLD }}>₪{b.planned_amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────── */
function StatCard({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { val, ref } = useCountUp(target);
  return (
    <div ref={ref} style={{
      flex: 1, minWidth: 140, textAlign: "center",
      padding: "24px 16px", borderRadius: 16,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(197,164,109,0.18)`,
    }}>
      <div style={{ ...FRANK, fontSize: 36, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
        {val}{suffix}
      </div>
      <div style={{ ...HEEBO, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

/* ── Feature card ─────────────────────────────────────── */
function FeatureCard({ emoji, title, desc, children, delay = 0 }:
  { emoji: string; title: string; desc: string; children?: React.ReactNode; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} style={{
      flex: 1, minWidth: 240, borderRadius: 20,
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(197,164,109,0.2)",
      padding: 24,
      transition: `opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      cursor: "default",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
      <div style={{ ...FRANK, fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 6 }}>{title}</div>
      <div style={{ ...HEEBO, fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16, lineHeight: 1.6 }}>{desc}</div>
      {children}
    </div>
  );
}

/* ── Testimonial card ─────────────────────────────────── */
function TestiCard({ quote, name, emoji, rot }: { quote: string; name: string; emoji: string; rot: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} style={{
      flex: 1, minWidth: 240, borderRadius: 20,
      background: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(197,164,109,0.2)",
      padding: "28px 24px",
      transform: visible ? `rotate(${rot})` : "translateY(30px)",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.7s, transform 0.7s",
    }}>
      <div style={{ ...FRANK, fontSize: 48, color: GOLD, lineHeight: 0.8, marginBottom: 12, opacity: 0.5 }}>"</div>
      <div style={{ ...HEEBO, fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 16 }}>{quote}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ ...HEEBO, fontSize: 13, fontWeight: 700, color: GOLD }}>{name}</div>
        <div style={{ fontSize: 16 }}>{emoji}</div>
      </div>
      <div style={{ marginTop: 8, color: GOLD, fontSize: 12 }}>★★★★★</div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────── */
export default function DemoPage() {
  const eventDate = new Date("2025-09-15T19:00:00");
  const { time, mounted } = useCountdown(eventDate);
  const { ref: heroRef, visible: heroVisible } = useScrollReveal();
  const rsvpBars = [
    { label: "אישרו",   value: DEMO_STATS.confirmed, color: OLIVE,    max: DEMO_STATS.total },
    { label: "סירבו",   value: DEMO_STATS.declined,  color: "#C0392B", max: DEMO_STATS.total },
    { label: "ממתינים", value: DEMO_STATS.pending,    color: GOLD,     max: DEMO_STATS.total },
  ];

  const FEATURES = [
    "הזמנה דיגיטלית מעוצבת",
    "ניהול רשימת מוזמנים",
    "אישורי הגעה אוטומטיים",
    "ניהול תקציב ומשימות",
    "דף אישי לאורחים",
    "תמיכה אישית של דביר",
  ];

  return (
    <div dir="rtl" lang="he" style={{ ...HEEBO, background: "#0f0700", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(197,164,109,0.3); }
          50% { text-shadow: 0 0 60px rgba(197,164,109,0.8), 0 0 120px rgba(197,164,109,0.3); }
        }
        @keyframes shimmerBtn {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .shimmer-btn {
          position: relative; overflow: hidden;
        }
        .shimmer-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: none;
        }
        .shimmer-btn:hover::after {
          animation: shimmerBtn 0.7s ease forwards;
        }
        .feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 20px 60px rgba(197,164,109,0.15) !important;
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", overflow: "hidden", padding: "40px 20px",
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1500 35%, #1a0800 70%, #0f0500 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 12s ease infinite",
      }}>
        {/* Floating rings */}
        {[
          { w: 500, h: 500, top: -100, right: -100, delay: "0s", dur: "8s" },
          { w: 300, h: 300, top: 100, left: -80, delay: "2s", dur: "6s" },
          { w: 200, h: 200, bottom: 50, right: 80, delay: "4s", dur: "7s" },
          { w: 150, h: 150, bottom: 150, left: 100, delay: "1s", dur: "9s" },
        ].map((ring, i) => (
          <div key={i} style={{
            position: "absolute",
            width: ring.w, height: ring.h, borderRadius: "50%",
            border: "1px solid rgba(197,164,109,0.12)",
            top: "top" in ring ? ring.top : "auto",
            bottom: "bottom" in ring ? ring.bottom : "auto",
            right: "right" in ring ? ring.right : "auto",
            left: "left" in ring ? ring.left : "auto",
            animation: `floatSlow ${ring.dur} ease-in-out ${ring.delay} infinite`,
            pointerEvents: "none",
          }} />
        ))}

        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(197,164,109,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div ref={heroRef} style={{
          position: "relative", zIndex: 2,
          animation: "slideInUp 1s ease forwards",
        }}>
          <div style={{
            display: "inline-block", marginBottom: 20,
            padding: "6px 20px", borderRadius: 30,
            background: "rgba(197,164,109,0.1)",
            border: "1px solid rgba(197,164,109,0.25)",
            ...HEEBO, fontSize: 12, letterSpacing: "0.2em", color: GOLD,
          }}>
            ✦ הזמנות דיגיטליות לחתונה
          </div>

          <h1 style={{
            ...FRANK, fontSize: "clamp(48px, 10vw, 90px)", fontWeight: 700,
            lineHeight: 1.1, marginBottom: 12,
            background: `linear-gradient(135deg, #fff 0%, ${GOLD} 50%, #fff 100%)`,
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite, glow 3s ease-in-out infinite",
          }}>
            נועה ויוני 💛
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ ...HEEBO, fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
              90 ימים לחתונה
            </span>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="#dashboard"
              className="shimmer-btn"
              style={{
                ...HEEBO, fontSize: 15, fontWeight: 700,
                background: `linear-gradient(135deg, ${GOLD}, #9B6E2C)`,
                color: "#fff", padding: "14px 28px", borderRadius: 30,
                textDecoration: "none", display: "inline-block",
                boxShadow: `0 8px 30px rgba(197,164,109,0.4)`,
              }}
            >
              ראו הדגמה ↓
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="shimmer-btn"
              style={{
                ...HEEBO, fontSize: 15, fontWeight: 700,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(197,164,109,0.3)",
                color: "#fff", padding: "14px 28px", borderRadius: 30,
                textDecoration: "none", display: "inline-block",
              }}
            >
              💬 דברו איתנו
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          animation: "floatSlow 3s ease-in-out infinite",
          color: "rgba(197,164,109,0.4)", fontSize: 24,
        }}>
          ↓
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────── */}
      <section style={{
        padding: "48px 20px",
        background: "linear-gradient(180deg, #0f0700 0%, #150900 100%)",
      }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
        }}>
          <StatCard target={180} suffix="+" label="זוגות מאושרים" />
          <StatCard target={98} suffix="%" label="שביעות רצון" />
          <StatCard target={3} suffix=" דק׳" label="הגדרה בלבד" />
        </div>
      </section>

      {/* ── Feature showcase ───────────────────────────────── */}
      <section style={{ padding: "64px 20px", background: "#0f0700" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{
            textAlign: "center", ...HEEBO, fontSize: 11, letterSpacing: "0.22em",
            color: GOLD, textTransform: "uppercase", marginBottom: 8,
          }}>
            ✦ מה תקבלו
          </p>
          <h2 style={{
            textAlign: "center", ...FRANK, fontSize: "clamp(28px, 5vw, 42px)",
            fontWeight: 700, color: "#fff", marginBottom: 48,
          }}>
            הכל במקום אחד
          </h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <FeatureCard delay={0} emoji="💌" title="הזמנה דיגיטלית"
              desc="עיצוב מקצועי מרהיב עם הנפשות, ספירה לאחור ומיפוי ניווט">
              {/* Mini invitation mockup */}
              <div style={{
                borderRadius: 12, overflow: "hidden",
                background: "linear-gradient(150deg, #1a0a00, #2d1500)",
                border: "1px solid rgba(197,164,109,0.2)", padding: 16, textAlign: "center",
              }}>
                <div style={{ ...FRANK, fontSize: 18, color: GOLD, marginBottom: 4 }}>נועה ויוני 💛</div>
                <div style={{ ...HEEBO, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>15.9.2025 · 19:00</div>
                <div style={{ ...HEEBO, fontSize: 10, color: GOLD, marginTop: 6 }}>✦ אולם האירועים</div>
              </div>
            </FeatureCard>

            <FeatureCard delay={100} emoji="✅" title="אישורי הגעה"
              desc="מערכת חכמה לאיסוף ומעקב אחר אישורי הגעה בזמן אמת">
              {/* RSVP bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rsvpBars.map(bar => (
                  <div key={bar.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ ...HEEBO, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{bar.label}</span>
                      <span style={{ ...HEEBO, fontSize: 11, fontWeight: 700, color: bar.color }}>{bar.value}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
                      <div style={{
                        height: "100%", borderRadius: 3,
                        width: `${(bar.value / bar.max) * 100}%`,
                        background: bar.color, transition: "width 1s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard delay={200} emoji="📋" title="ניהול מלא"
              desc="משימות, תקציב, מתנות ולוח זמנים — הכל מסודר ונגיש">
              {/* Task checklist */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { t: "לסגור עם הצלם", done: true },
                  { t: "לבחור תפריט", done: false },
                  { t: "לשלוח הזמנות", done: true },
                  { t: "לאשר פרחים", done: false },
                ].map((task, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      background: task.done ? OLIVE : "rgba(255,255,255,0.08)",
                      border: `1px solid ${task.done ? OLIVE : "rgba(255,255,255,0.15)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {task.done && <span style={{ fontSize: 10 }}>✓</span>}
                    </div>
                    <span style={{
                      ...HEEBO, fontSize: 12,
                      color: task.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
                      textDecoration: task.done ? "line-through" : "none",
                    }}>{task.t}</span>
                  </div>
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* ── Live dashboard preview ─────────────────────────── */}
      <section id="dashboard" style={{ padding: "64px 20px", background: "#150900" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{
            textAlign: "center", ...HEEBO, fontSize: 11, letterSpacing: "0.22em",
            color: GOLD, textTransform: "uppercase", marginBottom: 8,
          }}>
            ✦ לוח בקרה חי
          </p>
          <h2 style={{
            textAlign: "center", ...FRANK, fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700, color: "#fff", marginBottom: 48,
          }}>
            כך נראה הדשבורד שלכם
          </h2>

          {/* Countdown widget */}
          <DashWidget title="ספירה לאחור לחתונה" delay={0}>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              {(mounted
                ? [{ v: time.d, l: "ימים" }, { v: time.h, l: "שעות" }, { v: time.m, l: "דקות" }, { v: time.s, l: "שניות" }]
                : [{ v: 84, l: "ימים" }, { v: 5, l: "שעות" }, { v: 22, l: "דקות" }, { v: 11, l: "שניות" }]
              ).map(({ v, l }) => (
                <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 14,
                    background: "rgba(197,164,109,0.08)", border: "1px solid rgba(197,164,109,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ ...FRANK, fontSize: 26, fontWeight: 700, color: GOLD }}>
                      {String(v).padStart(2, "0")}
                    </span>
                  </div>
                  <span style={{ ...HEEBO, fontSize: 10, color: "rgba(197,164,109,0.6)", letterSpacing: "0.1em" }}>{l}</span>
                </div>
              ))}
            </div>
          </DashWidget>

          {/* RSVP widget */}
          <DashWidget title="סטטוס הזמנות" delay={100}>
            <p style={{ ...HEEBO, fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>
              <strong style={{ color: "#fff" }}>{DEMO_STATS.attendees}</strong> מגיעים מתוך {DEMO_STATS.total} מוזמנים
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rsvpBars.map(bar => (
                <div key={bar.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ ...HEEBO, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{bar.label}</span>
                    <span style={{ ...HEEBO, fontSize: 13, fontWeight: 700, color: bar.color }}>{bar.value}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${(bar.value / bar.max) * 100}%`,
                      background: bar.color, transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </DashWidget>

          {/* Budget donut widget */}
          <DashWidget title="תקציב החתונה" delay={200}>
            <DonutChart />
          </DashWidget>
        </div>
      </section>

      {/* ── Sticky bottom bar (mobile) ─────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        padding: "12px 16px 20px",
        background: "rgba(15,7,0,0.85)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(197,164,109,0.15)",
      }}
        className="block sm:hidden"
      >
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="shimmer-btn"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            ...HEEBO, fontSize: 16, fontWeight: 700,
            background: "#25D366", color: "#fff",
            padding: "14px 20px", borderRadius: 30,
            textDecoration: "none", width: "100%",
            boxShadow: "0 8px 30px rgba(37,211,102,0.4)",
          }}
        >
          💬 דברו איתנו בוואטסאפ
        </a>
      </div>

      {/* bottom padding for sticky bar */}
      <div style={{ height: 80 }} className="block sm:hidden" />
    </div>
  );
}

/* ── Dashboard widget wrapper ─────────────────────────── */
function DashWidget({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} style={{
      marginBottom: 20, borderRadius: 20,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(197,164,109,0.15)",
      padding: "24px 20px",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.7s ${delay}ms, transform 0.7s ${delay}ms`,
    }}>
      <p style={{
        ...HEEBO, fontSize: 11, color: GOLD,
        letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16,
      }}>
        ✦ {title}
      </p>
      {children}
    </div>
  );
}
