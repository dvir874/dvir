"use client";

import { use, useEffect, useState, useCallback } from "react";
import { Settings, ArrowLeft, Loader2, Unlock } from "lucide-react";

const C = {
  ivory:   "#FDFAF5",
  cream:   "#F6F1E8",
  gold:    "#C5A46D",
  goldText:"#8B6914",
  dark:    "#1C1008",
  muted:   "rgba(28,16,8,0.52)",
  border:  "#E8E0D4",
} as const;

interface CapsuleMessage {
  id: string;
  guest_name: string;
  message_type: string;
  content: string | null;
  unlock_years: number;
  unlock_at: string;
  unlocked: boolean;
  daysToUnlock: number;
  created_at: string;
}

const TYPE_EMOJI: Record<string, string> = {
  advice: "💎", blessing: "💛", story: "📖", prediction: "🔮",
};

function PadlockSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="28" cy="28" r="28" fill={C.cream} />
      <rect x="17" y="26" width="22" height="16" rx="4" fill="none" stroke={C.gold} strokeWidth="2" />
      <path d="M21 26V21a7 7 0 0 1 14 0v5" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
      <circle cx="28" cy="34" r="2.5" fill={C.gold} />
    </svg>
  );
}

export default function CapsulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token }      = use(params);
  const [items,        setItems]       = useState<CapsuleMessage[]>([]);
  const [loading,      setLoading]     = useState(true);
  const [weddingDate,  setWeddingDate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const evRes = await fetch(`/api/couple/${token}/briefing`);
    const ev    = await evRes.json();
    if (ev.event?.date) setWeddingDate(new Date(ev.event.date));

    const vtRes = await fetch(`/api/memory/vault-token?couple_token=${token}`);
    const vt    = await vtRes.json();
    if (!vt.token) { setLoading(false); return; }

    const res  = await fetch(`/api/memory/${vt.token}/capsule?couple=1`);
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const locked   = items.filter(m => !m.unlocked);
  const unlocked = items.filter(m => m.unlocked);

  const unlockDate = weddingDate
    ? new Date(weddingDate.getFullYear() + 1, weddingDate.getMonth(), weddingDate.getDate())
    : null;
  const daysToUnlock = unlockDate
    ? Math.max(0, Math.ceil((unlockDate.getTime() - Date.now()) / 86_400_000))
    : 0;

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark, paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <Settings size={20} style={{ color: C.muted, cursor: "pointer" }} />
        <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 16, color: C.goldText }}>
          קפסולת הזמן
        </span>
        <a href={`/couple/${token}`} style={{ color: C.muted, textDecoration: "none", display: "flex" }}>
          <ArrowLeft size={20} />
        </a>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px" }}>

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <Loader2 size={28} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.4s ease" }}>

            {/* Hero */}
            <div style={{ textAlign: "center", padding: "40px 0 28px" }}>
              <div style={{ marginBottom: 20, display: "inline-block" }}>
                <PadlockSVG />
              </div>
              <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 24, color: C.dark, marginBottom: 6 }}>
                קפסולת הזמן שלכם ❤️
              </h1>
              <p style={{ fontSize: 14, color: C.muted, fontWeight: 300 }}>
                {items.length > 0
                  ? `${locked.length} ברכות נשמרו בפנים`
                  : "אורחים כתבו לכם הודעות שיתגלו בעתיד"}
              </p>
            </div>

            {/* Countdown card */}
            {locked.length > 0 && unlockDate && (
              <div style={{ background: C.cream, borderRadius: 20, padding: "24px", border: `1px solid ${C.border}`, marginBottom: 28, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>
                  הייפתח בעוד
                </p>
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 56, color: C.goldText, lineHeight: 1, marginBottom: 4 }}>
                  {daysToUnlock}
                </p>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 12 }}>ימים</p>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 300 }}>
                  {unlockDate.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 && (
              <div style={{ textAlign: "center", padding: "12px 0 32px" }}>
                <p style={{ fontSize: 32, marginBottom: 12 }}>🕰️</p>
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, color: C.dark, marginBottom: 6 }}>עדיין אין הודעות</p>
                <p style={{ fontSize: 14, color: C.muted, fontWeight: 300 }}>שתפו את האורחים בקישור להשארת הודעה לעתיד</p>
              </div>
            )}

            {/* Unlocked messages */}
            {unlocked.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Unlock size={14} style={{ color: C.gold }} />
                  <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 15, color: C.goldText, fontWeight: 700 }}>נפתחו!</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {unlocked.map(m => (
                    <div key={m.id} style={{ padding: "16px", borderRadius: 16, background: C.cream, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>{TYPE_EMOJI[m.message_type] ?? "💌"}</span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{m.guest_name}</p>
                          <p style={{ fontSize: 11, color: C.muted }}>{new Date(m.created_at).toLocaleDateString("he-IL")}</p>
                        </div>
                      </div>
                      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, lineHeight: 1.7, color: C.dark }}>
                        &ldquo;{m.content}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked items — blurred preview (security: gibberish only, never real content) */}
            {locked.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span>🔒</span>
                  <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 15, color: C.dark, fontWeight: 700 }}>ממתינים לפתיחה</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {locked.map(m => (
                    <div key={m.id} style={{ padding: "14px 16px", borderRadius: 16, background: C.cream, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.ivory, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                        {TYPE_EMOJI[m.message_type] ?? "💌"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: C.dark, marginBottom: 4 }}>{m.guest_name}</p>
                        {/* Security: placeholder chars only — never actual content in DOM */}
                        <p aria-hidden="true" style={{ fontSize: 12, color: C.muted, overflow: "hidden", whiteSpace: "nowrap", filter: "blur(3.5px)", userSelect: "none" }}>
                          {"א".repeat(28)}
                        </p>
                      </div>
                      <span style={{ fontSize: 12, color: C.muted, flexShrink: 0, fontWeight: 300 }}>
                        {m.daysToUnlock > 0 ? `${m.daysToUnlock} ימים` : "נפתח בקרוב"}
                      </span>
                    </div>
                  ))}
                </div>
                {locked.length > 3 && (
                  <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 16, fontWeight: 300 }}>
                    ועוד {locked.length - 3} הפתעות נוספות...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
