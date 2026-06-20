"use client";

import { motion } from "framer-motion";
import { Heart, Gift, BookOpen, Star, Moon, Baby, Sparkles, Flower2 } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";
import { CATEGORY_META, getCategoryCount, type GalleryCategory } from "@/lib/galleryData";

const CATEGORY_CARDS = [
  {
    id:    "wedding"   as GalleryCategory,
    icon:  Heart,
    emoji: "💍",
    desc:  "ניהול מלא — אורחים, הושבה, תקציב ומתנות",
  },
  {
    id:    "birthday"  as GalleryCategory,
    icon:  Gift,
    emoji: "🎂",
    desc:  "ניהול מוזמנים ואישורי הגעה ליום הולדת",
  },
  {
    id:    "barmitzva" as GalleryCategory,
    icon:  BookOpen,
    emoji: "✡️",
    desc:  "ניהול בר מצווה עם לוח בקרה זוגי",
  },
  {
    id:    "batmitzva" as GalleryCategory,
    icon:  Sparkles,
    emoji: "🌟",
    desc:  "ניהול בת מצווה — מהמוזמן הראשון ועד יום האירוע",
  },
  {
    id:    "hina"      as GalleryCategory,
    icon:  Moon,
    emoji: "🌙",
    desc:  "ניהול חינה — אישורי הגעה ותזכורות אוטומטיות",
  },
  {
    id:    "brit"      as GalleryCategory,
    icon:  Baby,
    emoji: "👶",
    desc:  "ניהול ברית מילה עם מעקב מוזמנים",
  },
  {
    id:    "brita"     as GalleryCategory,
    icon:  Flower2,
    emoji: "🌸",
    desc:  "ניהול ברית בנות — הכל מסודר, הכל ידוע",
  },
];

export default function EventCategories() {
  const scrollToGallery = (categoryId: GalleryCategory) => {
    document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" });
    /* dispatch after scroll starts so Gallery has time to render */
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent<GalleryCategory>("raga:gallery-filter", {
          detail: categoryId,
        })
      );
    }, 420);
  };

  return (
    <section
      id="categories"
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="absolute inset-0 pattern-overlay opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/28 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="container-max mx-auto relative z-10">

        <FadeIn className="text-center mb-12">
          <p
            className="text-gold text-xs tracking-[0.22em] mb-3 uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            לכל אירוע
          </p>
          <h2 className="section-title">לכל אירוע — ניהול מלא</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            חתונה, חינה, בר מצווה, בת מצווה, ברית ועוד — כל אירוע מקבל לוח בקרה, אישורי הגעה ותזכורות אוטומטיות
          </p>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          staggerDelay={0.08}
          delayStart={0.05}
        >
          {CATEGORY_CARDS.map((cat) => {
            const meta  = CATEGORY_META.find((m) => m.id === cat.id)!;
            const count = getCategoryCount(cat.id);

            return (
              <motion.div key={cat.id} variants={staggerItem}>
                <motion.button
                  onClick={() => scrollToGallery(cat.id)}
                  className="w-full text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
                  whileHover="hovered"
                  initial="idle"
                  aria-label={`צפו בעיצובי ${meta.labelHe}`}
                >
                  <motion.div
                    className="relative p-6 rounded-2xl overflow-hidden"
                    variants={{
                      idle:    {
                        boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                        y: 0,
                      },
                      hovered: {
                        boxShadow: `0 20px 48px rgba(0,0,0,0.15), 0 0 0 2px ${meta.accent}55`,
                        y: -6,
                      },
                    }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: "rgba(255,255,255,0.80)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(197,164,109,0.15)",
                    }}
                  >
                    {/* Background accent shape */}
                    <motion.div
                      className="absolute -top-8 -left-8 w-24 h-24 rounded-full pointer-events-none"
                      variants={{
                        idle:    { opacity: 0, scale: 0.8 },
                        hovered: { opacity: 1, scale: 1   },
                      }}
                      transition={{ duration: 0.4 }}
                      style={{ background: `${meta.accent}10` }}
                    />

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 relative z-10"
                      style={{ background: meta.accentLight }}
                    >
                      <cat.icon
                        size={22}
                        strokeWidth={1.5}
                        style={{ color: meta.accent }}
                      />
                    </div>

                    {/* Title + count */}
                    <div className="flex items-start justify-between mb-2 relative z-10">
                      <h3
                        className="font-bold text-dark text-base leading-tight"
                        style={{ fontFamily: "Frank Ruhl Libre, serif" }}
                      >
                        {meta.labelHe}
                      </h3>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{
                          background: meta.accentLight,
                          color: meta.accent,
                          fontFamily: "Heebo, sans-serif",
                        }}
                      >
                        {count}
                      </span>
                    </div>

                    {/* Description */}
                    <p
                      className="text-dark/50 text-xs leading-relaxed relative z-10"
                      style={{ fontFamily: "Heebo, sans-serif" }}
                    >
                      {cat.desc}
                    </p>

                    {/* Hover arrow */}
                    <motion.div
                      className="mt-4 flex items-center gap-1 relative z-10"
                      variants={{
                        idle:    { opacity: 0, x: -4 },
                        hovered: { opacity: 1, x:  0 },
                      }}
                      transition={{ duration: 0.22 }}
                    >
                      <span
                        className="text-xs font-semibold"
                        style={{ color: meta.accent, fontFamily: "Heebo, sans-serif" }}
                      >
                        ניהול לאירוע זה
                      </span>
                      <span style={{ color: meta.accent }} className="text-xs">←</span>
                    </motion.div>
                  </motion.div>
                </motion.button>
              </motion.div>
            );
          })}

          {/* "Your event" card */}
          <motion.div variants={staggerItem}>
            <motion.button
              onClick={() =>
                document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
              whileHover="hovered"
              initial="idle"
              aria-label="צרו קשר לאירוע מיוחד"
            >
              <motion.div
                className="relative p-6 rounded-2xl overflow-hidden h-full min-h-[160px] flex flex-col justify-between"
                variants={{
                  idle:    { boxShadow: "0 2px 14px rgba(0,0,0,0.07)", y: 0 },
                  hovered: { boxShadow: "0 20px 48px rgba(107,123,90,0.2), 0 0 0 2px rgba(107,123,90,0.4)", y: -6 },
                }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "linear-gradient(135deg,#6B7B5A 0%,#4A5E3A 100%)",
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Star size={22} strokeWidth={1.5} color="white" />
                </div>
                <div>
                  <h3
                    className="font-bold text-white text-base leading-tight mb-1"
                    style={{ fontFamily: "Frank Ruhl Libre, serif" }}
                  >
                    אירוע אחר?
                  </h3>
                  <p
                    className="text-white/65 text-xs leading-relaxed"
                    style={{ fontFamily: "Heebo, sans-serif" }}
                  >
                    כל אירוע משפחתי — נשמח להתאים ניהול מדויק
                  </p>
                  <motion.p
                    variants={{ idle: { opacity: 0 }, hovered: { opacity: 1 } }}
                    transition={{ duration: 0.2 }}
                    className="text-white text-xs font-semibold mt-3"
                    style={{ fontFamily: "Heebo, sans-serif" }}
                  >
                    צרו קשר ←
                  </motion.p>
                </div>
              </motion.div>
            </motion.button>
          </motion.div>
        </StaggerContainer>
      </div>
    </section>
  );
}
