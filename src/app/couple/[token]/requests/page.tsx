"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
  shadow: "0 4px 24px rgba(28,16,8,0.09)",
};

const CATEGORIES = [
  { key: "question",   label: "שאלה כללית",  emoji: "❓" },
  { key: "venue",      label: "אולם",          emoji: "🏛️" },
  { key: "vendors",    label: "ספקים",         emoji: "🤝" },
  { key: "budget",     label: "תקציב",         emoji: "💰" },
  { key: "guests",     label: "אורחים",        emoji: "👥" },
  { key: "logistics",  label: "לוגיסטיקה",    emoji: "📦" },
  { key: "design",     label: "עיצוב / נושא",  emoji: "🎨" },
  { key: "other",      label: "אחר",            emoji: "📝" },
];

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  new:         { label: "נשלחה",         color: "#6B7B5A", bg: "rgba(107,123,90,0.1)" },
  in_progress: { label: "בטיפול",        color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  resolved:    { label: "טופלה",         color: "#059669", bg: "rgba(5,150,105,0.1)" },
  closed:      { label: "נסגרה",         color: "#9CA3AF", bg: "rgba(156,163,175,0.1)" },
};

interface CoupleRequest {
  id: string;
  category: string;
  title: string;
  description?: string;
  status: string;
  admin_note?: string;
  created_at: string;
}

export default function RequestsPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [requests, setRequests] = useState<CoupleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("question");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/requests`);
    if (r.ok) setRequests(await r.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    const r = await fetch(`/api/couple/${token}/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, title: title.trim(), description: description.trim() || undefined }),
    });
    if (r.ok) {
      setSuccess(true);
      setTitle(""); setDescription(""); setCategory("question");
      setTimeout(() => { setSuccess(false); setShowForm(false); load(); }, 2000);
    }
    setSaving(false);
  }

  const catFor = (key: string) => CATEGORIES.find(c => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
          <div>
            <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
            <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>📬 מרכז הבקשות</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ marginRight: "auto", background: "rgba(197,164,109,0.15)", border: "1px solid rgba(197,164,109,0.3)", borderRadius: 10, padding: "0.45rem 1rem", color: "#C5A46D", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            + בקשה חדשה
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Intro */}
        <div style={{ background: `linear-gradient(135deg, ${C.dark}, #2C1F0E)`, borderRadius: "1.25rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: "#FDFAF5", marginBottom: "0.4rem" }}>שלחו לנו בקשה</p>
          <p style={{ fontSize: 13, color: "rgba(197,164,109,0.7)", lineHeight: 1.7 }}>
            שאלה? בקשה? רוצים לתאם משהו? שלחו לנו כאן ונחזור אליכם תוך 24 שעות.
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <p style={{ fontSize: 48, marginBottom: "0.75rem" }}>📬</p>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 17, fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>אין בקשות עדיין</p>
            <p style={{ color: C.muted, fontSize: 14 }}>לחצו על "בקשה חדשה" כדי לפתוח פנייה לצוות</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {requests.map(req => {
              const cat = catFor(req.category);
              const st = STATUS_CFG[req.status] ?? STATUS_CFG.new;
              return (
                <div key={req.id} style={{ background: C.card, borderRadius: "1rem", border: `1px solid ${C.border}`, padding: "1rem 1.25rem", boxShadow: C.shadow }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <p style={{ fontWeight: 700, color: C.dark, fontSize: 15 }}>{req.title}</p>
                        <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: st.color, background: st.bg, whiteSpace: "nowrap" }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, marginBottom: req.description || req.admin_note ? "0.5rem" : 0 }}>
                        {cat.label} · {new Date(req.created_at).toLocaleDateString("he-IL")}
                      </p>
                      {req.description && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{req.description}</p>}
                      {req.admin_note && (
                        <div style={{ marginTop: "0.65rem", padding: "0.6rem 0.75rem", borderRadius: 8, background: "rgba(197,164,109,0.08)", border: `1px solid ${C.border}` }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 2 }}>💬 תגובת הצוות</p>
                          <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.55 }}>{req.admin_note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Request Bottom Sheet */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={() => setShowForm(false)} style={{ position: "absolute", inset: 0, background: "rgba(28,16,8,0.55)" }} />
          <div style={{ position: "relative", background: C.card, borderRadius: "1.5rem 1.5rem 0 0", padding: "1.5rem 1.25rem 2.5rem", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(28,16,8,0.12)", margin: "0 auto 1.25rem" }} />
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark, marginBottom: "1.25rem" }}>📬 בקשה חדשה</h2>

            {/* Category chips */}
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>נושא</p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setCategory(cat.key)}
                  style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: category === cat.key ? 700 : 400, cursor: "pointer", border: `1.5px solid ${category === cat.key ? C.gold : C.border}`, background: category === cat.key ? "rgba(197,164,109,0.12)" : "transparent", color: category === cat.key ? C.gold : C.muted, transition: "all 0.15s" }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Title */}
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>כותרת *</p>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="מה הבקשה שלכם?"
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 15, color: C.dark, background: C.ivory, fontFamily: "Heebo, sans-serif", marginBottom: "1.25rem", boxSizing: "border-box", outline: "none" }}
            />

            {/* Description */}
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: "0.5rem", letterSpacing: "0.05em" }}>פרטים נוספים</p>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="הוסיפו כל מידע שיעזור לנו לטפל בבקשה..."
              rows={4}
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.dark, background: C.ivory, fontFamily: "Heebo, sans-serif", marginBottom: "1.5rem", boxSizing: "border-box", resize: "none", outline: "none", lineHeight: 1.6 }}
            />

            {success ? (
              <div style={{ textAlign: "center", padding: "1rem", color: "#059669", fontWeight: 700, fontSize: 15 }}>✅ הבקשה נשלחה בהצלחה!</div>
            ) : (
              <button
                onClick={submit} disabled={saving || !title.trim()}
                style={{ width: "100%", padding: "0.875rem", borderRadius: 14, background: title.trim() ? `linear-gradient(135deg, ${C.gold}, #9B7A42)` : "rgba(197,164,109,0.2)", border: "none", color: title.trim() ? "white" : C.muted, fontSize: 16, fontWeight: 700, cursor: title.trim() ? "pointer" : "not-allowed", fontFamily: "Heebo, sans-serif" }}>
                {saving ? "שולח..." : "📬 שלחו בקשה"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
