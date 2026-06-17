"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logs to Vercel Function logs so we can see the real error
    console.error("[admin] RUNTIME ERROR:", error.message, error.stack);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F1E8",
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
          padding: "2rem",
          maxWidth: "640px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(197,164,109,0.12)",
        }}
      >
        <h2
          style={{
            color: "#333",
            fontFamily: "Frank Ruhl Libre, serif",
            marginBottom: "0.5rem",
          }}
        >
          שגיאה בטעינת הניהול
        </h2>
        <p style={{ color: "rgba(51,51,51,0.6)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
          דף הניהול קרס בזמן ריצה. הפרטים הטכניים מטה:
        </p>

        {/* Show the actual error — critical for debugging */}
        <pre
          style={{
            background: "rgba(200,50,50,0.06)",
            border: "1px solid rgba(200,50,50,0.18)",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontSize: "0.75rem",
            color: "rgb(160,40,40)",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            marginBottom: "1.5rem",
            direction: "ltr",
            textAlign: "left",
          }}
        >
          {error.message}
          {"\n\n"}
          {error.stack}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>

        <button
          onClick={reset}
          style={{
            background: "linear-gradient(135deg,#6B7B5A,#3E5435)",
            color: "white",
            border: "none",
            borderRadius: "0.75rem",
            padding: "0.75rem 1.5rem",
            fontFamily: "Heebo, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          נסה שוב
        </button>
      </div>
    </div>
  );
}
