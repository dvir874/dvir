"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldM:  "rgba(197,164,109,0.60)",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.52)",
  border: "rgba(197,164,109,0.18)",
  card:   "#FFFFFF",
  green:  "#4A7C3F",
  amber:  "#C5A46D",
};

type StepStatus = "done" | "active" | "pending" | "locked";

interface JourneyStep {
  key:        string;
  emoji:      string;
  title:      string;
  desc:       string;
  status:     StepStatus;
  tip?:       string;
  href?:      string;
}

interface BriefingData {
  daysUntilEvent: number;
  readinessPct:   number;
  eventName:      string;
  event?: {
    id: string;
    name: string;
    date: string;
    address?: string | null;
  };
}

interface Stats {
  total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number;
}

interface DashboardData {
  event: { id: string; name: string; date: string; address?: string | null };
  stats: Stats;
  seating: { totalSeats: number; assignedSeats: number };
}

function buildJourney(
  daysLeft:  number,
  data:      DashboardData | null,
  briefing:  BriefingData | null,
): JourneyStep[] {
  const stats     = data?.stats;
  const seating   = data?.seating;
  const hasAddress = !!data?.event?.address;
  const hasGuests  = (stats?.total ?? 0) > 0;
  const rsvpRate   = stats && stats.total > 0 ? (stats.confirmed + stats.declined) / stats.total : 0;
  const seatingPct = stats && seating && stats.attendees > 0 ? seating.assignedSeats / stats.attendees : 0;
  const isPostEvent = daysLeft < 0;
  const isWeddingDay = daysLeft === 0;

  function s(done: boolean, active: boolean, locked: boolean): StepStatus {
    if (done)   return "done";
    if (locked) return "locked";
    if (active) return "active";
    return "pending";
  }

  const steps: JourneyStep[] = [
    {
      key:    "engaged",
      emoji:  "💍",
      title:  "התארסתם",
      desc:   "המסע שלכם מתחיל — ברוכים הבאים למשפחה החדשה שלכם.",
      status: "done",
    },
    {
      key:    "venue",
      emoji:  "🏛",
      title:  "סגרתם אולם",
      desc:   "קבעתם מקום, תאריך, ומסגרת. הבסיס לכל שאר ההחלטות.",
      status: s(hasAddress, !hasAddress && daysLeft > 180, false),
      tip:    !hasAddress ? "הוסיפו כתובת אולם בהגדרות האירוע." : undefined,
    },
    {
      key:    "design",
      emoji:  "🎨",
      title:  "עיצוב ההזמנה",
      desc:   "הזמנה אישית שמספרת את הסיפור שלכם, בסגנון ייחודי.",
      status: s(daysLeft < 150, daysLeft >= 150 && daysLeft <= 200, false),
      tip:    daysLeft >= 150 ? "שירות עיצוב הזמנה זמין — צרו קשר עם דביר." : undefined,
      href:   "https://wa.me/972533318177?text=" + encodeURIComponent("💍 שלום דביר, אנחנו מעוניינים בשירות עיצוב הזמנה."),
    },
    {
      key:    "invitations",
      emoji:  "📨",
      title:  "שליחת הזמנות",
      desc:   "כל אורח מקבל הזמנה אישית עם קישור RSVP.",
      status: s(hasGuests && daysLeft < 120, hasGuests && daysLeft >= 120, !hasGuests),
      tip:    !hasGuests ? "הוסיפו אורחים לרשימה כדי להתחיל לשלוח הזמנות." : undefined,
      href:   "/couple/TOKEN/guests",
    },
    {
      key:    "rsvp",
      emoji:  "👥",
      title:  "אישורי הגעה",
      desc:   "עוקבים בזמן אמת — מי אישר, מי ממתין, מי לא ענה.",
      status: s(rsvpRate >= 0.85, rsvpRate > 0 && rsvpRate < 0.85, !hasGuests),
      tip:    rsvpRate < 0.7 && hasGuests && daysLeft < 60 ? "כדאי לשלוח תזכורת לממתינים." : undefined,
      href:   "/couple/TOKEN/guests",
    },
    {
      key:    "seating",
      emoji:  "🪑",
      title:  "סידורי הושבה",
      desc:   "שיבוץ מסודר לפי שולחנות, קרבה משפחתית ועדפות.",
      status: s(seatingPct >= 0.9, rsvpRate >= 0.6 && seatingPct < 0.9, rsvpRate < 0.4),
      tip:    seatingPct < 0.5 && rsvpRate >= 0.6 ? "הגיע הזמן לסדר את ההושבה." : undefined,
      href:   "/couple/TOKEN/seating",
    },
    {
      key:    "wedding",
      emoji:  "❤️",
      title:  "יום החתונה",
      desc:   isWeddingDay ? "🎊 היום הגדול הגיע! תיהנו מכל רגע." : isPostEvent ? "הרגע הגדול עבר — ואתם עשיתם זאת!" : `עוד ${daysLeft} ימים — ואתם מוכנים.`,
      status: isPostEvent || isWeddingDay ? "done" : daysLeft <= 7 ? "active" : "pending",
    },
    {
      key:    "gallery",
      emoji:  "📸",
      title:  "גלריית תמונות",
      desc:   "האורחים מעלים תמונות מהחתונה — ונוצר אלבום חי לכל החיים.",
      status: s(isPostEvent, isWeddingDay, !isPostEvent && !isWeddingDay),
      href:   "/gallery/TOKEN",
    },
    {
      key:    "thanks",
      emoji:  "💌",
      title:  "הודעת תודה",
      desc:   "שלחו הודעה אישית לכל מי שבא — זה הרגע שלא שוכחים.",
      status: s(false, isPostEvent, !isPostEvent),
      tip:    isPostEvent ? "שלחו הודעת תודה לכל האורחים דרך WhatsApp Center." : undefined,
      href:   isPostEvent ? "/couple/TOKEN" : undefined,
    },
    {
      key:    "review",
      emoji:  "⭐",
      title:  "בקשת המלצה",
      desc:   "ממליצים לחברים? כתבו לנו — זה עוזר לנו לגדול.",
      status: s(false, isPostEvent, !isPostEvent),
      tip:    isPostEvent ? "ספרו לחברים שלכם על המערכת — זה עוזר לנו מאוד." : undefined,
      href:   isPostEvent ? "https://wa.me/972533318177?text=" + encodeURIComponent("💍 שלום דביר, רוצים להמליץ עליכם!") : undefined,
    },
  ];

  return steps;
}

