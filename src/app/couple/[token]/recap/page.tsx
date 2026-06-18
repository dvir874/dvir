"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Heart, Users, Wallet, Camera, Mic, Lock, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";

const C = {
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#333333",
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  border: "rgba(197,164,109,0.22)",
  muted:  "rgba(51,51,51,0.50)",
};

interface RecapData {
  total_invited:        number;
  total_arrived:        number;
  arrival_rate:         number;
  avg_response_days:    number | null;
  budget_planned:       number;
  budget_actual:        number;
  total_memories:       number;
  total_audio:          number;
  total_capsules:       number;
  task_completion_rate: number;
  top_table_photos:     number;
}

function fmt(n: number) { return n.toLocaleString("he-IL"); }
function fmtMoney(n: number) { return `₪${fmt(Math.round(n))}`; }

function StatCard({ icon, label, value, sub, color = C.gold }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(197,164,109,0.08)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</p>
          <p className="text-2xl font-bold leading-none" style={{ color, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function BudgetBar({ planned, actual }: { planned: number; actual: number }) {
  if (planned === 0) return null;
  const pct     = Math.round((actual / planned) * 100);
  const over    = actual > planned;
  const diff    = Math.abs(actual - planned);
  const barPct  = Math.min((actual / (planned * 1.3)) * 100, 100);

  return (
    <div className="p-5 rounded-2xl col-span-2" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={18} style={{ color: C.gold }} />
        <p className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>תקציב סופי</p>
      </div>
      <div className="flex justify-between text-xs mb-2" style={{ fontFamily: "Heebo, sans-serif", color: C.muted }}>
        <span>תוכנן: {fmtMoney(planned)}</span>
        <span>בפועל: {fmtMoney(actual)}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "rgba(197,164,109,0.15)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${barPct}%`,
            background: over
              ? "linear-gradient(90deg,#C5A46D,#c0392b)"
              : "linear-gradient(90deg,#C5A46D,#6B7B5A)",
          }}
        />
      </div>
      <div className="flex items-center gap-1.5">
        {over ? <TrendingUp size={14} style={{ color: "#c0392b" }} /> : actual < planned ? <TrendingDown size={14} style={{ color: C.olive }} /> : <Minus size={14} style={{ color: C.muted }} />}
        <p className="text-xs font-semibold" style={{ color: over ? "#c0392b" : C.olive, fontFamily: "Heebo, sans-serif" }}>
          {over ? `חריגה של ${fmtMoney(diff)} (${pct - 100}%)` : actual < planned ? `חיסכון של ${fmtMoney(diff)} (${100 - pct}%)` : "בדיוק בתקציב!"}
        </p>
      </div>
    </div>
  );
}

function ArrivalRing({ rate }: { rate: number }) {
  const r    = 48, circ = 2 * Math.PI * r;
  const pct  = Math.min(rate, 100);
  const color = pct >= 85 ? C.olive : pct >= 70 ? C.gold : "#c0392b";

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(197,164,109,0.15)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray 1.2s ease" }} />
        <text x="60" y="56" textAnchor="middle" style={{ fontSize: 26, fontWeight: 700, fill: color, fontFamily: "Frank Ruhl Libre, serif" }}>
          {Math.round(pct)}%
        </text>
        <text x="60" y="72" textAnchor="middle" style={{ fontSize: 10, fill: C.muted, fontFamily: "Heebo, sans-serif" }}>
          הגיעו
        </text>
      </svg>
      <p className="text-xs mt-1 text-center" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>אחוז הגעה</p>
    </div>
  );
}

