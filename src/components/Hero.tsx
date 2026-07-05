"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, ArrowLeft, ChevronDown } from "lucide-react";
import { WA_URL } from "@/lib/constants";
import LeadForm from "./LeadForm";

/* ─── Design tokens ─── */
const G = {
  white:     "#FFFFFF",
  gold:      "#C5A46D",
  goldLight: "#D4BC8A",
  goldMuted: "rgba(197,164,109,0.65)",
  olive:     "#6B7B5A",
  oliveMuted:"rgba(107,123,90,0.70)",
  dark:      "#1C1008",
  darkMuted: "rgba(28,16,8,0.50)",
  border:    "rgba(197,164,109,0.18)",
  borderSoft:"rgba(197,164,109,0.10)",
  shadow:    "0 20px 60px rgba(197,164,109,0.10), 0 4px 20px rgba(0,0,0,0.05)",
};

/* ─── Platform capabilities ─── */
const BULLETS = [
  "ניהול אורחים ואישורי הגעה",
  "תזכורות אוטומטיות בוואטסאפ",
  "תכנון הושבה חכם לפי שולחנות",
  "מעקב תקציב ומתנות בזמן אמת",
  "רשימת משימות לכל שלב בתכנון",
  "ליווי אישי מהתחלה ועד הסוף",
];

/* ─── Activity feed ─── */
const FEED = [
  { text: "משפחת כהן אישרה הגעה",     sub: "3 אורחים",          color: "#6B7B5A", delta: 3 },
  { text: "נשלחה תזכורת בוואטסאפ",   sub: "ל-23 ממתינים",      color: "#C5A46D", delta: 0 },
  { text: "סידור שולחנות הושלם",       sub: "28 שולחנות",         color: "#6B7B5A", delta: 1 },
  { text: "משימה הושלמה",              sub: "תשלום לצלם",          color: "#6B7B5A", delta: 0 },
  { text: "ציון מוכנות עודכן",         sub: "87 / 100 ✦",         color: "#C5A46D", delta: 0 },
  { text: "משפחת ברק אישרה הגעה",     sub: "4 אורחים",           color: "#6B7B5A", delta: 4 },
  { text: "5 ברכות קוליות התקבלו",    sub: "מקיר הזיכרונות",     color: "#C5A46D", delta: 0 },
  { text: "דן כהן אישר הגעה",         sub: "1 אורח",             color: "#6B7B5A", delta: 1 },
];

