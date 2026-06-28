"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, Clock, XCircle, Users, Loader2, AlertCircle,
  Wallet, LayoutGrid, ListChecks, Gift, Plus, Trash2,
  ChevronDown, ChevronUp, Camera, Mic, Lock, Sparkles, Zap,
} from "lucide-react";
import type { WeddingScore, SmartAlert } from "@/lib/wedding-score";
import ChatWidget from "@/components/ChatWidget";
import HelpButton from "@/components/HelpButton";
import WeddingHealthCard from "@/components/WeddingHealthCard";
import CoupleBottomNav from "@/components/CoupleBottomNav";

// F7 — 50 daily quotes, deterministic by day (not random)
const INSPIRATION_QUOTES = [
  "האהבה אינה מסתכלת בשעון — היא פשוט נמצאת שם.",
  "כל יום יחד הוא דף חדש בסיפור שלכם.",
  "לא מה שיש לכם, אלא מה שאתם בונים יחד — זה שיישאר.",
  "החתונה היא הפתיח; החיים המשותפים הם היצירה.",
  "שתי נשמות, בית אחד, אינסוף פרקים לפנינו.",
  "אושר אמיתי הוא שיהיה מישהו שמח לראות אותך כשאתה חוזר הביתה.",
  "אהבה היא הבחירה שבוחרים מחדש כל יום.",
  "הפרטים הקטנים — הם לב הסיפור הגדול.",
  "ביחד אתם חזקים יותר מהסכום של שניכם.",
  "הזמן עובר, הרגעים נשארים — תעשו כמה שיותר.",
  "כל זוג כותב את הסיפור שלו. הפרק הזה רק מתחיל.",
  "חתונה היא הבטחה שעושים ברגל אחת — ומקיימים עם שתיהן.",
  "לאהוב מישהו זה לראות אותו כמו שהוא ולהחזיק את ידו בכל זאת.",
  "הדבר הטוב ביותר שתחזיקו בחיים זה יד של מישהו שאוהב אתכם.",
  "האמת הגדולה ביותר: ביחד הכל יותר קל.",
  "מהיום אתם לא שניים — אתם אחד עם שתי נקודות מבט מדהימות.",
  "כל הכנה עכשיו היא מתנה לכם בעתיד.",
  "הפרחים יכמשו, הגלידה תיגמר — אבל האהבה שלכם תישאר.",
  "גם אם הכל לא מושלם — הם בוחרים אחד את השנייה. זה הכי חשוב.",
  "החתונה היא יום אחד. הנישואין הם חיים שלמים. שניהם שווים כל רגע.",
  "הספירה לאחור החלה — אבל הסיפור שלכם רק מתחיל.",
  "כל יום שעובר הוא צעד אחד קרוב יותר לרגע שיזכרו תמיד.",
  "לא מחפשים שלמות — מחפשים מישהו שגורם לכם להרגיש שלמים.",
  "אין אירוע מושלם — יש רגעים אמיתיים. ואלו חשובים יותר.",
  "הקסם אינו בחתונה — אלא בכל הבוקרים שאחריה.",
  "הזמינו את כולם לחגוג את מה שבניתם יחד.",
  "הרגע הזה — של הכנה, של ציפייה — הוא חלק מהסיפור.",
  "אהבה אמיתית אינה עיוורת — היא רואה הכל ובוחרת בכל זאת.",
  "כשיהיה קשה, תזכרו: בחרתם אחד את השנייה. זה הכל.",
  "השמחה הגדולה ביותר היא לחלוק אותה עם מישהו.",
  "יחד אתם יוצרים משהו שלא היה קיים לפני — משפחה חדשה.",
  "כל ההכנות, כל הלחץ — הכל שווה את הרגע הזה.",
  "חיים משותפים הם אמנות — ואתם האמנים.",
  "עוד קצת — ואז מתחילת הפרק הכי יפה.",
  "אתם לא מארגנים חתונה — אתם בונים זיכרון.",
  "כשתסתכלו אחורה, תחייכו על כל פרט קטן שדאגתם לו.",
  "הדאגה מגיעה מהאהבה. וזה נפלא.",
  "כל אורח שמגיע הוא עוד חלק מהסיפור שלכם.",
  "האושר שלכם מדבק — שתפו אותו עם כולם.",
  "מהרגע שבחרתם אחד את השנייה — כל שאר ההחלטות פשוטות יותר.",
  "החיים לא מחכים. אבל הרגע הנכון — הוא עכשיו.",
  "אהבה היא לשמוע את השקט ביחד ולהרגיש שלמים.",
  "כל זוג שמגיע לחתונה מביא איתו חלק מהסיפור שלכם.",
  "הדבר היחיד שצריך ביום הגדול: להיות נוכחים ברגע.",
  "אתם מוכנים — גם אם זה לא מרגיש כך עדיין.",
  "האהבה בנויה על אמון, בחירה, ויום אחד ביחד בכל פעם.",
  "החתונה היא ההתחלה. הכל שלפניה — זה הדרך.",
  "רגע לפני — כל שנייה שלו שווה לנצח.",
  "תנו לאהבה להוביל אתכם. היא תמיד יודעת את הדרך.",
  "עוד יום אחד — ואז החיים שלכם משתנים לטובה, לתמיד.",
  "האושר הגדול ביותר: לדעת שיש מישהו שמחכה לכם הביתה.",
];

// F8 — Context-aware daily tips by days-left bucket
const TIPS_EARLY = [
  "💡 יש לכם זמן — אבל הזמן עובר מהר. תתחילו עם רשימת האורחים עכשיו.",
  "💡 טיפ: צרו תקציב ראשוני עוד לפני שמתחילים לשאול ספקים.",
  "💡 אולם הוא הבסיס לכל שאר ההחלטות — סגרו אותו ראשון.",
  "💡 Save The Date כדאי לשלוח 6 חודשים לפני. עדיין יש זמן!",
  "💡 הכינו רשימת VIP — אלו שחייבים להגיע. הם עוזרים לקבוע את התאריך.",
  "💡 חפשו צלם לפחות 8 חודשים מראש — הטובים נגמרים מהר.",
  "💡 פתחו חשבון חיסכון ייעודי לחתונה — קל יותר לנהל כך.",
  "💡 תתחילו לאסוף השראה עכשיו — Pinterest, Instagram, חתונות שאהבתם.",
];
const TIPS_MID = [
  "💡 עדיין לא סגרתם DJ? עכשיו הזמן — לפני שכולם יוצאו.",
  "💡 קייטרינג: בקשו טעימה לפני שחותמים. זה הכלל הראשון.",
  "💡 שלחו הזמנות לפחות חודש לפני — לאורחים מחוץ לעיר, חודשיים.",
  "💡 סידורי הושבה: תתחילו לחשוב על הלוגיקה. מי ליד מי?",
  "💡 ספקים: בקשו חוזה כתוב מכולם. הכל בכתב.",
  "💡 כבר תיאמתם עם הרב/עורך הטקס? כדאי לסגור מוקדם.",
  "💡 אם אתם עושים הפתעות — תתאמו עם הצוות עכשיו.",
  "💡 כדאי לפתוח קבוצת WhatsApp לצוות היום — כך הכל מסונכרן.",
];
const TIPS_FINAL = [
  "💡 פחות מחודש! שלחו תזכורת לכל מי שעדיין לא ענה.",
  "💡 הכינו תיק 'חירום': גרבי עתודה, מדבקות, תרופות, מגנט.",
  "💡 עשו rehearsal קצר עם צוות האירוע שבוע לפני.",
  "💡 תאמו עם הצלם את כל הצילומים שאתם רוצים — עם רשימה כתובה.",
  "💡 בדקו שהתשלום לכל הספקים מסודר. אל תשאירו לאחרון.",
  "💡 הכינו תוכנית B לכל דבר שיכול לא לעבוד.",
  "💡 הורידו את כתובת האולם לניווט offline — למקרה שאין קליטה.",
  "💡 תתנסו בלבוש המלא שבוע לפני — נעליים כלולות.",
];
const TIPS_LASTWEEK = [
  "💡 שבוע אחרון! אשרו כמויות סופיות עם הקייטרינג.",
  "💡 שלחו לכל ספק SMS עם שעת ההגעה המדויקת ושם איש הקשר שלכם.",
  "💡 הדפיסו גיבוי של רשימת הושבה — גם אם יש דיגיטלי.",
  "💡 ישנו מוקדם שלשום. ביום לפני תהיו עייפים — זה נורמלי.",
  "💡 הכינו מעטפה עם מזומן קטן לטיפים לצוות האולם.",
  "💡 הפקידו ביד מישהו אמין: טבעות, כתובה, מסמכי רבנות.",
  "💡 הורידו את אפליקציית הגלריה שלנו — תשתפו עם האורחים ביום.",
  "💡 הזכירו לכולם: ביום האירוע, הטלפונים בצד. תהיו נוכחים.",
];

function getDailyTip(daysLeft: number): string {
  const dayIdx = Math.floor(Date.now() / 86_400_000);
  if (daysLeft > 90) return TIPS_EARLY[dayIdx % TIPS_EARLY.length];
  if (daysLeft > 30) return TIPS_MID[dayIdx % TIPS_MID.length];
  if (daysLeft > 7)  return TIPS_FINAL[dayIdx % TIPS_FINAL.length];
  return TIPS_LASTWEEK[dayIdx % TIPS_LASTWEEK.length];
}

function getTimeTheme() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return {
    // Morning — deep warm gold-brown, premium
    gradient:   "linear-gradient(160deg, #5C3D1E 0%, #3D2410 55%, #1E1008 100%)",
    bgPage:     "#F6F1E8",
    ring1:      "rgba(197,164,109,0.18)",
    ring2:      "rgba(197,164,109,0.09)",
    radial:     "radial-gradient(ellipse at 15% 10%, rgba(197,164,109,0.18) 0%, transparent 55%)",
    label:      "בוקר טוב ☀️",
    textMuted:  "rgba(255,235,185,0.65)",
    factBg:     "rgba(255,255,255,0.10)",
    factBorder: "rgba(197,164,109,0.35)",
  };
  if (h >= 12 && h < 18) return {
    // Afternoon — deep olive-charcoal, premium
    gradient:   "linear-gradient(160deg, #3A4D2E 0%, #253320 55%, #121A0E 100%)",
    bgPage:     "#F2EDE3",
    ring1:      "rgba(180,210,140,0.15)",
    ring2:      "rgba(107,123,90,0.10)",
    radial:     "radial-gradient(ellipse at 80% 10%, rgba(180,210,140,0.16) 0%, transparent 55%)",
    label:      "צהריים טובים 🌿",
    textMuted:  "rgba(210,235,180,0.65)",
    factBg:     "rgba(255,255,255,0.10)",
    factBorder: "rgba(180,210,140,0.30)",
  };
  // Evening/Night — deep espresso-gold, premium
  return {
    gradient:   "linear-gradient(160deg, #3D2B1F 0%, #24160C 55%, #0E0806 100%)",
    bgPage:     "#F2EDE3",
    ring1:      "rgba(197,164,109,0.16)",
    ring2:      "rgba(197,164,109,0.08)",
    radial:     "radial-gradient(ellipse at 60% 10%, rgba(197,164,109,0.14) 0%, transparent 55%)",
    label:      "לילה טוב 🌙",
    textMuted:  "rgba(255,235,185,0.60)",
    factBg:     "rgba(255,255,255,0.10)",
    factBorder: "rgba(197,164,109,0.32)",
  };
}

