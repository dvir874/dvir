"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push(next);
        router.refresh();
      } else {
        setError("סיסמה שגויה");
      }
    } catch {
      setError("שגיאת רשת, נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)",
        fontFamily: "Heebo, sans-serif",
        direction: "rtl",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#FDFAF5",
          border: "1px solid rgba(197,164,109,0.25)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 12px 48px rgba(197,164,109,0.14)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#C5A46D", textTransform: "uppercase", marginBottom: 8 }}>
            רגע לפני
          </p>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.6rem", fontWeight: 700, color: "#333" }}>
            כניסה לניהול
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6 }}>
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              placeholder="הכנס סיסמה"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                border: error ? "1.5px solid rgba(220,38,38,0.6)" : "1.5px solid rgba(197,164,109,0.3)",
                fontFamily: "Heebo, sans-serif",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "rgb(220,38,38)", fontSize: 12, marginTop: 6 }}>{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: 10,
              border: "none",
              background: loading || !password
                ? "rgba(197,164,109,0.4)"
                : "linear-gradient(135deg,#C5A46D,#B8924A)",
              color: "white",
              fontFamily: "Heebo, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading || !password ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
