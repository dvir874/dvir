"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "שרה כהן",
    event: "חתונה",
    location: "תל אביב",
    text: "פניתי לרגע לפני שבועיים לפני החתונה, ותוך יומיים קיבלתי הזמנה שכולם ביקשו לדעת מאיפה. השירות היה מדהים, האדיבות והמקצועיות לא יאמנו. ממש ממליצה בחום לכל זוג!",
    stars: 5,
    initials: "שכ",
    color: "#C5A46D",
    bgColor: "#FBF5EB",
  },
  {
    name: "מיכל לוי",
    event: "בת מצווה",
    location: "חיפה",
    text: "רציתי משהו ייחודי ומרגש לבת המצווה של הבת שלי. הם הקשיבו לכל פרט קטן, הציעו כמה גרסאות ולא הניחו עד שהיינו מרוצים ב-100%. התוצאה הייתה מעל כל ציפייה. תודה!",
    stars: 5,
    initials: "מל",
    color: "#6B7B5A",
    bgColor: "#EDF2EA",
  },
  {
    name: "יוסי אברהם",
    event: "אירוסין",
    location: "ירושלים",
    text: "הזמנו הזמנה לאירוסין ב-48 שעות לפני האירוע כשכולם כבר אמרו לנו שאין סיכוי. הם פשוט עשו את זה, ועוד ברמה גבוהה שלא ציפינו. המחיר גם היה הגון ביותר. יוצא מן הכלל!",
    stars: 5,
    initials: "יא",
    color: "#4A6741",
    bgColor: "#EDF2EA",
  },
  {
    name: "רחל גולן",
    event: "חינה",
    location: "אשדוד",
    text: "ההזמנה לחינה שלי הייתה פשוט אומנות. כולם בחתונה שאלו אותי מי עיצב — ואני הפניתי אותם מיד לרגע לפני. העיצוב המזרחי היה בדיוק מה שרציתי, עד הפרט הכי קטן.",
    stars: 5,
    initials: "רג",
    color: "#B8956A",
    bgColor: "#FBF0E8",
  },
];

export default function Testimonials() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-max mx-auto relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p
            className="text-gold text-sm tracking-widest mb-3 uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            מה אומרים עלינו
          </p>
          <h2 className="section-title">לקוחות מספרים</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            מעל 500 לקוחות מרוצים — הם מספרים הכי טוב
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>

        {/* Bottom aggregate rating */}
        <div
          className={`mt-14 text-center transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div
            className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(197,164,109,0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={22} className="text-gold" fill="#C5A46D" />
              ))}
            </div>
            <div className="text-center sm:text-right">
              <p className="font-bold text-dark text-lg" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
                4.9 / 5 דירוג ממוצע
              </p>
              <p className="text-dark/50 text-xs mt-0.5" style={{ fontFamily: "Heebo, sans-serif" }}>
                מבוסס על 300+ חוות דעת של לקוחות
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div
      className="relative rounded-2xl p-7 h-full flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(197,164,109,0.2)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Quote icon */}
      <div
        className="absolute top-5 left-5 opacity-15"
      >
        <Quote size={36} style={{ color: t.color }} />
      </div>

      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: t.stars }).map((_, s) => (
          <Star key={s} size={15} fill="#C5A46D" className="text-gold" />
        ))}
      </div>

      {/* Text */}
      <p
        className="text-dark/70 text-sm leading-[1.85] flex-1"
        style={{ fontFamily: "Heebo, sans-serif" }}
      >
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Divider */}
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(197,164,109,0.35),transparent)",
        }}
      />

      {/* Author */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md"
          style={{
            background: `linear-gradient(135deg,${t.color},${t.color}99)`,
          }}
        >
          {t.initials}
        </div>
        <div>
          <p
            className="font-semibold text-dark text-sm"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            {t.name}
          </p>
          <p
            className="text-xs text-dark/45 mt-0.5"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            {t.event} · {t.location}
          </p>
        </div>

        {/* Verified badge */}
        <div className="mr-auto">
          <span
            className="text-[10px] px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(107,123,90,0.1)",
              color: "#6B7B5A",
              fontFamily: "Heebo, sans-serif",
              border: "1px solid rgba(107,123,90,0.2)",
            }}
          >
            ✓ לקוח מאומת
          </span>
        </div>
      </div>
    </div>
  );
}
