"use client";

import { useState } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";

/* Lead-nurture series: 10 ready WhatsApp tips to send weekly to warm leads
   who haven't closed yet. Copy → paste into the lead's chat. */

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.5)", border: "#E8E0D4" };

const TIPS: { title: string; text: string }[] = [
  { title: "שבוע 1 — האקסל", text: "היי! 🙂 טיפ קטן לתכנון: במקום אקסל אחד ענק, פצלו את רשימת האורחים ל-3 עמודות בלבד — שם, טלפון, כמה מוזמנים. כל השאר (אישורים, מנות, שולחנות) ממילא מתמלא לבד אחר כך. חוסך שעות.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 2 — מתי לשלוח הזמנות", text: "טיפ השבוע 🙂 הזמן הכי טוב לשלוח הזמנה דיגיטלית: 5-6 שבועות לפני, ביום ראשון-שני בערב (20:00-21:30). ככה אתם מקבלים גל אישורים ראשון חזק, ונשאר זמן לשני סבבי תזכורות.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 3 — הטעות של הרזרבות", text: "טיפ חשוב 🙂 כשסוגרים מנות עם האולם — אל תסמכו על 'הממתינים'. מניסיון: כ-60% ממי שלא ענה בכלל, מגיע בסוף. תמיד להשאיר שולחן רזרבה אחד ו-5% מנות מעל המאושרים.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 4 — סבתא והוואטסאפ", text: "שאלה שחוזרת אצלי הרבה: 'ומה עם המבוגרים שלא מסתדרים עם קישורים?' 🙂 התשובה: ההודעה בנויה כך שגם סבתא לוחצת ומאשרת ב-10 שניות. ולמי שממש לא — שיחת טלפון אחת שלכם סוגרת את זה, והמערכת מתעדכנת ידנית.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 5 — ההושבה בלי ריבים", text: "טיפ להושבה 🙂 אל תתחילו משמות — תתחילו מקבוצות: משפחה שלו, משפחה שלה, צבא, עבודה. קודם מחליטים כמה שולחנות לכל קבוצה, ורק בסוף נכנסים לשמות. 80% מהוויכוחים נחסכים ככה.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 6 — תאריך אחרון לאישור", text: "טיפ זהב 🙂 בהזמנה עצמה, כתבו 'נשמח לתשובה עד [תאריך]' — שבועיים לפני האירוע. דדליין ברור מעלה את אחוז המענה המוקדם בעשרות אחוזים, כי אנשים דוחים מה שאין לו תאריך.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 7 — הניווט", text: "פרט קטן שעושה הבדל 🙂 ודאו שבהזמנה יש כפתור Waze ישיר — לא רק כתובת. אורח שמגיע רגוע ובזמן = אורח שנשאר לריקודים. (אצלנו זה מובנה, רק אומר 😉)\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 8 — התמונות שלא תקבלו", text: "עובדה מפתיעה 🙂 לאורחים שלכם יהיו בטלפונים יותר תמונות מלצלם — ואתם לא תראו 90% מהן. פתרון פשוט: QR על השולחנות שמעלה הכל לאלבום משותף. למחרת בבוקר יש לכם מאות רגעים שלא ידעתם שקרו.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 9 — שבוע לפני", text: "צ'קליסט לשבוע האחרון 🙂\n✅ סבב תזכורת אחרון לממתינים\n✅ סגירת מספר מנות עם האולם (עם הרזרבה!)\n✅ שליחת מספרי שולחן לאורחים\n✅ ביום שלפני — הודעת 'מחר זה קורה!' עם ניווט\nזהו. השאר זה להתרגש.\n\nדביר — רגע לפני 💍" },
  { title: "שבוע 10 — ההצעה", text: "היי 🙂 אני יודע שאתם עמוק בתכנון — אז בלי לחץ, רק תזכורת שאני כאן. אם תרצו שאקח מכם את כל ניהול האורחים (אישורים, תזכורות, הושבה, גלריה) — זה מתחיל ב-₪180 ולוקח לי יום להקים. שווה שיחה של 10 דקות?\n\nדביר — רגע לפני 💍" },
];

export default function TipsPage() {
  const [copied, setCopied] = useState<number | null>(null);

  function copy(i: number) {
    navigator.clipboard?.writeText(TIPS[i].text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 60 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 700, color: C.dark, margin: 0 }}>🎓 סדרת טיפים ללידים</h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>ליד שלא סגר? שלחו טיפ אחד בשבוע — ותישארו לו בראש עד שיסגור</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {TIPS.map((t, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.goldT, margin: 0 }}>{t.title}</p>
              <button onClick={() => copy(i)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: copied === i ? "rgba(74,124,89,0.1)" : C.cream, border: `1px solid ${copied === i ? "rgba(74,124,89,0.4)" : C.border}`, borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: copied === i ? "#4A7C59" : C.dark, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {copied === i ? <><Check size={13} /> הועתק!</> : <><Copy size={13} /> העתק</>}
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
