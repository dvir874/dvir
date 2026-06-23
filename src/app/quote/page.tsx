"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PRICE = 1490;
const DISCOUNT_PCT = 10;
const DVIR_PHONE = "972533318177";

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function QuoteContent() {
  const params = useSearchParams();
  const name = params.get("name") ?? "הזוג היקר";
  const date = params.get("date") ?? "";
  const coupon = params.get("coupon") ?? "";

  const discountAmount = Math.round(PRICE * (DISCOUNT_PCT / 100));
  const finalPrice = PRICE - discountAmount;
  const validUntil = addDays(30);

  const whatsappMsg = encodeURIComponent("שלום דביר, קיבלתי את הצעת המחיר ואני מעוניין/ת לשמוע עוד");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f5; font-family: 'Heebo', sans-serif; direction: rtl; }
        .page { background: white; max-width: 794px; margin: 32px auto; padding: 56px 64px; min-height: 1123px; box-shadow: 0 4px 32px rgba(0,0,0,0.12); }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .page { margin: 0; box-shadow: none; padding: 40px 48px; }
        }
        @media (max-width: 860px) {
          .page { margin: 0; padding: 32px 24px; min-height: unset; }
        }
      `}</style>

      {/* Print/Share bar */}
      <div className="no-print" style={{ background: "#1C1008", padding: "12px 24px", display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#C5A46D", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          🖨️ הדפס / שמור PDF
        </button>
        <a
          href={`https://wa.me/${DVIR_PHONE}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "white", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          💬 שלח בוואטסאפ
        </a>
      </div>

      <div className="page">
        {/* Header */}
        <div style={{ borderBottom: "2px solid #C5A46D", paddingBottom: 24, marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 36, fontWeight: 900, color: "#1C1008", lineHeight: 1.1 }}>רגע לפני</h1>
            <p style={{ color: "#6B7B5A", fontSize: 13, marginTop: 4 }}>ניהול חתונה דיגיטלי | דביר בן ברוך</p>
          </div>
          <div style={{ textAlign: "left" }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 24, color: "#C5A46D", fontWeight: 700 }}>הצעת מחיר</h2>
            <p style={{ color: "#888", fontSize: 12, marginTop: 4 }}>{new Date().toLocaleDateString("he-IL")}</p>
          </div>
        </div>

        {/* To */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 16, color: "#1C1008", fontWeight: 500 }}>לכבוד: <strong style={{ color: "#C5A46D" }}>{name}</strong></p>
          {date && <p style={{ fontSize: 15, color: "#555", marginTop: 6 }}>תאריך החתונה: <strong>{date}</strong></p>}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(197,164,109,0.3)", marginBottom: 28 }} />

        {/* Package */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 22, color: "#1C1008", marginBottom: 16, fontWeight: 700 }}>
            ✨ חבילת הזהב — ניהול חתונה דיגיטלי
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "הזמנה דיגיטלית מעוצבת (20 עיצובים לבחירה)",
              "אישורי הגעה דיגיטליים עם SMS אוטומטי",
              "דשבורד לזוג — ניהול אורחים, תקציב, משימות",
              "סידורי הושבה דיגיטליים",
              "קיר זיכרונות — תמונות מהאירוע",
              "טיימליין יום החתונה",
              "תזכורות חכמות לאורחים",
              "ליווי אישי של דביר לאורך כל הדרך",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#C5A46D", fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 15, color: "#333" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: "rgba(197,164,109,0.07)", border: "1px solid rgba(197,164,109,0.3)", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
          {coupon ? (
            <>
              <p style={{ fontSize: 15, color: "#555", textDecoration: "line-through" }}>מחיר רגיל: ₪{PRICE.toLocaleString()}</p>
              <p style={{ fontSize: 14, color: "#6B7B5A", marginTop: 4 }}>קוד קופון <strong>{coupon}</strong> — הנחה {DISCOUNT_PCT}%: ‎−₪{discountAmount}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#C5A46D", marginTop: 8, fontFamily: "Frank Ruhl Libre, serif" }}>
                מחיר סופי: ₪{finalPrice.toLocaleString()}
              </p>
            </>
          ) : (
            <p style={{ fontSize: 22, fontWeight: 700, color: "#C5A46D", fontFamily: "Frank Ruhl Libre, serif" }}>
              מחיר: ₪{PRICE.toLocaleString()}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(197,164,109,0.3)", marginBottom: 28 }} />

        {/* Add-ons */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, color: "#1C1008", marginBottom: 14, fontWeight: 700 }}>
            תוספות אופציונליות
          </h3>
          {[
            ["ייצוא רשימת אורחים לאקסל", "₪0 (כלול)"],
            ["הדפסת סידורי הושבה", "₪150"],
            ["עיצוב מותאם אישית", "₪300"],
          ].map(([label, price]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(197,164,109,0.12)", fontSize: 14, color: "#444" }}>
              <span>• {label}</span>
              <span style={{ fontWeight: 600, color: "#6B7B5A" }}>{price}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(197,164,109,0.3)", marginBottom: 24 }} />

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: "#888" }}>הצעה בתוקף עד: <strong style={{ color: "#1C1008" }}>{validUntil}</strong></p>
            <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>לפרטים ותיאום: <strong style={{ color: "#C5A46D" }}>0533318177</strong></p>
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, color: "#C5A46D", fontWeight: 700 }}>רגע לפני</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>ragalifnei.co.il</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען...</div>}>
      <QuoteContent />
    </Suspense>
  );
}
