"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", gold: "#C5A46D", dark: "#1C1008",
  muted: "rgba(28,16,8,0.55)", border: "rgba(197,164,109,0.20)",
  card: "#FFFFFF", shadow: "0 4px 24px rgba(28,16,8,0.09)",
};

interface Guest { id: string; name: string; phone: string; guest_count: number; status: string; side?: string; table_number?: number | null }
interface Task { id: string; title: string; category: string; completed: boolean; due_date?: string | null }
interface BudgetItem { id: string; category: string; description: string; planned_amount: number; actual_amount: number; status: string }
interface Table { id: string; name: string; number: number; capacity: number }

export default function PrintCenterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [printing, setPrinting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/briefing`);
    if (!r.ok) return;
    const d = await r.json();
    const eid = d.event?.id;
    setEventName(d.eventName ?? "");
    setEventId(eid ?? null);

    if (eid) {
      const [gRes, tRes, bRes, tbRes] = await Promise.all([
        fetch(`/api/couple/${token}/guests`),
        fetch(`/api/couple/${token}/tasks`),
        fetch(`/api/budget?event_id=${eid}`),
        fetch(`/api/seating-tables?event_id=${eid}`),
      ]);
      if (gRes.ok) setGuests(await gRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (bRes.ok) setBudget(await bRes.json());
      if (tbRes.ok) setTables(await tbRes.json());
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  function printSection(id: string) {
    setPrinting(id);
    setTimeout(() => {
      window.print();
      setPrinting(null);
    }, 100);
  }

  const confirmed = guests.filter(g => g.status === "confirmed");
  const totalBudget = budget.reduce((s, b) => s + (b.planned_amount ?? 0), 0);
  const totalActual = budget.reduce((s, b) => s + (b.actual_amount ?? 0), 0);

  const DOWNLOADS = [
    {
      id: "guests",
      icon: "👥",
      title: "רשימת האורחים",
      sub: `${guests.length} אורחים סה"כ · ${confirmed.length} מאושרים`,
      available: guests.length > 0,
    },
    {
      id: "seating",
      icon: "🪑",
      title: "סידורי ההושבה",
      sub: `${tables.length} שולחנות · ${confirmed.length} מאושרים`,
      available: tables.length > 0,
    },
    {
      id: "tasks",
      icon: "📋",
      title: "רשימת המשימות",
      sub: `${tasks.filter(t => !t.completed).length} משימות פתוחות`,
      available: tasks.length > 0,
    },
    {
      id: "budget",
      icon: "💰",
      title: "תקציב האירוע",
      sub: `${totalActual.toLocaleString("he-IL")} ₪ שולם מתוך ${totalBudget.toLocaleString("he-IL")} ₪`,
      available: budget.length > 0,
    },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: "4rem" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-section { display: block !important; page-break-after: always; }
          body { background: white; font-family: Heebo, sans-serif; direction: rtl; }
        }
        .print-section { display: none; }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
          <div>
            <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
            <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>🖨️ מרכז הדפסה</h1>
          </div>
        </div>
      </div>

      <div className="no-print" style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: "1.5rem", lineHeight: 1.7 }}>
          הורידו כל מסמך כ-PDF או הדפיסו ישירות מהדפדפן.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {DOWNLOADS.map(d => (
            <div key={d.id} style={{ background: C.card, borderRadius: "1rem", border: `1px solid ${C.border}`, padding: "1.1rem 1.25rem", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: "1rem", opacity: d.available ? 1 : 0.5 }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: C.dark, fontSize: 15, marginBottom: 2 }}>{d.title}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{d.sub}</p>
              </div>
              <button
                disabled={!d.available || printing === d.id}
                onClick={() => printSection(d.id)}
                style={{ padding: "0.55rem 1.1rem", borderRadius: 10, background: d.available ? `linear-gradient(135deg, ${C.gold}, #9B7A42)` : "rgba(197,164,109,0.15)", border: "none", color: d.available ? "white" : C.muted, fontSize: 13, fontWeight: 700, cursor: d.available ? "pointer" : "not-allowed", whiteSpace: "nowrap" }}>
                {printing === d.id ? "מכין..." : "🖨️ הדפס"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Print Sections — hidden on screen, shown on print */}
      {printing === "guests" && (
        <div className="print-section" style={{ padding: "2rem" }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, marginBottom: "0.5rem" }}>👥 רשימת אורחים — {eventName}</h1>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>{new Date().toLocaleDateString("he-IL")}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "right" }}>שם</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "right" }}>טלפון</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>מוזמנים</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>סטטוס</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>שולחן</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => (
                <tr key={g.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd" }}>{g.name}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd" }}>{g.phone}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{g.guest_count}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{g.status === "confirmed" ? "✅" : g.status === "declined" ? "❌" : "⏳"}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{g.table_number ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {printing === "seating" && (
        <div className="print-section" style={{ padding: "2rem" }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, marginBottom: "0.5rem" }}>🪑 סידורי הושבה — {eventName}</h1>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>{new Date().toLocaleDateString("he-IL")}</p>
          {tables.map(t => {
            const seated = confirmed.filter(g => g.table_number === t.number);
            return (
              <div key={t.id} style={{ marginBottom: "1.5rem", pageBreakInside: "avoid" }}>
                <h2 style={{ fontSize: 16, marginBottom: "0.5rem" }}>שולחן {t.number} — {t.name} (קיבולת: {t.capacity})</h2>
                <ul style={{ paddingRight: "1.5rem" }}>{seated.map(g => <li key={g.id} style={{ marginBottom: 2 }}>{g.name} ({g.guest_count})</li>)}</ul>
                {seated.length === 0 && <p style={{ color: "#999", fontSize: 13 }}>אין מושבים שובצו</p>}
              </div>
            );
          })}
        </div>
      )}

      {printing === "tasks" && (
        <div className="print-section" style={{ padding: "2rem" }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, marginBottom: "0.5rem" }}>📋 משימות — {eventName}</h1>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>{new Date().toLocaleDateString("he-IL")}</p>
          {["done", "pending"].map(st => (
            <div key={st} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 16, marginBottom: "0.75rem" }}>{st === "done" ? "✅ הושלמו" : "⏳ פתוחות"}</h2>
              {tasks.filter(t => (t.completed ? "done" : "pending") === st).map(t => (
                <p key={t.id} style={{ marginBottom: 4, paddingRight: "0.75rem", fontSize: 14 }}>
                  {t.completed ? "☑" : "☐"} {t.title}{t.due_date ? ` — ${new Date(t.due_date).toLocaleDateString("he-IL")}` : ""}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {printing === "budget" && (
        <div className="print-section" style={{ padding: "2rem" }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, marginBottom: "0.5rem" }}>💰 תקציב — {eventName}</h1>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>{new Date().toLocaleDateString("he-IL")}</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "right" }}>קטגוריה</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "right" }}>תיאור</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>מתוכנן</th>
                <th style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>בפועל</th>
              </tr>
            </thead>
            <tbody>
              {budget.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd" }}>{b.category}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd" }}>{b.description}</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{(b.planned_amount ?? 0).toLocaleString("he-IL")} ₪</td>
                  <td style={{ padding: "7px 12px", border: "1px solid #ddd", textAlign: "center" }}>{(b.actual_amount ?? 0).toLocaleString("he-IL")} ₪</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700, background: "#f0ece4" }}>
                <td colSpan={2} style={{ padding: "8px 12px", border: "1px solid #ddd" }}>סה"כ</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>{totalBudget.toLocaleString("he-IL")} ₪</td>
                <td style={{ padding: "8px 12px", border: "1px solid #ddd", textAlign: "center" }}>{totalActual.toLocaleString("he-IL")} ₪</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
