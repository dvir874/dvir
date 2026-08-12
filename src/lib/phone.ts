import { PHONE_DISPLAY } from '@/lib/constants';

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return '972' + digits;
}

export function whatsappInviteLink(
  phone: string | null | undefined,
  name: string,
  rsvpToken: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://raga-lifnei.co.il';
  const rsvpUrl = `${baseUrl}/rsvp/${rsvpToken}`;
  const message =
    `✨ *הזמנה רשמית* ✨\n\nמשפחה וחברים יקרים!\n\nאתם מוזמנים לחגוג איתנו 🎊\n\nלחצו על הקישור לפרטים מלאים ואישור הגעה:\n👇\n${rsvpUrl}\n\nנשמח לראותכם! 🤍`;
  const encoded = encodeURIComponent(message);

  if (phone && phone.trim()) {
    return `https://wa.me/${normalizePhone(phone)}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

export function whatsappThankYouLink(
  phone: string,
  name: string,
  eventName: string,
  galleryUrl?: string | null,
): string {
  const normalized = normalizePhone(phone);
  let message =
    `שלום ${name}! 💛\n\nתודה שהייתם חלק מהיום המיוחד שלנו ב${eventName}.\n` +
    `שמחנו לחגוג איתכם ❤️`;
  if (galleryUrl) {
    message += `\n\nצילמתם תמונות? נשמח שתשתפו אותן באלבום המשותף 📸\n${galleryUrl}`;
  }
  /* This line goes out on real messages to real guests, so the number here is
     the one that must be right. It was hardcoded and unhyphenated while every
     screen showed 053-331-8177; reading the constant means it cannot drift
     again. */
  message += `\n\n💍 מכירים זוג שמתחתן? האירוע הזה נוהל עם "רגע לפני" — אישורי הגעה, הושבה והכל במקום אחד. שלחו להם: ${PHONE_DISPLAY}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function whatsappReminderLink(
  phone: string,
  name: string,
  rsvpToken: string,
  eventName: string
): string {
  const normalized = normalizePhone(phone);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://raga-lifnei.co.il';
  const rsvpUrl = `${baseUrl}/rsvp/${rsvpToken}`;
  const message =
    `🔔 *תזכורת* — ${eventName}\n\nשלום ${name}!\n\nעוד לא קיבלנו את אישור ההגעה שלכם 🙏\n\nלחצו על הקישור לאישור מהיר:\n👇\n${rsvpUrl}\n\nנשמח לדעת האם תוכלו להגיע 🤍`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/* ── Welcome message to a newly-onboarded couple ── */
export function whatsappWelcomeLink(
  phone: string,
  coupleName: string,
  coupleToken: string,
): string {
  const normalized = normalizePhone(phone);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://regalifnei.vercel.app';
  const dashUrl = `${baseUrl}/couple/${coupleToken}`;
  const message =
    `💍 ${coupleName}, ברוכים הבאים לרגע לפני! 🎉\n\n` +
    `המערכת שלכם מוכנה. הנה הקישור האישי שלכם:\n${dashUrl}\n\n` +
    `שם תוכלו לראות את רשימת האורחים, אישורי ההגעה בזמן אמת, וכל מה שקשור לאירוע.\n\n` +
    `שמרו את הקישור — הוא שלכם בלבד 🔒\n` +
    `לכל שאלה אני כאן — דביר`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/* ── Weekly RSVP summary to the couple ── */
export function whatsappWeeklySummaryLink(
  phone: string,
  coupleName: string,
  stats: { confirmed: number; pending: number; declined: number; total: number },
  coupleToken: string,
): string {
  const normalized = normalizePhone(phone);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://regalifnei.vercel.app';
  const dashUrl = `${baseUrl}/couple/${coupleToken}`;
  const message =
    `💍 ${coupleName}, עדכון שבועי מרגע לפני 📊\n\n` +
    `✅ אישרו הגעה: ${stats.confirmed}\n` +
    `⏳ ממתינים: ${stats.pending}\n` +
    `❌ לא מגיעים: ${stats.declined}\n` +
    `📋 סה״כ מוזמנים: ${stats.total}\n\n` +
    `לצפייה בכל הפרטים:\n${dashUrl}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/* ── Day-before reminder to a guest (with Waze) ── */
export function whatsappDayBeforeLink(
  phone: string,
  guestName: string,
  eventName: string,
  eventTime: string | null,
  address: string | null,
): string {
  const normalized = normalizePhone(phone);
  let message =
    `💍 משפחה וחברים יקרים!\n\n` +
    `${guestName}, מחר זה קורה! 🎉\n${eventName}`;
  if (eventTime) message += `\n🕐 ${eventTime}`;
  if (address) {
    message += `\n📍 ${address}\n🚗 ניווט: https://waze.com/ul?q=${encodeURIComponent(address)}`;
  }
  message += `\n\nמחכים לראותכם! 🤍`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/* ── Testimonial request to the couple (post-wedding) ── */
export function whatsappTestimonialLink(
  phone: string,
  coupleName: string,
): string {
  const normalized = normalizePhone(phone);
  const message =
    `💍 ${coupleName}, מזל טוב שוב! 🥂\n\n` +
    `מקווה שהכל היה מושלם. אשמח מאוד אם תוכלו לכתוב לי 2-3 משפטים על החוויה עם רגע לפני — זה עוזר לי המון.\n\n` +
    `ואם מכירים זוג שמתחתן — אשמח שתעבירו את המספר שלי 🙏\n\nתודה, דביר`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * One canonical shape for a stored Israeli number: 05XXXXXXXX.
 *
 * Nothing normalised on write. The importer stripped non-digits and stopped
 * there, so a spreadsheet with 972-prefixed numbers stored them exactly as
 * typed — eight guests on Dvir's own list, one of whom (שרוליק) never received
 * anything. The webhook localises an incoming 9725… to 05… before looking a
 * guest up, so a guest stored AS 9725… could never be matched to their own
 * reply, and every delivery report about them landed nowhere.
 *
 * normalizePhone() above converts the other way, for wa.me links. This is the
 * storage form, and it belongs on every path that writes a guest.
 */
export function toLocalPhone(raw: string | null | undefined): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return "0" + digits.slice(3);
  if (digits.startsWith("0"))   return digits;
  /* Ten digits with no prefix is a mobile missing its leading zero. */
  return digits.length === 9 ? "0" + digits : digits;
}
