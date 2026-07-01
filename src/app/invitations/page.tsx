"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VISIBLE_INVITATIONS, STYLE_LABELS, type InvitationStyle } from "@/data/invitations";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldM:  "rgba(197,164,109,0.65)",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.52)",
  border: "rgba(197,164,109,0.18)",
};

const ALL_STYLES: ("all" | InvitationStyle)[] = [
  "all", "romantic", "minimalist", "luxury", "rustic", "classic", "modern",
];
const STYLE_FILTER_LABELS: Record<"all" | InvitationStyle, string> = {
  all:        "כולם",
  romantic:   "רומנטי",
  minimalist: "מינימליסטי",
  luxury:     "יוקרתי",
  rustic:     "כפרי",
  classic:    "קלאסי",
  modern:     "מודרני",
};

function InvitationCard({ inv }: { inv: (typeof VISIBLE_INVITATIONS)[number] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col rounded-2xl overflow-hidden"
      style={{
        background:  "#FFFFFF",
        border:      `1px solid ${C.border}`,
        boxShadow:   "0 2px 16px rgba(28,16,8,0.06)",
      }}
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3/4", background: C.cream }}
      >
        {!imgError ? (
          <Image
            src={inv.previewImage}
            alt={inv.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder gradient when image missing */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{
              background: "linear-gradient(160deg,#F6F1E8,#EDE6D6)",
            }}
          >
            <span className="text-5xl opacity-30">✉️</span>
            <p
              className="text-xs font-medium"
              style={{ color: C.goldM, fontFamily: "Heebo, sans-serif" }}
            >
              {inv.name}
            </p>
          </div>
        )}

        {/* Style badge */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{
              background: "rgba(255,255,255,0.90)",
              color:      C.gold,
              fontFamily: "Heebo, sans-serif",
              backdropFilter: "blur(6px)",
            }}
          >
            {STYLE_LABELS[inv.style]}
          </span>
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top,rgba(28,16,8,0.55) 0%,transparent 50%)" }}
        >
          <Link
            href={`/invitations/${inv.slug}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{
              background:  C.gold,
              color:       "#FFFFFF",
              fontFamily:  "Heebo, sans-serif",
              boxShadow:   "0 4px 16px rgba(197,164,109,0.4)",
            }}
          >
            👁️ צפה בהזמנה
          </Link>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="text-base font-bold mb-1.5"
          style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
        >
          {inv.name}
        </h3>
        <p
          className="text-sm leading-relaxed mb-4 flex-1"
          style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
        >
          {inv.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {inv.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(197,164,109,0.10)",
                color:      C.goldM,
                fontFamily: "Heebo, sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={`/invitations/${inv.slug}`}
          className="w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md"
          style={{
            background:  "rgba(197,164,109,0.10)",
            color:       C.gold,
            fontFamily:  "Heebo, sans-serif",
            border:      `1px solid rgba(197,164,109,0.25)`,
          }}
        >
          צפה בהזמנה ←
        </Link>
      </div>
    </motion.div>
  );
}

export default function InvitationsGallery() {
  const [activeFilter, setActiveFilter] = useState<"all" | InvitationStyle>("all");

  const filtered = activeFilter === "all"
    ? VISIBLE_INVITATIONS
    : VISIBLE_INVITATIONS.filter((i) => i.style === activeFilter);

  return (
    <main dir="rtl" style={{ background: C.ivory, minHeight: "100vh" }}>
      <Header />

      {/* Hero */}
      <section
        className="relative pt-28 pb-16 px-4 overflow-hidden"
        style={{ background: C.cream }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%,rgba(197,164,109,0.10) 0%,transparent 65%)",
          }}
        />
        <div className="container-max mx-auto text-center relative">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: C.goldM, fontFamily: "Heebo, sans-serif" }}
          >
            ✦ סטודיו לעיצוב הזמנות ✦
          </p>
          <h1
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif", letterSpacing: "-0.02em" }}
          >
            גלריית ההזמנות שלנו
          </h1>
          <div
            className="w-14 h-px mx-auto mb-5"
            style={{ background: `linear-gradient(90deg,transparent,${C.gold},transparent)` }}
          />
          <p
            className="text-base md:text-lg max-w-lg mx-auto leading-relaxed"
            style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
          >
            כל הזמנה מעוצבת ידנית, בהתאמה מלאה לאופי הזוג.
            <br className="hidden md:block" />
            אלה הם חלק מהעבודות שיצרנו לאורך השנים.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div
        className="sticky top-[4.5rem] z-30 py-4 px-4 border-b"
        style={{
          background:   "rgba(253,250,245,0.95)",
          backdropFilter: "blur(12px)",
          borderColor:  "rgba(197,164,109,0.15)",
        }}
      >
        <div className="container-max mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {ALL_STYLES.map((style) => {
              const active = activeFilter === style;
              return (
                <button
                  key={style}
                  onClick={() => setActiveFilter(style)}
                  className="flex-shrink-0 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background:  active ? C.gold : "rgba(197,164,109,0.09)",
                    color:       active ? "#FFFFFF" : C.muted,
                    border:      active ? "1px solid transparent" : `1px solid ${C.border}`,
                    fontFamily:  "Heebo, sans-serif",
                  }}
                >
                  {STYLE_FILTER_LABELS[style]}
                  {style !== "all" && (
                    <span className="mr-1.5 opacity-60 text-xs">
                      ({VISIBLE_INVITATIONS.filter((i) => i.style === style).length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-14 px-4">
        <div className="container-max mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                אין הזמנות בסגנון זה עדיין
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 max-w-5xl mx-auto"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((inv) => (
                  <InvitationCard key={inv.slug} inv={inv} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Bottom CTA strip */}
      <section
        className="py-16 px-4"
        style={{ background: C.dark }}
      >
        <div className="container-max mx-auto text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: "rgba(197,164,109,0.65)", fontFamily: "Heebo, sans-serif" }}
          >
            ✦ עיצוב אישי ✦
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "#FDFAF5", fontFamily: "Frank Ruhl Libre, serif" }}
          >
            לא מצאתם בדיוק מה שחיפשתם?
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(253,250,245,0.50)", fontFamily: "Heebo, sans-serif" }}
          >
            כל הזמנה מעוצבת מאפס בהתאמה לסגנון שלכם, לצבעי האירוע ולאישיות הזוג.
          </p>
          <a
            href="https://wa.me/972533318177?text=%F0%9F%92%8D%20שלום%20דביר!%20אני%20מעוניין%2Fת%20בעיצוב%20הזמנה%20אישית"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm"
            style={{
              background:  C.gold,
              color:       "#FFFFFF",
              fontFamily:  "Heebo, sans-serif",
              boxShadow:   "0 4px 20px rgba(197,164,109,0.35)",
            }}
          >
            💬 בואו נעצב יחד
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
