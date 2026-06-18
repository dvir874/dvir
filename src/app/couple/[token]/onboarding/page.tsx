"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, Check, Heart, Sparkles } from "lucide-react";

const C = {
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#333333",
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  border: "rgba(197,164,109,0.22)",
  muted:  "rgba(51,51,51,0.55)",
};

/* ─── Style options ─────────────────────────────────────────────────────────── */
const STYLES = [
  { id: "classic",  label: "קלאסי ואלגנטי",   emoji: "🌹", desc: "נצחי, מרהיב, שחור-לבן-זהב" },
  { id: "modern",   label: "מודרני ומינימלי",  emoji: "◼", desc: "נקי, עכשווי, קווים נועזים" },
  { id: "romantic", label: "רומנטי וחלומי",    emoji: "🌸", desc: "פרחוני, עדין, אוורירי" },
  { id: "boho",     label: "בוהו ואורגני",     emoji: "🌿", desc: "טבעי, ירוק, כפרי" },
  { id: "outdoor",  label: "טקס בחוץ",         emoji: "☀️", desc: "גן, טבע, אור טבעי" },
  { id: "luxury",   label: "יוקרה בלי פשרות", emoji: "✦",  desc: "פרמיום, גרנד, מפואר" },
];

/* ─── Fears options ─────────────────────────────────────────────────────────── */
const FEARS = [
  { id: "budget",     label: "תקציב",              emoji: "💰" },
  { id: "family",     label: "דינמיקה משפחתית",   emoji: "👨‍👩‍👧" },
  { id: "logistics",  label: "לוגיסטיקה ותיאום",  emoji: "📋" },
  { id: "stress",     label: "לחץ ועומס",          emoji: "😤" },
  { id: "forgetting", label: "לשכוח משהו חשוב",   emoji: "🤦" },
  { id: "vendors",    label: "ספקים לא אמינים",    emoji: "🔧" },
];

/* ─── Manager options ─────────────────────────────────────────────────────────*/
const MANAGERS = [
  { id: "bride",  label: "הכלה",            emoji: "👰" },
  { id: "groom",  label: "החתן",            emoji: "🤵" },
  { id: "both",   label: "שנינו ביחד",      emoji: "💑" },
  { id: "other",  label: "בן משפחה / יועץ", emoji: "🙋" },
];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(197,164,109,0.18)" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${((step) / total) * 100}%`, background: `linear-gradient(90deg, ${C.gold}, #D4BC8A)` }}
      />
    </div>
  );
}