const C = {
  cream:  "#F2EDE3",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.42)",
  border: "rgba(197,164,109,0.22)",
  card:   "#FFFFFF",
  shadow: "0 4px 24px rgba(28,16,8,0.09), 0 1px 4px rgba(197,164,109,0.10)",
};

interface EventInfo    { id: string; name: string; date: string; address?: string | null; client_name?: string | null }
interface Stats        { total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number }
interface Budget       { planned: number; actual: number; remaining: number; itemCount: number }
interface Seating      { totalSeats: number; assignedSeats: number; tableCount: number }
interface Tasks        { total: number; completed: number }
interface GiftsSummary { total: number; count: number }
interface DashboardData { event: EventInfo; stats: Stats; budget: Budget; seating: Seating; tasks: Tasks; gifts: GiftsSummary }
interface WeddingTask  { id: string; title: string; category: string; completed: boolean; due_date?: string | null }

interface BriefingData {
  greeting:       string;
  phase:          string;
  phaseLabel:     string;
  phaseMessage:   string;
  daysUntilEvent: number;
  eventName:      string;
  score:          WeddingScore;
  alerts:         SmartAlert[];
  keyFacts:       string[];
  readinessPct:   number;
  event?:         { id: string; name: string; date: string; address?: string | null; bride_name?: string | null; groom_name?: string | null; mini_site_hero_path?: string | null; service_steps?: unknown[]; event_timeline?: { time: string; title: string }[] };
}

const VENDOR_CATEGORIES = [
  { key: "photographer", label: "צלם",          emoji: "📸" },
  { key: "videographer", label: "צלם וידאו",    emoji: "🎬" },
  { key: "dj",           label: "DJ / תזמורת",  emoji: "🎵" },
  { key: "catering",     label: "קייטרינג",      emoji: "🍽️" },
  { key: "flowers",      label: "פרחים",         emoji: "💐" },
  { key: "dress",        label: "שמלה / חליפה",  emoji: "👗" },
  { key: "rabbi",        label: "רב",             emoji: "📜" },
  { key: "venue",        label: "אולם",           emoji: "🏛️" },
];

const ALERT_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  urgent:    { bg: "rgba(192,57,43,0.06)",  border: "rgba(192,57,43,0.25)",  text: "#C0392B", icon: "🚨" },
  important: { bg: "rgba(197,164,109,0.08)",border: "rgba(197,164,109,0.3)", text: "#A07840", icon: "⚠️" },
  suggested: { bg: "rgba(107,123,90,0.06)", border: "rgba(107,123,90,0.2)",  text: "#4A7C3F", icon: "💡" },
  info:      { bg: "rgba(107,123,90,0.05)", border: "rgba(107,123,90,0.15)", text: "#6B7B5A", icon: "✅" },
};

function fmt(n: number) { return n.toLocaleString("he-IL"); }

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });
  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true }); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
        done: false,
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

