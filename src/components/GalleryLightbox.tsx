"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import type { GalleryImage } from "@/lib/galleryData";
import { getCategoryMeta } from "@/lib/galleryData";

interface LightboxProps {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function GalleryLightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  /* Keyboard navigation */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") onPrev();  // RTL: right = prev
      if (e.key === "ArrowLeft")  onNext();  // RTL: left  = next
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [index, onClose, onPrev, onNext]);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = index !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [index]);

  const navBtn: React.CSSProperties = {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.14)",
  };

  return (
    <AnimatePresence>
      {index !== null && (() => {
        const img      = images[index];
        const hasPrev  = index > 0;
        const hasNext  = index < images.length - 1;
        const catMeta  = getCategoryMeta(img.category);

        return (
          <motion.div
            key="lightbox"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ background: "rgba(4,4,4,0.93)", backdropFilter: "blur(20px)" }}
            onClick={onClose}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image — cross-fade on index change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.75)]"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={1080}
                    height={1920}
                    className="block w-auto rounded-2xl"
                    style={{
                      maxHeight: "82vh",
                      maxWidth: "min(88vw, 400px)",
                      objectFit: "contain",
                    }}
                    priority
                    sizes="(max-width: 768px) 88vw, 400px"
                  />

                  {/* Bottom label */}
                  <div
                    className="absolute bottom-0 left-0 right-0 px-5 py-4"
                    style={{
                      background: "linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 100%)",
                    }}
                  >
                    <p
                      className="text-xs tracking-[0.2em] uppercase font-semibold mb-0.5"
                      style={{ color: catMeta.accent, fontFamily: "Heebo, sans-serif" }}
                    >
                      {img.label}
                    </p>
                    <p
                      className="text-white/38 text-[10px]"
                      style={{ fontFamily: "Heebo, sans-serif" }}
                    >
                      ✦ עבודה אמיתית · רגע לפני
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Counter pill */}
              <div
                className="absolute top-3 right-3 md:top-5 md:right-5 text-white/55 text-xs px-3 py-1.5 rounded-full"
                style={{
                  fontFamily: "Heebo, sans-serif",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {index + 1} / {images.length}
              </div>

              {/* Category pill */}
              <div
                className="absolute top-3 left-14 md:top-5 md:left-20 text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{
                  fontFamily: "Heebo, sans-serif",
                  background: catMeta.accentLight,
                  color: catMeta.accent,
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${catMeta.accent}33`,
                }}
              >
                {catMeta.labelHe}
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 md:top-5 md:left-5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/20"
                style={navBtn}
                aria-label="סגור"
              >
                <X size={18} color="white" />
              </button>

              {/* Prev — RTL right side */}
              {hasPrev && (
                <button
                  onClick={onPrev}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/18"
                  style={navBtn}
                  aria-label="הקודם"
                >
                  <ChevronRight size={22} color="white" />
                </button>
              )}

              {/* Next — RTL left side */}
              {hasNext && (
                <button
                  onClick={onNext}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/18"
                  style={navBtn}
                  aria-label="הבא"
                >
                  <ChevronLeft size={22} color="white" />
                </button>
              )}

              {/* Dot strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 flex-wrap justify-center max-w-xs px-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`תמונה ${i + 1}`}
                    className="rounded-full transition-all duration-300 flex-shrink-0"
                    style={{
                      width:  i === index ? "18px" : "6px",
                      height: "6px",
                      background: i === index
                        ? `linear-gradient(90deg,${catMeta.accent},${catMeta.accent}cc)`
                        : "rgba(255,255,255,0.22)",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
