export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return '972' + digits;
}

export interface EventInviteDetails {
  eventName?: string;
  date?: string;          // ISO or display string
  address?: string;
  receptionTime?: string; // e.g. "19:30"
  ceremonyTime?: string;  // e.g. "20:30"
}

export function buildInviteMessage(rsvpUrl: string, event?: EventInviteDetails): string {
  const lines: string[] = ['💍 משפחה וחברים יקרים!', ''];

  if (event?.eventName) {
    lines.push(`הנכם מוזמנים לחתונת *${event.eventName}* 🎊`);
  } else {
    lines.push('הנכם מוזמנים לחגוג איתנו 🎊');
  }

  if (event?.date) {
    const d = new Date(event.date);
    const formatted = isNaN(d.getTime())
      ? event.date
      : d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    lines.push(`📅 ${formatted}`);
  }

  if (event?.address) {
    lines.push(`📍 ${event.address}`);
  }

  if (event?.receptionTime || event?.ceremonyTime) {
    const times: string[] = [];
    if (event.receptionTime) times.push(`קבלת פנים ${event.receptionTime}`);
    if (event.ceremonyTime)  times.push(`חופה וקידושין ${event.ceremonyTime}`);
    lines.push(`🕐 ${times.join(' | ')}`);
  }

  lines.push('', 'לאישור הגעה לחצו על הקישור 👇', rsvpUrl, '', 'נשמח לראותכם! 🤍');
  return lines.join('\n');
}

export function whatsappInviteLink(
  phone: string | null | undefined,
  name: string,
  rsvpToken: string,
  event?: EventInviteDetails
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://regalifnei.vercel.app';
  const rsvpUrl = `${baseUrl}/rsvp/${rsvpToken}`;
  const message = buildInviteMessage(rsvpUrl, event);
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
