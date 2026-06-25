"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", gold: "#C5A46D",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
};

interface ServiceStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  icon?: string;
}

const STATUS_CFG = {
  pending:     { label: "ממתין",       color: "#9CA3AF", bg: "rgba(156,163,175,0.1)",  icon: "○" },
  in_progress: { label: "בתהליך",      color: "#D97706", bg: "rgba(217,119,6,0.1)",    icon: "◐" },
  done:        { label: "הושלם",       color: "#059669", bg: "rgba(5,150,105,0.12)",   icon: "●" },
};

export default function ServiceCenterPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [steps, setSteps] = useState<ServiceStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [coupleNames, setCoupleNames] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/briefing`);
    if (r.ok) {
      const d = await r.json();
      setCoupleNames(d.event?.name ?? "");
      setSteps(d.event?.service_steps ?? []);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const done = steps.filter(s => s.status === "done").length;
  const total = steps.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
            <div>
              <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
              <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>🛎 מרכז שירות</h1>
            </div>
          </div>
          {!loading && total > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(197,164,109,0.65)", marginBottom: 4 }}>
                <span>{done} מתוך {total} שלבים הושלמו</span>
                <span style={{ fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "rgba(197,164,109,0.18)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #C5A46D, #E8D5A8)", borderRadius: 3, transition: "width 0.8s" }} />
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
        ) : steps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <p style={{ fontSize: 52, marginBottom: "0.75rem" }}>🛎</p>
            <p style={{ fontSize: 17, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>הצוות שלנו איתכם</p>
            <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
              כשנתחיל את תהליך הליווי שלכם,<br />
              תוכלו לעקוב אחר כל שלב כאן.
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: "1.5rem", lineHeight: 1.6 }}>
              הצוות שלנו מלווה אתכם לאורך כל הדרך. כאן תוכלו לעקוב אחר התקדמות הליווי.
            </p>
            <div style={{ position: "relative" }}>
              {/* Vertical line */}
              <div style={{ position: "absolute", right: 20, top: 20, bottom: 20, width: 2, background: "rgba(197,164,109,0.18)", zIndex: 0 }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {steps.map((step, i) => {
                  const cfg = STATUS_CFG[step.status] ?? STATUS_CFG.pending;
                  return (
                    <div key={step.id ?? i} style={{ display: "flex", gap: "1rem", position: "relative", zIndex: 1 }}>
                      {/* Status dot */}
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: cfg.bg, border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                        {step.icon ?? cfg.icon}
                      </div>
                      {/* Card */}
                      <div style={{ flex: 1, background: C.card, borderRadius: 14, padding: "0.9rem 1rem", boxShadow: "0 2px 10px rgba(28,16,8,0.06)", border: `1px solid ${step.status === "done" ? "rgba(5,150,105,0.2)" : C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <p style={{ fontWeight: 700, color: C.dark, fontSize: 15 }}>{step.title}</p>
                          <span style={{ padding: "3px 10px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, whiteSpace: "nowrap" }}>
                            {cfg.label}
                          </span>
                        </div>
                        {step.description && (
                          <p style={{ fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 1.55 }}>{step.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact CTA */}
            <div style={{ marginTop: "2rem", background: `linear-gradient(135deg, ${C.dark}, #2C1F0E)`, borderRadius: 18, padding: "1.25rem", textAlign: "center" }}>
              <p style={{ color: "#FDFAF5", fontSize: 15, fontWeight: 700, fontFamily: "Frank Ruhl Libre, serif", marginBottom: "0.4rem" }}>יש שאלה? אנחנו כאן</p>
              <p style={{ color: "rgba(197,164,109,0.7)", fontSize: 13, marginBottom: "1rem" }}>הצוות שלנו זמין עבורכם בכל שלב</p>
              <a href={`https://wa.me/972525000000?text=שלום, אני ${coupleNames} ורציתי לשאול...`} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", background: "#25D366", color: "white", borderRadius: 12, padding: "0.65rem 1.5rem", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                💬 צרו קשר ב-WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