export default function RecapPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [recap,   setRecap]   = useState<RecapData | null>(null);
  const [event,   setEvent]   = useState<{ name: string; date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [daysUntil, setDaysUntil] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/couple/${token}/recap`)
      .then(async r => {
        const d = await r.json();
        if (r.status === 425) { setDaysUntil(d.daysUntil); setLoading(false); return; }
        if (!r.ok) { setError(d.error || "שגיאה"); setLoading(false); return; }
        setEvent(d.event);
        setRecap(d.recap);
        setLoading(false);
      })
      .catch(() => { setError("שגיאה בטעינה"); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={32} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (daysUntil !== null) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
          הסיכום יהיה מוכן אחרי החתונה
        </h1>
        <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          עוד {daysUntil} ימים עד היום הגדול — אחריו נכין עבורכם סיכום מלא של כל הרגעים, המספרים והזיכרונות.
        </p>
      </div>
    </div>
  );

  if (error || !recap || !event) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{error ?? "לא נמצא"}</p>
    </div>
  );

  const weddingYear = new Date(event.date).getFullYear();
  const capsuleYears = [1, 5, 10].map(y => weddingYear + y);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, paddingBottom: "4rem" }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 pt-16 pb-12 text-center"
        style={{ background: "linear-gradient(160deg,#1a120a 0%,#2d1f10 60%,#1a120a 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px,white 1px,transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.5),transparent)" }} />

        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(197,164,109,0.70)", fontFamily: "Heebo, sans-serif" }}>סיכום יום החתונה</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
          {event.name}
        </h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Heebo, sans-serif" }}>
          {new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        {/* Ring + key stats */}
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <ArrivalRing rate={recap.arrival_rate} />
          <div className="text-right">
            <div className="mb-3">
              <p className="text-3xl font-bold text-white" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>{fmt(recap.total_arrived)}</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Heebo, sans-serif" }}>מתוך {fmt(recap.total_invited)} הגיעו</p>
            </div>
            {recap.avg_response_days && (
              <div>
                <p className="text-xl font-bold" style={{ color: C.gold, fontFamily: "Frank Ruhl Libre, serif" }}>{recap.avg_response_days.toFixed(1)} ימים</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Heebo, sans-serif" }}>ממוצע תגובה להזמנה</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="px-4 max-w-lg mx-auto mt-6 space-y-4">

        <h2 className="text-lg font-bold" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>המספרים שלכם</h2>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Users size={18} />}         label="הגיעו"        value={fmt(recap.total_arrived)}   sub={`${Math.round(recap.arrival_rate)}% מהמוזמנים`} />
          <StatCard icon={<CheckCircle2 size={18} />}  label="השלמת משימות" value={`${Math.round(recap.task_completion_rate)}%`} sub="מרשימת המשימות" color={C.olive} />
          <StatCard icon={<Camera size={18} />}        label="זיכרונות"     value={fmt(recap.total_memories)}  sub="תמונות, וידאו וברכות" />
          <StatCard icon={<Mic size={18} />}           label="ברכות קוליות" value={fmt(recap.total_audio)}     sub="הוקלטו על ידי אורחים" color={C.olive} />
          <BudgetBar planned={recap.budget_planned} actual={recap.budget_actual} />
        </div>

        {/* Time Capsule teaser */}
        {recap.total_capsules > 0 && (
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg,#1a120a,#2d1f10)",
              border: "1px solid rgba(197,164,109,0.25)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Lock size={18} style={{ color: C.gold }} />
              <p className="text-sm font-semibold text-white" style={{ fontFamily: "Heebo, sans-serif" }}>כמוסות הזמן שלכם</p>
            </div>
            <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.50)", fontFamily: "Heebo, sans-serif" }}>
              {recap.total_capsules} הודעות ממתינות לכם — נפתחות ביום השנה
            </p>
            <div className="flex gap-2">
              {capsuleYears.map(y => (
                <div key={y} className="flex-1 py-2 rounded-xl text-center" style={{ background: "rgba(197,164,109,0.10)", border: "1px solid rgba(197,164,109,0.20)" }}>
                  <p className="text-xs font-bold" style={{ color: C.gold, fontFamily: "Frank Ruhl Libre, serif" }}>{y}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Heebo, sans-serif" }}>נפתח</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closing message */}
        <div
          className="p-6 rounded-2xl text-center mt-4"
          style={{ background: "rgba(197,164,109,0.08)", border: `1px solid ${C.border}` }}
        >
          <Heart size={24} style={{ color: C.gold, margin: "0 auto 12px" }} />
          <p className="text-base font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מזל טוב ✦
          </p>
          <p className="text-sm leading-relaxed" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            תודה שאפשרתם לנו להיות חלק מהיום הזה.
            <br />
            ביום השנה הראשון — נשלח לכם הפתעה.
          </p>
        </div>
      </div>
    </div>
  );
}
