"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const eventId = params.get("event_id");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F2EDE3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Heebo, sans-serif" }}>
      <div style={{ textAlign: "center", padding: "2rem", maxWidth: 440 }}>
        <div style={{ fontSize: 64, marginBottom: "1rem" }}>✅</div>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "2rem", fontWeight: 700, color: "#1C1008", marginBottom: "0.5rem" }}>
          התשלום התקבל!
        </h1>
        <p style={{ fontSize: 15, color: "rgba(28,16,8,0.55)", marginBottom: "2rem", lineHeight: 1.7 }}>
          תודה רבה. התשלום עבר בהצלחה ואנחנו מעדכנים את הפרטים במערכת.
        </p>
        <a
          href={eventId ? `/admin?event=${eventId}` : "/admin"}
          style={{ display: "inline-block", padding: "0.75rem 2rem", borderRadius: 12, background: "linear-gradient(135deg,#C5A46D,#9B6E2C)", color: "white", textDecoration: "none", fontWeight: 600, fontSize: 14 }}
        >
          חזרה לניהול ←
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
