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
  message += `\n\n💍 מכירים זוג שמתחתן? האירוע הזה נוהל עם "רגע לפני" — אישורי הגעה, הושבה והכל במקום אחד. שלחו להם: 053-3318177`;
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