// Inline countdown used inside the hero header
function CountdownInline({ targetDate }: { targetDate: string }) {
  const t = useCountdown(targetDate);
  if (t.done) return null;
  const units = [
    { label: "ימים",   value: t.days    },
    { label: "שעות",   value: t.hours   },
    { label: "דקות",   value: t.minutes },
    { label: "שניות",  value: t.seconds },
  ];
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem" }}>
      {units.map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
          <div style={{
            background: "linear-gradient(160deg, rgba(197,164,109,0.18) 0%, rgba(197,164,109,0.06) 100%)",
            border: "1px solid rgba(197,164,109,0.25)",
            borderRadius: 14,
            padding: "0.7rem 0.3rem 0.6rem",
            marginBottom: "0.4rem",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1.5rem,5.5vw,2rem)", fontWeight: 700, color: "#C5A46D", lineHeight: 1 }}>
              {String(value).padStart(2, "0")}
            </span>
          </div>
          <span style={{ fontSize: 9, color: "rgba(197,164,109,0.5)", fontFamily: "Heebo, sans-serif", letterSpacing: "0.1em" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(197,164,109,0.15)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="70" y="65" textAnchor="middle" style={{ fontSize: 32, fontWeight: 700, fill: color, fontFamily: "Frank Ruhl Libre, serif" }}>{score}</text>
      <text x="70" y="85" textAnchor="middle" style={{ fontSize: 11, fill: "rgba(51,51,51,0.5)", fontFamily: "Heebo, sans-serif" }}>/ 100</text>
    </svg>
  );
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ name }: { name: string }) {
  const [phase, setPhase] = useState<"hidden" | "show" | "fade">("hidden");
  useEffect(() => {
    if (sessionStorage.getItem("raga_splash_shown")) return;
    sessionStorage.setItem("raga_splash_shown", "1");
    setPhase("show");
    const t1 = setTimeout(() => setPhase("fade"), 2400);
    const t2 = setTimeout(() => setPhase("hidden"), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  if (phase === "hidden") return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#080402",
      display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      gap: "1.25rem",
      opacity: phase === "fade" ? 0 : 1,
      transition: phase === "fade" ? "opacity 0.9s cubic-bezier(0.4,0,0.2,1)" : "opacity 0.4s ease",
      pointerEvents: phase === "fade" ? "none" : "all",
    }}>
      {/* Stars background */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: Math.random() * 2 + 1 + "px", height: Math.random() * 2 + 1 + "px",
          borderRadius: "50%",
          background: "rgba(197,164,109,0.6)",
          left: Math.random() * 100 + "%", top: Math.random() * 100 + "%",
          animation: `coupleGlow ${1.5 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: Math.random() * 2 + "s",
        }} />
      ))}
      <p style={{ fontSize: 9, letterSpacing: "0.55em", color: "rgba(197,164,109,0.45)", fontFamily: "Heebo, sans-serif", fontWeight: 300, textAlign: "center" }}>
        ✦ &nbsp; ר ג ע &nbsp; ל פ נ י &nbsp; ✦
      </p>
      <div style={{ textAlign: "center" }}>
        <div className="gold-shimmer-text" style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(2.2rem,9vw,4rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {name}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 48, height: 1, background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.55))" }} />
        <span style={{ fontSize: 12, color: "rgba(197,164,109,0.55)", fontFamily: "Heebo, sans-serif", letterSpacing: "0.18em" }}>ברוכים הבאים</span>
        <div style={{ width: 48, height: 1, background: "linear-gradient(90deg,rgba(197,164,109,0.55),transparent)" }} />
      </div>
      {/* Bottom progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(197,164,109,0.15)" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,transparent,#C5A46D,transparent)", animation: "goldShimmer 2.5s linear forwards", backgroundSize: "300% auto" }} />
      </div>
    </div>
  );
}

// ─── Gold Particle Canvas ─────────────────────────────────────────────────────
function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const COLORS = ["rgba(197,164,109,", "rgba(232,213,168,", "rgba(155,122,66,", "rgba(255,235,180,"];
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 800, y: Math.random() * 300,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.4 + 0.08),
      o: Math.random() * 0.7 + 0.1,
      vo: (Math.random() * 0.007 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.o = Math.max(0.05, Math.min(0.85, p.o + p.vo));
        if (p.o <= 0.05 || p.o >= 0.85) p.vo *= -1;
        if (p.y < -8)  { p.y = canvas.height + 8; p.x = Math.random() * canvas.width; }
        if (p.x < -8)  p.x = canvas.width  + 8;
        if (p.x > canvas.width + 8) p.x = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.o.toFixed(2) + ")";
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ─── Wedding Rings ────────────────────────────────────────────────────────────
function WeddingRings() {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem", animation: "coupleFloat 5s ease-in-out infinite" }}>
      <svg width="100" height="52" viewBox="0 0 100 52" fill="none" style={{ overflow: "visible", filter: "drop-shadow(0 2px 8px rgba(197,164,109,0.35))" }}>
        <circle cx="36" cy="26" r="20" fill="none" stroke="#C5A46D" strokeWidth="3.5" />
        <circle cx="36" cy="26" r="20" fill="none" stroke="rgba(232,213,168,0.4)" strokeWidth="1" strokeDasharray="3 10" />
        <circle cx="36" cy="26" r="14" fill="none" stroke="rgba(197,164,109,0.15)" strokeWidth="1" />
        <circle cx="64" cy="26" r="20" fill="none" stroke="#C5A46D" strokeWidth="3.5" />
        <circle cx="64" cy="26" r="20" fill="none" stroke="rgba(232,213,168,0.4)" strokeWidth="1" strokeDasharray="3 10" />
        <circle cx="64" cy="26" r="14" fill="none" stroke="rgba(197,164,109,0.15)" strokeWidth="1" />
        {/* Diamond highlight */}
        <polygon points="50,8 52.5,13 50,18 47.5,13" fill="rgba(232,213,168,0.85)" />
      </svg>
    </div>
  );
}

// ─── Daily encouraging messages ───────────────────────────────────────────────
const DAILY_MESSAGES = [
  "כל יום שעובר מקרב אתכם לרגע הגדול 💛",
  "החתונה מחכה לכם — וזה מרגש! ✨",
  "אתם עושים עבודה מדהימה בארגון הכל 👏",
  "כל פרט קטן הופך לזיכרון גדול ❤️",
  "הדרך לחופה מרופדת בהרבה אהבה 💍",
  "יום אחד פחות — יום אחד יותר קרוב! 🎊",
  "המשפחה והחברים שלכם כבר מתרגשים 🌟",
  "ביחד אתם מסוגלים להכל 💪",
  "זה היום שתספרו עליו לנכדים 🌸",
  "הרגשת ההתרגשות? זה הסימן שאתם בדרך הנכונה 💫",
];

// ─── Updates Center (smart contextual updates) ────────────────────────────────
function UpdatesCenter({ briefing, stats, seating }: {
  briefing: BriefingData;
  stats: { total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number };
  seating: { assignedSeats: number };
}) {
  const updates: { icon: string; text: string; priority: "red" | "yellow" | "green"; href?: string }[] = [];
  const days = briefing.daysUntilEvent;

  if (days > 0 && days <= 5 && stats.attendees > seating.assignedSeats) {
    updates.push({ icon: "🪑", text: `נותרו ${days} ימים — בדקו שסידורי ההושבה מוכנים`, priority: "red", href: `/couple/${window?.location?.pathname?.split("/")[2]}/seating` });
  }
  if (days > 5 && stats.responseRate >= 70 && seating.assignedSeats === 0 && stats.attendees > 0) {
    updates.push({ icon: "🎯", text: `${stats.responseRate}% ענו — הגיע הזמן להתחיל סידורי הושבה`, priority: "yellow" });
  }
  if (briefing.readinessPct >= 90 && days > 0) {
    updates.push({ icon: "✅", text: `אתם מוכנים ב-${briefing.readinessPct}% — מצוין!`, priority: "green" });
  }
  if (stats.pending > 20 && days > 7) {
    updates.push({ icon: "⏳", text: `${stats.pending} אורחים עדיין לא ענו — שקלו לשלוח תזכורת`, priority: "yellow" });
  }

  if (updates.length === 0) return null;

  const COLOR = { red: { border: "#EF4444", bg: "rgba(239,68,68,0.07)", dot: "#EF4444" }, yellow: { border: "#F59E0B", bg: "rgba(245,158,11,0.07)", dot: "#F59E0B" }, green: { border: "#10B981", bg: "rgba(16,185,129,0.07)", dot: "#10B981" } };

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1rem 1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: "0.1em", marginBottom: "0.75rem" }}>❤️ מה חדש?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {updates.map((u, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.75rem", borderRadius: 10, background: COLOR[u.priority].bg, border: `1px solid ${COLOR[u.priority].border}30` }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLOR[u.priority].dot, flexShrink: 0, display: "inline-block" }} />
            <p style={{ fontSize: 13, color: C.dark, flex: 1 }}>{u.icon} {u.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Post-Event Dashboard ──────────────────────────────────────────────────────
function PostEventDashboard({ token, eventName, eventDate }: { token: string; eventName: string; eventDate?: string }) {
  const [photoCount,    setPhotoCount]    = useState(0);
  const [blessingCount, setBlessingCount] = useState(0);

  useEffect(() => {
    fetch(`/api/gallery/${token}`)
      .then(r => r.json())
      .then(d => setPhotoCount(Array.isArray(d.photos) ? d.photos.length : 0))
      .catch(() => {});
    fetch(`/api/memory/${token}/items`)
      .then(r => r.json())
      .then(d => setBlessingCount(Array.isArray(d.items) ? d.items.filter((i: {type?: string}) => i.type === "blessing").length : 0))
      .catch(() => {});
  }, [token]);

  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const POST_GRID = [
    { icon: "📸", label: "גלריה",          sub: "תמונות האירוע",     href: `/gallery/${token}` },
    { icon: "💝", label: "ברכות",          sub: "כל הברכות שקיבלתם", href: `/memories/${token}` },
    { icon: "⏳", label: "קפסולת זמן",     sub: "מכתבים לעתיד",      href: `/couple/${token}/capsule` },
    { icon: "⭐", label: "ריוו",           sub: "כתבו ביקורת",        href: `/survey/${token}` },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 80 }}>
      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(253,250,245,0.97)", backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
      }}>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: C.gold, margin: 0, letterSpacing: "0.05em" }}>רגע לפני</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, cursor: "pointer" }}>
          <div style={{ width: 20, height: 1.5, background: C.dark, borderRadius: 1 }}/>
          <div style={{ width: 14, height: 1.5, background: C.dark, borderRadius: 1 }}/>
          <div style={{ width: 20, height: 1.5, background: C.dark, borderRadius: 1 }}/>
        </div>
      </header>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 16px 24px" }}>
        {/* Hero text */}
        <section style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 32, color: C.dark, margin: "0 0 8px" }}>
            ✨ החתונה הייתה מושלמת!
          </h1>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 24, color: "#8B6914", margin: "0 0 4px" }}>{eventName}</p>
          {formattedDate && (
            <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, margin: 0 }}>{formattedDate}</p>
          )}
        </section>

        {/* Memory stats row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 0, background: C.cream, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: "14px 0", marginBottom: 20, overflow: "hidden",
        }}>
          {[
            { value: photoCount,    label: "תמונות" },
            { value: blessingCount, label: "ברכות"  },
            { value: 0,             label: "זכרונות" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, textAlign: "center",
              borderRight: i < 2 ? `1px solid ${C.border}` : "none",
            }}>
              <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: 0, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* 2×2 action grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {POST_GRID.map(card => (
            <a key={card.label} href={card.href}
               target={card.href.startsWith("http") ? "_blank" : undefined}
               rel="noreferrer"
               style={{
                 textDecoration: "none", background: C.cream, borderRadius: 16,
                 border: `1px solid ${C.border}`, padding: "20px 14px 16px",
                 display: "flex", flexDirection: "column", alignItems: "center",
                 gap: 4, textAlign: "center",
               }}>
              <span style={{ fontSize: 28, marginBottom: 4 }}>{card.icon}</span>
              <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 15, color: C.dark, margin: 0 }}>{card.label}</p>
              <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 12, color: C.muted, margin: 0 }}>{card.sub}</p>
            </a>
          ))}
        </div>

        {/* Photo upload CTA — dashed card per E3-S11 spec */}
        {photoCount === 0 && (
          <a href={`/memory/${token}`} style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
            <div style={{
              background: C.cream,
              border: `2px dashed ${C.gold}`,
              borderRadius: 16,
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, color: C.muted, marginBottom: 8 }}>📷</div>
              <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 400, fontSize: 16, color: C.dark, margin: "0 0 6px" }}>הוסיפו תמונה מהחתונה</p>
              <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 13, color: C.muted, margin: "0 0 16px" }}>שמרו את הרגע הכי יפה</p>
              <span style={{
                display: "inline-block", padding: "10px 24px", borderRadius: 10,
                border: `1.5px solid ${C.gold}`, color: "#8B6914",
                fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 14,
              }}>
                העלו תמונה
              </span>
            </div>
          </a>
        )}
      </div>

      {/* Post-event BottomNav: בית / גלריה / זכרונות / עוד */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 180,
        background: "rgba(253,250,245,0.97)", backdropFilter: "blur(16px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", alignItems: "stretch", height: 56,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }} dir="rtl">
        {[
          { emoji: "🏠", label: "בית",      href: `/couple/${token}`,    active: true  },
          { emoji: "📸", label: "גלריה",    href: `/gallery/${token}`,   active: false },
          { emoji: "💝", label: "זכרונות",  href: `/memories/${token}`,  active: false },
          { emoji: "☰",  label: "עוד",      href: null,                  active: false },
        ].map(tab => (
          tab.href ? (
            <a key={tab.label} href={tab.href}
               style={{ flex: 1, textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, position: "relative" }}>
              {tab.active && <span style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", width: 20, height: 3, borderRadius: 2, background: C.gold }} />}
              <span style={{ fontSize: 20, lineHeight: 1, filter: tab.active ? "none" : "grayscale(0.6) opacity(0.6)" }}>{tab.emoji}</span>
              <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 10, fontWeight: tab.active ? 700 : 400, color: tab.active ? C.gold : C.muted }}>{tab.label}</span>
            </a>
          ) : (
            <div key={tab.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, cursor: "pointer" }}>
              <span style={{ fontSize: 20, lineHeight: 1, filter: "grayscale(0.6) opacity(0.6)" }}>{tab.emoji}</span>
              <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 10, fontWeight: 400, color: C.muted }}>{tab.label}</span>
            </div>
          )
        ))}
      </nav>
    </div>
  );
}

// ─── Day Before Screen ─────────────────────────────────────────────────────────
function DayBeforeScreen({ token, event, vendors: vendorMap }: {
  token: string;
  event: { name: string; date: string; address?: string | null };
  vendors: Record<string, boolean>;
}) {
  const wazeLink = event.address ? `https://waze.com/ul?q=${encodeURIComponent(event.address)}` : null;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(253,250,245,0.97)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: C.gold, margin: 0 }}>רגע לפני</p>
      </header>

      {/* Hero */}
      <div style={{ padding: "2rem 1.5rem 1.5rem", textAlign: "center", background: C.ivory }}>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 32, color: C.dark, margin: "0 0 8px" }}>🌟 מחר זה הגדול!</p>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontStyle: "italic", fontSize: 20, color: "#8B6914", margin: 0 }}>{event.name}</p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {/* What to bring */}
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: "0.85rem" }}>✅ מה לקחת מחר</h2>
          {["תעודת זהות", "חוזים חתומים עם הספקים", "מסמכי הרבנות", "נעליים נוחות לגיבוי", "מטען לטלפון", "כרטיסי שולחן (אם יש)", "תרופות / אנטיביוטיקה (אם רלוונטי)"].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ color: C.gold, fontSize: 14, flexShrink: 0 }}>✔</span>
              <p style={{ fontSize: 13, color: C.dark }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Venue */}
        {event.address && (
          <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: "0.75rem" }}>📍 כתובת האולם</h2>
            <p style={{ fontSize: 14, color: C.dark, marginBottom: "0.75rem" }}>{event.address}</p>
            {wazeLink && (
              <a href={wazeLink} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.6rem 1.25rem", borderRadius: 10, background: "rgba(0,130,255,0.1)", border: "1px solid rgba(0,130,255,0.25)", textDecoration: "none", fontSize: 13, fontWeight: 700, color: "#0082FF" }}>
                🧭 נווט ב-Waze
              </a>
            )}
          </div>
        )}

        {/* Last reminders */}
        <div style={{ background: `linear-gradient(135deg, rgba(197,164,109,0.1), rgba(197,164,109,0.04))`, borderRadius: "1.25rem", border: `1.5px solid rgba(197,164,109,0.3)`, padding: "1.25rem" }}>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.dark, marginBottom: "0.75rem" }}>💛 תזכורות אחרונות</h2>
          {["נסו לישון מוקדם הלילה", "אכלו ארוחת בוקר טובה מחר", "תנו לעצמכם זמן — אל תתחרעו", "הסמארטפונים בצד — תהיו נוכחים ברגע", "תהנו! ❤️"].map((item, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.45rem 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14 }}>💫</span>
              <p style={{ fontSize: 13, color: C.dark }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── F5: Wedding Mode — shown when daysLeft === 0 ────────────────────────────
function WeddingDayScreen({ token, event, briefing }: {
  token: string;
  event: { name: string; date: string; address?: string | null };
  briefing: BriefingData | null;
}) {
  const [timeline, setTimeline] = useState<{ time: string; title: string }[]>(
    briefing?.event?.event_timeline ?? []
  );
  const nowHHMM = (() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  })();
  function timelineItemState(time: string): "active" | "past" | "upcoming" {
    const diff = time.localeCompare(nowHHMM);
    if (diff > 0) return "upcoming";
    const [h, m] = time.split(":").map(Number);
    const [nh, nm] = nowHHMM.split(":").map(Number);
    const minuteDiff = (nh * 60 + nm) - (h * 60 + m);
    if (minuteDiff <= 30) return "active";
    return "past";
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTime, setNewTime]   = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving]     = useState(false);
  const eventId = briefing?.event?.id;

  const wazeLink = event.address
    ? `https://waze.com/ul?q=${encodeURIComponent(event.address)}`
    : "https://waze.com";

  async function addTimelineItem() {
    if (!newTime || !newTitle || !eventId) return;
    setSaving(true);
    const updated = [...timeline, { time: newTime, title: newTitle }]
      .sort((a, b) => a.time.localeCompare(b.time));
    try {
      await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_timeline: updated }),
      });
      setTimeline(updated);
      setNewTime("");
      setNewTitle("");
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  }

  const actions = [
    { icon: "📍", label: "נווט ב-Waze",    href: wazeLink },
    { icon: "📞", label: "אנשי קשר",       href: `/couple/${token}/vendors` },
    { icon: "🪑", label: "הושבה",          href: `/couple/${token}/seating` },
    { icon: "📸", label: "גלריה",          href: `/gallery/${token}` },
    { icon: "💬", label: "הודעה לאורחים",  href: `/couple/${token}/requests` },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.cream, fontFamily: "'Heebo',sans-serif" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg,#3D2B1F 0%,#1C1008 100%)",
        padding: "3rem 1.5rem 2.5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 700, fontSize: "32px", color: "#FFFFFF", margin: "0 0 0.5rem", lineHeight: 1.2, textAlign: "center" }}>
          היום הגדול הגיע! ❤️
        </h1>
        <p style={{ fontFamily: "'Frank Ruhl Libre',serif", fontWeight: 700, fontStyle: "italic", fontSize: 22, color: "#8B6914", marginTop: "0.25rem" }}>{event.name}</p>
        <p style={{ fontFamily: "'Heebo',sans-serif", fontWeight: 300, color: "rgba(255,255,255,0.7)", fontSize: 16, marginTop: "0.25rem" }}>
          {new Date(event.date).toLocaleDateString("he-IL", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "1.5rem" }}>
        {/* Quick actions — 2×2 grid per E3-S10 spec */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {actions.slice(0, 4).map(a => (
            <a key={a.label} href={a.href} target={a.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
               style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem", padding:"1.25rem 0.5rem",
                        background: C.card, borderRadius: 14, boxShadow: C.shadow, textDecoration:"none",
                        border: `1.5px solid ${C.border}` }}>
              <span style={{ fontSize: 26 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{a.label}</span>
            </a>
          ))}
        </div>

        {/* Event timeline */}
        <div style={{ background: C.card, borderRadius: 16, padding: "1.25rem", boxShadow: C.shadow, border: `1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <h2 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, fontSize:18, color:C.dark, margin:0 }}>
              📅 לוז האירוע
            </h2>
            {eventId && (
              <button onClick={() => setShowAddModal(true)}
                      style={{ background:"none", border:`1.5px solid ${C.gold}`, borderRadius:8, padding:"0.3rem 0.75rem",
                               color:C.gold, fontWeight:600, fontSize:12, cursor:"pointer" }}>
                + הוסף
              </button>
            )}
          </div>

          {timeline.length === 0 ? (
            <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
              <p style={{ color: C.muted, fontSize: 14, marginBottom:"0.75rem" }}>עדיין לא הוסיפו לוז לאירוע</p>
              {eventId && (
                <button onClick={() => setShowAddModal(true)}
                        style={{ background:C.gold, color:"#fff", border:"none", borderRadius:10,
                                 padding:"0.6rem 1.5rem", fontWeight:600, cursor:"pointer", fontSize:14 }}>
                  הוסיפו את לוז האירוע
                </button>
              )}
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {timeline.map((item, i) => {
                const state = timelineItemState(item.time);
                return (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:"0.75rem",
                    padding: state === "active" ? "0.75rem 0.75rem" : "0.6rem 0.75rem",
                    borderRadius:10,
                    background: C.cream,
                    border: state === "active" ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                    opacity: state === "past" ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}>
                    <span style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, color:"#8B6914", fontSize:18, minWidth:48 }}>{item.time}</span>
                    <span style={{ fontFamily:"'Heebo',sans-serif", fontSize:15, color:C.dark }}>{item.title}</span>
                    {state === "active" && <span style={{ marginRight:"auto", fontSize:10, fontFamily:"'Heebo',sans-serif", color:C.gold, fontWeight:700, background:"rgba(197,164,109,0.12)", borderRadius:8, padding:"2px 8px" }}>עכשיו</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add timeline modal */}
      {showAddModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(28,16,8,0.55)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
             onClick={() => setShowAddModal(false)}>
          <div style={{ background:C.card, borderRadius:"20px 20px 0 0", padding:"1.5rem", width:"100%", maxWidth:520 }}
               onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily:"'Frank Ruhl Libre',serif", fontWeight:700, fontSize:18, color:C.dark, marginBottom:"1rem" }}>הוסיפו פריט ללוז</h3>
            <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", gap:"0.75rem", marginBottom:"1rem" }}>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                     style={{ padding:"0.6rem", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit" }} />
              <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                     placeholder="תיאור (למשל: קבלת פנים)"
                     style={{ padding:"0.6rem", borderRadius:8, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit" }} />
            </div>
            <button onClick={addTimelineItem} disabled={saving || !newTime || !newTitle}
                    style={{ width:"100%", background:C.gold, color:"#fff", border:"none", borderRadius:10,
                             padding:"0.8rem", fontWeight:700, fontSize:15, cursor:saving?"wait":"pointer",
                             opacity: (!newTime||!newTitle) ? 0.5 : 1 }}>
              {saving ? "שומר..." : "הוסף"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confetti (one-time burst on load) ────────────────────────────────────────
function useConfetti() {
  useEffect(() => {
    if (sessionStorage.getItem("raga_confetti_shown")) return;
    sessionStorage.setItem("raga_confetti_shown", "1");
    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { position:"fixed", inset:"0", width:"100%", height:"100%", pointerEvents:"none", zIndex:"99997" });
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const COLORS = ["#C5A46D","#E8D5A8","#9B7A42","#6B7B5A","#FDFAF5","#D4BC8A","#BFA060"];
    const pieces = Array.from({ length: 130 }, () => ({
      x: canvas.width * 0.3 + Math.random() * canvas.width * 0.4,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: -(Math.random() * 14 + 4),
      angle: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.18,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 9 + 4,
      h: Math.random() * 6 + 3,
      o: 1,
      shape: Math.random() > 0.55 ? "rect" : "circle" as "rect"|"circle",
    }));
    let animId: number;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.38;
        p.angle += p.vr;
        p.vx *= 0.995;
        if (p.y > canvas.height * 0.6) p.o = Math.max(0, p.o - 0.025);
        if (p.o > 0 && p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.o;
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        else { ctx.beginPath(); ctx.arc(0, 0, p.w/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(draw);
      else canvas.remove();
    }
    draw();
    return () => { cancelAnimationFrame(animId); canvas.remove(); };
  }, []);
}

// ── E3-S6: Circular Progress Arc ─────────────────────────────────────────────
function CircularProgressArc({ value, label }: { value: number; label: string }) {
  const r     = 52;
  const circ  = 2 * Math.PI * r;
  const arc   = circ * 0.75;
  const filled = (Math.min(value, 100) / 100) * arc;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0 24px", position:"relative" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`${label}: ${value}%`} style={{ transform:"rotate(135deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(197,164,109,0.14)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${arc} ${circ - arc}`}/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#C5A46D" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`} style={{ transition:"stroke-dasharray .8s ease" }}/>
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-46%)", textAlign:"center" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"28px", fontWeight:900, color:"#8B6914", margin:0, lineHeight:1 }}>{value}%</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:300, color:"#8C7B6E", margin:0 }}>{label}</p>
      </div>
    </div>
  );
}

// ── E3-S7: Quick Action Card ──────────────────────────────────────────────────
function QuickCard({ emoji, value, label, caption, href, rawValue }: {
  emoji:string; value:number|string; label:string; caption:string; href:string; rawValue?:boolean;
}) {
  const display = rawValue ? String(value) : typeof value === "number" ? value.toLocaleString("he-IL") : value;
  return (
    <a href={href} style={{ textDecoration:"none" }}>
      <div style={{ background:"#F6F1E8", borderRadius:"16px", border:"1px solid #E8E0D4", padding:"16px 14px 14px", display:"flex", flexDirection:"column", gap:"2px", minHeight:"88px" }}>
        <span style={{ fontSize:"22px", alignSelf:"flex-end" }}>{emoji}</span>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"28px", fontWeight:700, color:"#1C1008", margin:0, lineHeight:1 }}>{display}</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:300, color:"#8C7B6E", margin:0 }}>{label}</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"11px", fontWeight:600, color:"#C5A46D", margin:"4px 0 0", letterSpacing:".03em" }}>{caption} ←</p>
      </div>
    </a>
  );
}