const STATUS_CONFIG: Record<StepStatus, { dot: string; dotBg: string; line: string; cardBg: string; cardBorder: string }> = {
  done:    { dot: "✓",  dotBg: "#4A7C3F",                    line: "#4A7C3F",                 cardBg: "#FFFFFF",   cardBorder: "rgba(74,124,63,0.20)"   },
  active:  { dot: "→",  dotBg: "#C5A46D",                    line: "rgba(197,164,109,0.30)",  cardBg: "#FFFFFF",   cardBorder: "rgba(197,164,109,0.35)" },
  pending: { dot: "○",  dotBg: "rgba(28,16,8,0.12)",         line: "rgba(28,16,8,0.10)",      cardBg: "#FDFAF5",   cardBorder: "rgba(28,16,8,0.08)"     },
  locked:  { dot: "🔒", dotBg: "rgba(28,16,8,0.06)",         line: "rgba(28,16,8,0.06)",      cardBg: "#FDFAF5",   cardBorder: "rgba(28,16,8,0.05)"     },
};

export default function JourneyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router     = useRouter();

  const [data,     setData]     = useState<DashboardData | null>(null);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dr, br] = await Promise.all([
          fetch(`/api/couple/${token}/dashboard`).then(r => r.ok ? r.json() : null),
          fetch(`/api/couple/${token}/briefing`).then(r => r.ok ? r.json() : null),
        ]);
        setData(dr);
        setBriefing(br);
      } catch { /* graceful */ }
      setLoading(false);
    }
    load();
  }, [token]);

  const daysLeft = briefing?.daysUntilEvent
    ?? (data?.event?.date ? Math.ceil((new Date(data.event.date).getTime() - Date.now()) / 86_400_000) : 999);

  const steps = buildJourney(daysLeft, data, briefing);

  /* Replace TOKEN placeholder in hrefs */
  const resolvedSteps = steps.map(s => ({
    ...s,
    href: s.href?.replace("TOKEN", token),
  }));

  const doneCount   = resolvedSteps.filter(s => s.status === "done").length;
  const totalCount  = resolvedSteps.length;
  const progressPct = Math.round((doneCount / totalCount) * 100);

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: C.cream, fontFamily: "Heebo, sans-serif", color: C.dark }}
    >
      {/* Header */}
      <div
        style={{
          background:   "#FFFFFF",
          borderBottom: `1px solid ${C.border}`,
          padding:      "1rem 1.25rem 0.875rem",
          position:     "sticky",
          top:          0,
          zIndex:       10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <button
            onClick={() => router.back()}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.muted, lineHeight: 1 }}
          >
            ←
          </button>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, fontWeight: 700, color: C.dark }}>
            ❤️ המסע שלכם
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ flex: 1, height: 6, background: "rgba(197,164,109,0.15)", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                height:     "100%",
                width:      loading ? "0%" : `${progressPct}%`,
                background: "linear-gradient(90deg,#4A7C3F,#6B7B5A)",
                borderRadius: 3,
                transition: "width 0.8s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: C.olive, fontWeight: 600, flexShrink: 0 }}>
            {doneCount}/{totalCount} שלבים
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: "3rem 1.25rem", textAlign: "center" }}>
          <p style={{ color: C.muted, fontSize: 14 }}>טוען את המסע שלכם...</p>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div style={{ padding: "1.5rem 1.25rem 2rem", maxWidth: 560, margin: "0 auto" }}>
          {resolvedSteps.map((step, idx) => {
            const cfg     = STATUS_CONFIG[step.status];
            const isLast  = idx === resolvedSteps.length - 1;
            const isActive = step.status === "active";

            return (
              <div key={step.key} style={{ display: "flex", gap: "0.875rem" }}>
                {/* Left: dot + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  {/* Dot */}
                  <div
                    style={{
                      width:          32,
                      height:         32,
                      borderRadius:   "50%",
                      background:     cfg.dotBg,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      fontSize:       step.status === "done" ? 14 : step.status === "active" ? 14 : step.status === "locked" ? 13 : 12,
                      color:          step.status === "done" ? "#FFFFFF" : step.status === "active" ? "#FFFFFF" : C.muted,
                      fontWeight:     700,
                      flexShrink:     0,
                      boxShadow:      isActive ? "0 0 0 4px rgba(197,164,109,0.18)" : "none",
                      transition:     "box-shadow 0.3s",
                    }}
                  >
                    {step.status === "done" ? "✓" : step.status === "locked" ? "🔒" : step.emoji}
                  </div>
                  {/* Line */}
                  {!isLast && (
                    <div
                      style={{
                        width:      2,
                        flex:       1,
                        minHeight:  24,
                        background: cfg.line,
                        margin:     "4px 0",
                      }}
                    />
                  )}
                </div>

                {/* Right: card */}
                <div style={{ flex: 1, paddingBottom: isLast ? 0 : "1rem" }}>
                  <div
                    style={{
                      background:   cfg.cardBg,
                      border:       `1px solid ${cfg.cardBorder}`,
                      borderRadius: "1rem",
                      padding:      "0.875rem 1rem",
                      opacity:      step.status === "locked" ? 0.55 : 1,
                      boxShadow:    isActive ? "0 4px 20px rgba(197,164,109,0.12)" : "none",
                    }}
                  >
                    {/* Title row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <p
                        style={{
                          fontFamily: "Frank Ruhl Libre, serif",
                          fontSize:   15,
                          fontWeight: step.status === "done" || isActive ? 700 : 600,
                          color:      step.status === "done" ? C.olive : isActive ? C.dark : C.muted,
                        }}
                      >
                        {step.title}
                      </p>
                      {step.status === "done" && (
                        <span style={{ fontSize: 11, color: "#4A7C3F", fontWeight: 600, background: "rgba(74,124,63,0.08)", padding: "2px 8px", borderRadius: 20 }}>
                          ✓ הושלם
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, background: "rgba(197,164,109,0.10)", padding: "2px 8px", borderRadius: 20 }}>
                          ◉ בתהליך
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: step.tip || step.href ? "0.625rem" : 0 }}>
                      {step.desc}
                    </p>

                    {/* Tip */}
                    {step.tip && (
                      <p style={{ fontSize: 11, color: C.gold, fontStyle: "italic", marginBottom: step.href ? "0.5rem" : 0 }}>
                        💡 {step.tip}
                      </p>
                    )}

                    {/* Action button */}
                    {step.href && step.status !== "locked" && step.status !== "done" && (
                      step.href.startsWith("http") ? (
                        <a
                          href={step.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display:        "inline-flex",
                            alignItems:     "center",
                            gap:            4,
                            padding:        "5px 12px",
                            borderRadius:   20,
                            background:     C.gold,
                            color:          "#FFFFFF",
                            fontSize:       11,
                            fontWeight:     600,
                            fontFamily:     "Heebo, sans-serif",
                            textDecoration: "none",
                          }}
                        >
                          {step.emoji} {step.title} ←
                        </a>
                      ) : (
                        <Link
                          href={step.href}
                          style={{
                            display:        "inline-flex",
                            alignItems:     "center",
                            gap:            4,
                            padding:        "5px 12px",
                            borderRadius:   20,
                            background:     isActive ? C.gold : "rgba(197,164,109,0.12)",
                            color:          isActive ? "#FFFFFF" : C.gold,
                            fontSize:       11,
                            fontWeight:     600,
                            fontFamily:     "Heebo, sans-serif",
                            textDecoration: "none",
                          }}
                        >
                          {step.emoji} {step.title} ←
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post event call to share */}
      {daysLeft < 0 && !loading && (
        <div
          style={{
            margin:       "0 1.25rem 2rem",
            padding:      "1.25rem",
            borderRadius: "1.25rem",
            background:   C.dark,
            textAlign:    "center",
            maxWidth:     560,
            marginInline: "auto",
          }}
        >
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, fontWeight: 700, color: "#FDFAF5", marginBottom: 6 }}>
            ❤️ המסע הסתיים — מתחיל פרק חדש
          </p>
          <p style={{ fontSize: 13, color: "rgba(253,250,245,0.55)", marginBottom: 16, lineHeight: 1.65 }}>
            כל הכבוד על הדרך שעשיתם.
            <br />
            ספרו לחברים שלכם על המערכת — זה עוזר לנו מאוד.
          </p>
          <a
            href={`https://wa.me/972533318177?text=${encodeURIComponent("💍 שלום דביר, רצינו לומר תודה ולהמליץ עליכם!")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        "inline-flex",
              alignItems:     "center",
              gap:            8,
              padding:        "10px 24px",
              borderRadius:   20,
              background:     C.gold,
              color:          "#FFFFFF",
              fontSize:       14,
              fontWeight:     600,
              fontFamily:     "Heebo, sans-serif",
              textDecoration: "none",
            }}
          >
            💬 שלחו לנו הודעה
          </a>
        </div>
      )}
    </div>
  );
}
