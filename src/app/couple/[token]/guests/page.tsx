"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";

const C = {
  ivory: "#FDFAF5", gold: "#C5A46D", olive: "#6B7B5A",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
};

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: "מאושר", color: "#059669", bg: "rgba(5,150,105,0.1)" },
  pending:   { label: "ממתין",  color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  declined:  { label: "מסרב",  color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  maybe:     { label: "אולי",  color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
};

const SIDE_LABEL: Record<string, string> = {
  bride: "צד כלה",
  groom: "צד חתן",
};

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  guest_count: number;
  status: string;
  side: string | null;
  table_number: number | null;
  notes: string | null;
}

export default function GuestCenterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSide, setFilterSide] = useState("all");
  const [detail, setDetail] = useState<Guest | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [detailSide, setDetailSide] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/guests`);
    if (r.ok) setGuests(await r.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (g: Guest) => {
    setDetail(g);
    setDetailNotes(g.notes ?? "");
    setDetailSide(g.side ?? "");
  };

  const saveDetail = async () => {
    if (!detail) return;
    setSaving(true);
    const r = await fetch(`/api/couple/${token}/guests`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: detail.id, side: detailSide || null, notes: detailNotes || null }),
    });
    if (r.ok) {
      const updated = await r.json();
      setGuests(gs => gs.map(g => g.id === updated.id ? updated : g));
      setDetail(null);
    }
    setSaving(false);
  };

  // Summary
  const total = guests.reduce((s, g) => s + g.guest_count, 0);
  const confirmed = guests.filter(g => g.status === "confirmed").reduce((s, g) => s + g.guest_count, 0);
  const pending   = guests.filter(g => g.status === "pending").reduce((s, g) => s + g.guest_count, 0);
  const declined  = guests.filter(g => g.status === "declined").reduce((s, g) => s + g.guest_count, 0);
  const seated    = guests.filter(g => g.table_number).reduce((s, g) => s + g.guest_count, 0);

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone ?? "").includes(search);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    const matchSide = filterSide === "all" || g.side === filterSide;
    return matchSearch && matchStatus && matchSide;
  });

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
            <div>
              <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
              <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>👥 מוזמנים</h1>
            </div>
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם או טלפון..."
            style={{ width: "100%", border: "none", borderRadius: 10, padding: "0.55rem 0.8rem", fontSize: 13, fontFamily: "Heebo, sans-serif", background: "rgba(255,255,255,0.1)", color: "#FDFAF5", outline: "none", boxSizing: "border-box" }} />

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", flexWrap: "wrap" }}>
            {[{ key: "all", label: "הכל" }, { key: "confirmed", label: "מאושרים" }, { key: "pending", label: "ממתינים" }, { key: "declined", label: "מסרבים" }].map(f => (
              <button key={f.key} onClick={() => setFilterStatus(f.key)}
                style={{ padding: "4px 10px", borderRadius: 10, border: "none", background: filterStatus === f.key ? "rgba(197,164,109,0.3)" : "transparent", color: filterStatus === f.key ? C.gold : "rgba(197,164,109,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {f.label}
              </button>
            ))}
            <div style={{ width: 1, background: "rgba(197,164,109,0.3)" }} />
            {[{ key: "all", label: "שני הצדדים" }, { key: "bride", label: "כלה" }, { key: "groom", label: "חתן" }].map(f => (
              <button key={f.key} onClick={() => setFilterSide(f.key)}
                style={{ padding: "4px 10px", borderRadius: 10, border: "none", background: filterSide === f.key ? "rgba(197,164,109,0.3)" : "transparent", color: filterSide === f.key ? C.gold : "rgba(197,164,109,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1rem" }}>
        {/* Summary cards */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {[
              { label: "סה״כ", value: total, icon: "👥" },
              { label: "מאושרים", value: confirmed, icon: "✅" },
              { label: "ממתינים", value: pending, icon: "⏳" },
              { label: "שובצו", value: seated, icon: "🪑" },
            ].map(card => (
              <div key={card.label} style={{ background: C.card, borderRadius: 14, padding: "0.7rem 0.5rem", boxShadow: "0 2px 10px rgba(28,16,8,0.06)", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <p style={{ fontSize: 16 }}>{card.icon}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{card.value}</p>
                <p style={{ fontSize: 9, color: C.muted }}>{card.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Smart hint */}
        {!loading && pending > 10 && (
          <div style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: 13, color: "#92400E" }}>
            💡 {pending} אורחים עדיין לא אישרו — שקלו לשלוח תזכורת.
          </div>
        )}
        {!loading && confirmed > 0 && seated < confirmed && (
          <div style={{ background: "rgba(197,164,109,0.08)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: 13, color: C.dark }}>
            🪑 {confirmed - seated} אורחים מאושרים עדיין לא שובצו לשולחן.
          </div>
        )}

        {/* Guest list */}
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ fontSize: 48, marginBottom: "0.5rem" }}>👥</p>
            <p style={{ color: C.muted, fontSize: 14 }}>{guests.length === 0 ? "אין מוזמנים עדיין." : "לא נמצאו תוצאות."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map(g => {
              const st = STATUS_LABEL[g.status] ?? { label: g.status, color: C.muted, bg: "transparent" };
              return (
                <button key={g.id} onClick={() => openDetail(g)}
                  style={{ background: C.card, borderRadius: 14, padding: "0.85rem 1rem", boxShadow: "0 2px 8px rgba(28,16,8,0.05)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "right", cursor: "pointer", width: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(197,164,109,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 16 }}>👤</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{g.name}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>
                      {g.guest_count > 1 ? `${g.guest_count} מוזמנים` : "מוזמן אחד"}
                      {g.side ? ` · ${SIDE_LABEL[g.side] ?? g.side}` : ""}
                      {g.table_number ? ` · שולחן ${g.table_number}` : ""}
                    </p>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, color: st.color, background: st.bg }}>
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setDetail(null); }}>
          <div style={{ background: C.ivory, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, padding: "1.5rem 1rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark }}>{detail.name}</h2>
                <p style={{ fontSize: 12, color: C.muted }}>{detail.guest_count > 1 ? `${detail.guest_count} מוזמנים` : "מוזמן אחד"}</p>
              </div>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {/* Info rows */}
              {[
                { label: "סטטוס", value: STATUS_LABEL[detail.status]?.label ?? detail.status },
                { label: "טלפון", value: detail.phone ?? "—" },
                { label: "שולחן", value: detail.table_number ? `שולחן ${detail.table_number}` : "לא שובץ" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, paddingBottom: "0.5rem" }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{row.value}</span>
                </div>
              ))}

              {/* Editable: side */}
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>צד</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[{ v: "", l: "לא ידוע" }, { v: "bride", l: "צד כלה" }, { v: "groom", l: "צד חתן" }].map(opt => (
                    <button key={opt.v} onClick={() => setDetailSide(opt.v)}
                      style={{ flex: 1, padding: "0.5rem", borderRadius: 10, border: `1px solid ${detailSide === opt.v ? C.gold : C.border}`, background: detailSide === opt.v ? "rgba(197,164,109,0.12)" : "white", color: detailSide === opt.v ? C.dark : C.muted, fontSize: 12, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable: notes */}
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>הערות</label>
                <textarea value={detailNotes} onChange={e => setDetailNotes(e.target.value)} rows={2} placeholder="הערה אישית..."
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box", resize: "none" }} />
              </div>

              {detail.phone && (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <a href={`tel:${detail.phone}`} style={{ flex: 1, padding: "0.6rem", borderRadius: 12, background: "rgba(197,164,109,0.1)", border: `1px solid ${C.border}`, color: C.dark, fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>📞 התקשר</a>
                  <a href={`https://wa.me/${detail.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "0.6rem", borderRadius: 12, background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", color: "#065F46", fontSize: 13, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>💬 WhatsApp</a>
                </div>
              )}

              <button onClick={saveDetail} disabled={saving}
                style={{ width: "100%", background: saving ? "rgba(197,164,109,0.5)" : C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.9rem", fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    <HelpButton token={token} />
    </div>
  );
}