// ── E3-S7: Smart Alert Strip (max 1 alert, highest urgency first) ─────────────
function SmartAlertStrip({ stats, seating, daysLeft, token }: { stats:Stats; seating:Seating; daysLeft:number; token:string }) {
  const unseated = Math.max(0, stats.attendees - seating.assignedSeats);
  let text: string | null = null;
  let href = `/couple/${token}/seating`;
  if (unseated > 0 && daysLeft < 30)         { text = `${unseated} אורחים לא שובצו — ${daysLeft} ימים נותרו`; href = `/couple/${token}/seating`; }
  else if (stats.pending > 0 && daysLeft < 14){ text = `עדיין ממתינים ל-${stats.pending} אישורים`; href = `/couple/${token}/guests`; }
  else if (stats.total === 0)                  { text = "הוסיפו את האורחים הראשונים שלכם"; href = `/couple/${token}/guests`; }
  if (!text) return null;
  return (
    <a href={href} style={{ textDecoration:"none" }}>
      <div style={{ background:"rgba(197,164,109,0.08)", borderRadius:"12px", border:"1px solid rgba(197,164,109,0.25)", padding:"12px 16px", marginBottom:"12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:400, color:"#1C1008", margin:0 }}>{text}</p>
        <span style={{ color:"#C5A46D", fontFamily:"Heebo,sans-serif", fontSize:"16px", flexShrink:0 }}>←</span>
      </div>
    </a>
  );
}

// ── E3-S7: Milestone Cards ────────────────────────────────────────────────────
const MILESTONE_CTA: Record<string,string> = {
  venue:"קבעו מועד ביקור", payment:"שלמו מקדמה", vendor:"אשרו חוזה",
  decoration:"אשרו פרטים", catering:"סגרו תפריט",
};

function MilestoneCard({ task, token }: { task:WeddingTask; token:string }) {
  const isUrgent = task.due_date && (new Date(task.due_date).getTime() - Date.now()) < 14 * 86_400_000;
  const cta = MILESTONE_CTA[task.category] ?? "המשיכו ←";
  const dueLabel = task.due_date ? new Date(task.due_date).toLocaleDateString("he-IL",{ day:"numeric", month:"short" }) : null;
  return (
    <a href={`/couple/${token}/checklist`} style={{ textDecoration:"none" }}>
      <div style={{ background:"#F6F1E8", borderRadius:"12px", padding:"12px 14px", border:`1px solid ${isUrgent ? "#C5A46D" : "#E8E0D4"}`, borderRightWidth: isUrgent ? "3px" : "1px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:600, color:"#1C1008", margin:"0 0 2px" }}>{task.title}</p>
          {dueLabel && <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"12px", fontWeight:300, color:"#8C7B6E", margin:0 }}>{dueLabel}</p>}
        </div>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:600, color:"#C5A46D", margin:0, flexShrink:0, paddingRight:"8px" }}>{cta}</p>
      </div>
    </a>
  );
}

function MilestoneList({ tasks, token }: { tasks:WeddingTask[]; token:string }) {
  const upcoming = tasks.filter(t => !t.completed && t.due_date)
    .sort((a,b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0,3);
  const shown = upcoming.length > 0 ? upcoming : tasks.filter(t => !t.completed).slice(0,3);
  if (shown.length === 0) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"16px" }}>
      {shown.map(t => <MilestoneCard key={t.id} task={t} token={token} />)}
    </div>
  );
}

