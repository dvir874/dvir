"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 120,   suffix: "+", label: "אירועים שנוהלו"  },
  { value: 15000, suffix: "+", label: "אורחים במערכת"   },
  { value: 98,    suffix: "%", label: "שביעות רצון"      },
  { value: 48,    suffix: "h", label: "זמן הקמה ממוצע"  },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const pct = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          setCount(Math.round(target * ease));
          if (pct < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  const display = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : String(count);

  return (
    <span ref={ref} style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
      {display}{suffix}
    </span>
  );
}

export default function TrustBar() {
  return (
    <div
      dir="rtl"
      style={{
        background: "#1C1C1C",
        borderTop:    "1px solid rgba(197,164,109,0.12)",
        borderBottom: "1px solid rgba(197,164,109,0.12)",
      }}
    >
      <div
        className="container-max mx-auto px-4 md:px-8"
        style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "28px 16px",
              textAlign: "center",
              borderLeft: i < STATS.length - 1 ? "1px solid rgba(197,164,109,0.10)" : "none",
            }}
          >
            <p
              style={{
                fontSize: "clamp(24px,4vw,36px)",
                fontWeight: 700,
                color: "#C5A46D",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              <Counter target={s.value} suffix={s.suffix} />
            </p>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "Heebo, sans-serif",
                fontWeight: 400,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
