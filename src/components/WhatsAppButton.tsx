"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { WA_URL } from "@/lib/constants";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2200);
    const t2 = setTimeout(() => { if (!dismissed) setTooltipOpen(true); }, 5000);
    const t3 = setTimeout(() => { setTooltipOpen(false); setDismissed(true); }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [dismissed]);

  const dismiss = () => { setTooltipOpen(false); setDismissed(true); };

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      {/* Tooltip */}
      {tooltipOpen && (
        <div
          className="relative rounded-2xl p-4 shadow-2xl max-w-[195px]"
          style={{
            background: "white",
            border: "1px solid rgba(197,164,109,0.2)",
            animation: "fadeUp 0.3s ease-out both",
          }}
        >
          <button onClick={dismiss} className="absolute top-2 left-2 text-dark/25 hover:text-dark/55 transition-colors" aria-label="סגור">
            <X size={13} />
          </button>
          <p className="text-dark text-sm font-semibold mb-1" style={{ fontFamily: "Heebo, sans-serif" }}>💬 דברו עם דביר</p>
          <p className="text-dark/55 text-xs leading-relaxed" style={{ fontFamily: "Heebo, sans-serif" }}>
            עיצוב אישי מ-₪70 · מענה מהיר
          </p>
          {/* Arrow */}
          <div className="absolute -bottom-[7px] right-7 w-3.5 h-3.5 rotate-45"
            style={{ background: "white", borderRight: "1px solid rgba(197,164,109,0.2)", borderBottom: "1px solid rgba(197,164,109,0.2)" }} />
        </div>
      )}

      {/* Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שלחו הודעה לדביר בוואטסאפ"
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 whatsapp-pulse"
        style={{ background: "#22c55e" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span
          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
          style={{ background: "#C5A46D", fontSize: "9px", fontFamily: "Heebo, sans-serif" }}
        >
          1
        </span>
      </a>
    </div>
  );
}
