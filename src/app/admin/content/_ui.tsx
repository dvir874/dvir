"use client";

/* Shared pieces of the Content Hub — Stitch screens f8cae5e1 (list) and
   4cacf93a (detail), approved 08/10/2026. Tokens are the admin palette used
   on /admin/morning, which is also what the Stitch prompt specified. */

import type { Format, Goal, Platform, Status } from "@/lib/content-brief";
import { FORMAT_LABEL, GOAL_LABEL, STATUS_LABEL } from "@/lib/content-brief";

export const T = {
  page: "#F6F1E8",
  card: "#FDFAF5",
  border: "#E8E0D4",
  dark: "#1C1008",
  muted: "rgba(28,16,8,0.55)",
  faint: "rgba(28,16,8,0.38)",
  gold: "#C5A46D",
  goldT: "#8B6914",
  olive: "#6B7B5A",
  warn: "#B85C38",
};
export const serif = "'Frank Ruhl Libre', serif";

export function Chip({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "gold" | "olive" }) {
  const c = tone === "gold" ? { bg: "#FBF4E6", fg: T.goldT, bd: "#EBDDBF" }
    : tone === "olive" ? { bg: "#EEF2E8", fg: T.olive, bd: "#D9E2CF" }
    : { bg: "#F7F3EC", fg: T.muted, bd: T.border };
  return (
    <span style={{ background: c.bg, color: c.fg, border: `1px solid ${c.bd}` }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-body text-[12px] font-medium whitespace-nowrap">
      {children}
    </span>
  );
}

export function FormatChip({ f }: { f: Format }) {
  return <Chip>{f} · {FORMAT_LABEL[f]}</Chip>;
}

export function GoalChip({ g }: { g: Goal | null }) {
  return g ? <Chip tone="olive">מטרה: {GOAL_LABEL[g]}</Chip> : null;
}

const STATUS_STYLE: Record<Status, { bg: string; fg: string; dot?: string }> = {
  IDEA: { bg: "#EFEBE4", fg: T.muted },
  APPROVED: { bg: "#EFEBE4", fg: T.dark, dot: T.olive },
  SCRIPT: { bg: T.dark, fg: "#FDFAF5" },
  PRODUCTION: { bg: "#FDF0D5", fg: "#A86A12", dot: "#D99A2B" },
  READY: { bg: "#EEF2E8", fg: T.olive, dot: T.olive },
  PUBLISHED: { bg: "#EEF2E8", fg: T.olive, dot: T.olive },
  ANALYZING: { bg: "#EEF2E8", fg: T.olive, dot: T.gold },
  WINNER: { bg: T.gold, fg: T.dark },
  KILLED: { bg: "#F6E3DC", fg: T.warn },
};

export function StatusBadge({ s }: { s: Status }) {
  const st = STATUS_STYLE[s];
  return (
    <span style={{ background: st.bg, color: st.fg }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-body text-[12px] font-bold ${s === "KILLED" ? "line-through" : ""}`}>
      {s === "WINNER" && "★"}
      {st.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />}
      {s === "WINNER" || s === "KILLED" || s === "SCRIPT" ? s : STATUS_LABEL[s]}
    </span>
  );
}

const PLATFORM_NAME: Record<Platform, string> = { instagram: "Reels", tiktok: "TikTok", facebook: "Facebook" };

export function Platforms({ list, label = "פורסם ב:" }: { list: Platform[]; label?: string }) {
  if (!list.length) return null;
  return (
    <div className="flex items-center gap-2 font-body text-[12px]" style={{ color: T.faint }}>
      <span>{label}</span>
      {list.map((p) => (
        <span key={p} className="rounded-md px-2 py-0.5" style={{ border: `1px solid ${T.border}`, color: T.dark, background: "#fff" }}>
          {PLATFORM_NAME[p]}
        </span>
      ))}
    </div>
  );
}

export const fmtNum = (n: number | null | undefined) =>
  n == null ? "—" : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

export const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("he-IL") : "");
