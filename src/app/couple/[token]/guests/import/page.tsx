"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Plus, Trash2, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

const C = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  border:   "#E8E0D4",
  error:    "#B85C38",
  success:  "#4A7C59",
};

const LS_KEY = (token: string) => `guest_import_draft_${token}`;

interface Row { id: string; firstName: string; lastName: string; phone: string; }

function newRow(): Row {
  return { id: Math.random().toString(36).slice(2), firstName: "", lastName: "", phone: "" };
}

export default function GuestImportPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [tab, setTab]         = useState<"manual" | "excel">("manual");
  const [rows, setRows]       = useState<Row[]>([newRow(), newRow(), newRow()]);
  const [status, setStatus]   = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── localStorage auto-save ── */
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY(token));
    if (saved) {
      try { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) setRows(parsed); } catch {}
    }
  }, [token]);

  const saveLocal = useCallback((r: Row[]) => {
    localStorage.setItem(LS_KEY(token), JSON.stringify(r));
  }, [token]);

  function updateRow(id: string, field: keyof Row, value: string) {
    setRows(prev => {
      const next = prev.map(r => r.id === id ? { ...r, [field]: value } : r);
      saveLocal(next);
      return next;
    });
  }

  function addRow() {
    setRows(prev => {
      const next = [...prev, newRow()];
      saveLocal(next);
      return next;
    });
  }

  function removeRow(id: string) {
    setRows(prev => {
      const next = prev.filter(r => r.id !== id);
      if (next.length === 0) { const r = [newRow()]; saveLocal(r); return r; }
      saveLocal(next);
      return next;
    });
  }

  /* ── Submit manual ── */
  async function submitManual() {
    const filled = rows.filter(r => r.firstName.trim() || r.lastName.trim());
    if (filled.length === 0) { setMessage("יש למלא לפחות שורה אחת"); setStatus("error"); return; }
    setStatus("saving");
    try {
      const res = await fetch(`/api/couple/${token}/guests/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: filled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      localStorage.removeItem(LS_KEY(token));
      setMessage(`${data.imported} אורחים נוספו בהצלחה`);
      setStatus("success");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "שגיאה בשמירה");
      setStatus("error");
    }
  }

  /* ── Submit Excel ── */
  async function submitFile(file: File) {
    setStatus("saving");
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/couple/${token}/guests/import`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setMessage(`${data.imported} אורחים יובאו בהצלחה`);
      setStatus("success");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "שגיאה בייבוא");
      setStatus("error");
    }
  }

  const filledCount = rows.filter(r => r.firstName.trim() || r.lastName.trim()).length;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "'Heebo', sans-serif", paddingBottom: 100 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600&display=swap');
        input::placeholder { color: ${C.muted}; opacity: 0.6; }
        input:focus { outline: none; border-color: ${C.gold} !important; }
        .row-input { background: #fff; border: 1.5px solid ${C.border}; border-radius: 10px; padding: 11px 14px; font-size: 15px; font-family: 'Heebo', sans-serif; color: ${C.dark}; width: 100%; box-sizing: border-box; transition: border-color 0.15s; }
        .tab-btn { padding: 10px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: 'Heebo', sans-serif; font-size: 15px; font-weight: 500; transition: all 0.15s; }
        .drop-zone { border: 2px dashed ${C.border}; border-radius: 16px; padding: 48px 24px; text-align: center; cursor: pointer; transition: all 0.15s; }
        .drop-zone:hover, .drop-zone.active { border-color: ${C.gold}; background: rgba(197,164,109,0.05); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: C.dark, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowRight size={22} />
        </button>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: 0 }}>
          ייבוא רשימת מוזמנים
        </h1>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: C.cream, borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {([["manual","הזנה ידנית"],["excel","העלאת Excel"]] as const).map(([id, label]) => (
            <button key={id} className="tab-btn" onClick={() => { setTab(id); setStatus("idle"); setMessage(""); }}
              style={{ flex: 1, background: tab === id ? "#fff" : "transparent", color: tab === id ? C.dark : C.muted, boxShadow: tab === id ? "0 1px 4px rgba(28,16,8,0.08)" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Status banner */}
        {status === "success" && (
          <div style={{ background: "rgba(74,124,89,0.1)", border: "1px solid rgba(74,124,89,0.3)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <CheckCircle size={20} color={C.success} />
            <p style={{ margin: 0, color: C.success, fontWeight: 500, fontSize: 15 }}>{message}</p>
          </div>
        )}
        {status === "error" && (
          <div style={{ background: "rgba(184,92,56,0.08)", border: "1px solid rgba(184,92,56,0.25)", borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
            <AlertCircle size={20} color={C.error} />
            <p style={{ margin: 0, color: C.error, fontWeight: 500, fontSize: 15 }}>{message}</p>
          </div>
        )}

        {/* ══ MANUAL TAB ══ */}
        {tab === "manual" && (
          <>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              הזינו את פרטי האורחים שלכם. הטיוטה נשמרת אוטומטית — תוכלו לחזור ולהמשיך בכל עת.
            </p>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 44px", gap: 8, padding: "0 0 6px", marginBottom: 4 }}>
              {["שם פרטי", "שם משפחה", "טלפון", ""].map((h, i) => (
                <p key={i} style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.goldText, letterSpacing: "0.04em" }}>{h}</p>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((row) => (
                <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 44px", gap: 8, alignItems: "center" }}>
                  <input className="row-input" placeholder="ישראל" value={row.firstName}
                    onChange={e => updateRow(row.id, "firstName", e.target.value)} />
                  <input className="row-input" placeholder="ישראלי" value={row.lastName}
                    onChange={e => updateRow(row.id, "lastName", e.target.value)} />
                  <input className="row-input" placeholder="050-0000000" value={row.phone} type="tel" dir="ltr"
                    onChange={e => updateRow(row.id, "phone", e.target.value)} />
                  <button onClick={() => removeRow(row.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <button onClick={addRow}
              style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, background: "none", border: `1.5px dashed ${C.border}`, borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: C.goldText, fontSize: 14, fontWeight: 500, width: "100%", justifyContent: "center" }}>
              <Plus size={16} />
              הוסף אורח נוסף
            </button>

            {/* Submit */}
            <button onClick={submitManual} disabled={status === "saving" || filledCount === 0}
              style={{ width: "100%", marginTop: 28, padding: "16px", background: filledCount === 0 ? C.border : C.gold, color: filledCount === 0 ? C.muted : "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: filledCount === 0 ? "default" : "pointer", fontFamily: "'Heebo', sans-serif", boxShadow: filledCount > 0 ? "0 4px 14px rgba(197,164,109,0.38)" : "none", transition: "all 0.15s" }}>
              {status === "saving" ? "שומר..." : `שמירת ${filledCount > 0 ? filledCount : ""} אורחים`}
            </button>

            {filledCount > 0 && status !== "success" && (
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, marginTop: 10 }}>
                הטיוטה שמורה אוטומטית — תוכלו לחזור ולהמשיך בכל עת
              </p>
            )}
          </>
        )}

        {/* ══ EXCEL TAB ══ */}
        {tab === "excel" && (
          <>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              העלו קובץ Excel עם עמודות: <strong>שם פרטי</strong> (או <strong>שם</strong>), <strong>שם משפחה</strong>, <strong>טלפון</strong>.
            </p>

            {/* Template download hint */}
            <div style={{ background: C.cream, borderRadius: 12, padding: "14px 16px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <FileSpreadsheet size={20} color={C.goldText} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: C.dark }}>פורמט הקובץ</p>
                <p style={{ margin: 0, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                  עמודה A: שם פרטי · עמודה B: שם משפחה · עמודה C: טלפון<br/>
                  ניתן גם לשלוח קובץ עם עמודה אחת "שם" עם השם המלא.
                </p>
              </div>
            </div>

            {/* Drop zone */}
            <div className={`drop-zone${dragOver ? " active" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) submitFile(f);
              }}>
              <Upload size={36} color={C.gold} style={{ marginBottom: 14 }} />
              <p style={{ fontWeight: 600, fontSize: 16, color: C.dark, margin: "0 0 6px" }}>
                גררו קובץ לכאן או לחצו לבחירה
              </p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>xlsx · xls · csv</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) submitFile(f); }} />
            </div>

            {status === "saving" && (
              <p style={{ textAlign: "center", color: C.muted, fontSize: 14, marginTop: 20 }}>מייבא אורחים...</p>
            )}
          </>
        )}

        {/* After success — go to guests */}
        {status === "success" && (
          <button onClick={() => router.push(`/couple/${token}/guests`)}
            style={{ width: "100%", marginTop: 20, padding: "15px", background: C.cream, color: C.goldText, border: `1.5px solid ${C.gold}`, borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
            עבור לרשימת האורחים ←
          </button>
        )}
      </div>
    </div>
  );
}
