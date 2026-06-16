"use client";

import { useState } from "react";
import { CheckCircle, MessageSquare, Loader2, AlertCircle, PenLine } from "lucide-react";
import type { ApprovalRequest } from "@/lib/types";
import type { EventTheme } from "@/lib/themes";

interface ApprovalEvent {
  id: string;
  name: string;
  date: string;
  address?: string | null;
  theme?: string | null;
}

const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO = { fontFamily: "Heebo, sans-serif" };

export default function ApprovalClient({
  event,
  theme,
  initialApproval,
}: {
  event: ApprovalEvent;
  theme: EventTheme;
  initialApproval: ApprovalRequest | null;
}) {
  const [approval, setApproval]       = useState<ApprovalRequest | null>(initialApproval);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment]         = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");

  const eventDate = new Date(event.date).toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  async function submitDecision(status: "approved" | "changes_requested") {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/approval/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, client_comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שגיאה");
      setApproval(data as ApprovalRequest);
      setShowComment(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה לא צפויה");
    } finally {
      setSubmitting(false);
    }
  }

  const isApproved          = approval?.status === "approved";
  const isChangesRequested  = approval?.status === "changes_requested";
  const isPending           = !approval || approval.status === "pending";

  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: theme.bodyBg }}>
      {/* Header */}
      <div
        className="py-4 px-5 text-center"
        style={{ background: theme.heroBg, borderBottom: `1px solid ${theme.heroCountdownBorder}` }}
      >
        <p
          className="text-xs tracking-[0.22em] uppercase mb-1"
          style={{ color: theme.heroMutedText, ...HEEBO }}
        >
          ✦ אישור עיצוב
        </p>
        <h1 className="text-2xl font-bold" style={{ color: theme.heroNameColor, ...FRANK }}>
          {event.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: theme.heroMutedText, ...HEEBO }}>
          {eventDate}
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Version badge */}
        {approval && (
          <div
            className="text-center px-4 py-2 rounded-full text-xs font-semibold mx-auto"
            style={{
              background: theme.heroBadgeBg,
              border: `1px solid ${theme.heroBadgeBorder}`,
              color: theme.heroBadgeText,
              ...HEEBO,
            }}
          >
            {approval.version_name}
          </div>
        )}

        {/* Invitation preview — embed event page */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.cardBorder}` }}
          >
            <span className="text-xs font-medium" style={{ color: theme.mutedColor, ...HEEBO }}>
              תצוגה מקדימה של ההזמנה
            </span>
            <a
              href={`/event/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline"
              style={{ color: theme.accentColor, ...HEEBO }}
            >
              פתח במסך מלא ↗
            </a>
          </div>
          <iframe
            src={`/event/${event.id}`}
            title="תצוגה מקדימה"
            className="w-full"
            style={{ height: "520px", border: "none" }}
          />
        </div>

        {/* ── DECISION AREA ── */}
        {isPending && !showComment && (
          <div
            className="rounded-3xl p-6"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <p
              className="text-center text-base font-semibold mb-5"
              style={{ color: theme.headingColor, ...FRANK }}
            >
              מה דעתכם על העיצוב?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => submitDecision("approved")}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}cc)`,
                  boxShadow: `0 6px 20px ${theme.accentColor}33`,
                  ...HEEBO,
                }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                ✓ מאשר את העיצוב
              </button>
              <button
                onClick={() => setShowComment(true)}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-base transition-all duration-200 hover:opacity-80 disabled:opacity-50"
                style={{
                  background: theme.cardBg,
                  border: `1.5px solid ${theme.cardBorder}`,
                  color: theme.headingColor,
                  ...HEEBO,
                }}
              >
                <PenLine size={18} style={{ color: theme.accentColor }} />
                ✏️ מבקש תיקונים
              </button>
            </div>
          </div>
        )}

        {/* ── COMMENT BOX ── */}
        {isPending && showComment && (
          <div
            className="rounded-3xl p-6"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <p className="font-semibold mb-3" style={{ color: theme.headingColor, ...FRANK }}>
              מה תרצו לשנות?
            </p>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="לדוגמה: להגדיל את שם הכלה, לשנות את הצבע הראשי לזהב..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none mb-4"
              style={{
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                color: theme.bodyColor,
                ...HEEBO,
              }}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowComment(false); setComment(""); }}
                className="flex-1 py-3 rounded-xl text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.05)", color: theme.mutedColor, ...HEEBO }}
              >
                ביטול
              </button>
              <button
                onClick={() => submitDecision("changes_requested")}
                disabled={submitting || !comment.trim()}
                className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                style={{ background: `linear-gradient(135deg,#C07020,#A05018)`, ...HEEBO }}
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <MessageSquare size={15} />}
                שלח בקשת תיקון
              </button>
            </div>
          </div>
        )}

        {/* ── APPROVED STATE ── */}
        {isApproved && (
          <div
            className="rounded-3xl p-8 text-center"
            style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}
          >
            <CheckCircle size={48} className="mx-auto mb-3" style={{ color: theme.accentColor }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor, ...FRANK }}>
              העיצוב אושר!
            </h2>
            <p className="text-sm" style={{ color: theme.mutedColor, ...HEEBO }}>
              תודה — נמשיך עם ההכנות לשליחת ההזמנות.
            </p>
            {approval?.approved_at && (
              <p className="text-xs mt-3" style={{ color: theme.accentColor, ...HEEBO }}>
                אושר ב-{new Date(approval.approved_at).toLocaleString("he-IL")}
              </p>
            )}
          </div>
        )}

        {/* ── CHANGES REQUESTED STATE ── */}
        {isChangesRequested && (
          <div
            className="rounded-3xl p-6"
            style={{ background: "rgba(200,120,0,0.07)", border: "1px solid rgba(200,120,0,0.20)" }}
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="flex-shrink-0 mt-0.5" style={{ color: "#C07020" }} />
              <div>
                <p className="font-semibold mb-1.5" style={{ color: theme.headingColor, ...FRANK }}>
                  בקשת תיקונים נשלחה
                </p>
                {approval?.client_comment && (
                  <p
                    className="text-sm leading-relaxed p-3 rounded-xl"
                    style={{
                      background: "rgba(200,120,0,0.07)",
                      border: "1px solid rgba(200,120,0,0.15)",
                      color: theme.bodyColor,
                      ...HEEBO,
                    }}
                  >
                    &ldquo;{approval.client_comment}&rdquo;
                  </p>
                )}
                <p className="text-xs mt-2" style={{ color: theme.mutedColor, ...HEEBO }}>
                  נעדכן אתכם כשגרסה חדשה תהיה מוכנה לאישור.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-center" style={{ color: "rgb(200,60,60)", ...HEEBO }}>{error}</p>
        )}

        {/* No approval request yet */}
        {!approval && (
          <div
            className="rounded-3xl p-6 text-center"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
          >
            <p className="text-sm" style={{ color: theme.mutedColor, ...HEEBO }}>
              טרם נשלחה בקשת אישור לאירוע זה.
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: theme.footerTextMuted, ...HEEBO }}>
          ✦ רגע לפני · הזמנות דיגיטליות
        </p>
      </div>
    </div>
  );
}
