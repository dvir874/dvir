"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", gold: "#C5A46D", olive: "#6B7B5A",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
};

const GIFT_TYPES = [
  { value: "bit",       label: "Bit",       icon: "📱" },
  { value: "paybox",    label: "PayBox",    icon: "💳" },
  { value: "easy2give", label: "Easy2Give", icon: "💚" },
  { value: "cash",      label: "מזומן",     icon: "💵" },
  { value: "check",     label: "צ'ק",       icon: "📄" },
  { value: "other",     label: "אחר",       icon: "🎁" },
];

const PAYMENT_METHODS = [
  { value: "bit",    label: "Bit",    icon: "📱", color: "#0066FF" },
  { value: "paybox", label: "PayBox", icon: "💜", color: "#6B46C1" },
  { value: "easy2give", label: "Easy2Give", icon: "💚", color: "#059669" },
  { value: "custom", label: "קישור מותאם", icon: "🔗", color: "#C5A46D" },
];

interface Gift {
  id: string;
  guest_name: string;
  amount: number | null;
  gift_type: string | null;
  notes: string | null;
  received_at: string;
}

interface EventInfo {
  bit_phone: string | null;
  paybox_link: string | null;
  easy2give_link: string | null;
  custom_gift_link: string | null;
  gift_methods_enabled: string[];
}

const EMPTY_GIFT = { guest_name: "", amount: "", gift_type: "cash", notes: "", received_at: "" };

function getGiftTypeInfo(v: string | null) {
  return GIFT_TYPES.find(t => t.value === v) ?? { icon: "🎁", label: v ?? "אחר" };
}

