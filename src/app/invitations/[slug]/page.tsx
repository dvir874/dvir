"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VISIBLE_INVITATIONS, STYLE_LABELS } from "@/data/invitations";
import { WA_URL } from "@/lib/constants";

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

/* ─── Design Request Modal ─── */
function DesignRequestModal({
  invitation,
  onClose,
}: {
  invitation: { slug: string; name: string };
  onClose: () => void;
}) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/design-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitation_slug: invitation.slug,
          invitation_name: invitation.name,
          name,
          phone,
          message,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(28,16,8,0.60)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-7 sm:p-8"
        style={{
          background:   C.ivory,
          border:       `1px solid ${C.border}`,
          boxShadow:    "0 24px 80px rgba(0,0,0,0.18)",
          maxHeight:    "90vh",
          overflowY:    "auto",
          borderRadius: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, left: 16,
            background: "rgba(0,0,0,0.06)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#555",
          }}
        >
          <X size={16} />
        </button>

        {status === "done" ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">💌</div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
            >
              קיבלנו את הבקשה!
            </h3>
            <p
              className="text-sm"
              style={{ color: C.muted, fontFamily: "Heebo, sans-serif", lineHeight: 1.7 }}
            >
              דביר יחזור אליכם תוך 24 שעות עם הצעה אישית.
              <br />
              בינתיים, עיינו בשאר ההזמנות בגלריה.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: C.gold, color: "#fff", fontFamily: "Heebo, sans-serif" }}
            >
              סגור
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
                style={{ color: C.goldM, fontFamily: "Heebo, sans-serif" }}
              >
                ✦ בקשת עיצוב ✦
              </p>
              <h3
                className="text-xl font-bold"
                style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
              >
                אני רוצה עיצוב כזה
              </h3>
              <p
                className="text-sm mt-1"
                style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
              >
                בסגנון {invitation.name} — נחזור עם הצעה אישית תוך 24 שעות
              </p>
            </div>

            <form onSubmit={handleSubmit} dir="rtl" className="flex flex-col gap-4">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                >
                  שם הזוג
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="נועה ואורי"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    border:      `1px solid ${C.border}`,
                    background:  "#FFFFFF",
                    color:       C.dark,
                    fontFamily:  "Heebo, sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                >
                  טלפון <span style={{ color: C.gold }}>*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05X-XXXXXXX"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{
                    border:      `1px solid ${C.border}`,
                    background:  "#FFFFFF",
                    color:       C.dark,
                    fontFamily:  "Heebo, sans-serif",
                  }}
                  dir="ltr"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                >
                  ספרו לנו על החתונה (רשות)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="תאריך האירוע, סגנון שאוהבים, צבעי האירוע..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{
                    border:      `1px solid ${C.border}`,
                    background:  "#FFFFFF",
                    color:       C.dark,
                    fontFamily:  "Heebo, sans-serif",
                  }}
                />
              </div>

              {status === "error" && (
                <p
                  className="text-xs text-center"
                  style={{ color: "#e53e3e", fontFamily: "Heebo, sans-serif" }}
                >
                  משהו השתבש. נסו שוב או פנו בוואטסאפ.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !phone}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background:  status === "sending" ? "rgba(197,164,109,0.60)" : C.gold,
                  color:       "#FFFFFF",
                  fontFamily:  "Heebo, sans-serif",
                  cursor:      status === "sending" || !phone ? "not-allowed" : "pointer",
                }}
              >
                {status === "sending" ? "שולח..." : "💬 שלחו בקשה"}
              </button>

              <a
                href={`https://wa.me/972533318177?text=${encodeURIComponent(`💍 שלום דביר! ראיתי את הסגנון "${invitation.name}" ואני מעוניין/ת בעיצוב הזמנה אישית.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all"
                style={{
                  background:  "rgba(37,211,102,0.10)",
                  color:       "#128c7e",
                  border:      "1px solid rgba(37,211,102,0.25)",
                  fontFamily:  "Heebo, sans-serif",
                }}
              >
                או שלחו בוואטסאפ ישירות →
              </a>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function InvitationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const inv = VISIBLE_INVITATIONS.find((i) => i.slug === slug);

  const [showModal,    setShowModal]    = useState(false);
  const [lightboxSrc,  setLightboxSrc]  = useState<string | null>(null);
  const [imgError,     setImgError]     = useState(false);

  if (!inv) {
    return (
      <main dir="rtl" style={{ background: C.ivory, minHeight: "100vh" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, color: C.dark }}>
            ההזמנה לא נמצאה
          </p>
          <Link
            href="/invitations"
            className="text-sm"
            style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}
          >
            ← חזרה לגלריה
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const others = VISIBLE_INVITATIONS.filter((i) => i.slug !== slug).slice(0, 3);

  return (
    <main dir="rtl" style={{ background: C.ivory, minHeight: "100vh" }}>
      <Header />

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          style={{ background: "rgba(28,16,8,0.90)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.10)", color: "#fff" }}
            onClick={() => setLightboxSrc(null)}
          >
            <X size={20} />
          </button>
          <div className="relative max-w-2xl w-full" style={{ aspectRatio: "3/4" }}>
            <Image
              src={lightboxSrc}
              alt={inv.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Design request modal */}
      {showModal && (
        <DesignRequestModal
          invitation={{ slug: inv.slug, name: inv.name }}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="pt-24 pb-6 px-4">
        <div className="container-max mx-auto flex items-center gap-2" style={{ fontFamily: "Heebo, sans-serif" }}>
          <Link
            href="/invitations"
            className="flex items-center gap-1 text-sm transition-colors hover:text-gold"
            style={{ color: C.muted }}
          >
            <ArrowRight size={14} />
            גלריית הזמנות
          </Link>
          <span style={{ color: C.border }}>·</span>
          <span className="text-sm font-medium" style={{ color: C.dark }}>{inv.name}</span>
        </div>
      </div>

      {/* Main content */}
      <section className="px-4 pb-16">
        <div className="container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">

            {/* Image */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "3/4", background: C.cream, cursor: imgError ? "default" : "zoom-in" }}
              onClick={() => !imgError && setLightboxSrc(inv.previewImage)}
            >
              {!imgError ? (
                <Image
                  src={inv.previewImage}
                  alt={inv.name}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  style={{ background: "linear-gradient(160deg,#F6F1E8,#EDE6D6)" }}
                >
                  <span className="text-7xl opacity-25">✉️</span>
                  <p style={{ color: C.goldM, fontFamily: "Heebo, sans-serif", fontSize: 14 }}>
                    תמונה תתווסף בקרוב
                  </p>
                </div>
              )}
              {!imgError && (
                <div
                  className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    color: "rgba(255,255,255,0.80)",
                    fontFamily: "Heebo, sans-serif",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  לחצו להגדלה
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6 lg:pt-4">
              {/* Style badge */}
              <div>
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-4"
                  style={{
                    background: "rgba(197,164,109,0.12)",
                    color:      C.gold,
                    fontFamily: "Heebo, sans-serif",
                  }}
                >
                  {STYLE_LABELS[inv.style]}
                </span>
                <h1
                  className="text-3xl md:text-4xl font-bold mb-3"
                  style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif", lineHeight: 1.25 }}
                >
                  {inv.name}
                </h1>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                >
                  {inv.longDescription || inv.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {inv.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(197,164,109,0.10)",
                      color:      C.goldM,
                      fontFamily: "Heebo, sans-serif",
                      border:     `1px solid rgba(197,164,109,0.20)`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Premium service note */}
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: "rgba(197,164,109,0.07)",
                  border:     `1px solid rgba(197,164,109,0.18)`,
                }}
              >
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
                >
                  ✨ שירות עיצוב הזמנה אישית
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                >
                  המערכת כוללת אתר חתונה ומערכת ניהול מלאה.
                  עיצוב הזמנה אישית הוא שירות Premium בתוספת תשלום —
                  מותאם לחלוטין לסגנון שלכם, לצבעים ולאישיות הזוג.
                </p>
              </div>

              {/* CTA */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  background: C.dark,
                  border:     `1px solid rgba(197,164,109,0.15)`,
                }}
              >
                <p
                  className="text-base font-bold mb-1"
                  style={{ color: "#FDFAF5", fontFamily: "Frank Ruhl Libre, serif" }}
                >
                  אהבתם את הסגנון?
                </p>
                <p
                  className="text-sm mb-4"
                  style={{ color: "rgba(253,250,245,0.50)", fontFamily: "Heebo, sans-serif" }}
                >
                  גם לכם נוכל לעצב הזמנה אישית בהתאמה מלאה.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg"
                  style={{
                    background: C.gold,
                    color:      "#FFFFFF",
                    fontFamily: "Heebo, sans-serif",
                    boxShadow:  "0 4px 20px rgba(197,164,109,0.30)",
                  }}
                >
                  💬 אני רוצה עיצוב כזה
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More invitations */}
      {others.length > 0 && (
        <section
          className="py-14 px-4"
          style={{ background: C.cream, borderTop: `1px solid rgba(197,164,109,0.15)` }}
        >
          <div className="container-max mx-auto">
            <h2
              className="text-xl font-bold mb-8 text-center"
              style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
            >
              עוד הזמנות שאולי תאהבו
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/invitations/${other.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{
                    background: "#FFFFFF",
                    border:     `1px solid ${C.border}`,
                    boxShadow:  "0 2px 12px rgba(28,16,8,0.05)",
                  }}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "3/4", background: C.cream }}
                  >
                    <OtherImage src={other.previewImage} name={other.name} />
                  </div>
                  <div className="p-4">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}
                    >
                      {other.name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}
                    >
                      {other.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/invitations"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}
              >
                ← לכל הגלריה
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function OtherImage({ src, name }: { src: string; name: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: "linear-gradient(160deg,#F6F1E8,#EDE6D6)" }}
      >
        <span className="text-3xl opacity-25">✉️</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => setErr(true)}
    />
  );
}
