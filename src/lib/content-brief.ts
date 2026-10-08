/* Content Hub — shared vocabulary, the brief prompt, and its parser.
 *
 * "Generate Brief" is copy/paste on purpose (decided 08/10/2026): the project
 * holds no LLM key and the rule is not to buy a tool before a format proves
 * itself. So the button builds a complete Hebrew prompt, Dvir pastes it into
 * any chat, pastes the answer back, and parseBrief() fills the fields.
 *
 * The prompt is where the content rules live, so they are enforced on every
 * brief rather than remembered: pain first, product late, no invented numbers
 * about us, no claims we cannot prove.
 */

export const STATUSES = [
  "IDEA", "APPROVED", "SCRIPT", "PRODUCTION", "READY",
  "PUBLISHED", "ANALYZING", "WINNER", "KILLED",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  IDEA: "רעיון", APPROVED: "אושר", SCRIPT: "תסריט", PRODUCTION: "בהפקה", READY: "מוכן",
  PUBLISHED: "פורסם", ANALYZING: "בניתוח", WINNER: "Winner", KILLED: "נפסל",
};

export const FORMATS = ["A", "B", "C"] as const;
export type Format = (typeof FORMATS)[number];

export const FORMAT_LABEL: Record<Format, string> = {
  A: "הזוג שמתחתן",
  B: "הסיוט של כל זוג",
  C: "איך עושים נכון",
};

export const GOALS = ["awareness", "engagement", "traffic", "leads", "trust"] as const;
export type Goal = (typeof GOALS)[number];

export const GOAL_LABEL: Record<Goal, string> = {
  awareness: "חשיפה", engagement: "מעורבות", traffic: "כניסות לאתר", leads: "לידים", trust: "אמון",
};