function FloatingBadge({ children, className, delay }: {
  children: React.ReactNode; className: string; delay: string;
}) {
  return (
    <div
      className={`absolute z-20 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl ${className}`}
      style={{
        background: G.white,
        border:     `1px solid ${G.border}`,
        boxShadow:  "0 8px 28px rgba(197,164,109,0.14)",
        animation:  `float 4s ease-in-out ${delay} infinite`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Dashboard (real features only) ─── */
function Dashboard() {
  type GStatus = "confirmed" | "pending";
  type Guest   = { id: number; name: string; status: GStatus };

  const INIT_GUESTS: Guest[] = [
    { id: 1, name: "רחל ביטון",  status: "confirmed" },
    { id: 2, name: "דן כהן",     status: "pending"   },
    { id: 3, name: "מרים אברהם", status: "confirmed" },
    { id: 4, name: "יוסי גולד",  status: "pending"   },
    { id: 5, name: "שרה ביטון",  status: "confirmed" },
  ];

  const TOTAL = 287;

  const [feed,      setFeed]      = useState(FEED.slice(0, 4));
  const [feedKey,   setFeedKey]   = useState(0);
  const [confirmed, setConfirmed] = useState(214);
  const [pending,   setPending]   = useState(41);
  const [guests,    setGuests]    = useState<Guest[]>(INIT_GUESTS);
  const [flashId,   setFlashId]   = useState<number | null>(null);
  const [liveDot,   setLiveDot]   = useState(true);
  const [mounted,   setMounted]   = useState(false);
  const [secs,      setSecs]      = useState(0);
  const cycleRef      = useRef(0);
  const pendingIdxRef = useRef(0);
  const TARGET        = new Date("2026-10-16T19:00:00");

  useEffect(() => {
    setMounted(true);
    const tick = () => setSecs(Math.max(0, Math.floor((TARGET.getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setLiveDot((d) => !d), 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const PENDING_IDS = [2, 4];
    const id = setInterval(() => {
      const item = FEED[cycleRef.current % FEED.length];
      cycleRef.current++;
      setFeed((prev) => [item, ...prev.slice(0, 3)]);
      setFeedKey((k) => k + 1);
      if (item.delta > 0) {
        setConfirmed((c) => c + item.delta);
        setPending((p)   => Math.max(0, p - item.delta));
        const gid = PENDING_IDS[pendingIdxRef.current % PENDING_IDS.length];
        pendingIdxRef.current++;
        setGuests((prev) => {
          const allDone = PENDING_IDS.every((p) => prev.find((g) => g.id === p)?.status === "confirmed");
          if (allDone)
            return prev.map((g) => PENDING_IDS.includes(g.id) ? { ...g, status: "pending" as GStatus } : g);
          return prev.map((g) => g.id === gid ? { ...g, status: "confirmed" as GStatus } : g);
        });
        setFlashId(gid);
        setTimeout(() => setFlashId(null), 1500);
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const d   = Math.floor(secs / 86400);
  const h   = String(Math.floor((secs % 86400) / 3600)).padStart(2, "0");
  const m   = String(Math.floor((secs % 3600)  / 60)).padStart(2, "0");
  const s   = String(secs % 60).padStart(2, "0");
  const cd  = mounted ? `${d}:${h}:${m}:${s}` : "123:08:42:17";
  const pct = Math.round((confirmed / TOTAL) * 100);

  return (
    <div className="relative select-none w-full">

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)" }}
      >

        {/* Event header + countdown */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ background: "rgba(197,164,109,0.04)", borderColor: G.borderSoft }}>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                חתונת נועה ואורי
              </p>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(197,164,109,0.12)", color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
                הדגמה
              </span>
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>
              16 אוקטובר 2026 · אולם המלכות
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold tracking-tight" style={{ color: G.gold, fontFamily: "Frank Ruhl Libre, serif" }}>
              {cd}
            </p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
                style={{ background: liveDot ? G.olive : "transparent", border: `1px solid ${G.olive}` }}
              />
              <span className="text-[9px] font-medium" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>פעיל</span>
            </div>
          </div>
        </div>

        {/* KPI strip. real metrics: guests / confirmed / pending / RSVP rate */}
        <div className="grid grid-cols-4 border-b" style={{ borderColor: G.borderSoft, gap: "1px", background: G.borderSoft }}>
          {[
            { label: "מוזמנים",  val: String(TOTAL),     color: G.dark  },
            { label: "אישרו",    val: String(confirmed),  color: G.olive },
            { label: "ממתינים", val: String(pending),    color: G.gold  },
            { label: "אחוז מענה", val: `${pct}%`,        color: G.gold  },
          ].map((kpi) => (
            <div key={kpi.label} className="px-3 py-3" style={{ background: G.white }}>
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>
                {kpi.label}
              </p>
              <p className="text-base font-bold leading-none transition-all duration-700" style={{ color: kpi.color, fontFamily: "Frank Ruhl Libre, serif" }}>
                {kpi.val}
              </p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex" style={{ minHeight: 188 }}>

          {/* Guest list */}
          <div className="flex-1 p-3.5 border-l" style={{ borderColor: G.borderSoft }}>
            <p className="text-[9px] uppercase tracking-widest mb-2.5" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
              מוזמנים
            </p>
            {guests.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between py-1.5 px-2 rounded-xl mb-1 transition-all duration-500"
                style={{
                  background:  flashId === g.id ? "rgba(107,123,90,0.08)" : "transparent",
                  borderRight: flashId === g.id ? `2px solid ${G.olive}` : "2px solid transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{
                      background: g.status === "confirmed" ? "rgba(107,123,90,0.12)" : "rgba(197,164,109,0.12)",
                      color:      g.status === "confirmed" ? G.olive : G.goldMuted,
                      fontFamily: "Frank Ruhl Libre, serif",
                    }}
                  >
                    {g.name[0]}
                  </div>
                  <span className="text-[11px]" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
                    {g.name}
                  </span>
                </div>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: g.status === "confirmed" ? "rgba(107,123,90,0.10)" : "rgba(197,164,109,0.10)",
                    color:      g.status === "confirmed" ? G.olive : G.goldMuted,
                    fontFamily: "Heebo, sans-serif",
                  }}
                >
                  {g.status === "confirmed" ? "אישר" : "ממתין"}
                </span>
              </div>
            ))}
          </div>

          {/* Activity feed. real events only */}
          <div className="w-40 p-3.5 flex-shrink-0">
            <p className="text-[9px] uppercase tracking-widest mb-2.5" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
              פעילות
            </p>
            <div className="space-y-2.5 overflow-hidden">
              {feed.map((item, i) => (
                <div key={`${feedKey}-${i}`} className="flex items-start gap-2" style={{ opacity: 1 - i * 0.2 }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: item.color }} />
                  <div>
                    <p className="text-[10px] leading-tight" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
                      {item.text}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer. real stats only */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t" style={{ background: "rgba(197,164,109,0.03)", borderColor: G.borderSoft }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.olive }} />
            <span className="text-[10px]" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>דף אירוע פעיל</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.gold }} />
            <span className="text-[10px]" style={{ color: G.oliveMuted, fontFamily: "Heebo, sans-serif" }}>17 תזכורות נשלחו</span>
          </div>
          <div className="flex items-center gap-1.5 mr-auto">
            <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "rgba(197,164,109,0.15)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg,${G.gold},${G.goldLight})` }}
              />
            </div>
            <span className="text-[9px]" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>{pct}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Hero section ─── */
const HOW_STEPS = [
  { emoji: "💌", title: "יוצרים את האירוע", desc: "מזינים שם, תאריך, כתובת ובוחרים עיצוב מתוך 20+ תבניות עיצוב אלגנטיות" },
  { emoji: "📲", title: "שולחים הזמנות", desc: "המערכת שולחת הזמנות דיגיטליות אישיות עם קישור RSVP לכל אורח בנפרד" },
  { emoji: "📊", title: "עוקבים בזמן אמת", desc: "רואים מי אישר, מי פתח, ומי עוד לא ענה — הכל בדשבורד חי ועדכני" },
  { emoji: "🎊", title: "נהנים מהחתונה", desc: "בלי אקסל, בלי בלגן. הכל מסודר אוטומטית — ומגיעים ליום עצמו רגועים" },
];

function HowItWorksModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(28,16,8,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-8"
        style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.25)", boxShadow: "0 24px 80px rgba(0,0,0,0.16)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555", fontSize: 18 }}
        >×</button>

        <div className="text-center mb-7">
          <p style={{ fontSize: 10, letterSpacing: "0.22em", color: "#C5A46D", fontFamily: "Heebo, sans-serif", marginBottom: 8 }}>✦ תהליך פשוט ✦</p>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif" }}>
            איך זה עובד?
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {HOW_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#C5A46D,#B8935A)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18 }}>
                {i + 1}
              </div>
              <div style={{ paddingTop: 2 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif", marginBottom: 3 }}>
                  {step.emoji} {step.title}
                </p>
                <p style={{ fontSize: 13, color: "rgba(28,16,8,0.55)", fontFamily: "Heebo, sans-serif", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://wa.me/972533318177"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "0.9rem", borderRadius: 16, background: "linear-gradient(135deg,#C5A46D,#B8935A)", color: "white", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
        >
          התחילו עכשיו — בחינם ←
        </a>
      </div>
    </div>
  );
}

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      if (parallaxRef.current)
        parallaxRef.current.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#F6F1E8" }} />


      <div className="relative z-10 container-max mx-auto px-4 md:px-8 pt-28 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center min-h-[calc(100vh-7rem)]">

          {/* Text column */}
          <div
            className="flex flex-col items-center lg:items-end text-center lg:text-right order-1"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? "none" : "translateY(24px)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.20em] mb-4"
              style={{ color: "#6B7B5A", fontFamily: "Heebo, sans-serif" }}
            >
              ✦ לא עוד כלי לאישורי הגעה ✦
            </p>

            <h1
              className="text-4xl md:text-5xl xl:text-[3.1rem] font-bold text-dark leading-[1.22] mb-5"
              style={{ fontFamily: "Frank Ruhl Libre, serif", letterSpacing: "-0.02em" }}
            >
              כל החתונה שלכם —
              <br />
              <span style={{ color: "#C5A46D" }}>במערכת אחת</span>
            </h1>

            <p
              className="text-base md:text-lg leading-[1.85] max-w-lg mb-7"
              style={{ color: "rgba(51,51,51,0.60)", fontFamily: "Heebo, sans-serif", fontWeight: 300 }}
            >
              מהרגע שהתארסתם ועד הרבה אחרי האירוע.
              <br className="hidden md:block" />
              לא עוד אקסלים ווואטסאפ — מערכת שמלווה אתכם לאורך כל הדרך.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-3">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full sm:w-auto justify-center"
              >
                <MessageCircle size={17} strokeWidth={2} />
                קבלו הצעת מחיר תוך 24 שעות
              </a>
              <a href="/dashboard-demo" target="_blank" rel="noopener noreferrer" className="btn-outline w-full sm:w-auto justify-center">
                <span>ראו דמו חי</span>
                <ArrowLeft size={17} strokeWidth={2} />
              </a>
            </div>
            <button
              onClick={() => setShowHowItWorks(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#C5A46D", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 4, marginBottom: 12, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: "rgba(197,164,109,0.4)" }}
            >
              ← ראו איך זה עובד
            </button>
            {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}

            <a
              href="tel:0533318177"
              className="flex items-center gap-2 mb-4"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              <span className="text-sm font-semibold" style={{ color: "#333" }}>053-3318177</span>
              <span className="text-xs" style={{ color: "rgba(51,51,51,0.40)" }}>· דביר, זמין עד 22:00</span>
            </a>

            <p className="text-xs" style={{ color: "rgba(51,51,51,0.38)", fontFamily: "Heebo, sans-serif" }}>
              ללא התחייבות · שירות אישי · מענה מהיר
            </p>
          </div>

          {/* Dashboard column */}
          <div
            className="flex justify-center items-center order-2"
            style={{
              opacity:    mounted ? 1 : 0,
              transform:  mounted ? "none" : "translateY(32px)",
              transition: "opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s",
            }}
          >
            <Dashboard />
          </div>
        </div>
      </div>

      <button
        onClick={() => document.querySelector("#featured")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="גלול למטה"
        className="absolute bottom-7 left-1/2 -translate-x-1/2"
        style={{ color: "rgba(197,164,109,0.35)" }}
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
