"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const ITEMS = [
  {
    q: "כמה זמן לוקח לקבל את ההזמנה?",
    a: "בדרך כלל עד 48 שעות מרגע שמעבירים את פרטי האירוע. לפעמים אף מהר יותר — תלוי בעומס ובמורכבות העיצוב.",
  },
  {
    q: "אפשר לבצע תיקונים אחרי שמקבלים את הטיוטה?",
    a: "בהחלט. מבצעים תיקונים עד שהעיצוב מתאים לכם בדיוק — בלי עלות נוספת. לא מסיימים עד שאתם מרוצים לגמרי.",
  },
  {
    q: "אפשר להזמין הזמנה לכל סוג אירוע?",
    a: "כן. מעצבים הזמנות לחתונות, אירוסין, חינה, בר מצווה, בת מצווה, ברית, ימי הולדת ואירועי משפחה — כל אירוע מקבל עיצוב מותאם.",
  },
  {
    q: "איך מתבצע התהליך?",
    a: "הכל דרך וואטסאפ בצורה פשוטה ונוחה. שולחים פרטי אירוע, בוחרים סגנון, מקבלים טיוטה תוך 48 שעות, מאשרים ומקבלים את הקובץ המוגמר.",
  },
  {
    q: "באיזה פורמט מקבלים את ההזמנה?",
    a: "קובץ מוכן לשיתוף בוואטסאפ — מותאם לגודל שנראה הכי טוב בשיתוף. בחבילות הגבוהות יותר ניתן לקבל גם גרסת סטוריס וגרסת וידאו.",
  },
  {
    q: "איך מתחילים?",
    a: "משאירים פרטים ונחזור אליכם אישית להבין את האירוע ולהגדיר הכל בשבילכם.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));

  return (
    <section
      id="faq"
      ref={ref}
      className="section-padding relative overflow-hidden bg-white"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/22 to-transparent" />

      <div className="container-max mx-auto">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-gold text-xs tracking-[0.22em] mb-3 uppercase" style={{ fontFamily: "Heebo, sans-serif" }}>
            יש שאלות?
          </p>
          <h2 className="section-title">שאלות נפוצות</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            כל מה שרציתם לדעת לפני שמזמינים
          </p>
        </div>

        {/* Accordion */}
        <div
          className={`max-w-2xl mx-auto space-y-3 transition-all duration-700 delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              item={item}
              isOpen={open === i}
              onToggle={() => toggle(i)}
              delay={i * 60}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-12 transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-dark/45 text-sm mb-4" style={{ fontFamily: "Heebo, sans-serif" }}>
            לא מצאתם תשובה? שלחו הודעה ישירות
          </p>
          <a
            href={`https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר, יש לי שאלה לגבי הזמנה דיגיטלית.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-sm py-2.5 px-7"
          >
            שאלו אותי בוואטסאפ
          </a>
        </div>
      </div>
    </section>
  );
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
  delay,
}: {
  item: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) {
      setHeight(isOpen ? bodyRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: isOpen
          ? "1px solid rgba(197,164,109,0.45)"
          : "1px solid rgba(197,164,109,0.18)",
        background: isOpen
          ? "linear-gradient(160deg,#FDFAF5 0%,#F9F4EA 100%)"
          : "rgba(253,250,245,0.7)",
        boxShadow: isOpen ? "0 8px 32px rgba(197,164,109,0.12)" : "none",
        transitionDelay: `${delay}ms`,
      }}
    >
      {/* Question */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right focus:outline-none group"
        aria-expanded={isOpen}
      >
        <span
          className="font-semibold text-dark text-sm md:text-base leading-snug group-hover:text-olive transition-colors duration-200"
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          {item.q}
        </span>
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            background: isOpen
              ? "linear-gradient(135deg,#C5A46D,#D4BC8A)"
              : "rgba(197,164,109,0.12)",
          }}
        >
          {isOpen ? (
            <Minus size={15} color="white" />
          ) : (
            <Plus size={15} style={{ color: "#C5A46D" }} />
          )}
        </span>
      </button>

      {/* Answer */}
      <div
        style={{ height, overflow: "hidden", transition: "height 0.32s cubic-bezier(0.4,0,0.2,1)" }}
      >
        <div ref={bodyRef}>
          <div
            className="px-6 pb-5 text-dark/60 text-sm leading-[1.9] border-t border-gold/15"
            style={{ fontFamily: "Heebo, sans-serif", paddingTop: "14px" }}
          >
            {item.a}
          </div>
        </div>
      </div>
    </div>
  );
}
