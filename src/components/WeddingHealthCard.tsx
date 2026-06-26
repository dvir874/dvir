"use client";

import { useState } from "react";
import Link from "next/link";
import type { WeddingScore } from "@/lib/wedding-score";

const C = {
  gold:   "#C5A46D",
  goldM:  "rgba(197,164,109,0.65)",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.52)",
  border: "rgba(197,164,109,0.16)",
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  green:  "#4A7C3F",
  amber:  "#C5A46D",
  red:    "#C0392B",
};

const CATEGORY_ICONS: Record<string, string> = {
  rsvp:     "👥",
  tasks:    "📋",
  seating:  "🪑",
  budget:   "💰",
  vendors:  "🤝",
  timeline: "📅",
};

const CATEGORY_ROUTES: Record<string, string> = {
  rsvp:    "guests",
  tasks:   "checklist",
  seating: "seating",
  budget:  "gifts",
  vendors: "vendors",
};

interface Props {
  score:      WeddingScore;
  readiness:  number;
  token:      string;
  daysLeft:   number;
}

export default function WeddingHealthCard({ score, readiness, token, daysLeft }: Props) {
  const [expanded, setExpanded] = useState(false);

  const pct      = readiness;
  const color    = pct >= 80 ? C.green : pct >= 50 ? C.amber : C.red;
  const bgColor  = pct >= 80 ? "rgba(74,124,63,0.08)" : pct >= 50 ? "rgba(197,164,109,0.08)" : "rgba(192,57,43,0.08)";
  const message  = score.headline;

  /* best next action: component with lowest pct that has a tip */
  const nextAction = [...score.components]
    .filter((c) => c.tip && c.pct < 100)
    .sort((a, b) => a.pct - b.pct)[0];

  if (daysLeft < 0) return null;

  return (
    <div
      style={{
        background:   "#FFFFFF",
        borderRadius: "1.25rem",
        border:       `1px solid ${C.border}`,
        overflow:     "hidden",
        marginBottom: "1rem",
        boxShadow:    "0 2px 16px rgba(28,16,8,0.06)",
      }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width:      "100%",
          padding:    "1.1rem 1.25rem",
          display:    "flex",
          alignItems: "center",
          gap:        "1rem",
          background: "transparent",
          border:     "none",
          cursor:     "pointer",
          textAlign:  "right",
        }}
      >
        {/* Ring gauge */}
        <div style={{ flexShrink: 0, position: "relative", width: 64, height: 64 }}>
          <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(197,164,109,0.12)" strokeWidth={6} />
            <circle
              cx={32} cy={32} r={26}
              fill="none"
              stroke={color}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div
            style={{
              position:   "absolute",
              inset:      0,
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection:  "column",
            }}
          >
            <span
              style={{
                fontSize:   16,
                fontWeight: 900,
                fontFamily: "Frank Ruhl Libre, serif",
                color,
                lineHeight: 1,
              }}
            >
              {pct}
            </span>
            <span style={{ fontSize: 9, color: C.muted, fontFamily: "Heebo, sans-serif" }}>%</span>
          </div>
        </div>

        {/* Text */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <p
            style={{
              fontSize:   13,
              fontWeight: 600,
              color:      C.muted,
              fontFamily: "Heebo, sans-serif",
              marginBottom: 3,
            }}
          >
            ❤️ מצב החתונה שלכם
          </p>
          <p
            style={{
              fontSize:   14,
              fontWeight: 700,
              color:      C.dark,
              fontFamily: "Frank Ruhl Libre, serif",
              lineHeight: 1.35,
            }}
          >
            {message}
          </p>
          <span
            style={{
              display:      "inline-block",
              marginTop:    4,
              fontSize:     10,
              fontWeight:   600,
              padding:      "2px 8px",
              borderRadius: 20,
              background:   bgColor,
              color,
              fontFamily:   "Heebo, sans-serif",
            }}
          >
            {score.tierLabel}
          </span>
        </div>

        {/* Chevron */}
        <span
          style={{
            fontSize:   16,
            color:      C.goldM,
            transition: "transform 0.25s",
            transform:  expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      {/* ── Expanded: category bars + next action ── */}
      {expanded && (
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            padding:   "1rem 1.25rem 1.25rem",
          }}
        >
          {/* Category bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
            {score.components.map((comp) => {
              const barColor = comp.pct >= 80 ? C.green : comp.pct >= 50 ? C.amber : C.red;
              return (
                <div key={comp.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[comp.key] ?? "📌"}</span>
                      <span style={{ fontSize: 12, color: C.dark, fontFamily: "Heebo, sans-serif", fontWeight: 500 }}>
                        {comp.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: barColor, fontWeight: 700, fontFamily: "Heebo, sans-serif" }}>
                      {comp.pct}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: "rgba(197,164,109,0.12)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height:     "100%",
                        width:      `${comp.pct}%`,
                        borderRadius: 3,
                        background: barColor,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  {comp.explanation && (
                    <p style={{ fontSize: 10, color: C.muted, fontFamily: "Heebo, sans-serif", marginTop: 2 }}>
                      {comp.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next action */}
          {nextAction && (
            <div
              style={{
                background:   "rgba(197,164,109,0.07)",
                border:       `1px solid ${C.border}`,
                borderRadius: "0.875rem",
                padding:      "0.875rem 1rem",
              }}
            >
              <p
                style={{
                  fontSize:   11,
                  fontWeight: 600,
                  color:      C.gold,
                  fontFamily: "Heebo, sans-serif",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                ✨ הצעד הבא שכדאי לעשות
              </p>
              <p style={{ fontSize: 13, color: C.dark, fontFamily: "Heebo, sans-serif", lineHeight: 1.55, marginBottom: 8 }}>
                {nextAction.tip}
              </p>
              {CATEGORY_ROUTES[nextAction.key] && (
                <Link
                  href={`/couple/${token}/${CATEGORY_ROUTES[nextAction.key]}`}
                  style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    gap:            6,
                    padding:        "6px 14px",
                    borderRadius:   20,
                    background:     C.gold,
                    color:          "#FFFFFF",
                    fontSize:       12,
                    fontWeight:     600,
                    fontFamily:     "Heebo, sans-serif",
                    textDecoration: "none",
                  }}
                >
                  {CATEGORY_ICONS[nextAction.key]} עברו ל{nextAction.label} ←
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
