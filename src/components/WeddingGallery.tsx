"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft, MessageCircle } from "lucide-react";
import FadeIn from "./FadeIn";
import { WA_URL } from "@/lib/constants";

/* ── Image catalogue ─────────────────────────────────── */
const IMAGES = [
  { src: "/gallery/wedding/wedding.jpg",  alt: "הזמנת חתונה", w: 945,  h: 2048, label: "Save The Date"   },
  { src: "/gallery/wedding/wedding1.png", alt: "הזמנת חתונה", w: 941,  h: 1672, label: "חתונה רומנטית"  },
  { src: "/gallery/wedding/wedding2.png", alt: "הזמנת חתונה", w: 941,  h: 1672, label: "חתונה קלאסית"   },
  { src: "/gallery/wedding/wedding3.png", alt: "הזמנת חתונה", w: 941,  h: 1672, label: "חתונה מינימלית" },
  { src: "/gallery/wedding/wedding4.png", alt: "הזמנת חתונה", w: 1024, h: 1536, label: "חתונה יוקרתית"  },
  { src: "/gallery/wedding/wedding5.png", alt: "הזמנת חתונה", w: 1024, h: 1536, label: "חתונה פרחונית"  },
  { src: "/gallery/wedding/wedding6.png", alt: "הזמנת חתונה", w: 1024, h: 1536, label: "חתונה אישית"    },
  { src: "/gallery/wedding/wedding7.png", alt: "הזמנת חתונה", w: 1024, h: 1536, label: "חתונה ייחודית"  },
];