function Card({ children, selected, onClick }: {
  children: React.ReactNode; selected?: boolean; onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-right w-full p-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: selected ? "linear-gradient(135deg,rgba(197,164,109,0.15),rgba(197,164,109,0.08))" : C.ivory,
        border: `1.5px solid ${selected ? C.gold : C.border}`,
        boxShadow: selected ? "0 4px 20px rgba(197,164,109,0.20)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export default function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();

  const [step,      setStep]      = useState(0);
  const [mounted,   setMounted]   = useState(false);
  const [animating, setAnimating] = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Form state
  const [weddingDate,  setWeddingDate]  = useState("");
  const [guestCount,   setGuestCount]   = useState(150);
  const [venue,        setVenue]        = useState<"hall"|"garden"|"abroad"|"unknown">("hall");
  const [style,        setStyle]        = useState("");
  const [fears,        setFears]        = useState<string[]>([]);
  const [moment,       setMoment]       = useState("");
  const [manager,      setManager]      = useState("both");
  const [showSuccess,  setShowSuccess]  = useState(false);

  const TOTAL_STEPS = 7;

  useEffect(() => {
    setMounted(true);
    // Check if already onboarded
    fetch(`/api/couple/${token}/onboarding`)
      .then(r => r.json())
      .then(d => { if (d.onboarding_completed) router.replace(`/couple/${token}`); });
  }, [token, router]);

  function nextStep() {
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 220);
  }
  function prevStep() {
    setAnimating(true);
    setTimeout(() => { setStep(s => s - 1); setAnimating(false); }, 220);
  }
  function toggleFear(id: string) {
    setFears(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  async function finish() {
    setSaving(true);
    try {
      await fetch(`/api/couple/${token}/onboarding`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestCount, style, fears, moment, manager }),
      });
      setShowSuccess(true);
      setTimeout(() => router.replace(`/couple/${token}`), 3000);
    } catch {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  if (showSuccess) {
    return (
      <div style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center px-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg,#C5A46D,#D4BC8A)", boxShadow: "0 12px 40px rgba(197,164,109,0.35)" }}
          >
            <Sparkles size={40} color="white" />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            תוכנית החתונה שלכם מוכנה ✦
          </h1>
          <p className="text-base" style={{ fontFamily: "Heebo, sans-serif", color: C.muted }}>
            הכנו עבורכם רשימת משימות מותאמת אישית, לוח זמנים ותקציב מוצע.
            <br />מעבירים אתכם ללוח הבקרה...
          </p>
        </div>
      </div>
    );
  }

  const stepContent = () => {
    switch (step) {
      /* ─── Step 0: Date ──────────────────────────────────────────────────── */
      case 0: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 1 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מתי היום הגדול?
          </h2>
          <p className="text-sm mb-8" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            התאריך הוא הבסיס לתוכנית שלכם — כל משימה תתוזמן בהתאם
          </p>
          <input
            type="date"
            value={weddingDate}
            onChange={e => setWeddingDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full px-5 py-4 rounded-2xl text-base outline-none"
            style={{ background: C.ivory, border: `1.5px solid ${weddingDate ? C.gold : C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
          />
          <button
            onClick={nextStep}
            disabled={!weddingDate}
            className="w-full mt-6 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}
          >
            המשיכו <ArrowLeft size={18} />
          </button>
        </div>
      );

      /* ─── Step 1: Guest Count ───────────────────────────────────────────── */
      case 1: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 2 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            כמה אורחים בערך?
          </h2>
          <p className="text-sm mb-8" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            אפשר לשנות אחר כך — זה רק כדי לכייל את התקציב המוצע
          </p>
          <div className="text-center mb-6">
            <span className="text-6xl font-bold" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.gold }}>{guestCount}</span>
            <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>אורחים</p>
          </div>
          <input
            type="range" min={50} max={600} step={10}
            value={guestCount}
            onChange={e => setGuestCount(Number(e.target.value))}
            className="w-full mb-4"
            style={{ accentColor: C.gold }}
          />
          <div className="flex justify-between text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            <span>600+</span><span>300</span><span>150</span><span>50</span>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl font-semibold flex items-center gap-2" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}>
              <ArrowRight size={18} />
            </button>
            <button onClick={nextStep} className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      );

      /* ─── Step 2: Venue type ────────────────────────────────────────────── */
      case 2: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 3 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>איפה?</h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            סוג המקום משפיע על המשימות שניצור עבורכם
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: "hall",    label: "אולם אירועים", emoji: "🏛️" },
              { id: "garden",  label: "גן / חוץ",      emoji: "🌿" },
              { id: "abroad",  label: "חוץ לארץ",      emoji: "✈️" },
              { id: "unknown", label: "עוד לא יודעים", emoji: "🤷" },
            ].map(v => (
              <Card key={v.id} selected={venue === v.id} onClick={() => setVenue(v.id as typeof venue)}>
                <span className="text-2xl block mb-1">{v.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>{v.label}</span>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}>
              <ArrowRight size={18} />
            </button>
            <button onClick={nextStep} className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      );

      /* ─── Step 3: Style ────────────────────────────────────────────────── */
      case 3: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 4 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מה הסגנון שלכם?
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            בחרו את מה שהכי מדבר אליכם
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {STYLES.map(s => (
              <Card key={s.id} selected={style === s.id} onClick={() => setStyle(s.id)}>
                <span className="text-2xl block mb-1">{s.emoji}</span>
                <p className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{s.desc}</p>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}>
              <ArrowRight size={18} />
            </button>
            <button onClick={nextStep} disabled={!style} className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40" style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      );

      /* ─── Step 4: Fears ────────────────────────────────────────────────── */
      case 4: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 5 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מה הכי מדאיג אתכם?
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            בחרו הכל שרלוונטי — נוסיף משימות שיעזרו בדיוק בנקודות האלה
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {FEARS.map(f => (
              <Card key={f.id} selected={fears.includes(f.id)} onClick={() => toggleFear(f.id)}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{f.emoji}</span>
                  <span className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>{f.label}</span>
                  {fears.includes(f.id) && (
                    <Check size={14} style={{ color: C.gold, marginRight: "auto" }} />
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}>
              <ArrowRight size={18} />
            </button>
            <button onClick={nextStep} className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      );

      /* ─── Step 5: Moment ────────────────────────────────────────────────── */
      case 5: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 6 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מה הרגע שהכי חשוב לכם?
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            לא צריך להיות מושלם — כתבו בחופשיות
          </p>
          <textarea
            value={moment}
            onChange={e => setMoment(e.target.value)}
            placeholder="למשל: ריקוד עם אבא, הרגע שנפגשים ליד החופה, לראות את כל המשפחה יחד..."
            rows={4}
            className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none mb-8"
            style={{ background: C.ivory, border: `1.5px solid ${moment ? C.gold : C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
            onFocus={e  => (e.target.style.borderColor = C.gold)}
            onBlur={e   => (e.target.style.borderColor = moment ? C.gold : C.border)}
          />
          <div className="flex gap-3">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}>
              <ArrowRight size={18} />
            </button>
            <button onClick={nextStep} className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${C.gold},#D4BC8A)`, fontFamily: "Heebo, sans-serif" }}>
              המשיכו <ArrowLeft size={18} />
            </button>
          </div>
        </div>
      );

      /* ─── Step 6: Manager ───────────────────────────────────────────────── */
      case 6: return (
        <div>
          <p className="text-gold text-xs tracking-[0.22em] uppercase mb-2" style={{ fontFamily: "Heebo, sans-serif" }}>שלב 7 מתוך 7</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>
            מי מנהל את התכנון?
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            נתאים את הבריפינג היומי בהתאם
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {MANAGERS.map(m => (
              <Card key={m.id} selected={manager === m.id} onClick={() => setManager(m.id)}>
                <span className="text-2xl block mb-1">{m.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>{m.label}</span>
              </Card>
            ))}
          </div>

          {/* Summary before finish */}
          <div className="p-4 rounded-2xl mb-6" style={{ background: "rgba(197,164,109,0.08)", border: `1px solid ${C.border}` }}>
            <p className="text-xs font-semibold mb-2" style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>✦ סיכום תוכנית החתונה שלכם</p>
            <div className="space-y-1">
              {[
                weddingDate && `📅 ${new Date(weddingDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}`,
                `👥 ${guestCount} אורחים`,
                style && `✨ סגנון ${STYLES.find(s => s.id === style)?.label}`,
                fears.length > 0 && `⚡ ${fears.length} תחומים שנתמקד בהם`,
              ].filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{line as string}</p>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={prevStep} className="py-4 px-6 rounded-2xl" style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={finish}
              disabled={saving}
              className="flex-1 py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg,${C.olive},#4A6640)`, fontFamily: "Heebo, sans-serif" }}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} />}
              {saving ? "בונה את התוכנית שלכם..." : "בנו את תוכנית החתונה שלנו ✦"}
            </button>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.cream }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-semibold" style={{ color: C.gold, fontFamily: "Frank Ruhl Libre, serif", letterSpacing: "0.1em" }}>
              רגע לפני ✦
            </p>
            <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
              {step + 1} / {TOTAL_STEPS}
            </p>
          </div>
          <ProgressBar step={step + 1} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-12">
        <div
          className="max-w-md mx-auto"
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateX(20px)" : "none",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          {stepContent()}
        </div>
      </div>
    </div>
  );
}
