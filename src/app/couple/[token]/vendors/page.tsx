"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldL: "#D4BC8A",
  olive: "#6B7B5A", dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
};

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "venue", label: "אולם", icon: "🏛" },
  { value: "photographer", label: "צלם", icon: "📸" },
  { value: "video", label: "וידאו", icon: "🎬" },
  { value: "dj", label: "DJ", icon: "🎧" },
  { value: "rabbi", label: "רב", icon: "✡️" },
  { value: "design", label: "עיצוב", icon: "💐" },
  { value: "catering", label: "קייטרינג", icon: "🍽" },
  { value: "bar", label: "בר", icon: "🍸" },
  { value: "makeup", label: "איפור", icon: "💄" },
  { value: "hair", label: "שיער", icon: "💇" },
  { value: "dress", label: "שמלה", icon: "👗" },
  { value: "suit", label: "חליפה", icon: "🤵" },
  { value: "rings", label: "טבעות", icon: "💍" },
  { value: "transport", label: "הסעות", icon: "🚌" },
  { value: "car", label: "רכב", icon: "🚗" },
  { value: "magnet", label: "מגנטים", icon: "🧲" },
  { value: "attractions", label: "אטרקציות", icon: "🎪" },
  { value: "other", label: "אחר", icon: "📦" },
];

const PAYMENT_METHODS = ["מזומן", "העברה בנקאית", "Bit", "PayBox", "צ'ק", "כרטיס אשראי"];

type PaymentStatus = "unpaid" | "partial" | "paid";

interface Vendor {
  id: string;
  category: string;
  vendor_name: string | null;
  contact_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  price_agreed: number | null;
  amount_paid: number;
  payment_due_date: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  confirmed: boolean;
  rating_quality: number | null;
  rating_timing: number | null;
  rating_personal: number | null;
  rating_notes: string | null;
  notes: string | null;
  created_at: string;
}

const EMPTY_VENDOR: Omit<Vendor, "id" | "created_at"> = {
  category: "venue", vendor_name: null, contact_name: null, phone: null,
  whatsapp: null, email: null, address: null, website: null,
  price_agreed: null, amount_paid: 0, payment_due_date: null,
  payment_method: null, payment_status: "unpaid", confirmed: false,
  rating_quality: null, rating_timing: null, rating_personal: null,
  rating_notes: null, notes: null,
};

const statusColor: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  unpaid:  { bg: "rgba(192,57,43,0.10)",  text: "#C0392B", label: "טרם שולם" },
  partial: { bg: "rgba(197,164,109,0.15)", text: "#8B6914", label: "שולם חלקית" },
  paid:    { bg: "rgba(74,124,63,0.12)",   text: "#4A7C3F", label: "שולם" },
};

function getCatInfo(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? { icon: "📦", label: value };
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: value && n <= value ? "#C5A46D" : "rgba(197,164,109,0.3)", padding: 0 }}>★</button>
      ))}
    </div>
  );
}

