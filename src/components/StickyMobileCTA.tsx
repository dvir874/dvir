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
      className={`fixed bottom-20 left-4 right-4 z-40 md:hidden transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <a
        href={WA_URL_BUTTON}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-semibold text-sm shadow-2xl"
        style={{
          background:  "linear-gradient(135deg,#C5A46D,#D4BC8A)",
          color:       "white",
          fontFamily:  "Heebo, sans-serif",
          boxShadow:   "0 8px 32px rgba(197,164,109,0.40)",
        }}
      >
        <MessageCircle size={18} strokeWidth={2} />
        קבלו הצעת מחיר. תוך 24 שעות
      </a>
    </div>
  );
}
