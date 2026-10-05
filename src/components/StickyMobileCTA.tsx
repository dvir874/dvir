"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { WA_URL_BUTTON } from "@/lib/constants";

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      /* bottom-20 left an 80px hole under the bar for a widget this page does
         not have; it now sits on the safe area like every fixed element. */
      className={`fixed left-4 right-4 z-40 md:hidden transition-all duration-500 bottom-[calc(12px+env(safe-area-inset-bottom))] ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <a
        href={WA_URL_BUTTON}
        target="_blank"
        rel="noopener noreferrer"
        /* White on light gold measured ~2.3:1. Ink on gold is the hero's own
           primary button (7.9:1), so the bar now reads as the same action. */
        className="flex min-h-[52px] items-center justify-center gap-2.5 w-full py-3.5 rounded-pill font-bold text-[15px] shadow-2xl"
        style={{
          background:  "#C5A46D",
          color:       "#1C1008",
          fontFamily:  "Heebo, sans-serif",
          boxShadow:   "0 8px 32px rgba(197,164,109,0.40)",
        }}
      >
        <MessageCircle size={18} strokeWidth={2} />
        קבלו הצעת מחיר תוך 24 שעות
      </a>
    </div>
  );
}
