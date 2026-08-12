"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, Bell, Check, ChevronLeft, Clock3, MessageCircle, Plus, ShieldCheck, Sparkles, TrendingUp, X } from "lucide-react";

const leads = [
  { id: 1, name: "איתי לוי", service: "מזגן מיני מרכזי", value: 1450, status: "waiting", days: 2, phone: "972501111111" },
  { id: 2, name: "שירה כהן", service: "תיקון נזילה", value: 680, status: "hot", days: 1, phone: "972502222222" },
  { id: 3, name: "דניאל אוחנה", service: "החלפת לוח חשמל", value: 2200, status: "followed", days: 5, phone: "972503333333" },
  { id: 4, name: "מיכל רז", service: "ניקוי מזגן", value: 390, status: "waiting", days: 3, phone: "972504444444" },
];

const statusMeta = {
  waiting: { label: "ממתין לתשובה", tone: "bg-[#fff6df] text-[#8b6914]" },
  hot: { label: "חם", tone: "bg-[#edf7ef] text-[#34764b]" },
  followed: { label: "בוצע פולואפ", tone: "bg-[#f1ede8] text-[#74675e]" },
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 }).format(value);
}

export default function HazaratiPage() {
  const [activeTab, setActiveTab] = useState<"all" | "today" | "hot">("all");
  const [showDemo, setShowDemo] = useState(false);
  const [sent, setSent] = useState<number[]>([]);

  const visibleLeads = useMemo(() => {
    if (activeTab === "today") return leads.filter((lead) => lead.days >= 2);
    if (activeTab === "hot") return leads.filter((lead) => lead.status === "hot");
    return leads;
  }, [activeTab]);

  function markFollowed(id: number) {
    setSent((current) => (current.includes(id) ? current : [...current, id]));
  }

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-[#201a16]" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f8f6f2]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-3 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#201a16] text-white shadow-sm">ח</span>
            <span className="text-lg tracking-tight">חזרתי<span className="text-[#b58b3a]">.</span></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#6f655e] md:flex">
            <a href="#problem" className="transition hover:text-[#201a16]">למה זה קורה</a>
            <a href="#product" className="transition hover:text-[#201a16]">איך זה עובד</a>
            <a href="#pricing" className="transition hover:text-[#201a16]">מחיר</a>
          </nav>
          <a href="#demo" className="rounded-full bg-[#201a16] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#3a302a]">פתחו דמו</a>
        </div>
      </header>

      <section id="top" className="relative overflow-hidden border-b border-black/5">
        <div className="absolute -right-32 top-20 h-80 w-80 rounded-full bg-[#d7b96f]/20 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[#b8c7b0]/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b58b3a]/25 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#8b6914] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              פולואפ שמחזיר כסף, לא עוד CRM
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              שלחת הצעת מחיר?
              <span className="block text-[#b58b3a]">אל תיתן לה להיעלם.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f655e] sm:text-xl">
              חזרתי מזכיר לך בדיוק למי צריך לחזור, מתי, ומה לכתוב — כדי שבעלי מקצוע יפסיקו לאבד עסקאות בין הודעה אחת לאחרת.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setShowDemo(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#201a16] px-6 py-4 font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:bg-[#342a24]">
                נסו את הדמו החינמי <ArrowLeft className="h-4 w-4" />
              </button>
              <a href="#product" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#201a16]/15 bg-white/70 px-6 py-4 font-bold transition hover:bg-white">איך זה עובד?</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#7a7068]">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4f7c59]" /> בלי CRM מסובך</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4f7c59]" /> מתחילים ב-10 דקות</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4f7c59]" /> בלי התחייבות</span>
            </div>
          </div>

          <div id="demo" className="rounded-[2rem] border border-black/10 bg-[#201a16] p-3 shadow-2xl shadow-black/15">
            <div className="rounded-[1.5rem] bg-[#f7f4ee] p-4 sm:p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#8d8279]">יום שלישי · 12 באוגוסט</p>
                  <h2 className="mt-1 text-xl font-extrabold">בוקר טוב, יוסי 👋</h2>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9dfc9] text-[#8b6914]"><Bell className="h-5 w-5" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["7", "ממתינים"],
                  ["₪4,720", "פוטנציאל"],
                  ["3", "לחזור היום"],
                ].map(([value, label]) => <div key={label} className="rounded-2xl border border-black/5 bg-white p-3"><p className="text-lg font-black">{value}</p><p className="mt-0.5 text-[11px] text-[#8d8279]">{label}</p></div>)}
              </div>
              <div className="mt-4 rounded-2xl border border-black/5 bg-white p-3">
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-extrabold">מה דורש תשומת לב?</span><span className="rounded-full bg-[#edf7ef] px-2 py-1 text-[10px] font-bold text-[#34764b]">+₪1,450</span></div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f3ead8] font-bold text-[#8b6914]">א</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">איתי לוי</p><p className="truncate text-xs text-[#8d8279]">מזגן מיני מרכזי · לפני יומיים</p></div>
                  <span className="rounded-xl bg-[#201a16] px-3 py-2 text-[11px] font-bold text-white">לחזור</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-[#b58b3a]/15 bg-[#fbf6e9] p-4">
                <div className="flex items-start gap-3"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#4f7c59]" /><div><p className="text-xs font-bold text-[#6e5a2b]">הודעת פולואפ מוכנה</p><p className="mt-1 text-sm leading-6 text-[#5e544c]">"היי איתי, רק בודק אם יצא לך לעבור על ההצעה ששלחתי. אשמח לעזור אם יש שאלה 🙂"</p></div></div>
                <button onClick={() => setShowDemo(true)} className="mt-3 w-full rounded-xl bg-[#4f7c59] py-2.5 text-xs font-bold text-white">פתחו את הדמו</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-b border-black/5 bg-white py-20">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="max-w-2xl"><p className="text-xs font-bold tracking-[.18em] text-[#b58b3a]">הבעיה</p><h2 className="mt-3 text-4xl font-black tracking-[-.03em] sm:text-5xl">העסקה לא תמיד הולכת לאיבוד בגלל המחיר.</h2><p className="mt-5 text-lg leading-8 text-[#6f655e]">לפעמים פשוט אף אחד לא חזר. בעלי מקצוע עובדים מהשטח, עונים בין עבודות, ושיחות חשובות נבלעות בוואטסאפ.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              [Clock3, "אין זמן", "הלקוח קיבל הצעה ביום שני. ביום חמישי כבר שכחת ממנו."],
              [MessageCircle, "אין תהליך", "כל אחד כותב פולואפ אחר, בזמן אחר, בלי לדעת מה עובד."],
              [TrendingUp, "אין תמונה", "אתה רואה כמה עבודה עשית — לא כמה עסקאות נפלו בין הכיסאות."],
            ].map(([Icon, title, text]) => { const I = Icon as typeof Clock3; return <div key={title as string} className="rounded-3xl border border-black/8 bg-[#faf8f4] p-6"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e9dfc9] text-[#8b6914]"><I className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-extrabold">{title as string}</h3><p className="mt-2 leading-7 text-[#756b63]">{text as string}</p></div> })}
          </div>
        </div>
      </section>

      <section id="product" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-bold tracking-[.18em] text-[#b58b3a]">המוצר</p><h2 className="mt-3 text-4xl font-black tracking-[-.03em] sm:text-5xl">תיבת "למי אני חוזר היום?"</h2></div><p className="max-w-md text-[#6f655e] md:text-left">במקום עוד CRM, מקבלים פעולה אחת ברורה בכל בוקר.</p></div>
          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white p-4 shadow-xl shadow-black/5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4"><div className="flex gap-2">{[["all","הכול"],["today","היום"],["hot","חמים"]].map(([key,label]) => <button key={key} onClick={() => setActiveTab(key as typeof activeTab)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === key ? "bg-[#201a16] text-white" : "bg-[#f4f1ec] text-[#756b63] hover:bg-[#ebe6df]"}`}>{label}</button>)}</div><button className="inline-flex items-center gap-2 rounded-xl bg-[#f4f1ec] px-4 py-2 text-sm font-bold"><Plus className="h-4 w-4" /> ליד חדש</button></div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-black/5">
              <div className="hidden grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] gap-3 bg-[#faf8f4] px-4 py-3 text-xs font-bold text-[#8d8279] md:grid"><span>לקוח</span><span>שירות</span><span>סכום</span><span>סטטוס</span><span /></div>
              {visibleLeads.map((lead) => { const meta = statusMeta[lead.status as keyof typeof statusMeta]; const done = sent.includes(lead.id); return <div key={lead.id} className="grid gap-3 border-t border-black/5 px-4 py-4 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] md:items-center"><div><p className="font-bold">{lead.name}</p><p className="text-xs text-[#8d8279]">לפני {lead.days} ימים</p></div><p className="text-sm text-[#665d56]">{lead.service}</p><p className="font-black">₪{formatMoney(lead.value)}</p><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${meta.tone}`}>{done ? "פולואפ נשלח" : meta.label}</span><button onClick={() => markFollowed(lead.id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${done ? "bg-[#edf7ef] text-[#34764b]" : "bg-[#201a16] text-white hover:bg-[#342a24]"}`}>{done ? "✓ בוצע" : "פתח הודעה"}</button></div> })}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-[#8d8279]"><ShieldCheck className="h-4 w-4 text-[#4f7c59]" /> ב-MVP ההודעה נפתחת ב-WhatsApp ואתם מאשרים ושולחים. אין שליחה אוטומטית בלי הסכמה.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#201a16] py-20 text-white lg:py-24">
        <div className="mx-auto max-w-6xl px-5 lg:px-8"><div className="grid gap-12 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-bold tracking-[.18em] text-[#d7b96f]">לא עוד מערכת ענקית</p><h2 className="mt-3 text-4xl font-black tracking-[-.03em] sm:text-5xl">שלושה צעדים.<br />עסקה אחת שחוזרת לשיחה.</h2></div><div className="space-y-3">{[["01","מוסיפים ליד","שם, טלפון, מה הצעת וכמה."],["02","חזרתי מתזכר","מתי נכון לחזור ומה לכתוב."],["03","לוחצים ושולחים","הוואטסאפ נפתח עם הודעה מוכנה." ]].map(([n,t,d]) => <div key={n} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-sm font-black text-[#d7b96f]">{n}</span><div><h3 className="font-extrabold">{t}</h3><p className="mt-1 text-sm text-white/55">{d}</p></div></div>)}</div></div></div>
      </section>

      <section id="pricing" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8"><p className="text-xs font-bold tracking-[.18em] text-[#b58b3a]">מחיר</p><h2 className="mt-3 text-4xl font-black tracking-[-.03em]">פשוט מספיק כדי לא לחשוב עליו.</h2><p className="mx-auto mt-4 max-w-xl text-[#6f655e]">מחיר ה-MVP נועד להיות נמוך משמעותית ממערכת CRM מלאה, כי אנחנו פותרים בעיה אחת.</p><div className="mx-auto mt-10 max-w-md rounded-[2rem] border-2 border-[#b58b3a]/30 bg-[#fbf8f1] p-8 text-right shadow-xl shadow-[#b58b3a]/10"><div className="flex items-end justify-between"><div><p className="text-sm font-bold text-[#8d8279]">חזרתי Pro</p><p className="mt-2 text-5xl font-black">₪79</p></div><span className="rounded-full bg-[#201a16] px-3 py-1 text-xs font-bold text-white">14 יום ניסיון</span></div><p className="mt-1 text-sm text-[#8d8279]">לחודש · לפני מע״מ</p><ul className="mt-7 space-y-3 text-sm">{["עד 300 לידים פעילים","תזכורות פולואפ","הודעות WhatsApp מוכנות","דוח עסקאות שלא חזרו","ייצוא CSV","ללא התחייבות"].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#4f7c59]" />{item}</li>)}</ul><button onClick={() => setShowDemo(true)} className="mt-7 w-full rounded-2xl bg-[#201a16] py-4 font-bold text-white transition hover:-translate-y-0.5">התחילו בחינם</button></div></div>
      </section>

      <section className="border-t border-black/5 bg-[#f4f0e9] py-16">
        <div className="mx-auto max-w-6xl px-5 lg:px-8"><div className="grid gap-6 md:grid-cols-3"><div><p className="text-sm font-black">למי זה מתאים?</p><p className="mt-2 text-sm leading-6 text-[#6f655e]">חשמלאים, טכנאי מזגנים, אינסטלטורים, מנעולנים, מתקינים ובעלי מקצוע שמקבלים לידים ומוציאים הצעות מחיר.</p></div><div><p className="text-sm font-black">למי לא?</p><p className="mt-2 text-sm leading-6 text-[#6f655e]">לעסק עם צוות מכירות גדול שכבר עובד עם CRM ו-workflows מורכבים.</p></div><div><p className="text-sm font-black">למה עכשיו?</p><p className="mt-2 text-sm leading-6 text-[#6f655e]">כי יש מאות אלפי עסקים קטנים בישראל, אבל רובם לא צריכים עוד מערכת — הם צריכים שהפעולה הבאה תהיה ברורה.</p></div></div></div>
      </section>

      <footer className="bg-[#201a16] px-5 py-8 text-white/55"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between"><p>חזרתי. פחות לידים שנופלים בין הכיסאות.</p><p>© 2026 · MVP concept</p></div></footer>

      {showDemo && <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" onClick={() => setShowDemo(false)}><div className="w-full max-w-lg rounded-[2rem] bg-[#fbf8f1] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="text-xs font-bold tracking-[.16em] text-[#b58b3a]">DEMO</p><h2 className="mt-1 text-2xl font-black">בואו נראה ליד שלא הלך לאיבוד</h2></div><button onClick={() => setShowDemo(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white"><X className="h-4 w-4" /></button></div><div className="mt-5 rounded-2xl bg-white p-4"><div className="flex items-center justify-between"><div><p className="font-bold">שירה כהן</p><p className="text-xs text-[#8d8279]">תיקון נזילה · ₪680</p></div><span className="rounded-full bg-[#fff6df] px-2.5 py-1 text-xs font-bold text-[#8b6914]">לחזור היום</span></div><div className="mt-4 rounded-xl bg-[#f4f0e9] p-3 text-sm leading-6 text-[#5e544c]">היי שירה, רק בודק אם יצא לך לעבור על ההצעה ששלחתי. אשמח לענות על כל שאלה.</div><div className="mt-3 flex gap-2"><button onClick={() => setShowDemo(false)} className="flex-1 rounded-xl bg-[#201a16] py-3 text-sm font-bold text-white">פתיחת WhatsApp</button><button onClick={() => setShowDemo(false)} className="rounded-xl border border-black/10 px-4 py-3 text-sm font-bold">אחר כך</button></div></div><p className="mt-4 text-center text-xs text-[#8d8279]">זה דמו מקומי — עדיין לא נשלחת הודעה אמיתית.</p></div></div>}
    </main>
  );
}
