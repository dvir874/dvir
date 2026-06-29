"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  label, value, onChange, type = "text", autoComplete, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; autoComplete?: string; error?: string;
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
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: filled || focused ? "22px 14px 8px" : "14px",
          borderRadius: 12,
          border: `1.5px solid ${error ? "#B03030" : focused ? C.gold : C.border}`,
          background: C.ivory, color: C.dark,
          fontFamily: "Heebo, sans-serif", fontSize: 16,
          outline: "none", transition: "border-color 0.2s",
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

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(
    errorParam === "callback_failed" ? "הכניסה דרך Google נכשלה. נסו שוב." : null
  );
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPw, setShowPw] = useState(false);

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email.includes("@")) errs.email = "כתובת אימייל לא תקינה";
    if (!password) errs.password = "סיסמה חובה";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);

      // Find this user's event
      const res = await fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });
      const me = await res.json();
      if (me?.couple_token) {
        router.replace(`/couple/${me.couple_token}`);
      } else {
        router.replace("/auth/register");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "שגיאה לא צפויה";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("credentials")) {
        setError("האימייל או הסיסמה שגויים.");
      } else {
        setError(msg);
      }
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

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.5rem", fontFamily: "Heebo, sans-serif" }}>
      <style>{CSS}</style>

      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 20, color: C.gold, marginBottom: 32, letterSpacing: "0.05em" }}>רגע לפני</p>

      <div style={{ width: "100%", maxWidth: 480, background: C.ivory, borderRadius: 20, padding: "2rem 1.5rem", border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(28,16,8,0.06)", animation: "fadeUp 0.4s ease both" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 8px", textAlign: "center" }}>
          כניסה לחשבון
        </h1>
        <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, textAlign: "center", margin: "0 0 24px" }}>
          ברוכים השבים ❤️
        </p>

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
          כניסה עם Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 12, color: C.muted }}>— או —</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Form */}
        <form aria-label="כניסה לחשבון" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <FloatingLabelInput label="כתובת אימייל" type="email" value={email} onChange={setEmail} autoComplete="email" error={fieldErrors.email} />
          <div style={{ position: "relative" }}>
            <FloatingLabelInput label="סיסמה" type={showPw ? "text" : "password"} value={password} onChange={setPassword} autoComplete="current-password" error={fieldErrors.password} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              style={{ position: "absolute", left: 14, top: 14, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 12, fontFamily: "Heebo, sans-serif" }}>
              {showPw ? "הסתר" : "הצג"}
            </button>
          </div>

          {error && (
            <div role="alert" style={{ background: "rgba(220,50,50,0.08)", border: "1px solid rgba(220,50,50,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <p style={{ fontFamily: "Heebo, sans-serif", fontSize: 13, color: "#B03030", margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            style={{
              width: "100%", padding: "1rem", borderRadius: 14, border: "none",
              background: saving ? "rgba(197,164,109,0.3)" : `linear-gradient(135deg, ${C.gold}, #D4BC8A)`,
              color: "#fff", fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700,
              fontSize: 17, cursor: saving ? "not-allowed" : "pointer",
              boxShadow: saving ? "none" : "0 6px 24px rgba(197,164,109,0.35)",
              minHeight: 52, marginBottom: 16,
            }}>
            {saving ? "נכנסים..." : "כניסה"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, margin: 0 }}>
          אין לכם עדיין חשבון?{" "}
          <Link href="/auth/register" style={{ color: C.goldText, textDecoration: "none", fontWeight: 600 }}>
            הרשמו כאן
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