export default function CoupleDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();
  const [data,        setData]        = useState<DashboardData | null>(null);
  const [briefing,    setBriefing]    = useState<BriefingData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [tasks,       setTasks]       = useState<WeddingTask[]>([]);
  const [vendors,     setVendors]     = useState<Record<string, boolean>>({});
  const [newTask,     setNewTask]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [showScore,   setShowScore]   = useState(false);
  const [showAlerts,  setShowAlerts]  = useState(true);
  const [actionBusy,  setActionBusy]  = useState<string | null>(null);
  const [actionDone,  setActionDone]  = useState<Set<string>>(new Set());
  useConfetti();
  const [rsvpToast,      setRsvpToast]      = useState("");
  const [announcements,  setAnnouncements]  = useState<{ id: string; message: string; created_at: string }[]>([]);
  const [missingItems,   setMissingItems]   = useState<{ label: string; severity: "high" | "medium" | "low" }[]>([]);
  const [missingOpen,    setMissingOpen]    = useState(false);
  const [missingLoading, setMissingLoading] = useState(false);
  const [showCalendar,   setShowCalendar]   = useState(false);
  const prevConfirmedRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    const [mainRes, briefRes, onboardRes] = await Promise.all([
      fetch(`/api/couple/${token}`),
      fetch(`/api/couple/${token}/briefing`),
      fetch(`/api/couple/${token}/onboarding`),
    ]);
    const main     = await mainRes.json();
    const brief    = await briefRes.json();
    const onboard  = await onboardRes.json();
    if (!main.error)  setData(main);
    if (!brief.error) setBriefing(brief);
    // Redirect to onboarding if not yet completed
    if (!onboard.onboarding_completed && !onboard.error) {
      router.replace(`/couple/${token}/onboarding`);
      return;
    }
    setLoading(false);
  }, [token, router]);

  useEffect(() => { load(); }, [load]);

  // Live RSVP polling — beep + toast when new confirmation arrives
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/couple/${token}`);
        const d = await r.json();
        if (d.error) return;
        const nowConfirmed: number = d.stats?.confirmed ?? 0;
        if (prevConfirmedRef.current !== null && nowConfirmed > prevConfirmedRef.current) {
          // Play a gentle beep via AudioContext
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = "sine";
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
          } catch { /* no audio permission */ }
          const diff = nowConfirmed - prevConfirmedRef.current;
          setRsvpToast(`🎉 ${diff === 1 ? "אורח חדש אישר הגעה!" : `${diff} אורחים חדשים אישרו!`}`);
          setTimeout(() => setRsvpToast(""), 4000);
          setData(d);
        }
        prevConfirmedRef.current = nowConfirmed;
      } catch { /* ignore */ }
    }, 30_000);
    return () => clearInterval(id);
  }, [token]);

  // Fetch announcements from admin
  useEffect(() => {
    fetch(`/api/couple/${token}/announcements`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setAnnouncements(d))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!data?.event?.id) return;
    fetch(`/api/wedding-tasks?event_id=${data.event.id}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTasks(d));
    fetch(`/api/wedding-vendors?event_id=${data.event.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const map: Record<string, boolean> = {};
          d.forEach((v: { category: string; confirmed: boolean }) => { map[v.category] = v.confirmed; });
          setVendors(map);
        }
      });
  }, [data?.event?.id]);

  async function toggleTask(task: WeddingTask) {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
    await fetch(`/api/wedding-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    load();
  }

  async function addTask() {
    if (!newTask.trim() || !data?.event?.id) return;
    setSaving(true);
    await fetch("/api/wedding-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: data.event.id, title: newTask.trim(), category: "general" }),
    });
    setNewTask("");
    const res = await fetch(`/api/wedding-tasks?event_id=${data.event.id}`);
    const d   = await res.json();
    if (Array.isArray(d)) setTasks(d);
    setSaving(false);
  }

  async function deleteTask(id: string) {
    await fetch(`/api/wedding-tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function doAction(action: string, extra?: Record<string, string>) {
    if (actionBusy) return;
    setActionBusy(action);
    try {
      await fetch(`/api/couple/${token}/briefing`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, ...extra }),
      });
      setActionDone(prev => new Set(prev).add(action));
      load();
    } finally {
      setActionBusy(null);
    }
  }

  async function toggleVendor(category: string) {
    const next = !vendors[category];
    setVendors((p) => ({ ...p, [category]: next }));
    await fetch(`/api/couple/${token}/briefing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, confirmed: next }),
    });
    load();
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream }}>
      <Loader2 size={32} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, gap: "1rem" }}>
      <AlertCircle size={40} style={{ color: C.gold }} />
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", color: C.dark }}>הקישור אינו תקין</p>
    </div>
  );

  const { event, stats, budget, seating, gifts } = data;
  const theme      = getTimeTheme();
  const quote      = INSPIRATION_QUOTES[Math.floor(Date.now() / 86_400_000) % INSPIRATION_QUOTES.length];
  const daysLeft   = briefing?.daysUntilEvent ?? Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000);

  // Post-event mode
  if (daysLeft < 0) {
    return <PostEventDashboard token={token} eventName={event.name} eventDate={event.date} />;
  }

  // F5: Wedding day screen
  if (daysLeft === 0) {
    return <WeddingDayScreen token={token} event={event} briefing={briefing} />;
  }

  // Day-before special screen
  if (daysLeft === 1) {
    return <DayBeforeScreen token={token} event={event} vendors={vendors} />;
  }
  const taskPct    = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const seatingPct = stats.attendees > 0 ? Math.round((seating.assignedSeats / stats.attendees) * 100) : 0;
  const score      = briefing?.score;
  const alerts     = briefing?.alerts ?? [];
  const urgents    = alerts.filter(a => a.severity === "urgent");
  const others     = alerts.filter(a => a.severity !== "urgent");

  const CSS_DASH = `
    @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes dotPulse{0%,80%,100%{transform:scale(.6);opacity:.35}40%{transform:scale(1);opacity:1}}
    @keyframes slideCard{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    .loading-dot{width:10px;height:10px;border-radius:50%;background:#C5A46D;animation:dotPulse 1.2s ease-in-out infinite}
    .loading-dot:nth-child(2){animation-delay:.2s}
    .loading-dot:nth-child(3){animation-delay:.4s}
  `;

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:"#FDFAF5", fontFamily:"Heebo,sans-serif", paddingBottom:"80px" }}>
      <style>{CSS_DASH}</style>

      {/* Splash + RSVP toast */}
      {data && <SplashScreen name={event.name} />}
      {rsvpToast && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:C.olive, color:"white", padding:"0.65rem 1.5rem", borderRadius:30, fontSize:14, fontFamily:"Heebo,sans-serif", fontWeight:600, boxShadow:"0 4px 20px rgba(107,123,90,0.4)", animation:"slideCard .3s ease", whiteSpace:"nowrap" }}>
          {rsvpToast}
        </div>
      )}

      {/* ── E3-S6: Header bar ── */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"sticky", top:0, background:"rgba(253,250,245,0.96)", zIndex:10, backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(197,164,109,0.15)" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"18px", fontWeight:700, color:C.gold, margin:0, letterSpacing:".05em" }}>רגע לפני</p>
        <button style={{ background:"none", border:"none", cursor:"pointer", padding:"8px", display:"flex", flexDirection:"column", gap:"5px" }} aria-label="תפריט">
          <div style={{ width:20, height:1.5, background:C.dark, borderRadius:1 }}/>
          <div style={{ width:14, height:1.5, background:C.dark, borderRadius:1 }}/>
          <div style={{ width:20, height:1.5, background:C.dark, borderRadius:1 }}/>
        </button>
      </header>

      {/* ── E3-S6: Greeting + Countdown ── */}
      <section style={{ padding:"28px 20px 0", textAlign:"right", animation:"fadeUp .4s ease both" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"32px", fontWeight:700, color:C.dark, margin:"0 0 20px" }}>
          {briefing?.event?.bride_name && briefing?.event?.groom_name
            ? `שלום ${briefing.event.bride_name} ו${briefing.event.groom_name}`
            : `שלום ${event.name}`}
        </p>
        <div aria-label={`${daysLeft} ימים עד ליום החתונה`}>
          <p role="timer" style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"80px", fontWeight:900, color:"#8B6914", lineHeight:1, margin:"0 0 4px" }}>
            {daysLeft}
          </p>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"20px", fontWeight:300, color:C.muted, margin:"0 0 4px" }}>ימים</p>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"16px", fontWeight:300, color:C.muted, margin:0 }}>עד היום הגדול 💍</p>
        </div>
      </section>

      {/* ── E3-S6: Circular Progress Arc — readiness meter ── */}
      <CircularProgressArc value={briefing?.readinessPct ?? 0} label="מוכנות" />

      {/* ── E3-S7: 2×2 Quick Action Grid ── */}
      <section style={{ padding:"0 16px", animation:"fadeUp .4s ease .1s both" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
          <QuickCard emoji="👥" value={stats.confirmed} label="מגיעים"       caption="אורחים" href={`/couple/${token}/guests`} />
          <QuickCard emoji="🪑" value={seating.assignedSeats} label="שובצו" caption="הושבה"  href={`/couple/${token}/seating`} />
          <QuickCard emoji="📋" value={tasks.filter(t => !t.completed).length} label="משימות נותרו" caption="צ׳קליסט" href={`/couple/${token}/checklist`} />
          <QuickCard emoji="💰" value={budget.remaining > 0 ? `₪${Math.round(budget.remaining / 1000)}K` : "₪0"} label="נותרו" caption="תקציב" href={`/couple/${token}/gifts`} rawValue />
        </div>

        {/* Smart Alert — max 1, highest urgency */}
        <SmartAlertStrip stats={stats} seating={seating} daysLeft={daysLeft} token={token} />

        {/* Milestone Cards */}
        <MilestoneList tasks={tasks} token={token} />

        {/* Daily inspiration */}
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"14px", fontWeight:400, color:C.muted, fontStyle:"italic", textAlign:"center", padding:"20px 8px 32px", lineHeight:1.7 }}>
          &ldquo;{INSPIRATION_QUOTES[Math.floor(Date.now() / 86_400_000) % INSPIRATION_QUOTES.length]}&rdquo;
        </p>
      </section>


      {/* F9 — floating help button */}
      <HelpButton token={token} />
      {/* E3-S7: Bottom navigation */}
      <CoupleBottomNav token={token} />
    </div>
  );
}

interface TimelineItem { time: string; label: string }

