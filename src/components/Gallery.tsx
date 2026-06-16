"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import FadeIn from "./FadeIn";
import GalleryLightbox from "./GalleryLightbox";
import {
  CATEGORY_META,
  ALL_IMAGES,
  CURATED_IMAGES,
  getByCategory,
  getCategoryCount,
  type GalleryCategory,
  type GalleryImage,
} from "@/lib/galleryData";
import { WA_URL } from "@/lib/constants";

type ActiveView = GalleryCategory | "curated";

export default function Gallery() {
  const [active, setActive] = useState<ActiveView>("curated");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent<GalleryCategory>).detail;
      setActive(cat);
    };
    window.addEventListener("raga:gallery-filter", handler);
    return () => window.removeEventListener("raga:gallery-filter", handler);
  }, []);

  const filtered: GalleryImage[] =
    active === "curated" ? CURATED_IMAGES : getByCategory(active as GalleryCategory);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev  = useCallback(() => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const next  = useCallback(
    () => setLightboxIndex((i) => (i !== null && i < filtered.length - 1 ? i + 1 : i)),
    [filtered.length]
  );

  return (
    <>
      <section
        id="gallery"
        className="section-padding relative overflow-hidden bg-white"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(197,164,109,0.05) 0%,transparent 60%)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

        <div className="container-max mx-auto">

          {/* ── Header ── */}
          <FadeIn className="text-center mb-10">
            <p className="text-gold text-xs tracking-[0.22em] mb-3 uppercase" style={{ fontFamily: "Heebo, sans-serif" }}>
              {active === "curated"
                ? "עיצובים נבחרים"
                : CATEGORY_META.find((c) => c.id === active)?.labelHe ?? "גלריה"}
            </p>
            <h2 className="section-title">
              {active === "curated" ? "הגלריה שלנו" : "כל העיצובים"}
            </h2>
            <div className="gold-divider" />
            <p className="section-subtitle">
              {active === "curated"
                ? "חמשת העיצובים הנבחרים שאנחנו הכי גאים בהם — לחצו לתצוגה מלאה"
                : `${filtered.length} עיצובים אמיתיים — לחצו על תמונה לתצוגה מלאה`}
            </p>
          </FadeIn>

          {/* ── Category filter tabs ── */}
          <FadeIn delay={0.1} className="mb-10">
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-2 min-w-max mx-auto justify-start md:justify-center px-1 flex-wrap md:flex-nowrap">

                {/* Curated tab */}
                <button
                  onClick={() => setActive("curated")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0"
                  style={{
                    fontFamily: "Heebo, sans-serif",
                    background: active === "curated"
                      ? "linear-gradient(135deg,#C5A46D,#C5A46Dcc)"
                      : "rgba(0,0,0,0.04)",
                    color: active === "curated" ? "white" : "rgba(0,0,0,0.55)",
                    boxShadow: active === "curated" ? "0 4px 16px rgba(197,164,109,0.40)" : "none",
                    border: active === "curated" ? "none" : "1px solid rgba(0,0,0,0.07)",
                  }}
                >
                  ✦ עיצובים נבחרים
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{
                      background: active === "curated" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.07)",
                      color: active === "curated" ? "white" : "rgba(0,0,0,0.40)",
                    }}
                  >
                    {CURATED_IMAGES.length}
                  </span>
                </button>

                {/* Category tabs */}
                {CATEGORY_META.map((cat) => {
                  const isActive = active === cat.id;
                  const count    = getCategoryCount(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActive(cat.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0"
                      style={{
                        fontFamily: "Heebo, sans-serif",
                        background: isActive ? `linear-gradient(135deg,${cat.accent},${cat.accent}cc)` : "rgba(0,0,0,0.04)",
                        color:  isActive ? "white" : "rgba(0,0,0,0.55)",
                        boxShadow: isActive ? `0 4px 16px ${cat.accent}40` : "none",
                        border: isActive ? "none" : "1px solid rgba(0,0,0,0.07)",
                      }}
                    >
                      {cat.labelHe}
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{
                          background: isActive ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.07)",
                          color: isActive ? "white" : "rgba(0,0,0,0.40)",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* ── Grid ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
            >
              {filtered.map((img, i) => (
                <GalleryCard
                  key={img.src}
                  img={img}
                  index={i}
                  onOpen={() => setLightboxIndex(i)}
                  priority={i < 4}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* ── CTA ── */}
          <FadeIn delay={0.3} className="text-center mt-12">
            <p className="text-dark/45 text-sm mb-5" style={{ fontFamily: "Heebo, sans-serif" }}>
              אהבתם עיצוב מסוים? נוכל להתאים אותו בדיוק לאירוע שלכם
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
                fontFamily: "Heebo, sans-serif",
                boxShadow: "0 8px 24px rgba(34,197,94,0.28)",
              }}
            >
              <MessageCircle size={19} strokeWidth={2} />
              שלחו הודעה בוואטסאפ
            </a>
          </FadeIn>
        </div>
      </section>

      <GalleryLightbox
        images={filtered}
        index={lightboxIndex}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}

function GalleryCard({
  img,
  index,
  onOpen,
  priority,
}: {
  img: GalleryImage;
  index: number;
  onOpen: () => void;
  priority?: boolean;
}) {
  return (
    <motion.div
      className="break-inside-avoid mb-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: Math.min(index * 0.04, 0.36), ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl block"
        onClick={onOpen}
        aria-label={`פתח תמונה: ${img.label}`}
        whileHover="hovered"
        initial="idle"
      >
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          variants={{
            idle:    { boxShadow: "0 2px 14px rgba(0,0,0,0.08)" },
            hovered: { boxShadow: "0 20px 50px rgba(0,0,0,0.18), 0 0 0 2px rgba(197,164,109,0.5)" },
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            variants={{ idle: { scale: 1 }, hovered: { scale: 1.06 } }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={1080}
              height={1920}
              className="w-full h-auto block"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
            />
          </motion.div>

          <div className="absolute top-3 right-3 z-10">
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide"
              style={{
                background: "linear-gradient(135deg,rgba(197,164,109,0.9),rgba(212,188,138,0.9))",
                color: "white",
                fontFamily: "Heebo, sans-serif",
                backdropFilter: "blur(6px)",
              }}
            >
              ✦ אמיתי
            </span>
          </div>

          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-end pb-5 gap-1"
            variants={{ idle: { opacity: 0 }, hovered: { opacity: 1 } }}
            transition={{ duration: 0.2 }}
            style={{ background: "linear-gradient(to top,rgba(8,8,8,0.78) 0%,rgba(0,0,0,0.1) 55%,transparent 100%)" }}
          >
            <motion.p
              variants={{ idle: { y: 8 }, hovered: { y: 0 } }}
              transition={{ duration: 0.28 }}
              className="text-gold text-xs font-semibold tracking-[0.16em] uppercase"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              {img.label}
            </motion.p>
            <motion.p
              variants={{ idle: { y: 8, opacity: 0 }, hovered: { y: 0, opacity: 1 } }}
              transition={{ duration: 0.28, delay: 0.04 }}
              className="text-white/55 text-[11px]"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              לחצו לתצוגה מלאה
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
