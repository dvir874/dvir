"use client";

import { useState } from "react";
import { ArrowRight, Copy, Check } from "lucide-react";

/* Marketing kit — every launch asset ready to copy-paste.
   Built once, used everywhere: FB groups, mit4mit, video, lead replies. */

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.5)", border: "#E8E0D4" };

interface Asset { title: string; hint: string; text: string }
interface Section { emoji: string; name: string; assets: Asset[] }

const KIT: Section[] = [
  {
    emoji: "📣",
    name: "פוסטים לקבוצות פייסבוק (מתחתנים ומתחתנות)",
    assets: [
      {
        title: "פוסט השקה — מחיר מייסדים",
        hint: "לקבוצות 'מתחתנים 2026/2027'. לפרסם עם צילום מסך של הדשבורד או הדמו",
        text: `זוגות יקרים, שאלה: כמה שעות כבר בזבזתם על אקסל של אורחים? 😅\n\nאני דביר, ובניתי מערכת ישראלית לניהול חתונה — אישורי הגעה בוואטסאפ (בלי טלפונים מביכים), רשימת אורחים חיה, הושבה בגרירה, גלריה שהאורחים ממלאים לבד, ואפילו לוח טרמפים לאורחים.\n\nאני בתחילת הדרך, אז ל-5 הזוגות הראשונים מהקבוצה — חבילת אישורי הגעה מלאה ב-99 ש״ח במקום 180 (מחיר מייסדים, תמורת חוות דעת כנה בסוף).\n\nרוצים לראות איך זה מרגיש לאורח שלכם? יש דמו חי באתר, בלי הרשמה:\nregalifnei.vercel.app/try?utm_source=facebook\n\nמוזמנים לשאול כאן או בפרטי 🙂`,
      },
      {
        title: "פוסט ערך — בלי מכירה (לבניית אמון)",
        hint: "לפרסם שבוע אחרי פוסט ההשקה. נותן ערך, בונה מוניטין",
        text: `טיפ מניסיון למי שמתחיל עכשיו עם אישורי הגעה 💍\n\nהטעות הכי נפוצה: לסגור מנות עם האולם לפי 'מי שאישר'. מהנתונים שלי — כ-60% ממי שלא ענה בכלל, מגיע בסוף. תמיד תשאירו רזרבה של 5-7% מעל המאושרים, ושולחן אחד פנוי ליד הכניסה.\n\nועוד אחד: את ההזמנה הדיגיטלית הכי כדאי לשלוח ביום ראשון-שני בערב (20:00-21:30) — אחוזי הפתיחה הכי גבוהים בשבוע.\n\nשיהיה במזל לכולם! 🥂\n(אני דביר מ'רגע לפני' — מערכת לניהול חתונה. שאלות? מוזמנים בפרטי)`,
      },
      {
        title: "פוסט קצר — הדמו",
        hint: "פוסט זריז לקבוצות קטנות יותר",
        text: `בניתי משהו שהייתי רוצה שיהיה לי בחתונה שלי 🙂\n\nככה נראה אישור הגעה שהאורחים שלכם יקבלו בוואטסאפ — נסו בעצמכם (10 שניות, בלי הרשמה):\nregalifnei.vercel.app/try?utm_source=facebook\n\nאם אהבתם — יש לי מחיר מייסדים לזוגות הראשונים. דברו איתי 💬`,
      },
    ],
  },
  {
    emoji: "⭐",
    name: "פרופיל ל-mit4mit ומאורסים-מאורסות",
    assets: [
      {
        title: "תיאור העסק (להעתקה לפרופיל)",
        hint: "mit4mit.co.il ← הוספת עסק ← קטגוריית אישורי הגעה וסידורי הושבה",
        text: `רגע לפני — ניהול חתונה דיגיטלי עם ליווי אישי 💍\n\nכל מה שצריך במערכת אחת: אישורי הגעה אישיים בוואטסאפ (עם קישור לכל אורח ומעקב חי), תזכורות חכמות למי שלא ענה, סידורי הושבה בגרירה פשוטה, שליחת מספר שולחן לכל אורח לפני האירוע, גלריה חיה שהאורחים ממלאים, דף אירוע אישי עם ניווט — ואפילו לוח טרמפים לאורחים.\n\nמה שמייחד אותנו: אתם לא מדברים עם מוקד. אתם מדברים עם דביר — בן אדם אחד שמכיר את האירוע שלכם, זמין בוואטסאפ, ומלווה אתכם מההזמנה הראשונה ועד אחרי החתונה.\n\nמחיר הוגן ושקוף: חבילת אישורי הגעה מ-180 ש״ח לאירוע (תשלום חד-פעמי, בלי הפתעות). מחשבון מחיר באתר.\n\nדמו חי באתר — תראו בדיוק מה האורחים שלכם יקבלו, עוד לפני שדיברנו.`,
      },
      {
        title: "תשובה לביקורת ראשונה (כשתגיע)",
        hint: "לענות על כל ביקורת — גם חיובית. זה נראה טוב לבאים אחריהם",
        text: `תודה ענקית על המילים החמות! 🙏 היה כיף אמיתי ללוות אתכם — מהרשימה הראשונה ועד הריקודים. מאחל לכם חיים מלאים באהבה, ותמסרו ד״ש לכל המשפחה 💍\nדביר — רגע לפני`,
      },
    ],
  },
  {
    emoji: "🎬",
    name: "תסריט סרטון דמו (60 שניות)",
    assets: [
      {
        title: "תסריט הקלטת מסך + קריינות",
        hint: "מקליטים עם QuickTime/Loom על הדמו והדשבורד. מעלים לפייסבוק/אינסטגרם/טיקטוק",
        text: `[0-5 שנ׳ | מסך: הודעת וואטסאפ עם הזמנה]\n"ככה האורחים שלכם מקבלים את ההזמנה לחתונה — הודעה אישית, עם השם שלהם."\n\n[5-20 שנ׳ | מסך: הדמו /try — לוחצים מגיע, בוחרים 2, בוחרים מנות]\n"לוחצים על הקישור... מאשרים... בוחרים כמה מגיעים ואיזה מנות. עשר שניות, בלי להוריד כלום."\n\n[20-35 שנ׳ | מסך: דשבורד הזוג עם המספרים]\n"ואצלכם? הכל מתעדכן בזמן אמת. כמה אישרו, כמה ממתינים, מי צריך תזכורת — בלי אקסל ובלי לרדוף אחרי אף אחד."\n\n[35-50 שנ׳ | מסך: הושבה בגרירה + הודעת מספר שולחן]\n"וכשסוגרים הושבה — כל אורח מקבל את מספר השולחן שלו בוואטסאפ. אוטומטית."\n\n[50-60 שנ׳ | מסך: לוגו + כתובת]\n"רגע לפני. כל החתונה שלכם — במערכת אחת. יש דמו חי באתר, לינק בתגובה הראשונה."`,
      },
    ],
  },
  {
    emoji: "💬",
    name: "תבניות מענה ללידים",
    assets: [
      {
        title: "מענה ראשון לליד חדש (לענות תוך שעה!)",
        hint: "ההודעה הראשונה קובעת הכל. חמה, קצרה, עם צעד ברור",
        text: `היי [שם]! 🙂 תודה שפניתם, אני דביר.\n\nבשמחה אספר — אבל הכי קל להרגיש: הנה דמו חי של מה שהאורחים שלכם יקבלו (10 שניות):\nregalifnei.vercel.app/try\n\nוכמה שאלות קצרות כדי שאתאים לכם הצעה מדויקת:\n1. מתי החתונה?\n2. בערך כמה מוזמנים?\n3. מה הכי חשוב לכם — רק אישורי הגעה, או גם הושבה/גלריה/ניהול מלא?`,
      },
      {
        title: "פולו-אפ לליד ששתק (אחרי 3 ימים)",
        hint: "רוב העסקאות נסגרות בפולו-אפ. בלי לחץ, עם ערך",
        text: `היי [שם] 🙂 דביר מרגע לפני — רק מוודא שההודעה לא התפספסה.\n\nבלי קשר אם תתקדמו איתי — טיפ אחד ששווה לכם: את ההזמנות הכי כדאי לשלוח 5-6 שבועות לפני, ביום ראשון בערב. ככה מקבלים גל אישורים ראשון חזק.\n\nאם תרצו שאקח מכם את כל כאב הראש הזה — אני כאן. שיהיה במזל! 💍`,
      },
      {
        title: "סגירת עסקה (אחרי שאמרו כן)",
        hint: "לשלוח מיד עם הקישור להצעה + מקדמה",
        text: `מעולה!! 🎉 שמח שאתם איתי.\n\nהנה ההצעה הרשמית שלכם: [קישור מ-/quote]\nאפשר לאשר שם עם מקדמה של 100 ש״ח (יורדת מהמחיר) — וברגע שזה נכנס אני מקים לכם את המערכת ושולח לכם את הקישור האישי. תוך 24 שעות אתם באוויר.\n\nיאללה, מתחילים? 💍`,
      },
    ],
  },
  {
    emoji: "🤝",
    name: "פנייה לספקים (תוכנית שותפים)",
    assets: [
      {
        title: "הודעה לצלם/DJ/מאפרת",
        hint: "לשלוח ל-5 ספקים שאתה מכיר או שעבדו בחתונות שהיית בהן",
        text: `היי [שם]! אני דביר, מנהל מערכת דיגיטלית לחתונות בשם "רגע לפני" (אישורי הגעה, הושבה, גלריה).\n\nרעיון קצר: הזוגות שלך ממילא צריכים אישורי הגעה. אני נותן לך קוד אישי — זוג שמגיע דרכך מקבל 10% הנחה, ואתה מקבל 50 ש״ח על כל סגירה. בלי מאמץ מצדך, רק להזכיר בסוף פגישה.\n\nפרטים: regalifnei.vercel.app/partners\nשווה שיחה של 5 דקות? 🙂`,
      },
    ],
  },
];