export default function VendorsPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Omit<Vendor, "id" | "created_at">>(EMPTY_VENDOR);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState<string | null>(null);
  const [ratingForm, setRatingForm] = useState({ quality: 0, timing: 0, personal: 0, notes: "" });

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/vendors`);
    if (r.ok) setVendors(await r.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_VENDOR); setShowModal(true); };
  const openEdit = (v: Vendor) => { setEditing(v); setForm({ ...v }); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    const url = `/api/couple/${token}/vendors`;
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { id: editing.id, ...form } : form;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setShowModal(false); await load(); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק את הספק?")) return;
    await fetch(`/api/couple/${token}/vendors?id=${id}`, { method: "DELETE" });
    setVendors(v => v.filter(x => x.id !== id));
  };

  const saveRating = async (id: string) => {
    await fetch(`/api/couple/${token}/vendors`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rating_quality: ratingForm.quality || null, rating_timing: ratingForm.timing || null, rating_personal: ratingForm.personal || null, rating_notes: ratingForm.notes || null }),
    });
    setShowRating(null);
    await load();
  };

  // Dashboard totals
  const totalCommitted = vendors.reduce((s, v) => s + (v.price_agreed ?? 0), 0);
  const totalPaid      = vendors.reduce((s, v) => s + (v.amount_paid ?? 0), 0);
  const remaining      = totalCommitted - totalPaid;
  const paidCount      = vendors.filter(v => v.payment_status === "paid").length;
  const unpaidCount    = vendors.filter(v => v.payment_status !== "paid").length;

  const f = (v: number) => `₪${v.toLocaleString("he-IL")}`;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
          <div>
            <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
            <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>🤝 ספקי האירוע</h1>
          </div>
          <button onClick={openAdd} style={{ marginRight: "auto", background: C.gold, color: "white", border: "none", borderRadius: 12, padding: "0.5rem 1rem", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + הוסף ספק
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1rem" }}>
        {/* Dashboard cards */}
        {vendors.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "1.25rem" }}>
            {[
              { label: "ספקים", value: vendors.length.toString(), icon: "🤝" },
              { label: "שולמו", value: `${paidCount}/${vendors.length}`, icon: "✅" },
              { label: "סה״כ התחייבות", value: f(totalCommitted), icon: "💰" },
              { label: "נותר לתשלום", value: f(remaining), icon: "⏳" },
            ].map(card => (
              <div key={card.label} style={{ background: C.card, borderRadius: 16, padding: "0.85rem 1rem", boxShadow: "0 2px 12px rgba(28,16,8,0.07)", border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{card.icon} {card.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vendor list */}
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ fontSize: 48, marginBottom: "0.75rem" }}>🤝</p>
            <p style={{ color: C.muted, fontSize: 14 }}>עדיין לא הוספתם ספקים.</p>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: "1.5rem" }}>נהלו את כל ספקי האירוע במקום אחד.</p>
            <button onClick={openAdd} style={{ background: C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.75rem 1.5rem", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              + הוסף ספק ראשון
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {vendors.map(v => {
              const cat = getCatInfo(v.category);
              const st = statusColor[v.payment_status ?? "unpaid"];
              const expanded = expandedId === v.id;
              return (
                <div key={v.id} style={{ background: C.card, borderRadius: 18, boxShadow: "0 2px 12px rgba(28,16,8,0.07)", border: `1px solid ${C.border}`, overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "0.9rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => setExpandedId(expanded ? null : v.id)}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(197,164,109,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {cat.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: C.dark, fontSize: 15, marginBottom: 1 }}>{v.vendor_name || cat.label}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{cat.label}{v.contact_name ? ` · ${v.contact_name}` : ""}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <span style={{ background: st.bg, color: st.text, borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                      {v.price_agreed && <span style={{ fontSize: 12, color: C.muted }}>{f(v.price_agreed)}</span>}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: "0.9rem 1rem" }}>
                      {/* Payment progress */}
                      {v.price_agreed && (
                        <div style={{ marginBottom: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: C.muted }}>
                            <span>שולם {f(v.amount_paid)}</span>
                            <span>נשאר {f((v.price_agreed ?? 0) - v.amount_paid)}</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(197,164,109,0.15)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min(100, ((v.amount_paid / v.price_agreed!) * 100))}%`, background: C.gold, borderRadius: 3, transition: "width 0.4s" }} />
                          </div>
                        </div>
                      )}

                      {/* Contact info */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.85rem" }}>
                        {v.phone && (
                          <a href={`tel:${v.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(74,124,63,0.10)", color: "#4A7C3F", borderRadius: 10, padding: "5px 10px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                            📞 התקשר
                          </a>
                        )}
                        {(v.whatsapp || v.phone) && (
                          <a href={`https://wa.me/972${(v.whatsapp || v.phone)!.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(37,211,102,0.10)", color: "#128C7E", borderRadius: 10, padding: "5px 10px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                            💬 WhatsApp
                          </a>
                        )}
                        {v.email && (
                          <a href={`mailto:${v.email}`} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(37,99,235,0.10)", color: "#2563EB", borderRadius: 10, padding: "5px 10px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                            📧 Email
                          </a>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: C.muted, marginBottom: "0.9rem" }}>
                        {v.payment_due_date && <span>📅 תאריך תשלום: {new Date(v.payment_due_date).toLocaleDateString("he-IL")}</span>}
                        {v.payment_method && <span>💳 אמצעי תשלום: {v.payment_method}</span>}
                        {v.notes && <span>📝 {v.notes}</span>}
                      </div>

                      {/* Rating */}
                      {(v.rating_quality || v.rating_timing || v.rating_personal) && (
                        <div style={{ background: "rgba(197,164,109,0.07)", borderRadius: 12, padding: "0.6rem 0.8rem", marginBottom: "0.85rem" }}>
                          <p style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>דירוג</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 12 }}>
                            {v.rating_quality && <span>איכות: {"★".repeat(v.rating_quality)}{"☆".repeat(5 - v.rating_quality)}</span>}
                            {v.rating_timing && <span>עמידה בזמנים: {"★".repeat(v.rating_timing)}{"☆".repeat(5 - v.rating_timing)}</span>}
                            {v.rating_personal && <span>יחס אישי: {"★".repeat(v.rating_personal)}{"☆".repeat(5 - v.rating_personal)}</span>}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => openEdit(v)} style={{ flex: 1, background: "rgba(197,164,109,0.12)", color: C.gold, border: "none", borderRadius: 10, padding: "0.5rem", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>עריכה</button>
                        <button onClick={() => { setShowRating(v.id); setRatingForm({ quality: v.rating_quality ?? 0, timing: v.rating_timing ?? 0, personal: v.rating_personal ?? 0, notes: v.rating_notes ?? "" }); }} style={{ flex: 1, background: "rgba(197,164,109,0.12)", color: C.gold, border: "none", borderRadius: 10, padding: "0.5rem", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>⭐ דרג</button>
                        <button onClick={() => remove(v.id)} style={{ background: "rgba(192,57,43,0.10)", color: "#C0392B", border: "none", borderRadius: 10, padding: "0.5rem 0.75rem", fontSize: 13, cursor: "pointer" }}>🗑</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: C.ivory, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: "1.5rem 1rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark }}>
                {editing ? "עריכת ספק" : "הוספת ספק"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Category */}
              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>קטגוריה *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setForm(f => ({ ...f, category: c.value }))}
                      style={{ padding: "5px 10px", borderRadius: 10, border: `1px solid ${form.category === c.value ? C.gold : C.border}`, background: form.category === c.value ? "rgba(197,164,109,0.15)" : "white", color: form.category === c.value ? C.dark : C.muted, fontSize: 12, cursor: "pointer" }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name fields */}
              {[
                { key: "vendor_name", label: "שם העסק" },
                { key: "contact_name", label: "איש קשר" },
                { key: "phone", label: "טלפון" },
                { key: "whatsapp", label: "WhatsApp" },
                { key: "email", label: "אימייל" },
                { key: "website", label: "אתר אינטרנט" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                  <input value={((form as unknown) as Record<string, string | null>)[key] ?? ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value || null }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}

              {/* Payment */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>מחיר שסוכם (₪)</label>
                  <input type="number" value={form.price_agreed ?? ""} onChange={e => setForm(f => ({ ...f, price_agreed: e.target.value ? Number(e.target.value) : null }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>שולם (₪)</label>
                  <input type="number" value={form.amount_paid ?? 0} onChange={e => setForm(f => ({ ...f, amount_paid: Number(e.target.value) }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>תאריך תשלום הבא</label>
                  <input type="date" value={form.payment_due_date ?? ""} onChange={e => setForm(f => ({ ...f, payment_due_date: e.target.value || null }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>סטטוס תשלום</label>
                  <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value as PaymentStatus }))}
                    style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }}>
                    <option value="unpaid">טרם שולם</option>
                    <option value="partial">שולם חלקית</option>
                    <option value="paid">שולם</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>אמצעי תשלום</label>
                <select value={form.payment_method ?? ""} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value || null }))}
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }}>
                  <option value="">בחרו אמצעי תשלום</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 4 }}>הערות</label>
                <textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} rows={3}
                  style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <button onClick={save} disabled={saving}
                style={{ width: "100%", background: saving ? "rgba(197,164,109,0.5)" : C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.9rem", fontSize: 16, fontWeight: 700, cursor: saving ? "default" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                {saving ? "שומר..." : editing ? "שמור שינויים" : "הוסף ספק"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) setShowRating(null); }}>
          <div style={{ background: C.ivory, borderRadius: 20, width: "100%", maxWidth: 380, padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: "1.25rem" }}>⭐ דרגו את הספק</h3>
            {[
              { key: "quality", label: "איכות השירות" },
              { key: "timing", label: "עמידה בזמנים" },
              { key: "personal", label: "יחס אישי" },
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: "0.85rem" }}>
                <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 4 }}>{label}</label>
                <StarRating value={((ratingForm as unknown) as Record<string, number>)[key]} onChange={v => setRatingForm(f => ({ ...f, [key]: v }))} />
              </div>
            ))}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 4 }}>הערות</label>
              <textarea value={ratingForm.notes} onChange={e => setRatingForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => saveRating(showRating)}
              style={{ width: "100%", background: C.gold, color: "white", border: "none", borderRadius: 12, padding: "0.8rem", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
              שמור דירוג
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
