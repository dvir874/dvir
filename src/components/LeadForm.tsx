"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

const G = {
  gold:      "#C5A46D",
  goldLight: "#D4BC8A",
  olive:     "#6B7B5A",
  dark:      "#333333",
  border:    "rgba(197,164,109,0.22)",
  bg:        "rgba(253,250,245,0.85)",
};

export default function LeadForm({ source = "hero" }: { source?: string }) {
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [date,  setDate]  = useState("");
  const [state, setState] = useState<State>("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setState("loading");

    try {
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:         name.trim(),
          phone:        phone.trim(),
          wedding_date: date || null,
          source,
        }),
      });

      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  if (state === "success") {
    return (
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl mt-6 w-full max-w-sm"
        style={{ background: "rgba(107,123,90,0.10)", border: `1px solid rgba(107,123,90,0.25)` }}
      >
        <CheckCircle2 size={22} style={{ color: G.olive }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: G.olive, fontFamily: "Heebo, sans-serif" }}>
            קיבלנו! נחזור אליכם תוך שעה 🙌
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(107,123,90,0.70)", fontFamily: "Heebo, sans-serif" }}>
            בינתיים תוכלו לחפש אותנו בוואטסאפ
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 w-full max-w-sm"
      noValidate
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background:  G.bg,
          border:      `1px solid ${G.border}`,
          boxShadow:   "0 8px 32px rgba(197,164,109,0.10)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Label */}
        <div
          className="px-4 py-2.5 border-b text-xs font-semibold tracking-wide"
          style={{
            borderColor:  G.border,
            color:        G.gold,
            fontFamily:   "Heebo, sans-serif",
            background:   "rgba(197,164,109,0.05)",
          }}
        >
          ✦ שמרו לנו מקום — נחזור אליכם תוך שעה
        </div>

        <div className="p-3 space-y-2">
          <input
            type="text"
            placeholder="שם מלא *"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              background:  "rgba(255,255,255,0.80)",
              border:      `1px solid ${G.border}`,
              color:       G.dark,
              fontFamily:  "Heebo, sans-serif",
            }}
            onFocus={e  => (e.target.style.borderColor = G.gold)}
            onBlur={e   => (e.target.style.borderColor = G.border)}
          />
          <input
            type="tel"
            placeholder="מספר טלפון *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              background:  "rgba(255,255,255,0.80)",
              border:      `1px solid ${G.border}`,
              color:       G.dark,
              fontFamily:  "Heebo, sans-serif",
            }}
            onFocus={e  => (e.target.style.borderColor = G.gold)}
            onBlur={e   => (e.target.style.borderColor = G.border)}
          />
          <input
            type="text"
            placeholder="תאריך החתונה (אופציונלי)"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
            style={{
              background:  "rgba(255,255,255,0.80)",
              border:      `1px solid ${G.border}`,
              color:       G.dark,
              fontFamily:  "Heebo, sans-serif",
            }}
            onFocus={e  => (e.target.style.borderColor = G.gold)}
            onBlur={e   => (e.target.style.borderColor = G.border)}
          />

          <button
            type="submit"
            disabled={state === "loading" || !name.trim() || !phone.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:  `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`,
              color:       "white",
              fontFamily:  "Heebo, sans-serif",
              boxShadow:   "0 4px 16px rgba(197,164,109,0.30)",
            }}
          >
            {state === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {state === "loading" ? "שולח..." : "שמרו לי מקום"}
          </button>
        </div>
      </div>

      {state === "error" && (
        <p className="text-xs mt-2 text-center" style={{ color: "#b94040", fontFamily: "Heebo, sans-serif" }}>
          משהו השתבש — נסו שוב או כתבו לנו בוואטסאפ
        </p>
      )}
    </form>
  );
}
