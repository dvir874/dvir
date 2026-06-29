"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  label, value, onChange, type = "text", autoComplete, error, onBlur,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; error?: string; onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div style={{ position: "relative", marginBottom: error ? 4 : 16 }}>
      <label style={{
        position: "absolute", right: 14,
        top: focused || filled ? 6 : "50%",
        transform: focused || filled ? "none" : "translateY(-50%)",
        fontSize: focused || filled ? 10 : 14,
        color: error ? "#B03030" : focused ? C.gold : C.muted,
        transition: "all 0.2s", pointerEvents: "none",
        fontFamily: "Heebo, sans-serif", fontWeight: 300, zIndex: 1,
      }}>
        {label}
      </label>
      <input
        type={type} value={value} autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: filled || focused ? "22px 16px 8px" : "16px",
          borderRadius: 20,
          border: `1.5px solid ${error ? "#B03030" : focused ? C.gold : "transparent"}`,
          background: C.cream, color: C.dark,
          fontFamily: "Heebo, sans-serif", fontSize: 16,
          outline: "none", transition: "border-color 0.2s",
          boxShadow: "0 1px 4px rgba(28,16,8,0.06)",
        }}
      />
      {error && <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 11, color: "#B03030", margin: "4px 0 12px 4px" }}>{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateField(field: string, val: string) {
    setFieldErrors(prev => {
      const next = { ...prev };
      if (field === "brideName" && val.length < 2) next.brideName = "שם חובה";
      else if (field === "brideName") delete next.brideName;
      if (field === "groomName" && val.length < 2) next.groomName = "שם חובה";
      else if (field === "groomName") delete next.groomName;
      if (field === "email" && val && !val.includes("@")) next.email = "כתובת אימייל לא תקינה";
      else if (field === "email") delete next.email;
      if (field === "password" && val.length > 0 && val.length < 6) next.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
      else if (field === "password") delete next.password;
      return next;
    });
  }

  const canSubmit = brideName.length >= 2 && groomName.length >= 2 && email.includes("@") && password.length >= 6 && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ bride_name: brideName, groom_name: groomName, email, password }),
      });
      const data = await res.json();
      if (res.status === 409) throw new Error("כתובת האימייל הזו כבר רשומה. רוצים להתחבר?");
      if (!res.ok) throw new Error(data.error || "שגיאה ביצירת החשבון");
      router.replace(`/couple/${data.couple_token}/onboarding`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה לא צפויה");
      setSaving(false);
    }
  }

  async function handleGoogle() {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  }

  const previewName = (brideName || groomName)
    ? `חתונת ${brideName}${brideName && groomName ? " ו" : ""}${groomName}`
    : null;

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "Heebo, sans-serif" }}>
      <style>{CSS}</style>

      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 20, color: C.gold, marginBottom: 32, letterSpacing: "0.05em" }}>רגע לפני</p>

      <div style={{ width: "100%", maxWidth: 480, background: C.ivory, borderRadius: 20, padding: "2rem 1.5rem", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(28,16,8,0.06)", animation: "fadeUp 0.4s ease both" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 8px", textAlign: "center" }}>
          ספרו לנו עליכם
        </h1>
        <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 24px" }}>
          צרו את החשבון החתונה שלכם
        </p>

        {/* Form */}
        <form aria-label="יצירת חשבון" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <FloatingLabelInput
            label="שם הכלה" value={brideName} onChange={setBrideName}
            autoComplete="given-name" error={fieldErrors.brideName}
            onBlur={() => validateField("brideName", brideName)}
          />
          <FloatingLabelInput
            label="שם החתן" value={groomName} onChange={setGroomName}
            autoComplete="given-name" error={fieldErrors.groomName}
            onBlur={() => validateField("groomName", groomName)}
          />
          <FloatingLabelInput
            label="כתובת אימייל" type="email" value={email} onChange={setEmail}
            autoComplete="email" error={fieldErrors.email}
            onBlur={() => validateField("email", email)}
          />
          <div style={{ position: "relative" }}>
            <FloatingLabelInput
              label="סיסמה (לפחות 6 תווים)" type={showPw ? "text" : "password"}
              value={password} onChange={setPassword}
              autoComplete="new-password" error={fieldErrors.password}
              onBlur={() => validateField("password", password)}
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: "absolute", left: 14, top: 14, background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center" }}
              aria-label={showPw ? "הסתר סיסמה" : "הצג סיסמה"}>
              {showPw
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>

          {/* Live preview */}
          {previewName && (
            <div style={{ background: C.cream, border: `1.5px solid ${C.gold}`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, textAlign: "center" }}>
              <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 20, color: C.goldText, margin: 0 }}>
                {previewName}
              </p>
            </div>
          )}

          {error && (
            <div role="alert" aria-live="assertive" style={{ background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: "#B03030", margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={!canSubmit}
            style={{
              width: "100%", padding: "1rem", borderRadius: 14, border: "none",
              background: canSubmit ? `linear-gradient(135deg, ${C.gold}, #D4BC8A)` : "rgba(197,164,109,0.3)",
              color: "#fff", fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700,
              fontSize: 17, cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit ? "0 6px 24px rgba(197,164,109,0.35)" : "none",
              minHeight: 52, marginBottom: 16,
            }}>
            {saving ? "יוצרים..." : "הצטרפו ←"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 14px" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>או</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12, marginBottom: 16,
            border: `1px solid ${C.border}`, background: "#fff", color: C.dark,
            fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 15,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <GoogleIcon />
          התחברו עם Google
        </button>

        <p style={{ textAlign: "center", fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, margin: 0 }}>
          יש לכם חשבון?{" "}
          <Link href="/auth/login" style={{ color: C.goldText, textDecoration: "none", fontWeight: 600 }}>
            התחברו
          </Link>
        </p>
      </div>
    </div>
  );
}
