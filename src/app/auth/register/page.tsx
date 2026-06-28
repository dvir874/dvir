"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  border:   "#E8E0D4",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
`;

function FloatingLabelInput({
  label, value, onChange, type = "text", autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: 16 }}>
      <label style={{
        position: "absolute", right: 14,
        top: focused || filled ? 6 : "50%",
        transform: focused || filled ? "none" : "translateY(-50%)",
        fontSize: focused || filled ? 10 : 14,
        color: focused ? C.gold : C.muted,
        transition: "all 0.2s",
        pointerEvents: "none",
        fontFamily: "Heebo, sans-serif", fontWeight: 300,
        zIndex: 1,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: filled || focused ? "22px 14px 8px" : "14px",
          borderRadius: 12,
          border: `1.5px solid ${focused ? C.gold : C.border}`,
          background: C.ivory, color: C.dark,
          fontFamily: "Heebo, sans-serif", fontSize: 16,
          outline: "none", transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [email,     setEmail]     = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const canSubmit = brideName.length >= 2 && groomName.length >= 2 && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bride_name: brideName, groom_name: groomName, email: email || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "שגיאה ביצירת החשבון");
      router.replace(`/couple/${data.couple_token}/onboarding`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה לא צפויה");
      setSaving(false);
    }
  }

  const previewName = (brideName || groomName)
    ? `חתונת ${brideName}${brideName && groomName ? " ו" : ""}${groomName}`
    : null;

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "Heebo, sans-serif" }}>
      <style>{CSS}</style>

      {/* Wordmark */}
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 20, color: C.gold, marginBottom: 32, letterSpacing: "0.05em" }}>רגע לפני</p>

      <div style={{ width: "100%", maxWidth: 480, background: C.ivory, borderRadius: 20, padding: "2rem 1.5rem", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(28,16,8,0.06)", animation: "fadeUp 0.4s ease both" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 8px", textAlign: "center" }}>
          בואו נתחיל
        </h1>
        <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 28px" }}>
          כמה פרטים ואתם בפנים
        </p>

        <FloatingLabelInput label="שם הכלה"        value={brideName} onChange={setBrideName} autoComplete="given-name" />
        <FloatingLabelInput label="שם החתן"         value={groomName} onChange={setGroomName} autoComplete="given-name" />
        <FloatingLabelInput label="כתובת אימייל (אופציונלי)" type="email" value={email} onChange={setEmail} autoComplete="email" />

        {/* Live preview */}
        {previewName && (
          <div style={{ background: C.cream, border: `1.5px solid ${C.gold}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 20, color: C.goldText, margin: 0 }}>
              {previewName}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
            <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: "#B03030", margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%", padding: "1rem",
            borderRadius: 14,
            background: canSubmit ? `linear-gradient(135deg, ${C.gold}, #D4BC8A)` : "rgba(197,164,109,0.3)",
            border: "none", color: "#fff",
            fontFamily: "Frank Ruhl Libre, serif",
            fontSize: 17, fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            boxShadow: canSubmit ? "0 6px 24px rgba(197,164,109,0.35)" : "none",
            minHeight: 52, marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {saving ? "יוצרים את החשבון..." : "יאללה נתחיל 💍"}
        </button>

        <p style={{ textAlign: "center", fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, margin: 0 }}>
          כבר יש לכם קישור?{" "}
          <Link href="/couple" style={{ color: C.goldText, textDecoration: "none", fontWeight: 600 }}>
            כנסו דרכו
          </Link>
        </p>
      </div>
    </div>
  );
}
