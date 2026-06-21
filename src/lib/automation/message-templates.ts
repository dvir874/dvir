export type CampaignType = 'initial' | 'week_before' | 'day_before' | 'thank_you' | 'gallery';

export interface TemplateVars {
  guest_name: string;
  couple_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  address: string;
  event_link: string;
  navigation_link: string;
  gallery_link: string;
}

export const DEFAULT_TEMPLATES: Record<CampaignType, { title: string; body: string }> = {
  initial: {
    title: 'הזמנה ראשונית',
    body: `שלום {{guest_name}} ❤️

שמחים להזמין אותך לחתונה של
{{couple_name}}

📅 {{event_date}}
📍 {{venue}}

נשמח לראותך!

{{event_link}}`,
  },
  week_before: {
    title: 'תזכורת שבוע לפני',
    body: `שלום {{guest_name}} 🤍

בעוד שבוע נחגוג יחד את חתונת
{{couple_name}}

📅 {{event_date}}
📍 {{venue}}

מחכים לך!`,
  },
  day_before: {
    title: 'תזכורת יום לפני',
    body: `שלום {{guest_name}} 🎉

מחר זה קורה! מחכים לחגוג איתך.

📍 {{venue}}
🕒 {{event_time}}
🚗 {{navigation_link}}`,
  },
  thank_you: {
    title: 'הודעת תודה',
    body: `{{guest_name}} היקר/ה ❤️

תודה שהייתם חלק מהיום המיוחד שלנו.
שמחנו לחגוג איתכם!

בהערכה רבה,
{{couple_name}}`,
  },
  gallery: {
    title: 'גלריית האירוע',
    body: `שלום {{guest_name}} ❤️

תודה שחגגתם איתנו!
העלינו את התמונות מהאירוע.

📸 לגלריה המלאה:
{{gallery_link}}

{{couple_name}}`,
  },
};

export const CAMPAIGN_LABELS: Record<CampaignType, string> = {
  initial:     'שליחה ראשונה',
  week_before: 'תזכורת שבוע לפני',
  day_before:  'תזכורת יום לפני',
  thank_you:   'הודעת תודה',
  gallery:     'גלריית האירוע',
};

export const CAMPAIGN_ORDER: CampaignType[] = [
  'initial', 'week_before', 'day_before', 'thank_you', 'gallery',
];

export const CAMPAIGN_ICONS: Record<CampaignType, string> = {
  initial:     '💌',
  week_before: '📅',
  day_before:  '🎉',
  thank_you:   '🤍',
  gallery:     '📸',
};

export function renderTemplate(body: string, vars: Partial<TemplateVars>): string {
  let result = body;
  for (const [key, val] of Object.entries(vars)) {
    if (val !== undefined && val !== null) {
      result = result.replaceAll(`{{${key}}}`, String(val));
    }
  }
  return result;
}

export function buildWaLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  const intl  = clean.startsWith('0') ? `972${clean.slice(1)}` : clean;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export function getScheduledDate(eventDate: Date, type: CampaignType): Date {
  const d = new Date(eventDate);
  switch (type) {
    case 'initial':     d.setDate(d.getDate() - 30); break;
    case 'week_before': d.setDate(d.getDate() - 7);  break;
    case 'day_before':  d.setDate(d.getDate() - 1);  break;
    case 'thank_you':   d.setDate(d.getDate() + 1);  break;
    case 'gallery':     d.setDate(d.getDate() + 7);  break;
  }
  d.setHours(10, 0, 0, 0);
  return d;
}

export function getDaysUntilEvent(eventDate: string | Date): number {
  const ed  = new Date(eventDate);
  const now = new Date();
  ed.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((ed.getTime() - now.getTime()) / 86_400_000);
}

export interface AutomationAlert {
  level: 'warning' | 'info' | 'success';
  text: string;
  type: CampaignType | null;
}

export function getAutomationAlerts(daysUntil: number, campaigns: Array<{ type: string; status: string }>): AutomationAlert[] {
  const alerts: AutomationAlert[] = [];
  const sentTypes = new Set(campaigns.filter((c) => c.status === 'sent').map((c) => c.type));

  if (daysUntil > 30) return alerts;

  if (daysUntil <= 30 && daysUntil > 7 && !sentTypes.has('initial')) {
    alerts.push({ level: 'warning', text: `בעוד ${daysUntil} יום החתונה — שלחו הזמנה ראשונה לאורחים`, type: 'initial' });
  }
  if (daysUntil <= 8 && daysUntil > 1 && !sentTypes.has('week_before')) {
    alerts.push({ level: 'warning', text: `בעוד ${daysUntil} ימים — הגיע הזמן לתזכורת שבוע לפני`, type: 'week_before' });
  }
  if (daysUntil === 1 && !sentTypes.has('day_before')) {
    alerts.push({ level: 'warning', text: 'מחר האירוע — שלחו תזכורת אחרונה לאורחים', type: 'day_before' });
  }
  if (daysUntil === 0) {
    alerts.push({ level: 'success', text: 'היום האירוע 🎉 — שיהיה בהצלחה!', type: null });
  }
  if (daysUntil >= -2 && daysUntil < 0 && !sentTypes.has('thank_you')) {
    alerts.push({ level: 'info', text: 'האירוע הסתיים — הגיע הזמן לשלוח הודעת תודה לאורחים', type: 'thank_you' });
  }
  if (daysUntil <= -7 && daysUntil >= -9 && !sentTypes.has('gallery')) {
    alerts.push({ level: 'info', text: 'שבוע אחרי האירוע — שלחו גלריה לאורחים', type: 'gallery' });
  }
  return alerts;
}
