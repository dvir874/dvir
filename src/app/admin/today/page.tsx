"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
  red:    "#B85C38",
};

interface TodayData {
  pipeline: { id: string; name: string; date: string | null; days: number | null; step: string; action: string; href: string; urgent: boolean; notOpened?: number }[];
  newLeads: number;
  staleLeads: string[];
  upcoming: { id: string; name: string; date: string; client_phone: string | null; couple_token: string | null }[];
  morningAfter: { id: string; name: string; client_phone: string | null; attendees: number; photos: number; blessings: number; gallery_token: string | null }[];
  needsClosing: { id: string; name: string; date: string; client_phone: string | null }[];
  recentRsvps: { name: string; status: string; count: number; event: string; at: string }[];
  openRequests: { id: string; title: string; event: string }[];
  revenue: { paidThisMonth: number; outstanding: number };
}

function waPhone(phone: string | null): string {
  return (phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: C.goldT, margin: "0 0 12px", letterSpacing: "0.04em" }}>{title}</p>
      {children}
    </div>
  );
}

export default function AdminTodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/today")
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function markCompleted(id: string) {
    setClosing(id);
    await fetch(`/api/events/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setClosing(null);
    load();
  }

  const today = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/admin" style={{ color: C.dark, display: "flex", alignItems: "center" }}><ArrowRight size={20} /></a>
          <div>
            <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: 0 }}>☀️ היום שלי</h1>
            <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{today}</p>
          </div>
        </div>
        <button onClick={load} aria-label="רענן" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 8 }}>
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {loading && !data && <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען...</p>}

        {data && (
          <>
            {/* Alerts */}
            {data.staleLeads.length > 0 && (
              <a href="/admin/crm" style={{ textDecoration: "none" }}>
                <div style={{ background: "rgba(184,92,56,0.1)", border: `1.5px solid rgba(184,92,56,0.35)`, borderRadius: 14, padding: "13px 16px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.red, margin: 0 }}>
                    🔥 {data.staleLeads.length} לידים מחכים מעל 24 שעות — {data.staleLeads.slice(0, 2).join(", ")}{data.staleLeads.length > 2 ? "..." : ""}
                  </p>
                </div>
              </a>
            )}

            {/* Revenue */}
            <div style={{ background: C.cream, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", textAlign: "center", gap: 8 }}>
              <div>
                <p style={{ fontSize: 24, fontWeight: 900, color: C.green, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>₪{data.revenue.paidThisMonth.toLocaleString()}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>נכנס החודש</p>
              </div>
              <div>
                <p style={{ fontSize: 24, fontWeight: 900, color: data.revenue.outstanding > 0 ? C.red : C.dark, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>₪{data.revenue.outstanding.toLocaleString()}</p>
                <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>ממתין לגבייה</p>
              </div>
            </div>

            {/* Pipeline — next step per event */}
            {(data.pipeline ?? []).length > 0 && (
              <Section title="🧭 הצעד הבא — לכל אירוע">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.pipeline.map(e => (
                    <a key={e.id} href={e.href} style={{ textDecoration: "none" }}>
                      <div style={{
                        padding: "12px 14px", borderRadius: 12,
                        background: e.urgent ? "rgba(184,92,56,0.07)" : C.cream,
                        border: `1.5px solid ${e.urgent ? "rgba(184,92,56,0.35)" : C.border}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>
                            {e.urgent ? "🔥 " : ""}{e.name}
                          </p>
                          {e.days !== null && (
                            <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>
                              {e.days <= 0 ? "היום!" : `בעוד ${e.days} ימים`}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{e.step}</p>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.goldT, flexShrink: 0, whiteSpace: "nowrap" }}>
                            {e.action} ←
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 6 }}>
                          {(e.notOpened ?? 0) > 0 ? (
                            <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>
                              👀 {e.notOpened} לא פתחו את ההזמנה כלל — ייתכן מספר שגוי
                            </span>
                          ) : <span />}
                          <span
                            onClick={(ev) => { ev.preventDefault(); window.open(`/api/admin/backup?event_id=${e.id}`, "_blank"); }}
                            style={{ fontSize: 11, color: C.muted, cursor: "pointer", textDecoration: "underline", flexShrink: 0 }}>
                            📦 גיבוי
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Weddings this week */}
            {data.upcoming.length > 0 && (
              <Section title="💒 חתונות השבוע">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.upcoming.map(e => {
                    const d = new Date(e.date);
                    const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", background: C.cream, borderRadius: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: 0 }}>{e.name}</p>
                          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>
                            {d.toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" })} · {days <= 0 ? "היום!" : `בעוד ${days} ימים`}
                          </p>
                        </div>
                        {e.client_phone && (
                          <a href={`https://wa.me/${waPhone(e.client_phone)}`} target="_blank" rel="noopener noreferrer"
                            style={{ flexShrink: 0, padding: "8px 14px", background: "#25D366", color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                            💬 לזוג
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Morning after — send couple their recap */}
            {(data.morningAfter ?? []).length > 0 && (
              <Section title="🌅 הבוקר שאחרי — שלחו לזוג את הסיכום">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.morningAfter.map(e => {
                    const galleryUrl = e.gallery_token ? `${window.location.origin}/gallery/${e.gallery_token}` : null;
                    const msg =
                      `💍 בוקר טוב, זוג נשוי! 🤍\n\n` +
                      `איזה לילה זה היה...\n` +
                      `🎉 ${e.attendees} אורחים חגגו איתכם\n` +
                      (e.photos > 0 ? `📸 ${e.photos} תמונות מחכות לכם\n` : "") +
                      (e.blessings > 0 ? `💌 ${e.blessings} ברכות נכתבו לכם\n` : "") +
                      (galleryUrl ? `\nהכל מחכה לכם כאן:\n${galleryUrl}\n` : "") +
                      `\nמזל טוב! 🥂 דביר — רגע לפני`;
                    return (
                      <div key={e.id} style={{ padding: "12px", background: "rgba(197,164,109,0.08)", border: `1px solid rgba(197,164,109,0.3)`, borderRadius: 12 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 4px" }}>{e.name}</p>
                        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 10px" }}>
                          🎉 {e.attendees} אורחים · 📸 {e.photos} תמונות · 💌 {e.blessings} ברכות
                        </p>
                        {e.client_phone && (
                          <a href={`https://wa.me/${waPhone(e.client_phone)}?text=${encodeURIComponent(msg)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-block", padding: "9px 16px", background: "#25D366", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                            🌅 שלח את הודעת הבוקר שאחרי
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Post-wedding closing */}
            {data.needsClosing.length > 0 && (
              <Section title="🎬 חתונות שעברו — צ'קליסט סגירה">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.needsClosing.map(e => (
                    <div key={e.id} style={{ padding: "12px", background: C.cream, borderRadius: 12 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: C.dark, margin: "0 0 8px" }}>
                        {e.name} · {new Date(e.date).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {e.client_phone && (
                          <>
                            <a href={`https://wa.me/${waPhone(e.client_phone)}?text=${encodeURIComponent("💍 מזל טוב שוב! 🥂 מקווה שהכל היה מושלם. אשמח אם תכתבו לי 2-3 משפטים על החוויה עם רגע לפני 🙏 ואם מכירים זוג שמתחתן — תעבירו את המספר שלי. תודה, דביר")}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ padding: "7px 12px", background: "#fff", color: C.goldT, border: `1px solid ${C.gold}`, borderRadius: 9, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                              💬 בקש עדות
                            </a>
                          </>
                        )}
                        <button onClick={() => markCompleted(e.id)} disabled={closing === e.id}
                          style={{ padding: "7px 12px", background: C.green, color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: closing === e.id ? 0.6 : 1 }}>
                          {closing === e.id ? "סוגר..." : "✓ סמן כהושלם"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Recent RSVPs */}
            <Section title={`📊 אישורים ב-24 שעות האחרונות (${data.recentRsvps.length})`}>
              {data.recentRsvps.length === 0 ? (
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>אין תגובות חדשות</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {data.recentRsvps.map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                      <span style={{ color: C.dark, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.status === "confirmed" ? "✅" : "❌"} {r.name}{r.count > 1 ? ` (${r.count})` : ""}
                      </span>
                      <span style={{ color: C.muted, flexShrink: 0, fontSize: 12 }}>{r.event}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Open couple requests */}
            {data.openRequests.length > 0 && (
              <Section title={`📨 בקשות זוגות פתוחות (${data.openRequests.length})`}>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {data.openRequests.map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                      <span style={{ color: C.dark }}>{r.title}</span>
                      <span style={{ color: C.muted, flexShrink: 0, fontSize: 12 }}>{r.event}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
