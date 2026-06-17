"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Star, Loader2, Copy, CheckCircle, ExternalLink } from "lucide-react";

const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";

type Screen = "loading" | "error" | "form" | "done";

interface SurveyData {
  id: string;
  rating: number | null;
  responded_at: string | null;
  events: { name: string; date: string; client_name: string } | null;
}

export default function SurveyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [screen, setScreen] = useState<Screen>("loading");
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/survey/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setScreen("error"); return; }
        setSurvey(d);
        if (d.responded_at) {
          setSelected(d.rating);
          setRefCode(d.ref_code_generated);
          setScreen("done");
        } else {
          setScreen("form");
        }
      })
      .catch(() => setScreen("error"));
  }, [token]);

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    const res = await fetch(`/api/survey/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: selected, review_text: reviewText }),
    });
    const data = await res.json();
    if (data.success) {
      setRefCode(data.ref_code);
      setScreen("done");
    }
    setSubmitting(false);
  }

  function copyRefLink() {
    const url = `${window.location.origin}/ref/${refCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const eventName = survey?.events?.name ?? "האירוע שלכם";
  const clientName = survey?.events?.client_name ?? "";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)",
        padding: "1rem",
        direction: "rtl",
        fontFamily: "Heebo, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FDFAF5",
          border: "1px solid rgba(197,164,109,0.25)",
          borderRadius: "1.5rem",
          padding: "2rem",
          boxShadow: "0 12px 48px rgba(197,164,109,0.13)",
        }}
      >
        {screen === "loading" && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: GOLD, margin: "0 auto" }} />
          </div>
        )}

        {screen === "error" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.2rem", color: "#333" }}>
              הקישור אינו תקין
            </p>
            <p style={{ fontSize: 13, color: "rgba(51,51,51,0.5)", marginTop: 8 }}>
              פנו לדביר ישירות להשגת הקישור הנכון.
            </p>
          </div>
        )}

        {screen === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", marginBottom: 8 }}>
                רגע לפני
              </p>
              <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: "#333", marginBottom: 8 }}>
                {clientName ? `${clientName}, תודה!` : "תודה שבחרתם בנו"}
              </h1>
              <p style={{ fontSize: 13, color: "rgba(51,51,51,0.55)", lineHeight: 1.6 }}>
                כמה הייתם מרוצים מהשירות עבור {eventName}?
              </p>
            </div>

            {/* Star rating */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: "1.5rem" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(n)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    transition: "transform 0.15s",
                    transform: (hovered || selected) >= n ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <Star
                    size={38}
                    fill={(hovered || selected) >= n ? GOLD : "none"}
                    stroke={(hovered || selected) >= n ? GOLD : "rgba(197,164,109,0.35)"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            {selected > 0 && (
              <p style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: selected >= 4 ? OLIVE : "#888", marginBottom: "1rem" }}>
                {selected === 5 ? "מצוין! 🎉" : selected === 4 ? "מאוד מרוצים 😊" : selected === 3 ? "סביר" : selected === 2 ? "לא ממש מרוצים" : "לא מרוצים"}
              </p>
            )}

            {selected >= 4 && (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="ספרו לנו מה הכי אהבתם... (אופציונלי)"
                rows={3}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1.5px solid rgba(197,164,109,0.25)",
                  padding: "0.65rem 0.9rem",
                  fontFamily: "Heebo, sans-serif",
                  fontSize: 13,
                  resize: "none",
                  outline: "none",
                  marginBottom: "1rem",
                  boxSizing: "border-box",
                }}
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: 12,
                border: "none",
                background: !selected || submitting ? "rgba(197,164,109,0.35)" : `linear-gradient(135deg,${GOLD},#B8924A)`,
                color: "white",
                fontFamily: "Heebo, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: !selected || submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : "שלח משוב"}
            </button>
          </>
        )}

        {screen === "done" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: selected >= 4 ? "rgba(107,123,90,0.12)" : "rgba(197,164,109,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <CheckCircle size={34} style={{ color: selected >= 4 ? OLIVE : GOLD }} />
              </div>
              <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.4rem", fontWeight: 700, color: "#333", marginBottom: 8 }}>
                {selected >= 4 ? "תודה רבה! 🎊" : "תודה על המשוב"}
              </h2>
              <p style={{ fontSize: 13, color: "rgba(51,51,51,0.55)", lineHeight: 1.6 }}>
                {selected >= 4
                  ? "שמחים שנהניתם! הביקורת שלכם עוזרת לנו להגיע לעוד זוגות."
                  : "נשתדל להשתפר ולעשות עוד טוב יותר בפעם הבאה."}
              </p>
            </div>

            {selected >= 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(51,51,51,0.5)", textAlign: "center", marginBottom: 2 }}>
                  כתבו לנו ביקורת:
                </p>
                <a
                  href="https://g.page/r/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fetch(`/api/survey/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating: selected, platform_clicked: "google" }) }).catch(() => {})}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "0.75rem",
                    borderRadius: 10,
                    border: "1.5px solid rgba(66,133,244,0.3)",
                    background: "rgba(66,133,244,0.05)",
                    color: "#4285F4",
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={15} />
                  ⭐ ביקורת בגוגל
                </a>
                <a
                  href="https://www.facebook.com/ragalifnei"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "0.75rem",
                    borderRadius: 10,
                    border: "1.5px solid rgba(24,119,242,0.3)",
                    background: "rgba(24,119,242,0.05)",
                    color: "#1877F2",
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={15} />
                  👍 ביקורת בפייסבוק
                </a>

                {refCode && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "1rem",
                      borderRadius: 12,
                      background: "rgba(107,123,90,0.07)",
                      border: "1px solid rgba(107,123,90,0.2)",
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: OLIVE, marginBottom: 6 }}>
                      🎁 שתפו חברים — וקבלו הטבה!
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(51,51,51,0.55)", marginBottom: 10, lineHeight: 1.5 }}>
                      כל זוג שמגיע דרככם מקבל ₪20 הנחה, ואתם מקבלים הטבה ממשית מדביר.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "white",
                        border: "1px solid rgba(197,164,109,0.25)",
                        borderRadius: 8,
                        padding: "0.5rem 0.75rem",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 12, color: "#333", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {typeof window !== "undefined" ? `${window.location.origin}/ref/${refCode}` : `/ref/${refCode}`}
                      </span>
                      <button
                        onClick={copyRefLink}
                        style={{ background: "none", border: "none", cursor: "pointer", color: copied ? OLIVE : GOLD, flexShrink: 0 }}
                      >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`חברים! השתמשנו ב״רגע לפני״ להזמנות החתונה שלנו ויצא מושלם 🎊\nלחצו על הקישור לקבלת ₪20 הנחה:\n${typeof window !== "undefined" ? window.location.origin : ""}/ref/${refCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "0.65rem",
                        borderRadius: 10,
                        background: "#22C55E",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      📤 שתפו בוואטסאפ
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
