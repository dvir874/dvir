"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, CalendarDays, CreditCard, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react";

const C = {
  cream:  "#F2EDE3",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.45)",
  border: "rgba(197,164,109,0.18)",
};
const HEEBO  = { fontFamily: "Heebo, sans-serif" };
const FRANK  = { fontFamily: "Frank Ruhl Libre, serif" };

interface EventRow {
  id: string;
  name: string;
  date: string;
  client_name?: string | null;
  client_phone?: string | null;
  event_type?: string | null;
  payment_status?: string | null;
  payment_amount?: number | null;
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendees: number;
  responseRate: number;
  daysUntilEvent: number;
  healthTier: "green" | "yellow" | "red";
  needsAttention: boolean;
}

function fmt(n: number) { return n.toLocaleString("he-IL"); }

/* ── SVG bar chart ── */
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 320, H = 120, barW = Math.min(36, (W / data.length) - 8), gap = W / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 28}`} width="100%" style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const bh = Math.max(4, (d.value / max) * H);
        const x  = i * gap + gap / 2 - barW / 2;
        const y  = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={6} fill={d.color} opacity={0.85} />
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="Heebo, sans-serif">
              {d.label.length > 6 ? d.label.slice(0, 6) + "…" : d.label}
            </text>
            {d.value > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill={d.color} fontFamily="Heebo, sans-serif">
                {d.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Donut ── */
function Donut({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2, c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={`${color}18`} strokeWidth={9} />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={c + 4} textAnchor="middle" fontSize={13} fontWeight="bold" fill={C.dark} fontFamily="Frank Ruhl Libre, serif">
        {pct}%
      </text>
    </svg>
  );
}

/* ── Health dot ── */
function Dot({ tier }: { tier: "green" | "yellow" | "red" }) {
  const col = tier === "green" ? "#4CAF50" : tier === "yellow" ? "#FFC107" : "#EF4444";
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />;
}

/* ── RSVP mini bar ── */
function RsvpBar({ ev }: { ev: EventRow }) {
  const total = ev.total || 1;
  return (
    <div style={{ display: "flex", gap: 2, height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(197,164,109,0.1)" }}>
      <div style={{ width: `${(ev.confirmed / total) * 100}%`, background: C.olive }} />
      <div style={{ width: `${(ev.declined / total) * 100}%`, background: "#EF4444" }} />
      <div style={{ width: `${(ev.pending / total) * 100}%`, background: "rgba(197,164,109,0.3)" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [events,  setEvents]  = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manager/overview")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setEvents(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 size={32} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
    </div>
  );

  /* ── Derived metrics ── */
  const active       = events.filter(e => e.daysUntilEvent > 0);
  const past         = events.filter(e => e.daysUntilEvent <= 0);
  const totalGuests  = events.reduce((s, e) => s + e.total, 0);
  const totalAttend  = events.reduce((s, e) => s + e.attendees, 0);
  const avgResponse  = events.length > 0 ? Math.round(events.reduce((s, e) => s + e.responseRate, 0) / events.length) : 0;
  const paidEvents   = events.filter(e => e.payment_status === "paid");
  const totalRevenue = paidEvents.reduce((s, e) => s + (e.payment_amount ?? 0), 0);
  const pendingRev   = events.filter(e => e.payment_status !== "paid").length;
  const attention    = events.filter(e => e.needsAttention).length;

  /* ── Monthly revenue (last 6 months) ── */
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString("he-IL", { month: "short" }), year: d.getFullYear(), month: d.getMonth(), revenue: 0, count: 0 };
  });
  events.forEach(e => {
    if (e.payment_status !== "paid" || !e.date) return;
    const d = new Date(e.date);
    const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
    if (m) { m.revenue += e.payment_amount ?? 0; m.count++; }
  });

  /* ── RSVP bar chart data (top 8 active events by guest count) ── */
  const rsvpChartData = active
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(e => ({ label: e.name.split(" ")[0], value: e.responseRate, color: e.healthTier === "green" ? C.olive : e.healthTier === "yellow" ? C.gold : "#EF4444" }));

  /* ── Upcoming 90 days timeline ── */
  const upcoming = active
    .filter(e => e.daysUntilEvent <= 90)
    .sort((a, b) => a.daysUntilEvent - b.daysUntilEvent);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.cream, ...HEEBO }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #2C3E2D, #1A2A1B)`, padding: "1.5rem 1.5rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: "0.25em", color: "rgba(197,164,109,0.7)", marginBottom: 4 }}>RAGA LIFNEI</p>
          <h1 style={{ ...FRANK, fontSize: "1.5rem", fontWeight: 700, color: "white", margin: 0 }}>לוח בקרה</h1>
        </div>
        <a href="/admin" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none", padding: "0.5rem 1rem", borderRadius: 12, background: "rgba(255,255,255,0.08)" }}>
          <ArrowRight size={14} /> חזרה לאדמין
        </a>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.5rem 1rem 4rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* ── KPI Strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
          {[
            { icon: CalendarDays, label: "אירועים פעילים", value: active.length, sub: `${past.length} עברו`, color: C.olive },
            { icon: Users,        label: "סה״כ מוזמנים",   value: fmt(totalGuests), sub: `${fmt(totalAttend)} מגיעים`, color: C.gold },
            { icon: TrendingUp,   label: "ממוצע מענה",     value: `${avgResponse}%`, sub: `${attention} דורשים טיפול`, color: attention > 0 ? "#EF4444" : C.olive },
            { icon: CreditCard,   label: "הכנסות שולמו",  value: `₪${fmt(totalRevenue)}`, sub: `${pendingRev} ממתינים לתשלום`, color: C.gold },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{label}</p>
                <p style={{ ...FRANK, fontSize: "1.35rem", fontWeight: 700, color: C.dark, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue by month ── */}
        {totalRevenue > 0 && (
          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
            <p style={{ ...FRANK, fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: "1rem" }}>💰 הכנסות לפי חודש</p>
            <BarChart data={months.map(m => ({ label: m.label, value: m.revenue, color: C.gold }))} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
              <span style={{ fontSize: 11, color: C.muted }}>6 חודשים אחרונים</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.olive }}>סה״כ: ₪{fmt(totalRevenue)}</span>
            </div>
          </div>
        )}

        {/* ── RSVP rates chart ── */}
        {rsvpChartData.length > 0 && (
          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
            <p style={{ ...FRANK, fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: "0.75rem" }}>📊 אחוז מענה לפי אירוע</p>
            <BarChart data={rsvpChartData} />
            <div style={{ display: "flex", gap: 16, marginTop: "0.5rem" }}>
              {[["ירוק = מעל 75%", C.olive], ["צהוב = 40-75%", C.gold], ["אדום = מתחת 40%", "#EF4444"]].map(([l, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                  <span style={{ fontSize: 10, color: C.muted }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Upcoming 90 days timeline ── */}
        {upcoming.length > 0 && (
          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
            <p style={{ ...FRANK, fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: "1rem" }}>🗓️ 90 הימים הקרובים</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {upcoming.map(e => (
                <a key={e.id} href={`/admin?event=${e.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 1rem", borderRadius: 12,
                  background: e.daysUntilEvent <= 7 ? "rgba(239,68,68,0.05)" : "rgba(197,164,109,0.05)",
                  border: `1px solid ${e.daysUntilEvent <= 7 ? "rgba(239,68,68,0.18)" : C.border}` }}>
                  {/* Days pill */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: e.daysUntilEvent <= 7 ? "rgba(239,68,68,0.1)" : "rgba(197,164,109,0.1)" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, ...FRANK, color: e.daysUntilEvent <= 7 ? "#EF4444" : C.gold, lineHeight: 1 }}>{e.daysUntilEvent}</span>
                    <span style={{ fontSize: 9, color: C.muted }}>ימים</span>
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <Dot tier={e.healthTier} />
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.dark, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</p>
                    </div>
                    <RsvpBar ev={e} />
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {new Date(e.date).toLocaleDateString("he-IL", { day: "numeric", month: "long" })} · {e.confirmed}/{e.total} ענו
                    </p>
                  </div>
                  {/* RSVP donut */}
                  <Donut pct={e.responseRate} color={e.healthTier === "green" ? C.olive : e.healthTier === "yellow" ? C.gold : "#EF4444"} size={56} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── All events table ── */}
        <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <p style={{ ...FRANK, fontSize: "1rem", fontWeight: 700, color: C.dark, margin: 0 }}>כל האירועים ({events.length})</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: C.muted }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckCircle size={12} style={{ color: C.olive }} /> מגיעים</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} style={{ color: C.gold }} /> ממתינים</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><XCircle size={12} style={{ color: "#EF4444" }} /> לא מגיעים</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {events.sort((a, b) => a.daysUntilEvent - b.daysUntilEvent).map(e => (
              <a key={e.id} href={`/admin?event=${e.id}`}
                style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "0.75rem", borderRadius: 10, background: "rgba(197,164,109,0.04)", border: `1px solid ${C.border}`, transition: "background 0.15s" }}
                onMouseEnter={ev => (ev.currentTarget.style.background = "rgba(197,164,109,0.09)")}
                onMouseLeave={ev => (ev.currentTarget.style.background = "rgba(197,164,109,0.04)")}>
                <Dot tier={e.healthTier} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.dark, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: "1px 0 4px" }}>
                    {new Date(e.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                    {e.client_name ? ` · ${e.client_name}` : ""}
                  </p>
                  <RsvpBar ev={e} />
                </div>
                <div style={{ textAlign: "left", flexShrink: 0, minWidth: 60 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.dark, margin: 0, textAlign: "center" }}>{e.responseRate}%</p>
                  <p style={{ fontSize: 10, color: C.muted, margin: "1px 0 0", textAlign: "center" }}>{e.confirmed}/{e.total}</p>
                  {e.payment_status === "paid"
                    ? <p style={{ fontSize: 10, color: C.olive, textAlign: "center", marginTop: 2 }}>₪{fmt(e.payment_amount ?? 0)}</p>
                    : <p style={{ fontSize: 10, color: "rgba(239,68,68,0.6)", textAlign: "center", marginTop: 2 }}>טרם שולם</p>}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Revenue summary per event ── */}
        {events.some(e => e.payment_status === "paid" || e.payment_amount) && (
          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
            <p style={{ ...FRANK, fontSize: "1rem", fontWeight: 700, color: C.dark, marginBottom: "1rem" }}>💳 סיכום הכנסות</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {events.filter(e => e.payment_amount || e.payment_status).map(e => (
                <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.875rem", borderRadius: 10,
                  background: e.payment_status === "paid" ? "rgba(107,123,90,0.06)" : "rgba(239,68,68,0.04)",
                  border: `1px solid ${e.payment_status === "paid" ? "rgba(107,123,90,0.15)" : "rgba(239,68,68,0.12)"}` }}>
                  <p style={{ fontSize: 13, color: C.dark, margin: 0 }}>{e.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {e.payment_amount && <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>₪{fmt(e.payment_amount)}</span>}
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10,
                      background: e.payment_status === "paid" ? "rgba(107,123,90,0.12)" : "rgba(239,68,68,0.10)",
                      color: e.payment_status === "paid" ? C.olive : "#EF4444" }}>
                      {e.payment_status === "paid" ? "שולם ✓" : "טרם שולם"}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0.875rem", borderTop: `1px solid ${C.border}`, marginTop: "0.25rem" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>סה״כ שולם</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.olive }}>₪{fmt(totalRevenue)}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