/* ── Main section ────────────────────────────────────── */
export default function WeddingGallery() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev  = useCallback(
    () => setLightbox((i) => (i !== null && i > 0 ? i - 1 : i)),
    []
  );
  const next  = useCallback(
    () => setLightbox((i) => (i !== null && i < IMAGES.length - 1 ? i + 1 : i)),
    []
  );

  /* Keyboard nav */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape")    close();
      if (e.key === "ArrowRight") prev(); // RTL: right = prev
      if (e.key === "ArrowLeft")  next(); // RTL: left  = next
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [lightbox, close, prev, next]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  return (
    <>
      <section
        id="wedding-gallery"
        className="section-padding relative overflow-hidden"
        style={{ background: "linear-gradient(180deg,#FDFAF5 0%,#F6F1E8 100%)" }}
      >
        {/* top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="container-max mx-auto">

          {/* ── Header ── */}
          <FadeIn className="text-center mb-10">
            <p
              className="text-gold text-xs tracking-[0.22em] mb-3 uppercase"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              עבודות אמיתיות
            </p>
            <h2 className="section-title">גלריית הזמנות חתונה</h2>
            <div className="gold-divider" />
            <p className="section-subtitle">
              מבחר עיצובי הזמנות בהתאמה אישית לכל אירוע
            </p>
          </FadeIn>

          {/* ── Masonry grid — 1 / 2 / 4 columns ── */}
          <div className="columns-1 sm:columns-2 lg:columns-4 gap-4">
            {IMAGES.map((img, i) => (
              <FadeIn
                key={img.src}
                delay={i * 0.06}
                duration={0.55}
                className="break-inside-avoid mb-4"
              >
                <GalleryCard
                  img={img}
                  index={i}
                  onOpen={() => setLightbox(i)}
                />
              </FadeIn>
            ))}
          </div>

          {/* ── CTA ── */}
          <FadeIn delay={0.3} className="text-center mt-12">
            <p
              className="text-dark/45 text-sm mb-5"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              אהבתם את הסגנון? נעצב לכם הזמנה אישית
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
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

        {/* bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={IMAGES}
            index={lightbox}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Gallery card ─────────────────────────────────────── */
function GalleryCard({
  img,
  index,
  onOpen,
}: {
  img: (typeof IMAGES)[0];
  index: number;
  onOpen: () => void;
}) {
  return (
    <motion.button
      className="w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl block"
      onClick={onOpen}
      aria-label={`תצוגה מלאה: ${img.label}`}
      whileHover="hovered"
      initial="idle"
    >
      {/* Card shell with hover shadow + gold ring */}
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        variants={{
          idle: {
            boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
          },
          hovered: {
            boxShadow:
              "0 22px 56px rgba(0,0,0,0.20), 0 0 0 2px rgba(197,164,109,0.55)",
          },
        }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Image zoom wrapper */}
        <motion.div
          variants={{ idle: { scale: 1 }, hovered: { scale: 1.06 } }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.w}
            height={img.h}
            className="w-full h-auto block"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={index < 4}
          />
        </motion.div>

        {/* "Real work" badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide"
            style={{
              background: "linear-gradient(135deg,rgba(197,164,109,0.92),rgba(212,188,138,0.92))",
              color: "white",
              fontFamily: "Heebo, sans-serif",
              backdropFilter: "blur(6px)",
              boxShadow: "0 1px 8px rgba(197,164,109,0.3)",
            }}
          >
            ✦ אמיתי
          </span>
        </div>

        {/* Hover overlay — label + cue */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-end pb-5 gap-1"
          variants={{ idle: { opacity: 0 }, hovered: { opacity: 1 } }}
          transition={{ duration: 0.2 }}
          style={{
            background:
              "linear-gradient(to top, rgba(8,8,8,0.78) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
          }}
        >
          <motion.p
            variants={{ idle: { y: 8 }, hovered: { y: 0 } }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-gold text-xs font-semibold tracking-[0.16em] uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            {img.label}
          </motion.p>
          <motion.p
            variants={{ idle: { y: 8, opacity: 0 }, hovered: { y: 0, opacity: 1 } }}
            transition={{ duration: 0.3, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/55 text-[11px]"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            לחצו לתצוגה מלאה
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.button>
  );
}

/* ── Lightbox ─────────────────────────────────────────── */
function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: typeof IMAGES;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img     = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  /* Shared nav button style */
  const navBtnStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.11)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  return (
    /* Backdrop */
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ background: "rgba(4,4,4,0.94)", backdropFilter: "blur(18px)" }}
      onClick={onClose}
    >
      {/* Content — stop propagation so clicks inside don't close */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Image with cross-fade on index change ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
            style={{ maxHeight: "82vh", display: "flex", alignItems: "center" }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.w}
              height={img.h}
              className="block w-auto rounded-2xl"
              style={{
                maxHeight: "82vh",
                maxWidth: "min(88vw, 400px)",
                objectFit: "contain",
              }}
              priority
              sizes="(max-width: 768px) 88vw, 400px"
            />

            {/* Bottom info bar */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{
                background:
                  "linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 100%)",
              }}
            >
              <p
                className="text-gold text-xs tracking-[0.2em] uppercase font-semibold"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                {img.label}
              </p>
              <p
                className="text-white/38 text-[10px] mt-0.5"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                ✦ עבודה אמיתית · רגע לפני
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Counter ── */}
        <div
          className="absolute top-0 right-0 md:top-4 md:right-4 text-white/55 text-xs px-3 py-1.5 rounded-full"
          style={{
            fontFamily: "Heebo, sans-serif",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          {index + 1} / {images.length}
        </div>

        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-0 left-0 md:top-4 md:left-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/20"
          style={navBtnStyle}
          aria-label="סגור"
        >
          <X size={18} color="white" />
        </button>

        {/* ── Prev (RTL: right side) ── */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/20"
            style={navBtnStyle}
            aria-label="הקודם"
          >
            <ChevronRight size={22} color="white" />
          </button>
        )}

        {/* ── Next (RTL: left side) ── */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/20"
            style={navBtnStyle}
            aria-label="הבא"
          >
            <ChevronLeft size={22} color="white" />
          </button>
        )}

        {/* ── Dot indicators ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() =>
                i < index ? onPrev() : i > index ? onNext() : undefined
              }
              className="rounded-full transition-all duration-300"
              style={{
                width:  i === index ? "20px" : "6px",
                height: "6px",
                background:
                  i === index
                    ? "linear-gradient(90deg,#C5A46D,#D4BC8A)"
                    : "rgba(255,255,255,0.22)",
              }}
              aria-label={`תמונה ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
