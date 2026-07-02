"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";
import CoupleBottomNav from "@/components/CoupleBottomNav";

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldText: "#8B6914",
  olive: "#6B7B5A", dark: "#1C1008", muted: "#8C7B6E", border: "#E8E0D4",
};

const CSS_GUESTS = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
  .loading-dot{width:8px;height:8px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
  .loading-dot:nth-child(2){animation-delay:.2s}
  .loading-dot:nth-child(3){animation-delay:.4s}
  .guest-chip-scroll::-webkit-scrollbar{display:none}
`;

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

  const unseated = guests.filter(g => !g.table_number && g.status === "confirmed").reduce((s,g) => s+g.guest_count, 0);

  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || (g.phone ?? "").includes(search);
    let matchStatus = true;
    if (filterStatus === "confirmed") matchStatus = g.status === "confirmed";
    else if (filterStatus === "pending")   matchStatus = g.status === "pending";
    else if (filterStatus === "declined")  matchStatus = g.status === "declined";
    else if (filterStatus === "unseated")  matchStatus = !g.table_number && g.status === "confirmed";
    const matchSide = filterSide === "all" || g.side === filterSide;
    return matchSearch && matchStatus && matchSide;
  });

  const CHIPS = [
    { key:"all",       label:`כולם (${total})` },
    { key:"confirmed", label:`מגיעים (${confirmed})` },
    { key:"pending",   label:`ממתינים (${pending})` },
    { key:"declined",  label:`לא מגיעים (${declined})` },
    { key:"unseated",  label:`לא שובצו (${unseated})` },
  ];

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:C.ivory, fontFamily:"Heebo,sans-serif", paddingBottom:"140px" }}>
      <style>{CSS_GUESTS}</style>

      {/* E3-S9: Header — ivory, sticky */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"sticky", top:0, background:"rgba(253,250,245,0.96)", backdropFilter:"blur(8px)", borderBottom:`1px solid rgba(197,164,109,0.15)`, zIndex:10 }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px", color:C.muted, fontSize:20, lineHeight:1 }} aria-label="חזרה">→</button>
        <h1 style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"18px", fontWeight:700, color:C.dark, margin:0 }}>מרכז האורחים</h1>
        <div style={{ width:44 }} />
      </header>

      {/* Page heading + summary pills */}
      <div style={{ padding:"16px 20px 0" }}>
        <h2 style={{ fontFamily:"Frank Ruhl Libre,serif", fontWeight:900, fontSize:32, color:C.dark, margin:"0 0 16px" }}>מרכז האורחים</h2>
        {!loading && (
          <div style={{ display:"flex", gap:"8px", overflowX:"auto", scrollbarWidth:"none", paddingBottom:2 }}>
            {[
              { label:`${total} סה״כ`,        bg:C.cream,                        color:C.dark },
              { label:`${confirmed} מגיעים`,  bg:"rgba(5,150,105,0.15)",         color:"#065F46" },
              { label:`${pending} ממתינים`,   bg:"rgba(197,164,109,0.20)",       color:C.goldText },
              { label:`${declined} לא מגיעים`,bg:"rgba(28,16,8,0.08)",           color:C.muted },
            ].map(p => (
              <div key={p.label} style={{ flexShrink:0, background:p.bg, borderRadius:9999, padding:"6px 14px" }}>
                <span style={{ fontFamily:"Heebo,sans-serif", fontSize:13, fontWeight:600, color:p.color, whiteSpace:"nowrap" }}>{p.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* E3-S9: Filter chip row */}
      <div role="group" aria-label="סנן אורחים" className="guest-chip-scroll" style={{ display:"flex", gap:"8px", padding:"12px 16px", overflowX:"auto", scrollbarWidth:"none" }}>
        {CHIPS.map(c => {
          const active = filterStatus === c.key;
          return (
            <button key={c.key} onClick={() => setFilterStatus(c.key)}
              style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, border:"none", background:active?C.gold:C.cream, color:active?"white":C.muted, fontFamily:"Heebo,sans-serif", fontSize:13, fontWeight:active?600:400, cursor:"pointer", minHeight:36, whiteSpace:"nowrap", transition:"background .15s,color .15s" }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search input */}
      <div style={{ padding:"0 16px 12px" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם או טלפון"
            style={{ width:"100%", height:40, border:`1px solid ${C.border}`, borderRadius:12, paddingRight:44, paddingLeft:14, fontSize:14, fontFamily:"Heebo,sans-serif", background:C.cream, color:C.dark, outline:"none", boxSizing:"border-box" }} />
        </div>
      </div>

      {/* WarmAlertCard — unseated */}
      {!loading && unseated > 0 && (
        <div style={{ margin:"0 16px 12px", background:"rgba(197,164,109,0.08)", borderRadius:12, border:`1px solid rgba(197,164,109,0.25)`, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:14, fontWeight:400, color:C.dark, margin:0 }}>{unseated} אורחים לא שובצו — שבצו אותם לשולחנות</p>
          <a href={`/couple/${token}/seating`} style={{ color:C.gold, fontFamily:"Heebo,sans-serif", fontSize:16, flexShrink:0, textDecoration:"none" }}>←</a>
        </div>
      )}

      {/* E3-S9: Guest list */}
      <div role="list" aria-label="רשימת אורחים" style={{ padding:"0 16px" }}>
        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {[88,72,80,68,76].map((h,i) => (
              <div key={i} style={{ height:h, background:C.cream, borderRadius:14, border:`1px solid ${C.border}`, animation:"dotPulse 1.4s ease-in-out infinite", animationDelay:`${i*0.08}s` }}/>
            ))}
          </div>
        ) : guests.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem 1rem", animation:"fadeUp .4s ease both" }}>
            <svg width="60" height="50" viewBox="0 0 60 50" fill="none" style={{ display:"block", margin:"0 auto 16px" }} aria-hidden="true">
              <path d="M30 44 C30 44 30 22 30 6" stroke={C.olive} strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M30 30 C22 26 13 27 9 22" stroke={C.olive} strokeWidth="1" strokeLinecap="round"/>
              <path d="M30 22 C38 18 47 19 51 14" stroke={C.olive} strokeWidth="1" strokeLinecap="round"/>
              <circle cx="9" cy="22" r="1.5" fill={C.olive}/><circle cx="51" cy="14" r="1.5" fill={C.olive}/><circle cx="30" cy="6" r="2" fill={C.gold}/>
            </svg>
            <h2 style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"24px", fontWeight:700, color:C.dark, marginBottom:8 }}>עדיין אין אורחים</h2>
            <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:300, color:C.muted, marginBottom:24 }}>הוסיפו את האורחים שלכם כדי להתחיל</p>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign:"center", color:C.muted, fontFamily:"Heebo,sans-serif", fontSize:14, fontWeight:300, padding:"2rem" }}>לא נמצאו תוצאות</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {filtered.map(g => {
              const st = STATUS_LABEL[g.status] ?? { label: g.status, color:C.muted, bg:"transparent" };
              return (
                <button key={g.id} role="listitem" aria-label={`${g.name}, ${st.label}`} onClick={() => openDetail(g)}
                  style={{ background:C.cream, borderRadius:14, padding:"13px 14px", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:"12px", textAlign:"right", cursor:"pointer", width:"100%" }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(197,164,109,0.14)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:16 }}>👤</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"Heebo,sans-serif", fontWeight:600, color:C.dark, fontSize:14, margin:"0 0 2px" }}>{g.name}</p>
                    <p style={{ fontFamily:"Heebo,sans-serif", fontSize:12, fontWeight:300, color:C.muted, margin:0 }}>
                      {g.guest_count > 1 ? `${g.guest_count} מוזמנים` : "מוזמן אחד"}
                      {g.side ? ` · ${SIDE_LABEL[g.side] ?? g.side}` : ""}
                      {g.table_number ? ` · שולחן ${g.table_number}` : ""}
                    </p>
                  </div>
                  <span style={{ padding:"3px 10px", borderRadius:8, fontSize:11, fontWeight:600, color:st.color, background:st.bg, flexShrink:0 }}>
                    {st.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ONE floating GoldCTA — spec: no header "+" button */}
      <div style={{ position:"sticky", bottom:`calc(80px + env(safe-area-inset-bottom))`, padding:"0 16px", zIndex:5, display:"flex", flexDirection:"column", gap:10 }}>
        {guests.length > 0 && (
          <a
            href={`https://wa.me/972533318177?text=${encodeURIComponent(`היי דביר! סיימנו לסדר את רשימת האורחים (${guests.length} אורחים) — אפשר לשלוח את ההזמנות 🎉`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"14px", borderRadius:16, background:"#fff", color:"#1A9B4E", fontFamily:"Heebo,sans-serif", fontSize:14, fontWeight:700, border:"1.5px solid rgba(37,211,102,0.4)", textDecoration:"none", boxShadow:"0 2px 12px rgba(28,16,8,0.08)" }}>
            סידרתם את הרשימה? בקשו מדביר לשלוח את ההזמנות 🚀
          </a>
        )}
        <button onClick={() => router.push(`/couple/${token}/guests/import`)}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"16px", borderRadius:16, background:`linear-gradient(135deg,${C.gold},#B8935A)`, color:"white", fontFamily:"Heebo,sans-serif", fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:"0 4px 16px rgba(197,164,109,0.45)" }}>
          + הוסיפו אורח
        </button>
      </div>

      {/* Detail Panel */}
      {detail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e => { if (e.target===e.currentTarget) setDetail(null); }}>
          <div style={{ background:C.ivory, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:640, padding:"1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom))" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <div>
                <h2 style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:20, fontWeight:700, color:C.dark }}>{detail.name}</h2>
                <p style={{ fontFamily:"Heebo,sans-serif", fontSize:12, fontWeight:300, color:C.muted }}>{detail.guest_count > 1 ? `${detail.guest_count} מוזמנים` : "מוזמן אחד"}</p>
              </div>
              <button onClick={() => setDetail(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.muted }} aria-label="סגור">✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
              {[
                { label:"סטטוס", value: STATUS_LABEL[detail.status]?.label ?? detail.status },
                { label:"טלפון", value: detail.phone ?? "—" },
                { label:"שולחן", value: detail.table_number ? `שולחן ${detail.table_number}` : "לא שובץ" },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, paddingBottom:"0.5rem" }}>
                  <span style={{ fontFamily:"Heebo,sans-serif", fontSize:13, color:C.muted }}>{row.label}</span>
                  <span style={{ fontFamily:"Heebo,sans-serif", fontSize:13, fontWeight:600, color:C.dark }}>{row.value}</span>
                </div>
              ))}
              <div>
                <label style={{ fontFamily:"Heebo,sans-serif", fontSize:12, color:C.muted, display:"block", marginBottom:6 }}>צד</label>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  {[{ v:"", l:"לא ידוע" }, { v:"bride", l:"צד כלה" }, { v:"groom", l:"צד חתן" }].map(opt => (
                    <button key={opt.v} onClick={() => setDetailSide(opt.v)}
                      style={{ flex:1, padding:"0.5rem", borderRadius:10, border:`1px solid ${detailSide===opt.v?C.gold:C.border}`, background:detailSide===opt.v?"rgba(197,164,109,0.12)":C.cream, color:detailSide===opt.v?C.dark:C.muted, fontSize:12, cursor:"pointer", fontFamily:"Heebo,sans-serif" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontFamily:"Heebo,sans-serif", fontSize:12, color:C.muted, display:"block", marginBottom:4 }}>הערות</label>
                <textarea value={detailNotes} onChange={e => setDetailNotes(e.target.value)} rows={2} placeholder="הערה אישית..."
                  style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:10, padding:"0.6rem 0.8rem", fontSize:14, fontFamily:"Heebo,sans-serif", background:"white", color:C.dark, outline:"none", boxSizing:"border-box", resize:"none" }} />
              </div>
              {detail.phone && (
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <a href={`tel:${detail.phone}`} style={{ flex:1, padding:"0.6rem", borderRadius:12, background:"rgba(197,164,109,0.1)", border:`1px solid ${C.border}`, color:C.dark, fontSize:13, fontWeight:600, textAlign:"center", textDecoration:"none", minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" }}>📞 התקשר</a>
                  <a href={`https://wa.me/${detail.phone?.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"0.6rem", borderRadius:12, background:"rgba(5,150,105,0.1)", border:"1px solid rgba(5,150,105,0.3)", color:"#065F46", fontSize:13, fontWeight:600, textAlign:"center", textDecoration:"none", minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" }}>💬 WhatsApp</a>
                </div>
              )}
              <button onClick={saveDetail} disabled={saving}
                style={{ width:"100%", background:saving?"rgba(197,164,109,0.5)":C.gold, color:"white", border:"none", borderRadius:14, padding:"0.9rem", fontSize:16, fontWeight:700, cursor:saving?"default":"pointer", fontFamily:"Heebo,sans-serif", minHeight:52 }}>
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpButton token={token} />
      <CoupleBottomNav token={token} />
    </div>
  );
}
