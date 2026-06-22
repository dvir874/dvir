"use client";

import { MessageCircle } from "lucide-react";
import FadeIn from "./FadeIn";
import { WA_URL_DEMO } from "@/lib/constants";

export default function Testimonials() {
  return (
    <section
      className="section-padding"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="container-max mx-auto">
        <FadeIn className="text-center max-w-xl mx-auto">
          <h2
            className="section-title mb-4"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            מקום לזוג אחד נוסף
          </h2>
          <p
            className="text-base leading-relaxed mb-8"
            style={{
              color: "rgba(51,51,51,0.60)",
              fontFamily: "Heebo, sans-serif",
            }}
          >
            אני עובד עם מספר מצומצם של זוגות בכל פעם — כדי שכל אחד יקבל ליווי אמיתי.
            <br />
            אם החתונה שלכם ב-2026 או 2027 — כדאי לדבר עכשיו.
          </p>

          <a
            href={WA_URL_DEMO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              background: "#C5A46D",
              color: "white",
              fontFamily: "Heebo, sans-serif",
              boxShadow: "0 4px 20px rgba(197,164,109,0.30)",
            }}
          >
            <MessageCircle size={16} />
            דברו עם דביר — בלי התחייבות
          </a>

          <p
            className="mt-4 text-xs"
            style={{ color: "rgba(51,51,51,0.35)", fontFamily: "Heebo, sans-serif" }}
          >
            053-3318177 · מענה תוך 24 שעות
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
