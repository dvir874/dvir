"use client";

/**
 * EmotionalBand — full-width statement moment (Polish Wave 1, CEO-approved copy).
 * A quiet, high-emotion line that breaks the information rhythm. Two variants so the
 * two placements don't feel identical. Reduced-motion safe (FadeIn degrades gracefully).
 */

import FadeIn from "@/components/FadeIn";

export default function EmotionalBand({
  quote,
  sub,
  variant = "cream",
}: {
  quote: string;
  sub?: string;
  variant?: "cream" | "ink";
}) {
  const isInk = variant === "ink";
  return (
    <section
      dir="rtl"
      className={`relative w-full overflow-hidden px-6 py-16 lg:py-20 text-center ${
        isInk ? "bg-ink" : "bg-cream"
      }`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute right-6 top-6 font-display text-[120px] leading-none select-none ${
          isInk ? "text-white/5" : "text-gold/15"
        }`}
      >
        &rdquo;
      </span>
      <FadeIn className="relative mx-auto max-w-3xl">
        <p
          className={`font-display text-2xl lg:text-4xl font-bold leading-snug ${
            isInk ? "text-white" : "text-ink"
          }`}
        >
          {quote}
        </p>
        {sub && (
          <p
            className={`mt-5 font-body text-base lg:text-lg font-light ${
              isInk ? "text-white/60" : "text-ink/55"
            }`}
          >
            {sub}
          </p>
        )}
      </FadeIn>
    </section>
  );
}