export const PLATFORMS = ["instagram", "tiktok", "facebook"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** The filter pills on the list, mapped onto statuses. */
export const FILTERS: { key: string; label: string; statuses: Status[] | null }[] = [
  { key: "all", label: "הכל", statuses: null },
  { key: "ideas", label: "רעיונות", statuses: ["IDEA", "APPROVED"] },
  { key: "production", label: "בהפקה", statuses: ["SCRIPT", "PRODUCTION", "READY"] },
  { key: "published", label: "פורסמו", statuses: ["PUBLISHED", "ANALYZING", "WINNER"] },
  { key: "winners", label: "Winners", statuses: ["WINNER"] },
];

export type Shot = { shot: number; seconds: string; visual: string; on_screen: string };

export interface ContentItem {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  format: Format;
  status: Status;
  content_goal: Goal | null;
  pain_point: string | null;
  hook: string | null;
  hook_options: string[];
  script: string | null;
  storyboard: Shot[];
  visual_prompts: string[];
  voiceover: string | null;
  on_screen_text: string | null;
  caption: string | null;
  cta: string | null;
  platforms: Platform[];
  published_at: string | null;
  production_cost: number | null;
  production_time_minutes: number | null;
  customers: number | null;
  revenue: number | null;
  leads: number | null;
  whatsapp_clicks: number | null;
  website_clicks: number | null;
  shares: number | null;
  saves: number | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  profile_visits: number | null;
  notes: string | null;
}

/** In business order — the UI renders them in exactly this order. */
export const METRICS: { key: keyof ContentItem; label: string }[] = [
  { key: "customers", label: "לקוחות" },
  { key: "revenue", label: "הכנסה ₪" },
  { key: "leads", label: "לידים" },
  { key: "whatsapp_clicks", label: "קליקים לוואטסאפ" },
  { key: "website_clicks", label: "קליקים לאתר" },
  { key: "shares", label: "שיתופים" },
  { key: "saves", label: "שמירות" },
  { key: "views", label: "צפיות" },
  { key: "likes", label: "לייקים" },
  { key: "comments", label: "תגובות" },
  { key: "profile_visits", label: "כניסות לפרופיל" },
];

/** Columns a PATCH may write. Everything else (id, timestamps) is server-owned. */
export const EDITABLE = new Set<string>([
  "title", "format", "status", "content_goal", "pain_point", "hook", "hook_options", "script",
  "storyboard", "visual_prompts", "voiceover", "on_screen_text", "caption", "cta", "platforms",
  "published_at", "production_cost", "production_time_minutes", "notes",
  ...METRICS.map((m) => m.key as string),
]);

/** A per-video link, so GA4's first_campaign separates one Reel from another. */
export function trackingLink(id: string, platform: Platform = "instagram"): string {
  return `https://regalifnei.com/?utm_source=${platform}&utm_medium=reel&utm_campaign=c-${id.slice(0, 8)}`;
}

/* What the product really does. The prompt may only promise these. */
const PRODUCT_FACTS = [
  "כל אורח מקבל הזמנה אישית בוואטסאפ ומאשר הגעה בוואטסאפ",
  "מי שלא ענה מקבל תזכורות אוטומטיות; מי שענה לא מקבל עוד הודעות",
  "הזוג רואה בזמן אמת מי מגיע, מי לא ומי לא ענה",
  "הושבה בגרירה, ובערב שלפני החתונה כל אורח מקבל את מספר השולחן שלו",
  "האולם מקבל דוח מנות מסודר",
  "דביר מלווה כל זוג אישית — אדם אחד, לא מוקד ולא בוט",
  "משלמים רק אחרי שהכול מוכן",
];

export interface BriefInput {
  idea: string;
  format: Format;
  goal: Goal | null;
  winners?: Pick<ContentItem, "title" | "format" | "hook" | "pain_point" | "views" | "whatsapp_clicks" | "leads" | "customers">[];
}

export function buildBriefPrompt({ idea, format, goal, winners = [] }: BriefInput): string {
  const refs = winners.length
    ? winners.map((w, i) =>
        `${i + 1}. [${w.format} · ${FORMAT_LABEL[w.format]}] "${w.hook ?? w.title}" — כאב: ${w.pain_point ?? "?"} · ` +
        `צפיות ${w.views ?? "?"} · וואטסאפ ${w.whatsapp_clicks ?? "?"} · לידים ${w.leads ?? "?"} · לקוחות ${w.customers ?? "?"}`,
      ).join("\n")
    : "אין עדיין. זה מהסרטונים הראשונים.";

  return `אתה כותב תוכן לרילס קצר (Instagram Reels / TikTok / Facebook Reels) עבור "רגע לפני" — שירות ישראלי לאישורי הגעה והושבה לחתונות בוואטסאפ.
הסרטון מופק ב-AI. אין צילום של אנשים אמיתיים מהעסק.

## הקלט
כאב / רעיון: ${idea.trim()}
פורמט: ${format} — ${FORMAT_LABEL[format]}
${format === "A" ? "הזוג הקבוע: עידו ונועה (דמויות בדויות). סיטואציה מצחיקה-מעצבנת מתכנון החתונה, שמרגישה כמו סיפור ולא כמו פרסומת." : ""}${format === "B" ? "כאב אחד ספציפי, מוכר עד כאב. הצופה צריך להגיד 'זה בדיוק אני'." : ""}${format === "C" ? "טיפ אמיתי ושימושי שעוזר גם למי שלא יקנה מאיתנו לעולם." : ""}
מטרת הסרטון: ${goal ? GOAL_LABEL[goal] : "לידים"}

## חוקים — חובה
1. מתחילים בכאב או בסקרנות. לא בשם העסק. המוצר מופיע רק אחרי שהצופה הבין את הבעיה.
   מבנה: כאב → סיפור → רגע מזדהה → פתרון → CTA.
2. עברית טבעית, מדוברת, ישראלית. לא שיווקי, לא "AI-י", בלי קלישאות ("המערכת המושלמת", "חוויה בלתי נשכחת", "לא תאמינו").
3. מספרים בתוך הסיפור של הדמויות מותרים ("247 הוזמנו, 42 לא ענו"). טענות על התוצאות של רגע לפני — אסורות. אין לנו נתונים לפרסום. אל תמציא אחוזים, מספר לקוחות או ביקורות.
4. מותר להבטיח רק את מה שהמוצר באמת עושה:
${PRODUCT_FACTS.map((f) => `   - ${f}`).join("\n")}
5. אסור: "הכי זול", "מובטח", "100%", השוואה בשם למתחרה.
6. כל אישה שמופיעה בפרומפט ויזואלי — לבושה בצניעות: כתפיים מכוסות, שרוולים, מחשוף גבוה, שמלה לא צמודה. לכתוב את זה בתוך הפרומפט עצמו.
7. CTA: בדרך כלל "דברו איתנו בוואטסאפ", אבל בניסוח שמתאים לסרטון. לא אותו משפט כל פעם.
8. אורך: 15–30 שניות. 85% צופים בלי קול — הטקסט על המסך חייב לעמוד לבד.

## סרטונים שעבדו (להשראה, לא להעתקה)
${refs}

## הפלט
החזר JSON תקין בלבד, בלי טקסט לפניו או אחריו, במבנה הזה:
{
  "title": "שם קצר לסרטון",
  "pain_point": "הכאב במשפט אחד",
  "hook_options": ["קרס 1", "קרס 2", "קרס 3"],
  "hook": "הקרס המומלץ (אחד משלושת)",
  "script": "התסריט המלא, 15–30 שניות",
  "storyboard": [{"shot": 1, "seconds": "0–2", "visual": "מה רואים", "on_screen": "הטקסט על המסך"}],
  "visual_prompts": ["פרומפט באנגלית לכל שוט, באותו סדר, 9:16"],
  "voiceover": "טקסט הקריינות",
  "on_screen_text": "כל הטקסטים על המסך לפי הסדר, שורה לכל שוט",
  "caption": "כיתוב לפוסט, כולל 3–5 האשטגים בעברית",
  "cta": "הקריאה לפעולה"
}`;
}

/** The fields a pasted answer is allowed to fill. */
export type BriefFields = Partial<Pick<ContentItem,
  "title" | "pain_point" | "hook" | "hook_options" | "script" | "storyboard" | "visual_prompts" |
  "voiceover" | "on_screen_text" | "caption" | "cta">>;

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/**
 * Reads whatever the chat returned: bare JSON, JSON inside a ```json fence, or
 * JSON with a sentence around it. Returns only fields that were really there,
 * so an answer missing "caption" never blanks a caption already written.
 */
export function parseBrief(raw: string): { fields: BriefFields; error?: string } {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return { fields: {}, error: "לא נמצא JSON בתשובה" };

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { fields: {}, error: "ה-JSON בתשובה לא תקין — בקשו מהצ'אט להחזיר JSON בלבד" };
  }

  const fields: BriefFields = {};
  for (const k of ["title", "pain_point", "hook", "script", "voiceover", "on_screen_text", "caption", "cta"] as const) {
    const v = str(data[k]);
    if (v) fields[k] = v;
  }
  if (Array.isArray(data.hook_options)) {
    const opts = data.hook_options.map(str).filter((x): x is string => !!x);
    if (opts.length) fields.hook_options = opts;
  }
  if (Array.isArray(data.visual_prompts)) {
    const vp = data.visual_prompts.map(str).filter((x): x is string => !!x);
    if (vp.length) fields.visual_prompts = vp;
  }
  if (Array.isArray(data.storyboard)) {
    const shots = data.storyboard
      .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
      .map((s, i) => ({
        shot: typeof s.shot === "number" ? s.shot : i + 1,
        seconds: String(s.seconds ?? ""),
        visual: String(s.visual ?? ""),
        on_screen: String(s.on_screen ?? ""),
      }));
    if (shots.length) fields.storyboard = shots;
  }
  if (!fields.hook && fields.hook_options?.length) fields.hook = fields.hook_options[0];
  return { fields };
}
