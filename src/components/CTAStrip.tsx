"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { WA_URL } from "@/lib/constants";

export default function CTAStrip() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ padding: "5rem 1rem" }}
    >
      {/* Rich background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg,#3E5435 0%,#6B7B5A 50%,#4A5E3A 100%)",
        }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      {/* Gold bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(197,164,109,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="container-max mx-auto relative z-10 text-center">
        <div
          className={`transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-7">
            <span className="w-16 h-px bg-gradient-to-l from-gold/60 to-transparent" />
            <span className="text-gold/80 text-lg">✦</span>
            <span className="w-16 h-px bg-gradient-to-r from-gold/60 to-transparent" />
          </div>

          <h2
            className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-4 leading-snug"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            מוכנים להתחיל לנשום?
          </h2>
          <p
            className="text-white/65 text-base md:text-lg mb-10 max-w-md mx-auto leading-relaxed"
            style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300 }}
          >
            שלחו הודעה ונבנה יחד את תוכנית ניהול החתונה שלכם —
            <br className="hidden sm:block" />
            בלי התחייבות, עם ליווי אישי מהרגע הראשון
          </p>

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-semibold text-dark text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg,#C5A46D 0%,#D4BC8A 100%)",
              fontFamily: "Heebo, sans-serif",
              boxShadow: "0 8px 32px rgba(197,164,109,0.35)",
            }}
          >
            <MessageCircle size={20} strokeWidth={2} />
            בואו נדבר בוואטסאפ
          </a>

          <p
            className="mt-5 text-white/35 text-xs"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            ליווי אישי · מענה תוך שעה · ללא התחייבות
          </p>
        </div>
      </div>
    </section>
  );
}
