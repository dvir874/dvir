"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Star } from "lucide-react";
import FadeIn from "./FadeIn";
import { WA_URL_DEMO } from "@/lib/constants";

const TESTIMONIALS = [
  {
    couple: "נועה ואורי",
    date: "אוקטובר 2024",
    text: "המערכת שינתה לנו את כל חווית ההכנה לחתונה. במקום לנהל 4 אקסלים ו-3 קבוצות וואטסאפ — הכל היה במקום אחד. האורחים קיבלו הזמנה דיגיטלית מהממת ואישרו הגעה בלחיצה אחת.",
    stars: 5,
    emoji: "💛",
    rotate: "-1deg",
  },
  {
    couple: "שירה ודניאל",
    date: "יוני 2024",
    text: "דביר היה זמין תמיד — בוואטסאפ, ברגע. כשהיה לנו ספק לגבי סידורי הושבה, הוא עזר לנו לפתור את זה תוך שעה. שירות ברמה אחרת לגמרי.",
    stars: 5,
    emoji: "🌿",
    rotate: "0.5deg",
  },
  {
    couple: "מיכל וגיל",
    date: "מרץ 2025",
    text: "האורחים שלנו היו המומים מההזמנה הדיגיטלית. כולם אמרו שמעולם לא קיבלו משהו כזה יפה. הקיר זיכרונות מהאירוע היה הבונוס שלא ציפינו לו — אלבום חי שמתמלא מהרגע.",
    stars: 5,
    emoji: "✨",
    rotate: "1deg",
  },
];

const STATS = [
  { value: 47, suffix: "+", label: "זוגות מרוצים" },
  { value: 98, suffix: "%", label: "שביעות רצון" },
  { value: 3,  suffix: " דקות", label: "לפתיחת חשבון" },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = Math.ceil(target / 40);
        const id = setInterval(() => {
          start = Math.min(start + step, target);
          setCount(start);
          if (start >= target) clearInterval(id);
        }, 35);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Testimonials() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1C1008 0%, #2E1A0A 60%, #1C1008 100%)" }}
    >
      <style>{`
        @keyframes testimonialFloat { 0%,100%{transform:translateY(0) rotate(var(--rot))} 50%{transform:translateY(-8px) rotate(var(--rot))} }
        @keyframes starPop { 0%{transform:scale(0) rotate(-20deg);opacity:0} 70%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      {/* Decorative rings */}
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", border:"1px solid rgba(197,164,109,0.07)", top:-100, right:-100, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:250, height:250, borderRadius:"50%", border:"1px solid rgba(197,164,109,0.05)", bottom:-60, left:-60, pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 30% 50%, rgba(197,164,109,0.06) 0%, transparent 60%)", pointerEvents:"none" }} />

      <div className="container-max mx-auto px-4 py-20 relative z-10">

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"clamp(2rem,5vw,2.6rem)", fontWeight:700, color:"#C5A46D", lineHeight:1 }}>
                <AnimatedNumber target={s.value} suffix={s.suffix} />
              </p>
              <p style={{ fontSize:11, color:"rgba(255,240,200,0.5)", fontFamily:"Heebo, sans-serif", marginTop:"0.3rem", letterSpacing:"0.05em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <FadeIn className="text-center mb-12">
          <p style={{ fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(197,164,109,0.6)", marginBottom:"0.75rem", fontFamily:"Heebo, sans-serif" }}>✦ מה הזוגות אומרים</p>
          <h2 style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:700, color:"#FFF8EC", margin:0 }}>
            הם כבר עשו את הצעד
          </h2>
        </FadeIn>

        {/* CTA */}
        <div className="text-center">
          <motion.a
            href={WA_URL_DEMO}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"0.9rem 2rem", borderRadius:"0.875rem",
              background:"linear-gradient(135deg, #25D366, #1aab55)",
              color:"white", textDecoration:"none",
              fontFamily:"Heebo, sans-serif", fontWeight:700, fontSize:15,
              boxShadow:"0 6px 24px rgba(37,211,102,0.35)",
            }}
          >
            <MessageCircle size={18} />
            אני רוצה כזה לחתונה שלי
          </motion.a>
          <p style={{ fontSize:11, color:"rgba(255,240,200,0.35)", marginTop:"0.75rem", fontFamily:"Heebo, sans-serif" }}>
            053-3318177 · מענה תוך 24 שעות · ללא התחייבות
          </p>
        </div>
      </div>
    </section>
  );
}
