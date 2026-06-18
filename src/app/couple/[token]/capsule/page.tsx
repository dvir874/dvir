"use client";

import { use, useEffect, useState, useCallback } from "react";
import { ArrowRight, Lock, Unlock, Loader2, Heart } from "lucide-react";

const C = {
  cream: "#F6F1E8", ivory: "#FDFAF5", gold: "#C5A46D",
  olive: "#6B7B5A", dark: "#333333", muted: "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

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

const TYPE_LABELS: Record<string, string> = {
  advice: "עצה", blessing: "ברכה", story: "סיפור", prediction: "תחזית",
};
const TYPE_EMOJI: Record<string, string> = {
  advice: "💎", blessing: "💛", story: "📖", prediction: "🔮",
};

export default function CapsulePage({ params }: { params: Promise<{ token: string }> }) {
  const { token }   = use(params);
  const [items,     setItems]   = useState<CapsuleMessage[]>([]);
  const [loading,   setLoading] = useState(true);
  const [eventName, setEventName] = useState("");

  const load = useCallback(async () => {
    // We need the vault token from the couple token — fetch via briefing
    const evRes = await fetch(`/api/couple/${token}/briefing`);
    const ev    = await evRes.json();
    if (ev.eventName) setEventName(ev.eventName);

    // Get vault token for this event
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

  const byYear = locked.reduce<Record<number, CapsuleMessage[]>>((acc, m) => {
    (acc[m.unlock_years] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: `linear-gradient(160deg, #1a0f0a 0%, #2d1a12 50%, #1a0f0a 100%)`, fontFamily: "Heebo, sans-serif", color: "white" }}>

      {/* Header */}
      <div style={{ padding: "2rem 1.5rem 1.5rem" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <a href={`/couple/${token}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(197,164,109,0.7)", textDecoration: "none", fontSize: 13, marginBottom: "1.5rem" }}>
            <ArrowRight size={14} />חזרה ללוח הבקרה
          </a>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(197,164,109,0.12)", border: "1px solid rgba(197,164,109,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <Lock size={28} style={{ color: C.gold }} />
            </div>
            <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1.5rem,5vw,2rem)", fontWeight: 700, marginBottom: "0.5rem" }}>
              כמוסת הזמן שלכם
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.5 }}>
              אורחים כתבו לכם הודעות שיתגלו בעתיד.
              {items.length > 0 && ` ${items.length} הודעות ממתינות.`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 1rem 4rem" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Loader2 size={28} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <Heart size={40} style={{ color: "rgba(197,164,109,0.3)", margin: "0 auto 1rem" }} />
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              עדיין אין הודעות
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
              שתפו את האורחים בקישור להשארת הודעה לעתיד
            </p>
          </div>
        )}

        {/* Unlocked messages */}
        {unlocked.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
              <Unlock size={14} style={{ color: C.gold }} />
              <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", color: C.gold, margin: 0 }}>נפתח!</h2>
              <div style={{ flex: 1, height: 1, background: "rgba(197,164,109,0.15)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {unlocked.map((m) => (
                <div key={m.id} style={{ padding: "1.25rem", borderRadius: "1.25rem", background: "rgba(197,164,109,0.08)", border: "1px solid rgba(197,164,109,0.25)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
                    <span style={{ fontSize: 20 }}>{TYPE_EMOJI[m.message_type] ?? "💌"}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "white" }}>{m.guest_name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{TYPE_LABELS[m.message_type]} · נכתב ב-{new Date(m.created_at).toLocaleDateString("he-IL")}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
                    &ldquo;{m.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked by year */}
        {[1, 5, 10].map((years) => {
          const group = byYear[years];
          if (!group?.length) return null;
          const sampleItem = group[0];
          const unlockDate = new Date(sampleItem.unlock_at).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
          return (
            <div key={years} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
                <Lock size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                  נפתח ב-{unlockDate} ({years} {years === 1 ? "שנה" : "שנים"})
                </h2>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {group.map((m) => (
                  <div key={m.id} style={{ padding: "1rem 1.25rem", borderRadius: "1.25rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Lock size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{m.guest_name}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                        {TYPE_LABELS[m.message_type]} · {m.daysToUnlock} ימים עד הפתיחה
                      </p>
                    </div>
                    <span style={{ fontSize: 20 }}>{TYPE_EMOJI[m.message_type] ?? "💌"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Stats */}
        {items.length > 0 && (
          <div style={{ marginTop: "2rem", padding: "1.25rem", borderRadius: "1.25rem", background: "rgba(197,164,109,0.05)", border: "1px solid rgba(197,164,109,0.12)", textAlign: "center" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: C.gold }}>{items.length}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>הודעות נשמרו לכם מהאורחים</p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "0.75rem" }}>
              {[1, 5, 10].map(y => {
                const count = (byYear[y] ?? []).length;
                if (!count) return null;
                return <div key={y}><p style={{ fontSize: 16, fontWeight: 700, color: "white" }}>{count}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>לעוד {y} {y === 1 ? "שנה" : "שנים"}</p></div>;
              })}
              {unlocked.length > 0 && <div><p style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{unlocked.length}</p><p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>נפתחו</p></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
