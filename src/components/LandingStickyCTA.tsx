"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-cta-sentinel");
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .landing-sticky-bar { display: none !important; } }
      `}</style>
      <div
        aria-hidden={!visible}
        className="landing-sticky-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#FDFAF5",
          borderTop: "1px solid #E8E0D4",
          padding: "12px 20px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s ease-out",
        }}
      >
        <Link
          href="/auth/register"
          tabIndex={visible ? 0 : -1}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "52px",
            background: "#C5A46D",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "17px",
            fontWeight: 700,
            fontFamily: "'Heebo', sans-serif",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(197,164,109,0.4)",
          }}
        >
          התחילו עכשיו
        </Link>
      </div>
    </>
  );
}
