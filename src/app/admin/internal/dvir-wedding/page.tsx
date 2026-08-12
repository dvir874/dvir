"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Wedding Operations Center — Dvir & Mirav (INTERNAL SANDBOX)
   Isolated module. Reuses existing production tools via deep-links;
   adds only an operations dashboard on top of the live event data.
   To remove: delete this folder + /api/admin/internal/ops.
   ──────────────────────────────────────────────────────────── */

const EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948"; // "מירב ודביר"

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.5)", border: "#E8E0D4",
  green: "#4A7C59", red: "#B85C38", bride: "#B5838D", groom: "#6B7B5A",
};

interface Ops {
  event: { id: string; name: string; date: string | null; address: string | null; couple_token: string | null; client_phone: string | null };
  stats: { total: number; confirmed: number; declined: number; pending: number; attendees: number; confirmRate: number; brideSide: number; groomSide: number; unassignedSide: number; noPhone: number; invitesSent?: number };
  recentConfirmed: { name: string; count: number; at: string }[];
  recentDeclined: { name: string; at: string }[];
  followUp: { id: string; name: string; phone: string | null; opened: boolean }[];
  wrongNumber?: { id: string; name: string; phone: string | null; report: string }[];
  shuttle?: { seats: number; riders: { name: string; phone: string | null; count: number }[] };
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `לפני ${Math.max(1, mins)} ד׳`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `לפני ${h} ש׳`;
  return `לפני ${Math.floor(h / 24)} י׳`;
}

function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div style={{ background: C.cream, borderRadius: 14, padding: "16px 8px", textAlign: "center", border: `1px solid ${C.border}` }}>
      <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, color: color ?? C.dark, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.goldT, margin: "0 0 12px", letterSpacing: "0.04em" }}>{title}</p>
      {children}
    </div>
  );
}

