/**
 * Wedding task template engine.
 * Generates a personalized task list based on days until wedding,
 * guest count estimate, style, and fears.
 */

export type TaskCategory = "venue" | "vendors" | "legal" | "personal" | "day_of" | "general" | "guests" | "budget";

export interface TaskTemplate {
  title:       string;
  category:    TaskCategory;
  daysOffset:  number;   // days BEFORE wedding to set due_date (-180 = 6 months before)
  sort_order:  number;
  condition?:  (opts: OnboardingOpts) => boolean;
}

export interface OnboardingOpts {
  daysUntil:       number;
  guestCount:      number;
  style:           string;
  fears:           string[];
  manager:         string;
  budgetEstimate?: number;
}

const TEMPLATES: TaskTemplate[] = [
  // ─── VENUE ────────────────────────────────────────────────
  { title: "לאשר את האולם / מקום האירוע",             category: "venue",    daysOffset: -270, sort_order: 10 },
  { title: "לקבל חוזה חתום מהאולם",                   category: "venue",    daysOffset: -240, sort_order: 11 },
  { title: "לברר כמה שולחנות מקסימום האולם מכיל",     category: "venue",    daysOffset: -200, sort_order: 12 },
  { title: "לאשר כמות מנות סופית עם האולם",           category: "venue",    daysOffset: -21,  sort_order: 13 },
  { title: "סיור סופי באולם שבוע לפני",               category: "venue",    daysOffset: -7,   sort_order: 14 },

  // ─── VENDORS ──────────────────────────────────────────────
  { title: "לבחור ולאשר צלם חתונה",                   category: "vendors",  daysOffset: -240, sort_order: 20 },
  { title: "לאשר חוזה עם צלם",                        category: "vendors",  daysOffset: -220, sort_order: 21 },
  { title: "לבחור צלם וידאו",                         category: "vendors",  daysOffset: -210, sort_order: 22 },
  { title: "לבחור DJ / תזמורת",                       category: "vendors",  daysOffset: -200, sort_order: 23 },
  { title: "לאשר ג'אנר מוזיקה עם ה-DJ",               category: "vendors",  daysOffset: -60,  sort_order: 24 },
  { title: "לבחור מעצב/ת פרחים",                      category: "vendors",  daysOffset: -180, sort_order: 25 },
  { title: "לסגור עיצוב פרחים ותפאורה",               category: "vendors",  daysOffset: -90,  sort_order: 26 },
  { title: "לאשר קייטרינג / תפריט",                   category: "vendors",  daysOffset: -120, sort_order: 27 },
  { title: "לאשר עוגת חתונה",                         category: "vendors",  daysOffset: -60,  sort_order: 28 },
  { title: "לאשר הסדרי חניה לאורחים",                 category: "vendors",  daysOffset: -30,  sort_order: 29 },
  { title: "לשלוח קבצי מוזיקה ל-DJ (כניסה, ריקודים)", category: "vendors",  daysOffset: -14,  sort_order: 30 },
  { title: "לאשר תשלום סופי לכל הספקים",              category: "vendors",  daysOffset: -7,   sort_order: 31 },

  // ─── LEGAL ────────────────────────────────────────────────
  { title: "להירשם לנישואין ברבנות / נוטריון",         category: "legal",    daysOffset: -270, sort_order: 40 },
  { title: "לאשר תאריך טבילה (אם רלוונטי)",           category: "legal",    daysOffset: -90,  sort_order: 41 },
  { title: "להכין מסמכים לרבנות",                      category: "legal",    daysOffset: -60,  sort_order: 42 },
  { title: "לאשר פגישת הכנה לחופה עם הרב",            category: "legal",    daysOffset: -30,  sort_order: 43 },

  // ─── PERSONAL ─────────────────────────────────────────────
  { title: "לבחור שמלת כלה / חליפה",                  category: "personal", daysOffset: -240, sort_order: 50 },
  { title: "מדידת ביניים לשמלה / חליפה",              category: "personal", daysOffset: -120, sort_order: 51 },
  { title: "מדידה אחרונה לשמלה / חליפה",              category: "personal", daysOffset: -30,  sort_order: 52 },
  { title: "לבחור תכשיטים לחתונה",                    category: "personal", daysOffset: -60,  sort_order: 53 },
  { title: "לאשר ספר / מאפרת",                        category: "personal", daysOffset: -180, sort_order: 54 },
  { title: "ריהרסל לתסרוקת ואיפור",                   category: "personal", daysOffset: -21,  sort_order: 55 },
  { title: "לבחור טבעות נישואין",                      category: "personal", daysOffset: -120, sort_order: 56 },
  { title: "לאשר ירח דבש",                             category: "personal", daysOffset: -90,  sort_order: 57 },

  // ─── GUESTS ───────────────────────────────────────────────
  { title: "לרשום רשימת אורחים ראשונית",              category: "guests",   daysOffset: -270, sort_order: 60 },
  { title: "לשלוח הזמנות דיגיטליות לכל האורחים",      category: "guests",   daysOffset: -60,  sort_order: 61 },
  { title: "לעקוב אחרי מי ענה ומי לא",                category: "guests",   daysOffset: -30,  sort_order: 62 },
  { title: "לסגור רשימת אורחים סופית",                 category: "guests",   daysOffset: -21,  sort_order: 63 },
  { title: "לסיים סידור הושבה",                        category: "guests",   daysOffset: -10,  sort_order: 64 },
  { title: "להדפיס / לשלוח פתקי שולחנות לאורחים",    category: "guests",   daysOffset: -3,   sort_order: 65 },

  // ─── BUDGET ───────────────────────────────────────────────
  { title: "לבנות תקציב ראשוני לחתונה",               category: "budget",   daysOffset: -270, sort_order: 70 },
  { title: "לפתוח חשבון חיסכון ייעודי לחתונה",        category: "budget",   daysOffset: -240, sort_order: 71 },
  { title: "לעדכן תקציב בעקבות הצעות מחיר",           category: "budget",   daysOffset: -150, sort_order: 72 },
  { title: "לסכם כל ההוצאות 3 שבועות לפני",           category: "budget",   daysOffset: -21,  sort_order: 73 },

  // ─── DAY OF ───────────────────────────────────────────────
  { title: "להכין שקית ליום החתונה (תרופות, נייד, כרטיסי אשראי)", category: "day_of", daysOffset: -3, sort_order: 80 },
  { title: "לאשר לוח זמנים מפורט עם כל הספקים",      category: "day_of",   daysOffset: -5,   sort_order: 81 },
  { title: "לתדרך איש/אשת קשר מהמשפחה",               category: "day_of",   daysOffset: -3,   sort_order: 82 },
  { title: "לנוח! לישון מוקדם ערב החתונה",             category: "day_of",   daysOffset: -1,   sort_order: 83 },

  // ─── GENERAL ──────────────────────────────────────────────
  { title: "לפתוח לוח בקרה משותף עם בן/בת הזוג",     category: "general",  daysOffset: -300, sort_order: 1  },
  { title: "לסכם את חזון החתונה עם בן/בת הזוג",       category: "general",  daysOffset: -270, sort_order: 2  },
  { title: "לשלוח Save The Date לאורחים קרובים",       category: "general",  daysOffset: -120, sort_order: 3  },
  { title: "לקנות מתנות לאנשי הצוות הקרובים",         category: "general",  daysOffset: -14,  sort_order: 4  },

  // ─── CONDITIONAL — large wedding ──────────────────────────
  {
    title:      "לשכור wedding coordinator ליום האירוע",
    category:   "vendors",
    daysOffset: -150,
    sort_order: 35,
    condition:  (o) => o.guestCount >= 200,
  },
  {
    title:      "להכין מפה / תוכנית ישיבה מודפסת לכניסה",
    category:   "guests",
    daysOffset: -5,
    sort_order: 66,
    condition:  (o) => o.guestCount >= 150,
  },

  // ─── CONDITIONAL — outdoor / boho ─────────────────────────
  {
    title:      "לוודא הסדרי גנרטור / חשמל למקום",
    category:   "venue",
    daysOffset: -60,
    sort_order: 15,
    condition:  (o) => ["outdoor", "boho"].includes(o.style),
  },
  {
    title:      "לאשר אוהל / פתרון גשם למקרה שינוי מזג אוויר",
    category:   "venue",
    daysOffset: -45,
    sort_order: 16,
    condition:  (o) => ["outdoor", "boho"].includes(o.style),
  },

  // ─── CONDITIONAL — fears: budget ──────────────────────────
  {
    title:      "להשוות הצעות מחיר מ-3 ספקים שונים לכל קטגוריה",
    category:   "budget",
    daysOffset: -180,
    sort_order: 74,
    condition:  (o) => o.fears.includes("budget"),
  },
  {
    title:      "להגדיר תקציב מקסימום מחייב לכל קטגוריה",
    category:   "budget",
    daysOffset: -200,
    sort_order: 75,
    condition:  (o) => o.fears.includes("budget"),
  },

  // ─── CONDITIONAL — fears: family ──────────────────────────
  {
    title:      "לסמן קונפליקטים בין אורחים בסידור הישיבה",
    category:   "guests",
    daysOffset: -21,
    sort_order: 67,
    condition:  (o) => o.fears.includes("family"),
  },
  {
    title:      "להקצות מתאם משפחתי שיטפל בבעיות ביום",
    category:   "day_of",
    daysOffset: -14,
    sort_order: 84,
    condition:  (o) => o.fears.includes("family"),
  },
];

/** Build a personalized task list, filtering by condition and computing due dates. */
export function generateTasks(weddingDate: Date, opts: OnboardingOpts) {
  const today = new Date();

  return TEMPLATES
    .filter((t) => !t.condition || t.condition(opts))
    .map((t) => {
      const due = new Date(weddingDate);
      due.setDate(due.getDate() + t.daysOffset);
      return {
        title:      t.title,
        category:   t.category,
        due_date:   due > today ? due.toISOString().slice(0, 10) : null,
        sort_order: t.sort_order,
        is_default: true,
        completed:  false,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Suggested budget breakdown in ILS based on guest count */
export function suggestBudget(guestCount: number, style: string) {
  const perHead = style === "luxury" ? 550 : style === "modern" ? 420 : 380;
  const base    = guestCount * perHead;

  return {
    total:       base,
    venue:       Math.round(base * 0.35),
    catering:    Math.round(base * 0.28),
    photography: Math.round(base * 0.12),
    music:       Math.round(base * 0.08),
    flowers:     Math.round(base * 0.07),
    dress:       Math.round(base * 0.05),
    other:       Math.round(base * 0.05),
  };
}
