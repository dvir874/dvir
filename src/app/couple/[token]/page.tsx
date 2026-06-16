"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, Users, Loader2, AlertCircle, TrendingUp, Heart } from "lucide-react";
import type { Forecast, HealthScore } from "@/lib/types";

/* ── Design tokens (same visual language) ───────────── */
const C = {
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  goldL:  "#D4BC8A",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

interface Stats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendees: number;
  responseRate: number;
}
interface EventInfo {
  id: string;
  name: string;
  date: string;
  address?: string | null;
}
interface DashboardData {
  event: EventInfo;
  stats: Stats;
  forecast: Forecast | null;
  health: HealthScore | null;
}

export default function CoupleDashboard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(true); return; }
        setData(d);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Shell><Loading /></Shell>;
  if (error || !data) return <Shell><NotFound /></Shell>;

  const { event, stats, forecast, health } = data;
  const formattedDate = new Date(event.date).toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000);

  return (
    <Shell>
      {/* ── Event header ─────────────────────────── */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>
          דף האירוע שלכם
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
        >
          {event.name}
        </h1>
        <p className="text-base" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          {formattedDate}
        </p>
        {event.address && (
          <p className="text-sm mt-1" style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>
            📍 {event.address}
          </p>
        )}
        {daysLeft > 0 && (
          <div
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(197,164,109,0.12)", color: "#A07840", fontFamily: "Heebo, sans-serif" }}
          >
            <Clock size={12} /> עוד {daysLeft} ימים
          </div>
        )}
      </div>

      <GoldDivider />

      {/* ── KPI grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {[
          { label: "הוזמנו",        value: stats.total,        icon: Users,       color: C.gold  },
          { label: "אישרו הגעה",    value: stats.confirmed,    icon: CheckCircle, color: C.olive },
          { label: "ממתינים",       value: stats.pending,      icon: Clock,       color: "#A07840" },
          { label: "לא מגיעים",     value: stats.declined,     icon: XCircle,     color: C.muted },
          { label: "מגיעים בפועל",  value: stats.attendees,    icon: Heart,       color: C.olive },
          { label: "אחוז מענה",     value: `${stats.responseRate}%`, icon: TrendingUp, color: C.gold },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 text-center"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
          >
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <p className="text-2xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
              {value}
            </p>
            <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Progress bar ─────────────────────────── */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            <span>אחוז מענה: {stats.responseRate}%</span>
            <span>{stats.confirmed + stats.declined} מתוך {stats.total}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(197,164,109,0.15)" }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${stats.responseRate}%`,
                background: `linear-gradient(90deg,${C.olive},${C.gold})`,
              }}
            />
          </div>
          <div className="flex mt-1.5 gap-3 text-[10px]" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: C.olive }} />
              אישרו {stats.confirmed}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "rgba(197,164,109,0.45)" }} />
              ממתינים {stats.pending}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "rgba(51,51,51,0.20)" }} />
              לא מגיעים {stats.declined}
            </span>
          </div>
        </div>
      )}

      <GoldDivider />

      {/* ── Forecast ─────────────────────────────── */}
      {forecast && forecast.pendingGuests > 0 && (
        <div className="mb-6">
          <SectionTitle>תחזית נוכחות</SectionTitle>
          <div
            className="rounded-2xl p-5"
            style={{ background: C.ivory, border: `1px solid ${C.border}` }}
          >
            <p className="text-sm text-center mb-4" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
              בהתבסס על {forecast.confirmRate}% שיעור אישור עד כה
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "שמרני",  value: forecast.conservative, color: C.muted },
                { label: "צפוי",   value: forecast.expected,     color: C.olive, large: true },
                { label: "אופטימי", value: forecast.optimistic,   color: C.gold },
              ].map(({ label, value, color, large }) => (
                <div key={label}>
                  <p
                    className={`font-bold ${large ? "text-4xl" : "text-2xl"} mb-1`}
                    style={{ color, fontFamily: "Frank Ruhl Libre, serif" }}
                  >
                    {value}
                  </p>
                  <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-4" style={{ color: "rgba(51,51,51,0.30)", fontFamily: "Heebo, sans-serif" }}>
              {forecast.confirmedAttendees} מגיעים בוודאות · {forecast.pendingGuests} ממתינים עדיין
            </p>
          </div>
        </div>
      )}

      {/* ── Health Score ──────────────────────────── */}
      {health && (
        <div className="mb-6">
          <SectionTitle>ציון בריאות האירוע</SectionTitle>
          <div
            className="rounded-2xl p-5"
            style={{ background: C.ivory, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-5">
              {/* Circle */}
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center flex-shrink-0"
                style={{
                  background: health.tier === "green"
                    ? "rgba(107,123,90,0.10)"
                    : health.tier === "yellow"
                      ? "rgba(197,164,109,0.12)"
                      : "rgba(200,50,50,0.08)",
                  border: `2px solid ${health.tier === "green" ? C.olive : health.tier === "yellow" ? C.gold : "rgba(200,50,50,0.3)"}`,
                }}
              >
                <span
                  className="text-2xl font-bold leading-none"
                  style={{
                    color: health.tier === "green" ? C.olive : health.tier === "yellow" ? "#A07840" : "rgb(180,50,50)",
                    fontFamily: "Frank Ruhl Libre, serif",
                  }}
                >
                  {health.score}
                </span>
                <span className="text-[10px]" style={{ color: C.muted }}>מתוך 100</span>
              </div>
              <div className="flex-1">
                <p
                  className="font-semibold mb-1"
                  style={{
                    color: health.tier === "green" ? C.olive : health.tier === "yellow" ? "#A07840" : "rgb(180,50,50)",
                    fontFamily: "Heebo, sans-serif",
                  }}
                >
                  {health.tier === "green" ? "מצב מצוין 🟢" : health.tier === "yellow" ? "מצב בינוני 🟡" : "דורש תשומת לב 🔴"}
                </p>
                <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{health.label}</p>
              </div>
            </div>

            {/* Factor bars */}
            <div className="mt-4 flex flex-col gap-2">
              {health.breakdown.map(({ factor, points, max }) => (
                <div key={factor} className="flex items-center gap-2">
                  <span className="text-xs w-40 shrink-0" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{factor}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(197,164,109,0.15)" }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${(points / max) * 100}%`,
                        background: points / max >= 0.7 ? C.olive : points / max >= 0.4 ? C.gold : "rgba(200,100,100,0.6)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Reassurance footer ───────────────────── */}
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(197,164,109,0.06)", border: `1px solid ${C.border}` }}
      >
        <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          💛 אנחנו מטפלים בכל הפרטים עבורכם.<br />
          <span className="text-xs">עדכון אוטומטי בכל שינוי · ללא צורך בפעולה מצדכם</span>
        </p>
      </div>
    </Shell>
  );
}

/* ── Shared components ──────────────────────────────── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: `linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)` }}>
      <div className="max-w-2xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(197,164,109,0.6)", fontFamily: "Heebo, sans-serif" }}>
            רגע לפני
          </p>
        </div>
        {children}
        <p className="text-center text-[10px] mt-8" style={{ color: "rgba(51,51,51,0.25)", fontFamily: "Heebo, sans-serif" }}>
          © רגע לפני · ניהול אישורי הגעה
        </p>
      </div>
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="w-full h-px my-6" style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.35),transparent)" }} />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "rgba(197,164,109,0.8)", fontFamily: "Heebo, sans-serif" }}>
      {children}
    </p>
  );
}

function Loading() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <Loader2 size={32} className="animate-spin" style={{ color: "#C5A46D" }} />
      <p style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif" }}>טוען…</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#C5A46D" }} />
      <p className="font-semibold mb-1" style={{ color: "#333", fontFamily: "Frank Ruhl Libre, serif" }}>
        הקישור אינו תקין
      </p>
      <p className="text-sm" style={{ color: "rgba(51,51,51,0.55)", fontFamily: "Heebo, sans-serif" }}>
        פנו אלינו לקבלת הקישור הנכון לאירוע שלכם.
      </p>
    </div>
  );
}