export default function DvirWeddingOpsPage() {
  const [ops, setOps] = useState<Ops | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/internal/ops?event_id=${EVENT_ID}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setOps(d); setErr(false); setLoading(false); })
      .catch(() => { setErr(true); setLoading(false); });
  }, []);

  useEffect(load, [load]);

  const daysLeft = ops?.event.date
    ? Math.max(0, Math.ceil((new Date(ops.event.date).getTime() - Date.now()) / 86_400_000))
    : null;

  const tool = (label: string, emoji: string, href: string, primary = false) => (
    <a href={href} target={href.startsWith("/couple") || href.startsWith("/gallery") ? "_blank" : undefined} rel="noopener noreferrer"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "16px 8px", borderRadius: 14, textDecoration: "none", textAlign: "center",
        background: primary ? C.gold : "#fff", color: primary ? "#fff" : C.dark,
        border: `1.5px solid ${primary ? C.gold : C.border}`, minHeight: 84,
      }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </a>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 60 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(150deg, #1C1008, #3D2B1F)", padding: "20px", color: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="/admin" style={{ color: "rgba(255,255,255,0.7)", display: "flex" }}><ArrowRight size={20} /></a>
            <div>
              <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 900, margin: 0 }}>Wedding Operations Center</h1>
              <p style={{ fontSize: 12, color: "#E5C188", margin: "2px 0 0" }}>דביר & מירב · מודול פנימי 💍</p>
            </div>
          </div>
          <button onClick={load} aria-label="רענן" style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 8 }}>
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {loading && !ops && <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען...</p>}
        {err && <p style={{ textAlign: "center", color: C.red, padding: 40 }}>לא נמצא אירוע — ודאו שהאירוע &quot;מירב ודביר&quot; קיים.</p>}

        {ops && (
          <>
            {/* Countdown */}
            {daysLeft !== null && (
              <div style={{ background: C.cream, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px", textAlign: "center" }}>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 48, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>{daysLeft}</p>
                <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0" }}>
                  ימים לחתונה · {ops.event.date && new Date(ops.event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}

            {/* Core stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <Stat value={ops.stats.total} label="סה״כ רשומות" />
              <Stat value={ops.stats.confirmed} label="אישרו ✓" color={C.green} />
              <Stat value={ops.stats.pending} label="ממתינים" color={C.goldT} />
              <Stat value={ops.stats.declined} label="לא מגיעים" color={C.muted} />
              <Stat value={ops.stats.attendees} label="נפשות מגיעות" color={C.green} />
              <Stat value={`${ops.stats.confirmRate}%`} label="אחוז מענה" color={C.goldT} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              <Stat value={ops.stats.invitesSent ?? 0} label="הזמנות נשלחו ✉️" color={C.goldT} />
              <Stat value={ops.stats.total - (ops.stats.invitesSent ?? 0)} label="טרם נשלחו" color={C.muted} />
            </div>

            {/* Sides */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <Stat value={ops.stats.brideSide} label="צד הכלה" color={C.bride} />
              <Stat value={ops.stats.groomSide} label="צד החתן" color={C.groom} />
              <Stat value={ops.stats.unassignedSide} label="ללא שיוך צד" color={C.muted} />
            </div>

            {ops.stats.noPhone > 0 && (
              <div style={{ background: "rgba(184,92,56,0.08)", border: `1.5px solid rgba(184,92,56,0.3)`, borderRadius: 12, padding: "12px 16px" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.red, margin: 0 }}>
                  📵 {ops.stats.noPhone} מוזמנים ללא טלפון — לא יקבלו הזמנה. השלימו בניהול האורחים.
                </p>
              </div>
            )}

            {/* Operational tools — all reuse existing production screens */}
            <Section title="🛠️ כלי תפעול">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
                {tool("ניהול אורחים", "👥", `/couple/${ops.event.couple_token}/guests`)}
                {tool("ייבוא אורחים", "📥", `/couple/${ops.event.couple_token}/guests/import`)}
                {tool("שליחת הזמנות", "📨", `/admin/send?event=${ops.event.id}`, true)}
                {tool("הושבה", "🪑", `/couple/${ops.event.couple_token}/seating`)}
                {tool("עמדת קבלה", "🎊", `/admin/checkin?event=${ops.event.id}`)}
                {tool("דוח מנות", "🍽️", `/couple/${ops.event.couple_token}/venue-report`)}
                {tool("לוח טרמפים", "🚗", `/couple/${ops.event.couple_token}/rides`)}
                {tool("קישור פתוח", "🔗", `/admin?event=${ops.event.id}`)}
                {tool("גלריה", "📸", `/gallery/${ops.event.couple_token}`)}
                {tool("מצב יום החתונה", "💍", `/couple/${ops.event.couple_token}/day`)}
              </div>
            </Section>

            {/* Wrong-number reports — guests who said the link reached the wrong person */}
            {(ops.wrongNumber?.length ?? 0) > 0 && (
              <Section title={`🚫 דיווחי מספר שגוי (${ops.wrongNumber!.length})`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {ops.wrongNumber!.map(w => (
                    <div key={w.id} style={{ background: "rgba(184,92,56,0.06)", border: `1px solid rgba(184,92,56,0.25)`, borderRadius: 12, padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.dark }}>{w.name}</span>
                        {w.phone && <span dir="ltr" style={{ fontSize: 12, color: C.muted }}>{w.phone}</span>}
                      </div>
                      <p style={{ fontSize: 13, color: C.red, margin: "6px 0 0", lineHeight: 1.5 }}>{w.report}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Tiberias shuttle — parents' guests who asked for a seat */}
            {(ops.shuttle?.riders.length ?? 0) > 0 && (
              <Section title={`🚌 הסעה מטבריה — ${ops.shuttle!.seats} מקומות (${ops.shuttle!.riders.length} הזמנות)`}>
                <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px" }}>
                  {ops.shuttle!.seats <= 19 ? "מיניבוס מספיק (עד 19)" : "צריך אוטובוס (מעל 19 מקומות)"}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ops.shuttle!.riders.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: C.dark }}>🚌 {r.name}{r.count > 1 ? ` (${r.count})` : ""}</span>
                      {r.phone && <span dir="ltr" style={{ color: C.muted, fontSize: 12 }}>{r.phone}</span>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Recent confirmations */}
            <Section title={`🎉 אישורים אחרונים (${ops.recentConfirmed.length})`}>
              {ops.recentConfirmed.length === 0 ? (
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>עוד אין אישורים</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ops.recentConfirmed.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: C.dark }}>✅ {r.name}{r.count > 1 ? ` (${r.count})` : ""}</span>
                      <span style={{ color: C.muted, fontSize: 12 }}>{timeAgo(r.at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Recent declines */}
            {ops.recentDeclined.length > 0 && (
              <Section title={`💛 עדכוני "לא מגיעים" אחרונים`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {ops.recentDeclined.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: C.dark }}>❌ {r.name}</span>
                      <span style={{ color: C.muted, fontSize: 12 }}>{timeAgo(r.at)}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Follow-up needed */}
            <Section title={`⏳ דורשים מעקב — ממתינים (${ops.followUp.length})`}>
              {ops.followUp.length === 0 ? (
                <p style={{ fontSize: 13, color: C.green, margin: 0 }}>כולם ענו! 🎉</p>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px" }}>
                    מסומן 👀 = פתחו את ההזמנה אך לא ענו (עדיפות לתזכורת). לחצו לפתיחת וואטסאפ אישי.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ops.followUp.map(fu => {
                      const phone = (fu.phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
                      const msg = encodeURIComponent(`💍 משפחה וחברים יקרים!\n\n${fu.name}, עדיין לא קיבלנו את אישורכם לחתונה של מירב ודביר 🙏\nנשמח לדעת אם תוכלו להגיע 🤍`);
                      return (
                        <div key={fu.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 12px", background: C.cream, borderRadius: 10 }}>
                          <span style={{ fontSize: 14, color: C.dark }}>{fu.opened ? "👀 " : ""}{fu.name}</span>
                          {fu.phone ? (
                            <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, color: "#1A9B4E", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>
                              💬 תזכורת
                            </a>
                          ) : <span style={{ fontSize: 12, color: C.red, flexShrink: 0 }}>אין טלפון</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
