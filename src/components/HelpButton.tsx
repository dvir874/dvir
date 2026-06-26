"use client";

import { useState } from "react";

const C = {
  gold: "#C5A46D", dark: "#1C1008", card: "#FFFFFF",
  border: "rgba(197,164,109,0.20)", muted: "rgba(28,16,8,0.55)",
};

const CATEGORIES = ["לוגיסטיקה", "ספקים", "הושבה", "תקציב", "אורחים", "עיצוב", "תכנון", "אחר"];

export default function HelpButton({ token }: { token: string }) {
  const [open, setOpen]       = useState(false);
  const [category, setCategory] = useState("");
  const [title, setTitle]     = useState("");
  const [desc, setDesc]       = useState("");
  const [status, setStatus]   = useState<"idle"|"sending"|"done">("idle");

  async function submit() {
    if (!category || !title.trim()) return;
    setStatus("sending");
    try {
      await fetch(`/api/couple/${token}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title: title.trim(), description: desc.trim() || undefined }),
      });
      setStatus("done");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
        setCategory("");
        setTitle("");
        setDesc("");
      }, 2200);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="צריכים עזרה?"
        style={{
          position: "fixed", bottom: 80, right: 16, zIndex: 200,
          background: C.dark, color: "#fff", border: "none",
          borderRadius: 999, padding: "0.65rem 1.1rem",
          fontFamily: "'Heebo',sans-serif", fontWeight: 700, fontSize: 13,
          boxShadow: "0 4px 20px rgba(28,16,8,0.30)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "0.35rem",
        }}
      >
        💬 עזרה?
      </button>

      {/* Bottom-sheet overlay */}
      {open && (
        <div
          dir="rtl"
          style={{
            position: "fixed", inset: 0, background: "rgba(28,16,8,0.50)",
            zIndex: 250, display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: C.card, borderRadius: "20px 20px 0 0",
              padding: "1.5rem", width: "100%", maxWidth: 520,
              fontFamily: "'Heebo',sans-serif",
            }}
            onClick={e => e.stopPropagation()}
          >
            {status === "done" ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <div style={{ fontSize: 40, marginBottom: "0.5rem" }}>✅</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: C.dark }}>נשלח! נחזור אליכם תוך 24 שעות</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 700, fontSize: 18, color: C.dark, margin: "0 0 1rem" }}>
                  צריכים עזרה? 🙋
                </h3>

                {/* Category chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "0.35rem 0.9rem", borderRadius: 999, fontSize: 13, cursor: "pointer",
                        border: `1.5px solid ${category === cat ? C.gold : C.border}`,
                        background: category === cat ? C.gold : "transparent",
                        color: category === cat ? "#fff" : C.muted,
                        fontWeight: category === cat ? 700 : 400,
                        fontFamily: "inherit",
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="נושא הבקשה (חובה)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{
                    width: "100%", padding: "0.65rem 0.75rem", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, fontSize: 14,
                    fontFamily: "inherit", marginBottom: "0.75rem", boxSizing: "border-box",
                  }}
                />
                <textarea
                  placeholder="פרטים נוספים (אופציונלי)"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%", padding: "0.65rem 0.75rem", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, fontSize: 14, resize: "none",
                    fontFamily: "inherit", marginBottom: "1rem", boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={submit}
                  disabled={status === "sending" || !category || !title.trim()}
                  style={{
                    width: "100%", background: C.gold, color: "#fff", border: "none",
                    borderRadius: 10, padding: "0.8rem", fontWeight: 700, fontSize: 15,
                    cursor: status === "sending" ? "wait" : "pointer",
                    opacity: (!category || !title.trim()) ? 0.5 : 1,
                    fontFamily: "inherit",
                  }}
                >
                  {status === "sending" ? "שולח..." : "שלחו בקשה"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
