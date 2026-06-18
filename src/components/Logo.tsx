"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export default function Logo({ size = "md", inverted = false }: LogoProps) {
  const sizes = {
    sm: { wrapper: "gap-1", branch: 32, text: "text-xl", sub: "text-xs" },
    md: { wrapper: "gap-1.5", branch: 44, text: "text-2xl", sub: "text-xs" },
    lg: { wrapper: "gap-2", branch: 60, text: "text-4xl", sub: "text-sm" },
  };

  const s = sizes[size];
  const textColor = inverted ? "text-cream" : "text-dark";
  const goldColor = inverted ? "#F0D898" : "#C5A46D";

  return (
    <div className={`flex flex-col items-center ${s.wrapper}`}>
      {/* Olive branch SVG */}
      <svg
        width={s.branch}
        height={s.branch * 0.6}
        viewBox="0 0 80 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-float"
        style={{ animationDelay: "0s" }}
      >
        {/* Main stem */}
        <path
          d="M40 44 C40 44 30 32 22 20 C16 12 20 4 28 6"
          stroke={goldColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40 44 C40 44 50 32 58 20 C64 12 60 4 52 6"
          stroke={goldColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left leaves */}
        <ellipse cx="22" cy="20" rx="7" ry="4" fill="#6B7B5A" transform="rotate(-30 22 20)" opacity="0.9" />
        <ellipse cx="28" cy="12" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(-20 28 12)" opacity="0.85" />
        <ellipse cx="16" cy="28" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(-40 16 28)" opacity="0.8" />
        {/* Right leaves */}
        <ellipse cx="58" cy="20" rx="7" ry="4" fill="#6B7B5A" transform="rotate(30 58 20)" opacity="0.9" />
        <ellipse cx="52" cy="12" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(20 52 12)" opacity="0.85" />
        <ellipse cx="64" cy="28" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(40 64 28)" opacity="0.8" />
        {/* Gold accent dots (berries) */}
        <circle cx="24" cy="6" r="2.5" fill={goldColor} opacity="0.9" />
        <circle cx="40" cy="4" r="2" fill={goldColor} opacity="0.8" />
        <circle cx="56" cy="6" r="2.5" fill={goldColor} opacity="0.9" />
      </svg>

      {/* Business name */}
      <div className="text-center leading-none">
        <div
          className={`${s.text} font-bold tracking-wide ${textColor}`}
          style={{ fontFamily: "Frank Ruhl Libre, serif", letterSpacing: "0.05em" }}
        >
          רגע לפני
        </div>
        <div
          className={`${s.sub} tracking-widest mt-0.5`}
          style={{ color: goldColor, fontFamily: "Heebo, sans-serif", letterSpacing: "0.12em" }}
        >
          ניהול חתונה
        </div>
      </div>
    </div>
  );
}