export default function GiftCenterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_GIFT);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState<"gifts" | "methods">("gifts");

  const load = useCallback(async () => {
    const [giftsRes, eventRes] = await Promise.all([
      fetch(`/api/couple/${token}/gifts-log`),
      fetch(`/api/couple/${token}/route`).catch(() => null),
    ]);
    if (giftsRes.ok) setGifts(await giftsRes.json());
    // Load event info for payment methods
    const evRes = await fetch(`/api/couple/${token}/briefing`);
    if (evRes.ok) {
      // briefing doesn't have gift methods — fetch event directly
    }
    setLoading(false);
  }, [token]);

  // Load event payment settings
  useEffect(() => {
    load();
    // Fetch event data
    fetch(`/api/couple/${token}/gifts-log`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setGifts(data));
  }, [token, load]);

  const addGift = async () => {
    if (!form.guest_name.trim()) return;
    setSaving(true);
    const body = {
      guest_name: form.guest_name.trim(),
      amount: form.amount ? Number(form.amount) : null,
      gift_type: form.gift_type || null,
      notes: form.notes || null,
      received_at: form.received_at || undefined,
    };
    const r = await fetch(`/api/couple/${token}/gifts-log`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (r.ok) { setShowAdd(false); setForm(EMPTY_GIFT); await load(); }
    setSaving(false);
  };

  const deleteGift = async (id: string) => {
    if (!confirm("למחוק את המתנה?")) return;
    await fetch(`/api/couple/${token}/gifts-log?id=${id}`, { method: "DELETE" });
    setGifts(g => g.filter(x => x.id !== id));
  };

  // Filtered gifts
  const filtered = gifts.filter(g => {
    const matchSearch = !search || g.guest_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || g.gift_type === filterType;
    return matchSearch && matchType;
  });

  // Summary
  const totalAmount = gifts.reduce((s, g) => s + (g.amount ?? 0), 0);
  const withAmount  = gifts.filter(g => g.amount && g.amount > 0).length;
  const avg         = withAmount > 0 ? Math.round(totalAmount / withAmount) : 0;

  const f = (v: number) => `₪${v.toLocaleString("he-IL")}`;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
          <div>
            <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
            <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>🎁 Gift Center</h1>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ marginRight: "auto", background: C.gold, color: "white", border: "none", borderRadius: 12, padding: "0.5rem 1rem", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + הוסף
          </button>
        </div>
        {/* Tabs */}
        <div style={{ maxWidth: 640, margin: "0.75rem auto 0", display: "flex", gap: "0.5rem" }}>
          {[{ key: "gifts", label: "מתנות" }, { key: "methods", label: "אמצעי תשלום" }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as "gifts" | "methods")}
              style={{ padding: "0.35rem 0.9rem", borderRadius: 10, border: "none", background: activeTab === t.key ? "rgba(197,164,109,0.25)" : "transparent", color: activeTab === t.key ? C.gold : "rgba(197,164,109,0.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1rem" }}>
        {activeTab === "gifts" && (
          <>
            {/* Summary cards */}
            {gifts.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "סה״כ", value: f(totalAmount), icon: "💰" },
                  { label: "מתנות", value: gifts.length.toString(), icon: "🎁" },
                  { label: "ממוצע", value: avg ? f(avg) : "—", icon: "📊" },
                ].map(card => (
                  <div key={card.label} style={{ background: C.card, borderRadius: 14, padding: "0.75rem", boxShadow: "0 2px 10px rgba(28,16,8,0.07)", border: `1px solid ${C.border}`, textAlign: "center" }}>
                    <p style={{ fontSize: 18 }}>{card.icon}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>{card.value}</p>
                    <p style={{ fontSize: 10, color: C.muted }}>{card.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Search + filter */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם..." style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.5rem 0.75rem", fontSize: 13, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none" }} />
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.5rem 0.75rem", fontSize: 13, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none" }}>
                <option value="all">הכל</option>
                {GIFT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>

            {/* Gift list */}
            {loading ? (
              <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                <p style={{ fontSize: 48, marginBottom: "0.75rem" }}>🎁</p>
                <p style={{ color: C.muted, fontSize: 14, marginBottom: "1.5rem" }}>
                  {gifts.length === 0 ? "עדיין לא נרשמו מתנות." : "לא נמצאו תוצאות."}
                </p>
                {gifts.length === 0 && (
                  <button onClick={() => setShowAdd(true)} style={{ background: C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.75rem 1.5rem", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                    + רשמו מתנה ראשונה
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {filtered.map(g => {
                  const type = getGiftTypeInfo(g.gift_type);
                  return (
                    <div key={g.id} style={{ background: C.card, borderRadius: 14, padding: "0.85rem 1rem", boxShadow: "0 2px 10px rgba(28,16,8,0.06)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{type.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{g.guest_name}</p>
                        <p style={{ fontSize: 11, color: C.muted }}>{type.label} · {new Date(g.received_at).toLocaleDateString("he-IL")}</p>
                        {g.notes && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>📝 {g.notes}</p>}
                      </div>
                      <div style={{ textAlign: "left", flexShrink: 0 }}>
                        {g.amount ? (
                          <p style={{ fontWeight: 700, color: C.dark, fontSize: 16 }}>{f(g.amount)}</p>
                        ) : (
                          <p style={{ color: C.muted, fontSize: 12 }}>לא צוין</p>
                        )}
                        <button onClick={() => deleteGift(g.id)} style={{ background: "none", border: "none", color: "rgba(192,57,43,0.5)", fontSize: 16, cursor: "pointer", marginTop: 4 }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === "methods" && (
          <div>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: "1.25rem", lineHeight: 1.6 }}>
              בחרו אילו אמצעי קבלת מתנות יוצגו לאורחים שלכם באתר האירוע.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {PAYMENT_METHODS.map(m => (
                <div key={m.value} style={{ background: C.card, borderRadius: 16, padding: "1rem", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(28,16,8,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700, color: C.dark, fontSize: 15 }}>{m.label}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: "0.5rem" }}>
                    {m.value === "bit" ? "מספר טלפון עבור Bit" :
                     m.value === "paybox" ? "קישור PayBox" :
                     m.value === "easy2give" ? "קישור Easy2Give" :
                     "קישור מותאם אישית"}
                  </p>
                  <input placeholder={`הזינו ${m.value === "bit" ? "מספר טלפון" : "קישור"}...`}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.5rem 0.75rem", fontSize: 13, fontFamily: "Heebo, sans-serif", background: C.ivory, color: C.dark, outline: "none", boxSizing: "border-box" }}
                    onBlur={async e => {
                      const val = e.target.value.trim();
                      const key = m.value === "bit" ? "bit_phone" : m.value === "paybox" ? "paybox_link" : m.value === "easy2give" ? "easy2give_link" : "custom_gift_link";
                      await fetch(`/api/couple/${token}/briefing`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: val || null }) }).catch(() => {});
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Gift Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: C.ivory, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, padding: "1.5rem 1rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark }}>רישום מתנה</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>שם האורח *</label>
                <input value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} placeholder="שם מלא..."
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.8rem", fontSize: 15, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>סכום (₪)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0"
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.8rem", fontSize: 15, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>סוג מתנה</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {GIFT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, gift_type: t.value }))}
                      style={{ padding: "6px 12px", borderRadius: 10, border: `1px solid ${form.gift_type === t.value ? C.gold : C.border}`, background: form.gift_type === t.value ? "rgba(197,164,109,0.15)" : "white", color: form.gift_type === t.value ? C.dark : C.muted, fontSize: 13, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>תאריך קבלה</label>
                <input type="date" value={form.received_at} onChange={e => setForm(f => ({ ...f, received_at: e.target.value }))}
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.8rem", fontSize: 15, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>הערות</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="הערה אופציונלית..."
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.8rem", fontSize: 15, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
              </div>

              <button onClick={addGift} disabled={saving || !form.guest_name.trim()}
                style={{ width: "100%", background: (saving || !form.guest_name.trim()) ? "rgba(197,164,109,0.5)" : C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.9rem", fontSize: 16, fontWeight: 700, cursor: (saving || !form.guest_name.trim()) ? "default" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                {saving ? "שומר..." : "שמור מתנה"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
