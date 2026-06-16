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
    `שלום ${name} 😊\n\nנשמח לאישור הגעה לחתונה שלנו.\n\n${rsvpUrl}\n\nתודה ❤️`;
  const encoded = encodeURIComponent(message);

  if (phone && phone.trim()) {
    return `https://wa.me/${normalizePhone(phone)}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
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
    `שלום ${name}! 🎊\n\nאנחנו שמחים להזמין אתכם לחגוג איתנו ב${eventName}.\n` +
    `נשמח לדעת האם תוכלו להגיע — לחצו על הקישור לאישור הגעה:\n${rsvpUrl}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