export default function MarketingKitPage() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(key: string, text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 60 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 19, fontWeight: 700, color: C.dark, margin: 0 }}>📣 ערכת השיווק</h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>כל נכסי ההשקה — מוכנים להעתקה. פוסטים, פרופילים, תסריטים ומענים</p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
        {KIT.map(section => (
          <div key={section.name} style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, color: C.goldT, margin: "0 0 12px" }}>
              {section.emoji} {section.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.assets.map(a => {
                const key = section.name + a.title;
                return (
                  <div key={a.title} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: 0 }}>{a.title}</p>
                        <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0", lineHeight: 1.5 }}>💡 {a.hint}</p>
                      </div>
                      <button onClick={() => copy(key, a.text)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: copied === key ? "rgba(74,124,89,0.1)" : C.cream, border: `1px solid ${copied === key ? "rgba(74,124,89,0.4)" : C.border}`, borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 600, color: copied === key ? "#4A7C59" : C.dark, cursor: "pointer", fontFamily: "Heebo, sans-serif", flexShrink: 0 }}>
                        {copied === key ? <><Check size={13} /> הועתק!</> : <><Copy size={13} /> העתק</>}
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: "#444", lineHeight: 1.8, margin: "10px 0 0", whiteSpace: "pre-wrap", background: C.ivory, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.border}` }}>{a.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