function TimelineEditor({ token }: { token: string }) {
  const [items,   setItems]   = useState<TimelineItem[]>([]);
  const [loaded,  setLoaded]  = useState(false);
  const [open,    setOpen]    = useState(false);
  const [time,    setTime]    = useState("18:00");
  const [label,   setLabel]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/timeline`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setItems(d); setLoaded(true); });
  }, [token]);

  async function save(next: TimelineItem[]) {
    const sorted = [...next].sort((a, b) => a.time.localeCompare(b.time));
    setItems(sorted);
    await fetch(`/api/couple/${token}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: sorted }),
    });
  }

  async function add() {
    if (!label.trim()) return;
    setSaving(true);
    await save([...items, { time, label: label.trim() }]);
    setLabel(""); setOpen(false); setSaving(false);
  }

  async function remove(i: number) {
    await save(items.filter((_, idx) => idx !== i));
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (!loaded) return null;

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: "Heebo, sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          🗓 טיימליין יום החתונה
        </p>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.gold, fontFamily: "Heebo, sans-serif" }}>
          {open ? "סגור" : "+ הוסף"}
        </button>
      </div>

      {items.length === 0 && !open && (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          בנו את לוח הזמנים של היום שלכם — מתי קבלת פנים, חופה, ריקודים ועוד
        </p>
      )}

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item, i) => {
            const [h, m] = item.time.split(":").map(Number);
            const mins = h * 60 + m;
            const nextMins = i + 1 < items.length
              ? Number(items[i+1].time.split(":")[0]) * 60 + Number(items[i+1].time.split(":")[1])
              : mins + 60;
            const isActive = nowMinutes >= mins && nowMinutes < nextMins;
            const isPast   = nowMinutes >= nextMins;
            return (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: isActive ? C.gold : isPast ? C.olive : C.border, boxShadow: isActive ? `0 0 0 3px rgba(197,164,109,0.25)` : "none" }} />
                  {i < items.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, minHeight: 28, background: isPast ? C.olive : C.border, opacity: 0.35, marginTop: 2 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: i < items.length - 1 ? "0.875rem" : 0 }}>
                  <span style={{ fontSize: 11, color: isActive ? C.gold : C.muted, fontFamily: "Heebo, sans-serif", fontWeight: isActive ? 700 : 400 }}>{item.time}</span>
                  <p style={{ fontSize: 13, color: isPast ? C.muted : C.dark, fontFamily: "Heebo, sans-serif", fontWeight: isActive ? 700 : 400, margin: 0, opacity: isPast ? 0.55 : 1 }}>
                    {item.label}
                    {isActive && <span style={{ marginRight: 6, fontSize: 10, background: C.gold, color: "white", padding: "1px 6px", borderRadius: 8, verticalAlign: "middle" }}>עכשיו</span>}
                  </p>
                </div>
                <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.18)", padding: "4px 2px", flexShrink: 0, marginTop: 2 }}>
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${C.border}` }}>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ width: 90, padding: "0.4rem 0.5rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <input placeholder="שם האירוע (קבלת פנים, חופה...)" value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <button onClick={add} disabled={saving || !label.trim()}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 8, background: C.gold, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {saving ? "..." : "הוסף"}
          </button>
        </div>
      )}
    </div>
  );
}

function RsvpCounter({ stats }: { stats: { total: number; confirmed: number; declined: number; pending: number; attendees: number } }) {
  const total        = stats.total || 1;
  const confirmedPct = Math.round((stats.confirmed / total) * 100);
  const declinedPct  = Math.round((stats.declined  / total) * 100);
  const pendingPct   = 100 - confirmedPct - declinedPct;

  // SVG donut
  const R = 46, CIRC = 2 * Math.PI * R;
  let off = 0;
  const slices = [
    { pct: confirmedPct / 100, color: C.olive   },
    { pct: declinedPct  / 100, color: "#C0392B" },
    { pct: pendingPct   / 100, color: "rgba(197,164,109,0.35)" },
  ].map(s => {
    const dash = s.pct * CIRC;
    const slice = { ...s, dasharray: dash, dashoffset: -off * CIRC };
    off += s.pct;
    return slice;
  });

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>אישורי הגעה</h3>
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>{stats.confirmed + stats.declined} מתוך {stats.total} ענו</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        {/* Donut */}
        <svg width={110} height={110} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
          <circle cx={55} cy={55} r={R} fill="none" stroke="rgba(197,164,109,0.10)" strokeWidth={14} />
          {slices.map((s, i) => (
            <circle key={i} cx={55} cy={55} r={R} fill="none" stroke={s.color} strokeWidth={14}
              strokeDasharray={`${s.dasharray} ${CIRC}`} strokeDashoffset={s.dashoffset}
              transform="rotate(-90 55 55)" style={{ transition: "all 0.8s ease" }} />
          ))}
          <text x={55} y={50} textAnchor="middle" style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, fill: C.dark }}>{confirmedPct}%</text>
          <text x={55} y={65} textAnchor="middle" style={{ fontFamily: "Heebo, sans-serif", fontSize: 9, fill: C.muted }}>אישרו</text>
        </svg>

        {/* Bars */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            { label: "מגיעים",     count: stats.confirmed, pct: confirmedPct, color: C.olive   },
            { label: "ממתינים",    count: stats.pending,   pct: pendingPct,   color: C.gold    },
            { label: "לא מגיעים", count: stats.declined,  pct: declinedPct,  color: "#C0392B" },
          ].map(({ label, count, pct, color }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
                <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 13, fontWeight: 700, color }}>{count}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: "rgba(197,164,109,0.10)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {stats.attendees > 0 && (
        <p style={{ textAlign: "center", marginTop: "0.875rem", fontSize: 12, color: C.olive, fontFamily: "Heebo, sans-serif", fontWeight: 600 }}>
          🎉 {stats.attendees} אנשים מגיעים ליום הגדול
        </p>
      )}
    </div>
  );
}

function BudgetVisual({ budget }: { budget: { planned: number; actual: number; remaining: number; itemCount: number } }) {
  if (budget.itemCount === 0) return null;
  const usedPct = budget.planned > 0 ? Math.min(100, Math.round((budget.actual / budget.planned) * 100)) : 0;
  const overBudget = budget.actual > budget.planned;

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1rem" }}>
        <Wallet size={14} style={{ color: C.gold }} />
        <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>תקציב</h3>
        {overBudget && <span style={{ marginRight: "auto", fontSize: 10, background: "rgba(192,57,43,0.12)", color: "#C0392B", padding: "2px 8px", borderRadius: 8, fontFamily: "Heebo, sans-serif" }}>חריגה!</span>}
      </div>

      {/* Donut-style */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(197,164,109,0.12)" strokeWidth="10" />
            <circle cx="36" cy="36" r="28" fill="none"
              stroke={overBudget ? "#C0392B" : C.gold}
              strokeWidth="10"
              strokeDasharray={`${usedPct * 1.759} 175.9`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              style={{ transition: "stroke-dasharray 0.8s" }}
            />
          </svg>
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: overBudget ? "#C0392B" : C.dark }}>
            {usedPct}%
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>₪{fmt(budget.actual)}</p>
          <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 6px" }}>מתוך ₪{fmt(budget.planned)} מתוכנן</p>
          {!overBudget && <p style={{ fontSize: 11, color: C.olive, margin: 0 }}>₪{fmt(budget.remaining)} נותרו</p>}
        </div>
      </div>
    </div>
  );
}


const BLESSINGS = [
  "האהבה שלכם היא המפה, והחתונה היא הצעד הראשון במסע.",
  "כל רגע שעובר מקרב אתכם ליום שתזכרו לנצח.",
  "שיהיה לכם יום שמח כמו הלב שלכם — מלא ועמוק.",
  "שתמיד תצחקו ביחד, ושתמיד תהיו הבית אחד של השני.",
  "מהיום הזה ועד כל הימים — ביחד.",
];

function BlessingCard({ name }: { name: string }) {
  const blessing = BLESSINGS[Math.floor(name.length % BLESSINGS.length)];
  return (
    <div style={{
      borderRadius: "1.25rem",
      padding: "1.75rem 1.5rem",
      marginBottom: "0.875rem",
      textAlign: "center",
      background: "linear-gradient(135deg, #1C1008 0%, #2E1A0A 100%)",
      boxShadow: "0 4px 24px rgba(28,16,8,0.18)",
      border: "1px solid rgba(197,164,109,0.20)",
      position: "relative" as const,
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(197,164,109,0.5), transparent)" }} />
      <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "rgba(197,164,109,0.6)", marginBottom: "0.75rem", fontFamily: "Heebo, sans-serif" }}>
        ✦ לכבוד {name}
      </p>
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1rem,3.5vw,1.2rem)", color: "white", lineHeight: 1.7, margin: 0, fontWeight: 400 }}>
        &ldquo;{blessing}&rdquo;
      </p>
      <div style={{ width: 32, height: 1, background: "rgba(197,164,109,0.4)", margin: "1rem auto 0" }} />
      <p style={{ fontSize: 11, color: "rgba(197,164,109,0.55)", marginTop: "0.5rem", fontFamily: "Heebo, sans-serif" }}>
        דביר · רגע לפני
      </p>
    </div>
  );
}

// ─── Budget Tracker ───────────────────────────────────────────────────────────

const BUDGET_CATS = [
  { key: "venue",        label: "אולם",           color: "#C5A46D" },
  { key: "catering",     label: "קייטרינג",        color: "#5BA8A0" },
  { key: "photographer", label: "צלם",             color: "#7B68C8" },
  { key: "dj",           label: "DJ / מוזיקה",    color: "#E07B54" },
  { key: "flowers",      label: "פרחים",           color: "#D4A5C9" },
  { key: "dress",        label: "שמלה / חליפה",   color: "#6BAF8C" },
  { key: "other",        label: "אחר",             color: "#E8C84A" },
];

interface BudgetItem { id: string; category: string; description: string; planned_amount: number }

function BudgetTracker({ token }: { token: string }) {
  const [items,    setItems]    = useState<BudgetItem[]>([]);
  const [open,     setOpen]     = useState(false);
  const [cat,      setCat]      = useState("venue");
  const [desc,     setDesc]     = useState("");
  const [amount,   setAmount]   = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/budget`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setItems(d));
  }, [token]);

  async function add() {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    const catLabel = BUDGET_CATS.find(c => c.key === cat)?.label ?? cat;
    const res = await fetch(`/api/couple/${token}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, description: desc || catLabel, planned_amount: Number(amount) }),
    });
    const item = await res.json();
    if (!item.error) setItems(prev => [...prev, item]);
    setAmount(""); setDesc(""); setOpen(false); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/couple/${token}/budget?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const total = items.reduce((s, i) => s + i.planned_amount, 0);

  // Pie chart segments
  const PIE = 54, CIRC = 2 * Math.PI * PIE;
  let offset = 0;
  const segments = items.map(item => {
    const cat = BUDGET_CATS.find(c => c.key === item.category);
    const pct = total > 0 ? item.planned_amount / total : 0;
    const seg = { id: item.id, color: cat?.color ?? "#C5A46D", dasharray: pct * CIRC, dashoffset: -offset * CIRC };
    offset += pct;
    return seg;
  });

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Wallet size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>תקציב החתונה</h3>
        </div>
        {total > 0 && (
          <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: C.gold }}>
            ₪{fmt(total)}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          הוסיפו את קטגוריות התקציב שלכם — ותראו תמונה ברורה לאן הולך הכסף
        </p>
      ) : (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.875rem" }}>
          {/* Donut */}
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ flexShrink: 0 }}>
            <circle cx="58" cy="58" r={PIE} fill="none" stroke="rgba(197,164,109,0.12)" strokeWidth="16" />
            {segments.map(s => (
              <circle key={s.id} cx="58" cy="58" r={PIE} fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${s.dasharray} ${CIRC}`} strokeDashoffset={s.dashoffset}
                transform="rotate(-90 58 58)" style={{ transition: "all 0.5s ease" }} />
            ))}
            <text x="58" y="62" textAnchor="middle" style={{ fontSize: 11, fill: C.muted, fontFamily: "Heebo, sans-serif" }}>
              סה״כ
            </text>
          </svg>
          {/* Legend */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            {items.map(item => {
              const cat = BUDGET_CATS.find(c => c.key === item.category);
              const pct = total > 0 ? Math.round((item.planned_amount / total) * 100) : 0;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat?.color ?? C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, flex: 1, color: C.dark }}>{item.description}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{pct}%</span>
                  <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.2)", padding: 1 }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${C.border}` }}>
          <select value={cat} onChange={e => setCat(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, background: "white", outline: "none" }}>
            {BUDGET_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input placeholder="תיאור (אופציונלי)" value={desc} onChange={e => setDesc(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input type="number" placeholder="סכום ₪" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <button onClick={add} disabled={saving || !amount}
              style={{ padding: "0.4rem 0.9rem", borderRadius: 8, background: C.gold, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "..." : "הוסף"}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: "0.4rem 0.6rem", borderRadius: 8, background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer" }}>
              <XCircle size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: `1px dashed ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.muted, fontFamily: "Heebo, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Plus size={13} /> הוסף קטגוריית תקציב
        </button>
      )}
    </div>
  );
}

// ─── Gifts Tracker ────────────────────────────────────────────────────────────

// ─── Memory Section ───────────────────────────────────────────────────────────

function MemorySection({ token }: { token: string }) {
  const [vaultToken, setVaultToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/vault`)
      .then(r => r.json())
      .then(d => { if (d.vault_token) setVaultToken(d.vault_token); });
  }, [token]);

  if (!vaultToken) return null;

  async function copyLink() {
    const url = `${window.location.origin}/memory/${vaultToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{ fontSize: 16 }}>📷</span>
        <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0, color: C.dark }}>קיר זיכרונות האירוע</h3>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={copyLink}
          style={{
            flex: 1, minWidth: 140, padding: "0.65rem 1rem", borderRadius: 10,
            background: copied ? "rgba(107,123,90,0.12)" : "rgba(197,164,109,0.12)",
            border: `1px solid ${copied ? C.olive : C.border}`,
            color: copied ? C.olive : C.dark,
            fontSize: 13, fontWeight: 600, fontFamily: "Heebo, sans-serif", cursor: "pointer",
          }}
        >
          {copied ? "הועתק! ✓" : "שתפו עם האורחים"}
        </button>
        <a
          href={`/memory/${vaultToken}/wall`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, minWidth: 140, padding: "0.65rem 1rem", borderRadius: 10,
            background: "rgba(28,16,8,0.06)", border: `1px solid ${C.border}`,
            color: C.dark, fontSize: 13, fontWeight: 600, fontFamily: "Heebo, sans-serif",
            textDecoration: "none", textAlign: "center" as const,
          }}
        >
          צפו בקיר
        </a>
      </div>
    </div>
  );
}

interface GiftItem { id: string; guest_name: string; amount: number; notes?: string }

function GiftsTracker({ token }: { token: string }) {
  const [gifts,   setGifts]   = useState<GiftItem[]>([]);
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState("");
  const [amount,  setAmount]  = useState("");
  const [notes,   setNotes]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/gifts-log`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setGifts(d));
  }, [token]);

  async function add() {
    if (!name || !amount || Number(amount) <= 0) return;
    setSaving(true);
    const res = await fetch(`/api/couple/${token}/gifts-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_name: name, amount: Number(amount), notes }),
    });
    const gift = await res.json();
    if (!gift.error) setGifts(prev => [gift, ...prev]);
    setName(""); setAmount(""); setNotes(""); setOpen(false); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/couple/${token}/gifts-log?id=${id}`, { method: "DELETE" });
    setGifts(prev => prev.filter(g => g.id !== id));
  }

  const total = gifts.reduce((s, g) => s + g.amount, 0);

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Gift size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>מתנות שהתקבלו</h3>
        </div>
        {total > 0 && (
          <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: C.olive }}>
            ₪{fmt(total)}
          </span>
        )}
      </div>

      {gifts.length === 0 ? (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          רשמו כאן כל מתנה שמגיעה — הכל מסתכם אוטומטית
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "0.75rem", maxHeight: 180, overflowY: "auto" }}>
          {gifts.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.4rem 0.5rem", borderRadius: 8, background: "rgba(107,123,90,0.05)" }}>
              <span style={{ flex: 1, fontSize: 13, color: C.dark }}>{g.guest_name}</span>
              {g.notes && <span style={{ fontSize: 11, color: C.muted }}>{g.notes}</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: C.olive }}>₪{fmt(g.amount)}</span>
              <button onClick={() => remove(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.2)", padding: 1 }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="שם הנותן" value={name} onChange={e => setName(e.target.value)}
              style={{ flex: 2, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <input type="number" placeholder="₪ סכום" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="הערה (אופציונלי)" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <button onClick={add} disabled={saving || !name || !amount}
              style={{ padding: "0.4rem 0.9rem", borderRadius: 8, background: C.olive, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "..." : "הוסף"}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: "0.4rem 0.6rem", borderRadius: 8, background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer" }}>
              <XCircle size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: `1px dashed ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.muted, fontFamily: "Heebo, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Plus size={13} /> רשום מתנה שהתקבלה
        </button>
      )}
    </div>
  );
}

// ─── Smart Recommendations ────────────────────────────────────────────────────

const TASK_PRIORITY: Record<string, number> = {
  venue: 1, rabbi: 2, photographer: 3, videographer: 4,
  catering: 5, dj: 6, flowers: 7, dress: 8,
  music: 9, seating: 10, invitations: 11, other: 99,
};

function getUrgencyLabel(days: number, dueDate?: string | null): { label: string; color: string } {
  if (dueDate) {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
    if (diff < 0)  return { label: "באיחור!", color: "#C0392B" };
    if (diff <= 7) return { label: `${diff} ימים`, color: "#C0392B" };
    if (diff <= 30) return { label: `עד ${new Date(dueDate).toLocaleDateString("he-IL")}`, color: "#A07840" };
  }
  if (days <= 14)  return { label: "דחוף", color: "#C0392B" };
  if (days <= 45)  return { label: "בקרוב", color: "#A07840" };
  if (days <= 90)  return { label: "השבועות הקרובים", color: "#6B7B5A" };
  return { label: "אין דחיפות", color: "rgba(28,16,8,0.35)" };
}

function SmartRecommendations({
  tasks,
  daysLeft,
  onComplete,
}: {
  tasks: WeddingTask[];
  daysLeft: number;
  onComplete: (task: WeddingTask) => void;
}) {
  const pending = tasks.filter(t => !t.completed);
  if (pending.length === 0) return null;

  // Sort: overdue → has due_date soon → by category priority
  const sorted = [...pending].sort((a, b) => {
    const urgA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const urgB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    if (urgA !== urgB) return urgA - urgB;
    const prioA = TASK_PRIORITY[a.category] ?? 99;
    const prioB = TASK_PRIORITY[b.category] ?? 99;
    return prioA - prioB;
  });

  const recommendations = sorted.slice(0, 4);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(197,164,109,0.08) 0%, rgba(107,123,90,0.06) 100%)",
      borderRadius: "1.25rem",
      border: "1px solid rgba(197,164,109,0.22)",
      padding: "1.25rem",
      marginBottom: "0.875rem",
      boxShadow: C.shadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0, color: C.dark }}>
            כדאי לטפל עכשיו
          </h3>
          <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: "Heebo, sans-serif" }}>
            המלצות — לא חובה, אבל יעזור
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {recommendations.map((task, i) => {
          const { label, color } = getUrgencyLabel(daysLeft, task.due_date);
          return (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 12,
              padding: "0.6rem 0.75rem",
              border: "1px solid rgba(197,164,109,0.14)",
            }}>
              {/* Priority number */}
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: i === 0 ? C.gold : "rgba(197,164,109,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: i === 0 ? "white" : C.muted,
              }}>
                {i + 1}
              </div>

              {/* Task name */}
              <span style={{ flex: 1, fontSize: 13, color: C.dark, fontFamily: "Heebo, sans-serif" }}>
                {task.title}
              </span>

              {/* Urgency badge */}
              <span style={{
                fontSize: 10, color, fontFamily: "Heebo, sans-serif",
                padding: "0.15rem 0.5rem", borderRadius: 8,
                background: `${color}12`, border: `1px solid ${color}30`,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>

              {/* Mark done */}
              <button
                onClick={() => onComplete(task)}
                style={{
                  background: "none", border: `1.5px solid rgba(197,164,109,0.4)`,
                  borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: C.muted,
                }}
                title="סמן כבוצע"
              >
                <CheckCircle size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {pending.length > 4 && (
        <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: "0.75rem", fontFamily: "Heebo, sans-serif" }}>
          ועוד {pending.length - 4} משימות ברשימה המלאה למטה
        </p>
      )}
    </div>
  );
}

/* ── PartnerProfiles ────────────────────────────────────────── */
function PartnerProfiles({ eventName }: { eventName: string }) {
  const parsed = (() => {
    const clean = eventName.replace(/^חתונת\s*/i, "").replace(/^אירוע\s*/i, "");
    const match = clean.match(/^(.+?)\s+ו(.+)$/);
    if (match) return [match[1].trim(), match[2].trim()];
    return null;
  })();
  if (!parsed) return null;
  const [p1, p2] = parsed;

  const Avatar = ({ name, color }: { name: string; color: string }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: "white", letterSpacing: 0 }}>
        {name.slice(0, 1)}
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#FFF8EC", fontFamily: "Frank Ruhl Libre, serif" }}>{name}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0.75rem 1rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "1rem", borderRadius: 16, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,220,130,0.15)" }}>
        <Avatar name={p1} color="#C5A46D" />
        <div style={{ fontSize: 20, color: "rgba(255,235,180,0.6)" }}>💛</div>
        <Avatar name={p2} color="#6B7B5A" />
      </div>
    </div>
  );
}

/* ── MoodBoard ────────────────────────────────────────────────── */
const MOOD_PALETTES = [
  { id: "romantic", label: "רומנטי", colors: ["#F9CDD5", "#E8A5B5", "#D4839E", "#C5A46D", "#8B6355"] },
  { id: "luxury",   label: "יוקרתי", colors: ["#1A2744", "#2E4080", "#C5A46D", "#D4BC8A", "#F2EDE3"] },
  { id: "natural",  label: "טבעי",   colors: ["#D4E6C3", "#8FAF78", "#6B7B5A", "#C8B89A", "#F2EDE3"] },
  { id: "modern",   label: "מודרני", colors: ["#1A1A1A", "#333333", "#AAAAAA", "#DDDDDD", "#F5F5F5"] },
  { id: "enchanted",label: "קסום",   colors: ["#E8D5F5", "#C5A0E0", "#9B6CC5", "#6B4A8C", "#F2EDE3"] },
];
const MOOD_STYLES = ["קלאסי", "בוהו שיק", "מינימליסטי", "רוסטיק", "גלאמור"];

function MoodBoard({ token, eventId }: { token: string; eventId: string }) {
  const [palette, setPalette] = useState<string | null>(null);
  const [style,   setStyle]   = useState<string | null>(null);
  const [vision,  setVision]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const [open,    setOpen]    = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then(r => r.json()).then(ev => {
      if (ev.mood_palette) setPalette(ev.mood_palette);
      if (ev.mood_style)   setStyle(ev.mood_style);
      if (ev.mood_vision)  setVision(ev.mood_vision ?? "");
    }).catch(() => {});
  }, [eventId]);

  async function save() {
    setSaving(true);
    await fetch(`/api/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood_palette: palette, mood_style: style, mood_vision: vision }),
    }).catch(() => {});
    setSaving(false);
    setOpen(false);
  }

  const selectedPalette = MOOD_PALETTES.find(p => p.id === palette);

  return (
    <div style={{ maxWidth: 640, margin: "0.75rem auto 0", padding: "0 1rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", borderRadius: 14, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,220,130,0.15)", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🎨</span>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#FFF8EC", fontFamily: "Frank Ruhl Libre, serif", margin: 0 }}>
              לוח השראה
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,235,180,0.6)", fontFamily: "Heebo, sans-serif", margin: 0 }}>
              {palette ? `${selectedPalette?.label} · ${style ?? ""}` : "הוסיפו את חזון החתונה שלכם"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {selectedPalette?.colors.slice(0, 3).map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,0.2)" }} />
          ))}
          <span style={{ color: "rgba(255,235,180,0.6)", fontSize: 14, marginRight: 4 }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div style={{ background: "#FDFAF5", borderRadius: 16, padding: "1.25rem", marginTop: 8, border: "1px solid rgba(197,164,109,0.25)" }} dir="rtl">
          <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7B5A", marginBottom: 10, fontFamily: "Heebo, sans-serif" }}>פלטת צבעים</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {MOOD_PALETTES.map(p => (
              <button key={p.id} onClick={() => setPalette(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.5rem 0.75rem", borderRadius: 10, border: `1.5px solid ${palette === p.id ? "#C5A46D" : "rgba(197,164,109,0.2)"}`, background: palette === p.id ? "rgba(197,164,109,0.08)" : "white", cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {p.colors.map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />)}
                </div>
                <span style={{ fontSize: 12, color: "#1C1008", fontFamily: "Heebo, sans-serif", fontWeight: palette === p.id ? 600 : 400 }}>{p.label}</span>
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7B5A", marginBottom: 8, fontFamily: "Heebo, sans-serif" }}>סגנון החתונה</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {MOOD_STYLES.map(s => (
              <button key={s} onClick={() => setStyle(s)} style={{ padding: "0.4rem 0.9rem", borderRadius: 20, border: `1.5px solid ${style === s ? "#C5A46D" : "rgba(197,164,109,0.25)"}`, background: style === s ? "rgba(197,164,109,0.12)" : "white", fontSize: 12, color: style === s ? "#A07840" : "#555", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {s}
              </button>
            ))}
          </div>

          <p style={{ fontSize: 12, fontWeight: 600, color: "#6B7B5A", marginBottom: 6, fontFamily: "Heebo, sans-serif" }}>החזון שלכם</p>
          <textarea
            value={vision}
            onChange={e => setVision(e.target.value)}
            placeholder="ספרו לנו איך אתם דמיינתם את היום הגדול..."
            maxLength={500}
            rows={3}
            style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(197,164,109,0.3)", padding: "0.6rem 0.75rem", fontSize: 12, fontFamily: "Heebo, sans-serif", resize: "none", outline: "none", boxSizing: "border-box" }}
          />

          <button onClick={save} disabled={saving} style={{ marginTop: 12, width: "100%", padding: "0.7rem", borderRadius: 12, background: "linear-gradient(135deg,#C5A46D,#B8935A)", color: "white", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 13 }}>
            {saving ? "שומר..." : "שמור לוח השראה ✓"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── MiniCalendar ───────────────────────────────────────────── */
function MiniCalendar({ tasks, eventDate }: { tasks: WeddingTask[]; eventDate: string }) {
  const today = new Date();
  const wedding = new Date(eventDate);
  // Show next 30 days
  const upcoming = tasks
    .filter(t => !t.completed && t.due_date)
    .map(t => ({ ...t, dueDate: new Date(t.due_date!) }))
    .filter(t => t.dueDate >= today)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 8);

  const milestones = [
    { label: "החתונה! 💍", date: wedding, color: C.gold, important: true },
    ...upcoming.map(t => ({ label: t.title, date: t.dueDate, color: C.olive, important: false })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 8);

  if (milestones.length === 0) {
    return (
      <div style={{ marginTop: "0.875rem", textAlign: "center", padding: "0.75rem 0" }}>
        <p style={{ fontSize: 12, color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          הוסיפו תאריכי יעד למשימות כדי לראות לוח זמנים
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {milestones.map((m, i) => {
        const diff = Math.ceil((m.date.getTime() - today.getTime()) / 86_400_000);
        const dateStr = m.date.toLocaleDateString("he-IL", { day: "numeric", month: "long" });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.6rem 0.875rem", borderRadius: 10,
            background: m.important ? "rgba(197,164,109,0.10)" : "transparent",
            border: `1px solid ${m.important ? "rgba(197,164,109,0.3)" : C.border}` }}>
            <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
              <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, fontWeight: 700, color: m.color, margin: 0, lineHeight: 1 }}>{m.date.getDate()}</p>
              <p style={{ fontSize: 10, color: C.muted, margin: 0 }}>{m.date.toLocaleDateString("he-IL", { month: "short" })}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: m.important ? 700 : 500, color: C.dark, margin: 0, fontFamily: "Heebo, sans-serif" }}>{m.label}</p>
              <p style={{ fontSize: 11, color: C.muted, margin: "1px 0 0", fontFamily: "Heebo, sans-serif" }}>{dateStr}</p>
            </div>
            <span style={{ fontSize: 11, color: diff <= 3 ? "#C0392B" : C.muted, fontFamily: "Heebo, sans-serif", fontWeight: diff <= 7 ? 600 : 400, flexShrink: 0 }}>
              {diff === 0 ? "היום!" : diff === 1 ? "מחר" : `עוד ${diff} ימים`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── VendorBook ─────────────────────────────────────────────── */
const VENDOR_CATS_BOOK = [
  { key: "venue",        label: "אולם",          emoji: "🏛️" },
  { key: "catering",     label: "קייטרינג",       emoji: "🍽️" },
  { key: "photographer", label: "צלם/ת",          emoji: "📷" },
  { key: "video",        label: "וידאוגרף",       emoji: "🎬" },
  { key: "dj",           label: "DJ / מוזיקה",   emoji: "🎵" },
  { key: "flowers",      label: "פרחים",          emoji: "💐" },
  { key: "dress",        label: "שמלה / חליפה",  emoji: "👗" },
  { key: "makeup",       label: "איפור / שיער",   emoji: "💄" },
  { key: "other",        label: "אחר",            emoji: "✦"  },
];

interface VendorContact { id: string; category: string; name: string; phone: string | null; notes: string | null }

function VendorBook({ token }: { token: string }) {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [open,     setOpen]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [cat,      setCat]      = useState("venue");
  const [vname,    setVname]    = useState("");
  const [vphone,   setVphone]   = useState("");
  const [vnotes,   setVnotes]   = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/vendors`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setContacts(d));
  }, [token]);

  async function add() {
    if (!vname.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/couple/${token}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, name: vname, phone: vphone, notes: vnotes }),
    });
    const item = await res.json();
    if (!item.error) setContacts(prev => [...prev, item]);
    setVname(""); setVphone(""); setVnotes(""); setShowForm(false); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/couple/${token}/vendors?id=${id}`, { method: "DELETE" });
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📒</span>
          <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "0.95rem", fontWeight: 700, margin: 0, color: C.dark }}>ספר ספקים</h3>
          {contacts.length > 0 && <span style={{ fontSize: 11, background: "rgba(197,164,109,0.15)", color: C.gold, borderRadius: 10, padding: "1px 8px" }}>{contacts.length}</span>}
        </div>
        <ChevronDown size={15} style={{ color: C.muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div style={{ marginTop: "1rem" }}>
          {contacts.length === 0 && !showForm && (
            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0 0.75rem" }}>
              שמרו כאן את פרטי הקשר של כל הספקים — צלם, DJ, פרחים ועוד
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: contacts.length > 0 ? "0.75rem" : 0 }}>
            {contacts.map(c => {
              const catObj = VENDOR_CATS_BOOK.find(v => v.key === c.category);
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0.75rem", borderRadius: 10, background: "rgba(197,164,109,0.06)", border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{catObj?.emoji ?? "✦"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0, color: C.dark }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: "1px 0" }}>{catObj?.label}</p>
                    {c.phone && (
                      <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g,"").replace(/^0/,"972")}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, color: "#1A9B4E", textDecoration: "none", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                        💬 {c.phone}
                      </a>
                    )}
                    {c.notes && <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{c.notes}</p>}
                  </div>
                  <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,60,60,0.4)", padding: 2, flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {showForm ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.875rem", borderRadius: 12, background: "rgba(197,164,109,0.06)", border: `1px solid ${C.border}` }}>
              <select value={cat} onChange={e => setCat(e.target.value)}
                style={{ padding: "0.45rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "Heebo, sans-serif", background: "white" }}>
                {VENDOR_CATS_BOOK.map(v => <option key={v.key} value={v.key}>{v.emoji} {v.label}</option>)}
              </select>
              <input placeholder="שם הספק *" value={vname} onChange={e => setVname(e.target.value)}
                style={{ padding: "0.45rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "Heebo, sans-serif" }} />
              <input placeholder="טלפון (WhatsApp)" value={vphone} onChange={e => setVphone(e.target.value)}
                style={{ padding: "0.45rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "Heebo, sans-serif" }} />
              <input placeholder="הערה (אופציונלי)" value={vnotes} onChange={e => setVnotes(e.target.value)}
                style={{ padding: "0.45rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "Heebo, sans-serif" }} />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={add} disabled={saving || !vname.trim()}
                  style={{ flex: 1, padding: "0.5rem", borderRadius: 8, border: "none", background: C.gold, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif", fontWeight: 600 }}>
                  {saving ? "שומר..." : "שמור ✓"}
                </button>
                <button onClick={() => setShowForm(false)}
                  style={{ padding: "0.5rem 0.875rem", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif", color: C.muted }}>
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)}
              style={{ width: "100%", padding: "0.55rem", borderRadius: 10, border: "1.5px dashed rgba(197,164,109,0.4)", background: "transparent", cursor: "pointer", fontSize: 13, color: C.gold, fontFamily: "Heebo, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Plus size={14} /> הוסף ספק
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PremiumServiceCard({ icon, title, desc, token, eventName }: { icon: string; title: string; desc: string; token: string; eventName: string }) {
  const [showModal, setShowModal] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendRequest = async () => {
    setSending(true);
    await fetch(`/api/couple/${token}/chat`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `בקשת הצעת מחיר עבור: ${title}\nאירוע: ${eventName}`, sender: "couple" }),
    });
    setSent(true);
    setSending(false);
    setTimeout(() => { setShowModal(false); setSent(false); }, 2000);
  };

  return (
    <>
      <div style={{ background: "white", borderRadius: 14, padding: "1rem", border: `1px solid rgba(197,164,109,0.2)`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{title}</p>
          <p style={{ fontSize: 12, color: C.muted }}>{desc}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ background: C.gold, color: "white", border: "none", borderRadius: 10, padding: "0.45rem 0.9rem", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif", whiteSpace: "nowrap" }}>
          הצעת מחיר
        </button>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div dir="rtl" style={{ background: "#FDFAF5", borderRadius: 20, padding: "1.5rem", maxWidth: 360, width: "100%" }}>
            <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: "0.5rem" }}>{title}</h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: "1.25rem", lineHeight: 1.6 }}>
              אשלח בקשה לצוות רגע לפני ויחזרו אליכם עם הצעה מותאמת אישית.
            </p>
            {sent ? (
              <p style={{ textAlign: "center", color: "#059669", fontWeight: 700 }}>✓ הבקשה נשלחה!</p>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                <button onClick={sendRequest} disabled={sending}
                  style={{ background: C.gold, color: "white", border: "none", borderRadius: 12, padding: "0.8rem", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                  {sending ? "שולח..." : "📩 שלחו בקשה"}
                </button>
                <a href={`https://wa.me/972533318177?text=שלום+דביר,+אנחנו+${encodeURIComponent(eventName)}+ורוצים+לשמוע+על+${encodeURIComponent(title)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ background: "#25D366", color: "white", borderRadius: 12, padding: "0.8rem", fontSize: 15, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "block" }}>
                  💬 ישירות ב-WhatsApp
                </a>
                <button onClick={() => setShowModal(false)}
                  style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>ביטול</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
