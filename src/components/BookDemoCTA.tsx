"use client";

import { MessageCircle, Calendar } from "lucide-react";
import FadeIn from "./FadeIn";
import { WA_URL_DEMO as WA_URL } from "@/lib/constants";

export default function BookDemoCTA() {
  return (
    <section
      className="py-16 px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #6B7B5A 0%, #3E5435 100%)" }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(197,164,109,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(197,164,109,0.3) 0%, transparent 50%)"
      }} />

      <div className="container-max mx-auto relative z-10">
        <FadeIn className="text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "rgba(197,164,109,0.80)", fontFamily: "Heebo, sans-serif" }}
          >
            מוכנים להתחיל?
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            קבלו הצעת מחיר תוך 24 שעות
          </h2>
          <div className="w-14 h-px mx-auto mb-5" style={{ background: "rgba(197,164,109,0.5)" }} />
          <p
            className="text-sm text-white/65 max-w-md mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            ספרו לנו על האירוע. ונחזור אליכם עם הצעה מותאמת אישית, בלי התחייבות
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "#C5A46D",
                color: "white",
                fontFamily: "Heebo, sans-serif",
                boxShadow: "0 4px 20px rgba(197,164,109,0.35)",
              }}
            >
              <MessageCircle size={16} />
              שלחו הודעה. נחזור תוך 24 שעות
            </a>

            <a
              href="/dashboard-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.20)",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              <Calendar size={16} />
              ראו את הדשבורד קודם
            </a>
          </div>

          <p
            className="text-xs mt-5"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Heebo, sans-serif" }}
          >
            מענה אישי · ללא התחייבות · הצעה מותאמת לאירוע שלכם
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
